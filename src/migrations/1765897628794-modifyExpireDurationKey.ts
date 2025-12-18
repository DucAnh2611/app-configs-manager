import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyExpireDurationKey1765897628794 implements MigrationInterface {
    name = 'ModifyExpireDurationKey1765897628794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "durationAmount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "durationAmount" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "durationUnit" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "durationUnit" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "durationUnit" SET DEFAULT 'd'`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "durationUnit" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "durationAmount" SET DEFAULT '30'`);
        await queryRunner.query(`ALTER TABLE "keys" ALTER COLUMN "durationAmount" SET NOT NULL`);
    }

}
