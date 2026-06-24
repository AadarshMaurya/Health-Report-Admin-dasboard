import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Client } from './client.entity';

@Entity('health_reports')
@Index(['client_id'])
@Index(['report_date'])
export class HealthReport {
  @PrimaryColumn()
  @Index({ unique: true })
  report_id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client, (client) => client.health_reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'timestamp' })
  report_date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hemoglobin: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  vitamin_d: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  cholesterol: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  blood_sugar_fasting: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  creatinine: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  urine_protein: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi: number;

  @Column({ type: 'text', nullable: true })
  doctor_notes: string;
}
