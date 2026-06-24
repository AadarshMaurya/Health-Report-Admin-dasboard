import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { HealthReport } from './health-report.entity';

@Entity('clients')
@Index(['city'])
@Index(['health_condition'])
export class Client {
  @PrimaryColumn()
  @Index({ unique: true })
  client_id: string;

  @Column()
  full_name: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  mobile: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  state: string | null;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'varchar', nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', nullable: true })
  occupation: string | null;

  @Column({ type: 'varchar', nullable: true })
  health_condition: string | null;

  @Column({ type: 'varchar', nullable: true })
  beauty_goal: string | null;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => HealthReport, (report) => report.client, { cascade: true })
  health_reports: HealthReport[];
}
