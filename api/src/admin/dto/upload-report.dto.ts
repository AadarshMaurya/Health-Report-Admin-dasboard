import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadReportDto {
  @ApiProperty({ example: 'R99999', description: 'Unique report identifier' })
  @IsString()
  @IsNotEmpty()
  report_id: string;

  @ApiProperty({ example: 'C05000', description: 'Client identifier' })
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ example: '2026-06-23T12:00:00.000Z', description: 'Date of the clinical report' })
  @IsDateString()
  report_date: string;

  @ApiProperty({ example: 13.4, required: false })
  @IsOptional()
  @IsNumber()
  hemoglobin?: number;

  @ApiProperty({ example: 45.2, required: false })
  @IsOptional()
  @IsNumber()
  vitamin_d?: number;

  @ApiProperty({ example: 195.0, required: false })
  @IsOptional()
  @IsNumber()
  cholesterol?: number;

  @ApiProperty({ example: 98.2, required: false })
  @IsOptional()
  @IsNumber()
  blood_sugar_fasting?: number;

  @ApiProperty({ example: 0.9, required: false })
  @IsOptional()
  @IsNumber()
  creatinine?: number;

  @ApiProperty({ example: 0.12, required: false })
  @IsOptional()
  @IsNumber()
  urine_protein?: number;

  @ApiProperty({ example: 23.5, required: false })
  @IsOptional()
  @IsNumber()
  bmi?: number;

  @ApiProperty({ example: 'Vitals look excellent.', required: false })
  @IsOptional()
  @IsString()
  doctor_notes?: string;
}
