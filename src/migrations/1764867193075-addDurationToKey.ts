import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDurationToKey1764867193075 implements MigrationInterface {
  name = 'AddDurationToKey1764867193075';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keys" ADD "durationAmount" integer NOT NULL DEFAULT '30'`
    );
    await queryRunner.query(`ALTER TABLE "keys" ADD "durationUnit" text NOT NULL DEFAULT 'd'`);
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "FK_b0f723ede96b2991afe698988b6"`
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "UQ_b0f723ede96b2991afe698988b6"`
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
      `ALTER TABLE "api_key" ADD CONSTRAINT "UQ_b0f723ede96b2991afe698988b6" UNIQUE ("keyId")`
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "FK_b0f723ede96b2991afe698988b6" FOREIGN KEY ("keyId") REFERENCES "keys"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "durationUnit"`);
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "durationAmount"`);
  }
}
