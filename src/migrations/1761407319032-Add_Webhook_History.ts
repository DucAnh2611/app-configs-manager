import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWebhookHistory1761407319032 implements MigrationInterface {
    name = 'AddWebhookHistory1761407319032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_4c88e956195bba85977da21b8f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c88e956195bba85977da21b8f4"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_histories_status_enum" AS ENUM('SUCCESS', 'IN_QUEUE', 'FAILED', 'PROCESSING')`);
        await queryRunner.query(`CREATE TABLE "webhook_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "webhookId" uuid NOT NULL, "status" "public"."webhook_histories_status_enum" NOT NULL, "isSuccess" boolean NOT NULL DEFAULT false, "logs" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f60b0dda5c443a7ef6c0371602e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_triggertype_enum" RENAME TO "webhook_triggertype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."webhooks_triggertype_enum" AS ENUM('CHANGE')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "triggerType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "triggerType" TYPE "public"."webhooks_triggertype_enum" USING "triggerType"::"text"::"public"."webhooks_triggertype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_triggertype_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_triggeron_enum" RENAME TO "webhook_triggeron_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."webhooks_triggeron_enum" AS ENUM('APIKEY', 'CONFIG')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "triggerOn" TYPE "public"."webhooks_triggeron_enum" USING "triggerOn"::"text"::"public"."webhooks_triggeron_enum"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_triggeron_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_method_enum" RENAME TO "webhook_method_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."webhooks_method_enum" AS ENUM('POST', 'PUT', 'DELETE', 'GET')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "method" TYPE "public"."webhooks_method_enum" USING "method"::"text"::"public"."webhooks_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_method_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_bodytype_enum" RENAME TO "webhook_bodytype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."webhooks_bodytype_enum" AS ENUM('JSON', 'formData')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "bodyType" TYPE "public"."webhooks_bodytype_enum" USING "bodyType"::"text"::"public"."webhooks_bodytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_bodytype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "webhooks" ADD CONSTRAINT "FK_eb794212afa6cde982aa6d04ea5" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "webhook_histories" ADD CONSTRAINT "FK_b8c21bca3e6e8fad2a4ec26b3a4" FOREIGN KEY ("webhookId") REFERENCES "webhooks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_histories" DROP CONSTRAINT "FK_b8c21bca3e6e8fad2a4ec26b3a4"`);
        await queryRunner.query(`ALTER TABLE "webhooks" DROP CONSTRAINT "FK_eb794212afa6cde982aa6d04ea5"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_bodytype_enum_old" AS ENUM('JSON', 'formData')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "bodyType" TYPE "public"."webhook_bodytype_enum_old" USING "bodyType"::"text"::"public"."webhook_bodytype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."webhooks_bodytype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_bodytype_enum_old" RENAME TO "webhook_bodytype_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_method_enum_old" AS ENUM('POST', 'PUT', 'DELETE', 'GET')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "method" TYPE "public"."webhook_method_enum_old" USING "method"::"text"::"public"."webhook_method_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."webhooks_method_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_method_enum_old" RENAME TO "webhook_method_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_triggeron_enum_old" AS ENUM('APIKEY', 'CONFIG')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "triggerOn" TYPE "public"."webhook_triggeron_enum_old" USING "triggerOn"::"text"::"public"."webhook_triggeron_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."webhooks_triggeron_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_triggeron_enum_old" RENAME TO "webhook_triggeron_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."webhook_triggertype_enum_old" AS ENUM('CHANGE')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "triggerType" TYPE "public"."webhook_triggertype_enum_old" USING "triggerType"::"text"::"public"."webhook_triggertype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "triggerType" SET DEFAULT 'CHANGE'`);
        await queryRunner.query(`DROP TYPE "public"."webhooks_triggertype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."webhook_triggertype_enum_old" RENAME TO "webhook_triggertype_enum"`);
        await queryRunner.query(`DROP TABLE "webhook_histories"`);
        await queryRunner.query(`DROP TYPE "public"."webhook_histories_status_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_4c88e956195bba85977da21b8f4" ON "webhooks" ("deletedAt") `);
        await queryRunner.query(`ALTER TABLE "webhooks" ADD CONSTRAINT "FK_4c88e956195bba85977da21b8f4" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
