import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdjustApiKeyColumnKey1764437999505 implements MigrationInterface {
  name = 'AdjustApiKeyColumnKey1764437999505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "api_key"`);
    await queryRunner.query(`ALTER TABLE "api_key" RENAME COLUMN "key" TO "keyId"`);
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "keyId"`);
    await queryRunner.query(`ALTER TABLE "api_key" ADD "keyId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "UQ_b0f723ede96b2991afe698988b6" UNIQUE ("keyId")`
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "FK_b0f723ede96b2991afe698988b6" FOREIGN KEY ("keyId") REFERENCES "keys"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "FK_b0f723ede96b2991afe698988b6"`
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "UQ_b0f723ede96b2991afe698988b6"`
    );
    await queryRunner.query(`ALTER TABLE "api_key" DROP COLUMN "keyId"`);
    await queryRunner.query(`ALTER TABLE "api_key" ADD "keyId" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "api_key" RENAME COLUMN "keyId" TO "key"`);
  }
}
