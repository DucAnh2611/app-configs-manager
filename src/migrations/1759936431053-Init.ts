import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1759936431053 implements MigrationInterface {
  name = 'Init1759936431053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "apps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "name" character varying(50) NOT NULL, "configs" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c5121fda0f8268f1f7f84134e19" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."api_key_type_enum" AS ENUM('CONFIG', 'UP_CONFIG', 'THIRD_PARTY')`
    );
    await queryRunner.query(
      `CREATE TABLE "api_key" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appId" uuid NOT NULL, "type" "public"."api_key_type_enum" NOT NULL DEFAULT 'THIRD_PARTY', "key" text NOT NULL, "description" character varying(128), "active" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "revokedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "api_key" ADD CONSTRAINT "FK_f31a674f6cb84f00b05f7022c88" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "api_key" DROP CONSTRAINT "FK_f31a674f6cb84f00b05f7022c88"`
    );
    await queryRunner.query(`DROP TABLE "api_key"`);
    await queryRunner.query(`DROP TYPE "public"."api_key_type_enum"`);
    await queryRunner.query(`DROP TABLE "apps"`);
  }
}
