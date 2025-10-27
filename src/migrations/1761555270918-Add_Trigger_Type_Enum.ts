import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTriggerTypeEnum1761555270918 implements MigrationInterface {
    name = 'AddTriggerTypeEnum1761555270918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."webhooks_triggertype_enum" RENAME TO "webhooks_triggertype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."webhooks_triggertype_enum" AS ENUM('CHANGE', 'REMOVE')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "triggerType" TYPE "public"."webhooks_triggertype_enum" USING "triggerType"::"text"::"public"."webhooks_triggertype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."webhooks_triggertype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."webhooks_triggertype_enum_old" AS ENUM('CHANGE')`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "triggerType" TYPE "public"."webhooks_triggertype_enum_old" USING "triggerType"::"text"::"public"."webhooks_triggertype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."webhooks_triggertype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."webhooks_triggertype_enum_old" RENAME TO "webhooks_triggertype_enum"`);
    }

}
