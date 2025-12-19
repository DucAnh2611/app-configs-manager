import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyKeyColumnDefinition1764346833218 implements MigrationInterface {
  name = 'ModifyKeyColumnDefinition1764346833218';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "type"`);
    await queryRunner.query(`ALTER TABLE "keys" ADD "type" character varying(50) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "hashed"`);
    await queryRunner.query(`ALTER TABLE "keys" ADD "hashed" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "version"`);
    await queryRunner.query(`ALTER TABLE "keys" ADD "version" integer NOT NULL DEFAULT '-1'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "version"`);
    await queryRunner.query(`ALTER TABLE "keys" ADD "version" character varying(10) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "hashed"`);
    await queryRunner.query(`ALTER TABLE "keys" ADD "hashed" character varying(100) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "type"`);
    await queryRunner.query(`ALTER TABLE "keys" ADD "type" character varying(20) NOT NULL`);
  }
}
