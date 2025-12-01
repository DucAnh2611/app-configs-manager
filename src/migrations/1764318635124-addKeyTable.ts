import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyTable1764318635124 implements MigrationInterface {
  name = 'AddKeyTable1764318635124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."keys_status_enum" AS ENUM('INACTIVE', 'ACTIVE', 'RETIRED')`
    );
    await queryRunner.query(
      `CREATE TABLE "keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(20) NOT NULL, "hashed" character varying(100) NOT NULL, "hashBytes" integer NOT NULL, "status" "public"."keys_status_enum" NOT NULL, "version" character varying(10) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e63d5d51e0192635ab79aa49644" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "keys"`);
    await queryRunner.query(`DROP TYPE "public"."keys_status_enum"`);
  }
}
