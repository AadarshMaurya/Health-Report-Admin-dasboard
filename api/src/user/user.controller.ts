import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, User } from '../entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('User Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get current user profile bio and metadata' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getMe(@GetUser() user: User) {
    return this.userService.getMe(user);
  }

  @Get('latest-report')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get the latest clinical health report for the active client' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getLatestReport(@GetUser() user: User) {
    return this.userService.getLatestReport(user);
  }

  @Get('report-history')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get the full history of health reports for the active client' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getReportHistory(@GetUser() user: User) {
    return this.userService.getReportHistory(user);
  }
}
