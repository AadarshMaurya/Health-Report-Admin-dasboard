import AppDataSource from '../src/config/typeorm-cli.config';
import { Client } from '../src/entities/client.entity';
import { HealthReport } from '../src/entities/health-report.entity';
import { User, UserRole } from '../src/entities/user.entity';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

// Normalize row keys for resilient excel column mapping
function normalizeRow(row: any): any {
  const normalized: any = {};
  for (const key of Object.keys(row)) {
    const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    normalized[normKey] = row[key];
  }
  return normalized;
}

async function seed() {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();
  console.log('Database connection initialized successfully.');

  // Locate the Excel file in the parent folder or workspace root
  const pathsToTry = [
    path.join(__dirname, '../../../healthcare dataset.xlsx'),
    path.join(__dirname, '../../../healthcare dataset (2).xlsx'),
    path.join(__dirname, '../../healthcare dataset.xlsx'),
    path.join(__dirname, '../../healthcare dataset (2).xlsx'),
  ];

  let excelPath = '';
  for (const p of pathsToTry) {
    try {
      if (require('fs').existsSync(p)) {
        excelPath = p;
        break;
      }
    } catch (e) {}
  }

  if (!excelPath) {
    console.error('Error: Excel dataset file not found in paths: ', pathsToTry);
    process.exit(1);
  }

  console.log(`Reading Excel file from: ${excelPath}`);
  const workbook = xlsx.readFile(excelPath);

  // 1. Seed Admin user and User accounts helper
  const adminEmail = 'admin@clinitech.com';
  const defaultUserPassword = 'Password123';
  const defaultAdminPassword = 'AdminPassword123';

  console.log('Pre-hashing passwords for seeding...');
  const userPasswordHash = await bcrypt.hash(defaultUserPassword, 10);
  const adminPasswordHash = await bcrypt.hash(defaultAdminPassword, 10);

  console.log('Seeding admin user...');
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(User)
    .values({
      email: adminEmail,
      password_hash: adminPasswordHash,
      role: UserRole.ADMIN,
    })
    .orIgnore()
    .execute();
  console.log('Admin user seed complete.');

  // 2. Seed Clients
  console.log('Parsing "clients" sheet...');
  const clientsSheet = workbook.Sheets['clients'];
  if (!clientsSheet) {
    console.error('Error: "clients" sheet not found in Excel workbook.');
    process.exit(1);
  }
  const rawClients = xlsx.utils.sheet_to_json(clientsSheet);
  console.log(`Found ${rawClients.length} rows in clients sheet.`);

  const BATCH_SIZE = 1000;
  console.log('Seeding clients in batches...');
  for (let i = 0; i < rawClients.length; i += BATCH_SIZE) {
    const batch = rawClients.slice(i, i + BATCH_SIZE);
    const clientValues = batch.map(row => {
      const norm = normalizeRow(row);
      return {
        client_id: String(norm.clientid || norm.client_id || '').trim(),
        full_name: String(norm.fullname || norm.full_name || norm.name || 'Unknown Client').trim(),
        email: norm.email ? String(norm.email).trim() : null,
        mobile: norm.mobile ? String(norm.mobile).trim() : null,
        city: norm.city ? String(norm.city).trim() : null,
        state: norm.state ? String(norm.state).trim() : null,
        age: norm.age ? parseInt(norm.age, 10) : null,
        gender: norm.gender ? String(norm.gender).trim() : null,
        occupation: norm.occupation ? String(norm.occupation).trim() : null,
        health_condition: norm.healthcondition || norm.health_condition ? String(norm.healthcondition || norm.health_condition).trim() : null,
        beauty_goal: norm.beautygoal || norm.beauty_goal ? String(norm.beautygoal || norm.beauty_goal).trim() : null,
        created_at: norm.createdat || norm.created_at ? new Date(norm.createdat || norm.created_at) : new Date(),
      };
    }).filter(c => c.client_id);

    if (clientValues.length > 0) {
      await AppDataSource.createQueryBuilder()
        .insert()
        .into(Client)
        .values(clientValues as any[])
        .orIgnore()
        .execute();
    }
    console.log(`Seeded clients batch: ${i + clientValues.length}/${rawClients.length}`);
  }

  // 3. Seed Users (Client accounts)
  console.log('Seeding client user logins...');
  const allClients = await AppDataSource.getRepository(Client).find({ select: { email: true } });
  const uniqueEmails = Array.from(new Set(allClients.map(c => c.email).filter(Boolean)));
  console.log(`Generating user logins for ${uniqueEmails.length} unique client emails...`);

  for (let i = 0; i < uniqueEmails.length; i += BATCH_SIZE) {
    const batch = uniqueEmails.slice(i, i + BATCH_SIZE);
    const userValues = batch.map(email => ({
      email: email!,
      password_hash: userPasswordHash,
      role: UserRole.USER,
    }));

    await AppDataSource.createQueryBuilder()
      .insert()
      .into(User)
      .values(userValues)
      .orIgnore()
      .execute();
  }
  console.log('Client user login seeding complete.');

  // 4. Seed Health Reports
  console.log('Parsing "health_reports" sheet...');
  const reportsSheet = workbook.Sheets['health_reports'];
  if (!reportsSheet) {
    console.error('Error: "health_reports" sheet not found in Excel workbook.');
    process.exit(1);
  }
  const rawReports = xlsx.utils.sheet_to_json(reportsSheet);
  console.log(`Found ${rawReports.length} rows in health_reports sheet.`);

  console.log('Seeding health reports in batches...');
  for (let i = 0; i < rawReports.length; i += BATCH_SIZE) {
    const batch = rawReports.slice(i, i + BATCH_SIZE);
    const reportValues = batch.map(row => {
      const norm = normalizeRow(row);
      
      let rDate: Date;
      if (norm.reportdate || norm.report_date) {
        const dVal = norm.reportdate || norm.report_date;
        if (typeof dVal === 'number') {
          // Excel serial date representation
          rDate = new Date((dVal - 25569) * 86400 * 1000);
        } else {
          rDate = new Date(dVal);
        }
      } else {
        rDate = new Date();
      }

      return {
        report_id: String(norm.reportid || norm.report_id || '').trim(),
        client_id: String(norm.clientid || norm.client_id || '').trim(),
        report_date: rDate,
        hemoglobin: norm.hemoglobin ? parseFloat(norm.hemoglobin) : null,
        vitamin_d: (norm.vitamind || norm.vit_d) ? parseFloat(norm.vitamind || norm.vit_d) : null,
        cholesterol: norm.cholesterol ? parseFloat(norm.cholesterol) : null,
        blood_sugar_fasting: (norm.bloodsugarfasting || norm.blood_sugar) ? parseFloat(norm.bloodsugarfasting || norm.blood_sugar) : null,
        creatinine: norm.creatinine ? parseFloat(norm.creatinine) : null,
        urine_protein: (norm.urineprotein || norm.urine) ? parseFloat(norm.urineprotein || norm.urine) : null,
        bmi: norm.bmi ? parseFloat(norm.bmi) : null,
        doctor_notes: norm.doctornotes || norm.notes || norm.doctor_notes ? String(norm.doctornotes || norm.notes || norm.doctor_notes).trim() : null,
      };
    }).filter(r => r.report_id && r.client_id);

    if (reportValues.length > 0) {
      await AppDataSource.createQueryBuilder()
        .insert()
        .into(HealthReport)
        .values(reportValues as any[])
        .orIgnore()
        .execute();
    }
    console.log(`Seeded health reports batch: ${i + reportValues.length}/${rawReports.length}`);
  }

  console.log('Database seeding successfully finished!');
  await AppDataSource.destroy();
}

seed().catch(err => {
  console.error('Seeding script failed:', err);
  process.exit(1);
});
