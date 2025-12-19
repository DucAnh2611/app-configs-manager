import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicKeyToApiKey1759991797507 implements MigrationInterface {
  name = 'AddPublicKeyToApiKey1759991797507';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" ADD "publicKey" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "publicKey"`);
  }
}
