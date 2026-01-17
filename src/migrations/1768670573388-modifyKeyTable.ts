import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyKeyTable1768670573388 implements MigrationInterface {
  name = 'ModifyKeyTable1768670573388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "keys" ADD "path" text DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "keys" ADD "rotate" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`DROP INDEX "public"."IDX_49c28ff0d8851bd5c712a522d1"`);
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "version"`);
    await queryRunner.query(`ALTER TABLE "keys" ADD "version" text NOT NULL DEFAULT '-1'`);
    await queryRunner.query(
      `CREATE INDEX "IDX_49c28ff0d8851bd5c712a522d1" ON "keys" ("type", "version") WHERE "keys"."deletedAt" IS NULL AND "keys"."status" != 'RETIRED'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_49c28ff0d8851bd5c712a522d1"`);
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "version"`);
    await queryRunner.query(`ALTER TABLE "keys" ADD "version" integer NOT NULL DEFAULT '-1'`);
    await queryRunner.query(
      `CREATE INDEX "IDX_49c28ff0d8851bd5c712a522d1" ON "keys" ("type", "version") WHERE (("deletedAt" IS NULL) AND (status <> 'RETIRED'::keys_status_enum))`
    );
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "rotate"`);
    await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "path"`);
  }
}
