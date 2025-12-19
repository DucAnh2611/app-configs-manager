import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeleteDateToApiKey1760217026463 implements MigrationInterface {
  name = 'AddDeleteDateToApiKey1760217026463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "deletedAt"`);
  }
}
