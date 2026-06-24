import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { HealthReport } from '../entities/health-report.entity';
import { User, UserRole } from '../entities/user.entity';
import { UploadReportDto } from './dto/upload-report.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuthService } from '../auth/auth.service';
import * as xlsx from 'xlsx';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(HealthReport)
    private reportRepository: Repository<HealthReport>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async createAccount(dto: CreateAccountDto) {
    const { email, password, role } = dto;

    let client = await this.clientRepository.findOne({ where: { email: email.toLowerCase().trim() } });

    if (role === UserRole.USER) {
      if (!dto.fullName) {
        throw new BadRequestException('Full name is required when creating a client (USER) account');
      }

      if (!client) {
        // Generate a unique client_id
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        const clientId = `C${Date.now().toString().slice(-4)}${randomDigits}`;

        const newClient = Object.assign(new Client(), {
          client_id: clientId,
          full_name: dto.fullName.trim(),
          email: email.toLowerCase().trim(),
          mobile: dto.mobile || null,
          city: dto.city || null,
          state: dto.state || null,
          age: dto.age || null,
          gender: dto.gender || null,
          occupation: dto.occupation || null,
          health_condition: dto.healthCondition || null,
          beauty_goal: dto.beautyGoal || null,
        });

        client = await this.clientRepository.save(newClient);
      }
    }

    const authResult = await this.authService.register({
      email,
      password,
      role,
    });

    return {
      message: 'Account created successfully',
      user: authResult.user,
      clientId: client ? client.client_id : null,
    };
  }

  async uploadSingleReport(dto: UploadReportDto) {
    const client = await this.clientRepository.findOne({ where: { client_id: dto.client_id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${dto.client_id} not found`);
    }

    const report = this.reportRepository.create({
      report_id: dto.report_id,
      client_id: dto.client_id,
      report_date: new Date(dto.report_date),
      hemoglobin: dto.hemoglobin,
      vitamin_d: dto.vitamin_d,
      cholesterol: dto.cholesterol,
      blood_sugar_fasting: dto.blood_sugar_fasting,
      creatinine: dto.creatinine,
      urine_protein: dto.urine_protein,
      bmi: dto.bmi,
      doctor_notes: dto.doctor_notes,
    });

    return this.reportRepository.save(report);
  }

  async uploadBulkReports(buffer: Buffer) {
    let workbook: xlsx.WorkBook;
    try {
      workbook = xlsx.read(buffer, { type: 'buffer' });
    } catch (e) {
      throw new BadRequestException('Failed to parse excel/csv file buffer');
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      throw new BadRequestException('Uploaded file contains no rows');
    }

    // Normalization helper for resilient column lookup
    const normalizeRow = (row: any) => {
      const normalized: any = {};
      for (const key of Object.keys(row)) {
        const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        normalized[normKey] = row[key];
      }
      return normalized;
    };

    // Load active clients to validate relation integrity
    const allClients = await this.clientRepository.find({ select: { client_id: true } });
    const clientIds = new Set(allClients.map(c => c.client_id));

    const reportsToInsert: any[] = [];
    const skippedClientIds = new Set<string>();

    for (const row of rows) {
      const norm = normalizeRow(row);
      const reportId = String(norm.reportid || norm.report_id || '').trim();
      const clientId = String(norm.clientid || norm.client_id || '').trim();

      if (!reportId || !clientId) continue;

      if (!clientIds.has(clientId)) {
        skippedClientIds.add(clientId);
        continue;
      }

      let rDate: Date;
      if (norm.reportdate || norm.report_date) {
        const dVal = norm.reportdate || norm.report_date;
        if (typeof dVal === 'number') {
          rDate = new Date((dVal - 25569) * 86400 * 1000);
        } else {
          rDate = new Date(dVal);
        }
      } else {
        rDate = new Date();
      }

      reportsToInsert.push({
        report_id: reportId,
        client_id: clientId,
        report_date: rDate,
        hemoglobin: norm.hemoglobin ? parseFloat(norm.hemoglobin) : null,
        vitamin_d: (norm.vitamind || norm.vit_d) ? parseFloat(norm.vitamind || norm.vit_d) : null,
        cholesterol: norm.cholesterol ? parseFloat(norm.cholesterol) : null,
        blood_sugar_fasting: (norm.bloodsugarfasting || norm.blood_sugar) ? parseFloat(norm.bloodsugarfasting || norm.blood_sugar) : null,
        creatinine: norm.creatinine ? parseFloat(norm.creatinine) : null,
        urine_protein: (norm.urineprotein || norm.urine) ? parseFloat(norm.urineprotein || norm.urine) : null,
        bmi: norm.bmi ? parseFloat(norm.bmi) : null,
        doctor_notes: norm.doctornotes || norm.notes || norm.doctor_notes ? String(norm.doctornotes || norm.notes || norm.doctor_notes).trim() : null,
      });
    }

    if (reportsToInsert.length > 0) {
      const chunkSize = 1000;
      for (let i = 0; i < reportsToInsert.length; i += chunkSize) {
        const chunk = reportsToInsert.slice(i, i + chunkSize);
        await this.reportRepository.createQueryBuilder()
          .insert()
          .values(chunk as any[])
          .orIgnore()
          .execute();
      }
    }

    return {
      message: 'Bulk report upload processed successfully',
      total_rows_found: rows.length,
      successfully_imported: reportsToInsert.length,
      skipped_missing_clients_count: skippedClientIds.size,
      skipped_client_ids: Array.from(skippedClientIds).slice(0, 50),
    };
  }

  async getClients(
    page: number = 1,
    limit: number = 20,
    search: string = '',
    city: string = '',
    healthCondition: string = '',
    sortBy: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const queryBuilder = this.clientRepository.createQueryBuilder('client');

    if (search) {
      queryBuilder.andWhere(
        '(client.full_name ILIKE :search OR client.email ILIKE :search OR client.client_id ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (city) {
      queryBuilder.andWhere('client.city = :city', { city });
    }

    if (healthCondition) {
      queryBuilder.andWhere('client.health_condition = :healthCondition', { healthCondition });
    }

    const allowedSortFields = [
      'client_id',
      'full_name',
      'email',
      'city',
      'state',
      'age',
      'gender',
      'health_condition',
      'created_at',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? `client.${sortBy}` : 'client.created_at';

    queryBuilder.orderBy(safeSortBy, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const filters = await this.getFilterMetadata();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
      filters,
    };
  }

  private async getFilterMetadata() {
    const citiesQuery = await this.clientRepository
      .createQueryBuilder('client')
      .select('DISTINCT client.city', 'city')
      .where('client.city IS NOT NULL AND client.city != :empty', { empty: '' })
      .orderBy('city', 'ASC')
      .getRawMany();

    const conditionsQuery = await this.clientRepository
      .createQueryBuilder('client')
      .select('DISTINCT client.health_condition', 'condition')
      .where('client.health_condition IS NOT NULL AND client.health_condition != :empty', { empty: '' })
      .orderBy('condition', 'ASC')
      .getRawMany();

    return {
      cities: citiesQuery.map(c => c.city).filter(Boolean),
      health_conditions: conditionsQuery.map(c => c.condition).filter(Boolean),
    };
  }

  async getClientDetails(clientId: string) {
    const client = await this.clientRepository.findOne({
      where: { client_id: clientId },
      relations: { health_reports: true },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    client.health_reports.sort((a, b) => b.report_date.getTime() - a.report_date.getTime());

    return client;
  }

  async getReports(
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'report_date',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.client', 'client');

    const allowedSortFields = ['report_id', 'client_id', 'report_date', 'bmi', 'hemoglobin', 'cholesterol'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? `report.${sortBy}` : 'report.report_date';

    queryBuilder.orderBy(safeSortBy, sortOrder);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async updateClient(id: string, dto: UpdateClientDto) {
    const client = await this.clientRepository.findOne({ where: { client_id: id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    const oldEmail = client.email;
    const newEmail = dto.email ? dto.email.toLowerCase().trim() : undefined;

    // If email is changing, verify it is not already taken by another user
    if (newEmail && oldEmail && newEmail !== oldEmail.toLowerCase().trim()) {
      const existingUser = await this.userRepository.findOne({ where: { email: newEmail } });
      if (existingUser) {
        throw new BadRequestException('Email address is already in use by another account');
      }

      // Sync user email change if they have an active login account
      const user = await this.userRepository.findOne({ where: { email: oldEmail.toLowerCase().trim() } });
      if (user) {
        user.email = newEmail;
        await this.userRepository.save(user);
      }
    }

    // Map new fields
    if (dto.fullName !== undefined) client.full_name = dto.fullName.trim();
    if (dto.email !== undefined) client.email = newEmail || null;
    if (dto.mobile !== undefined) client.mobile = dto.mobile || null;
    if (dto.city !== undefined) client.city = dto.city || null;
    if (dto.state !== undefined) client.state = dto.state || null;
    if (dto.age !== undefined) client.age = dto.age !== null ? dto.age : null;
    if (dto.gender !== undefined) client.gender = dto.gender || null;
    if (dto.occupation !== undefined) client.occupation = dto.occupation || null;
    if (dto.healthCondition !== undefined) client.health_condition = dto.healthCondition || null;
    if (dto.beautyGoal !== undefined) client.beauty_goal = dto.beautyGoal || null;

    return this.clientRepository.save(client);
  }

  async deleteClient(id: string) {
    const client = await this.clientRepository.findOne({ where: { client_id: id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Find and delete the login account associated with the client's email
    if (client.email) {
      const user = await this.userRepository.findOne({ where: { email: client.email.toLowerCase().trim() } });
      if (user) {
        await this.userRepository.remove(user);
      }
    }

    // Delete client (cascades automatically to health_reports)
    await this.clientRepository.remove(client);

    return { message: `Client profile for ID ${id} and all related health records/credentials deleted successfully` };
  }
}
