import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { UploadReportDto } from './dto/upload-report.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Admin Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create-account')
  @ApiOperation({ summary: 'Create a new admin or client (USER) account' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createAccount(@Body() dto: CreateAccountDto) {
    return this.adminService.createAccount(dto);
  }

  @Post('upload-health-report')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Upload a single health report (JSON) OR bulk upload reports (CSV/Excel file)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV or Excel file containing multiple health reports',
        },
        report_id: { type: 'string' },
        client_id: { type: 'string' },
        report_date: { type: 'string', format: 'date-time' },
        hemoglobin: { type: 'number' },
        vitamin_d: { type: 'number' },
        cholesterol: { type: 'number' },
        blood_sugar_fasting: { type: 'number' },
        creatinine: { type: 'number' },
        urine_protein: { type: 'number' },
        bmi: { type: 'number' },
        doctor_notes: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  async uploadHealthReport(
    @UploadedFile() file?: any,
    @Body() body?: any,
  ) {
    if (file) {
      return this.adminService.uploadBulkReports(file.buffer);
    }

    if (!body || !body.report_id || !body.client_id) {
      throw new BadRequestException(
        'Please upload a CSV/Excel file or provide a valid JSON body containing report_id and client_id',
      );
    }

    const dto = body as UploadReportDto;
    return this.adminService.uploadSingleReport(dto);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Retrieve all clients with searching, sorting, and filter conditions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'healthCondition', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async getClients(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('healthCondition') healthCondition?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.adminService.getClients(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search || '',
      city || '',
      healthCondition || '',
      sortBy || 'created_at',
      sortOrder || 'DESC',
    );
  }

  @Get('clients/:id')
  @ApiOperation({ summary: 'Retrieve clinical profile for a specific client along with reports history' })
  async getClientDetails(@Param('id') id: string) {
    return this.adminService.getClientDetails(id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Retrieve all medical reports paginated' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  async getReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.adminService.getReports(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      sortBy || 'report_date',
      sortOrder || 'DESC',
    );
  }

  @Patch('clients/:id')
  @ApiOperation({ summary: 'Update client profile details and sync user login email' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async updateClient(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.adminService.updateClient(id, dto);
  }

  @Delete('clients/:id')
  @ApiOperation({ summary: 'Delete client profile, associated medical reports and user credentials' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async deleteClient(@Param('id') id: string) {
    return this.adminService.deleteClient(id);
  }
}
