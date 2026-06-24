import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782229329160 implements MigrationInterface {
    name = 'InitialSchema1782229329160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "health_reports" ("report_id" character varying NOT NULL, "client_id" character varying NOT NULL, "report_date" TIMESTAMP NOT NULL, "hemoglobin" numeric(5,2), "vitamin_d" numeric(6,2), "cholesterol" numeric(6,2), "blood_sugar_fasting" numeric(6,2), "creatinine" numeric(6,2), "urine_protein" numeric(5,2), "bmi" numeric(5,2), "doctor_notes" text, CONSTRAINT "PK_f66a191edfc67cf63009abf47b8" PRIMARY KEY ("report_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f66a191edfc67cf63009abf47b" ON "health_reports"  ("report_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7b9079eb7a78bb93eeb3e7d389" ON "health_reports"  ("report_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_aa105f7ae9d393b6ce80d00c3b" ON "health_reports"  ("client_id") `);
        await queryRunner.query(`CREATE TABLE "clients" ("client_id" character varying NOT NULL, "full_name" character varying NOT NULL, "email" character varying, "mobile" character varying, "city" character varying, "state" character varying, "age" integer, "gender" character varying, "occupation" character varying, "health_condition" character varying, "beauty_goal" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_49e91f1e368e3f760789e7764aa" PRIMARY KEY ("client_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_49e91f1e368e3f760789e7764a" ON "clients"  ("client_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4785649027bfbb9ad0feaf771e" ON "clients"  ("health_condition") `);
        await queryRunner.query(`CREATE INDEX "IDX_396b6ec49a8f3cae7cdc6e866d" ON "clients"  ("city") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "health_reports" ADD CONSTRAINT "FK_aa105f7ae9d393b6ce80d00c3b4" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "health_reports" DROP CONSTRAINT "FK_aa105f7ae9d393b6ce80d00c3b4"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_396b6ec49a8f3cae7cdc6e866d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4785649027bfbb9ad0feaf771e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_49e91f1e368e3f760789e7764a"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aa105f7ae9d393b6ce80d00c3b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7b9079eb7a78bb93eeb3e7d389"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f66a191edfc67cf63009abf47b"`);
        await queryRunner.query(`DROP TABLE "health_reports"`);
    }

}
