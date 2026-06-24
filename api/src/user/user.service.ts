import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Client } from '../entities/client.entity';
import { HealthReport } from '../entities/health-report.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(HealthReport)
    private reportRepository: Repository<HealthReport>,
  ) {}

  async getMe(user: User) {
    // If ADMIN, return details directly. If USER, retrieve matched client record by email
    const client = await this.clientRepository.findOne({
      where: { email: user.email },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      client: client || null,
    };
  }

  async getLatestReport(user: User) {
    const client = await this.clientRepository.findOne({
      where: { email: user.email },
    });
    if (!client) {
      throw new NotFoundException('Client profile not found for this user account');
    }

    const report = await this.reportRepository.findOne({
      where: { client_id: client.client_id },
      order: { report_date: 'DESC' },
    });

    if (!report) {
      throw new NotFoundException('No health reports found for this client');
    }

    return report;
  }

  async getReportHistory(user: User) {
    const client = await this.clientRepository.findOne({
      where: { email: user.email },
    });
    if (!client) {
      throw new NotFoundException('Client profile not found for this user account');
    }

    const reports = await this.reportRepository.find({
      where: { client_id: client.client_id },
      order: { report_date: 'DESC' },
    });

    return reports;
  }
}
