import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhook1760757216281 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "webhook_triggertype_enum" AS ENUM('CHANGE')`);
    await queryRunner.query(`CREATE TYPE "webhook_triggeron_enum" AS ENUM('APIKEY', 'CONFIG')`);
    await queryRunner.query(
      `CREATE TYPE "webhook_method_enum" AS ENUM('POST', 'PUT', 'DELETE', 'GET')`
    );
    await queryRunner.query(`CREATE TYPE "webhook_bodytype_enum" AS ENUM('JSON', 'formData')`);
    await queryRunner.query(
      `CREATE TABLE "webhooks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appId" uuid NOT NULL, "name" character varying(100) NOT NULL, "triggerType" "webhook_triggertype_enum" NOT NULL DEFAULT 'CHANGE', "triggerOn" "webhook_triggeron_enum" NOT NULL, "targetUrl" character varying NOT NULL, "method" "webhook_method_enum" NOT NULL, "authKey" character varying, "bodyType" "webhook_bodytype_enum" NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c88e956195bba85977da21b8f4" ON "webhooks" ("deletedAt") `
    );
    await queryRunner.query(
      `ALTER TABLE "webhooks" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8f4" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhooks" DROP CONSTRAINT "FK_4c88e956195bba85977da21b8f4"`
    );
    await queryRunner.query(`DROP INDEX "IDX_4c88e956195bba85977da21b8f4"`);
    await queryRunner.query(`DROP TABLE "webhooks"`);
    await queryRunner.query(`DROP TYPE "webhook_bodytype_enum"`);
    await queryRunner.query(`DROP TYPE "webhook_method_enum"`);
    await queryRunner.query(`DROP TYPE "webhook_triggeron_enum"`);
    await queryRunner.query(`DROP TYPE "webhook_triggertype_enum"`);
  }
}
