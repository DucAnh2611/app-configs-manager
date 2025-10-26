import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDataToWebhookHistory1761468674144 implements MigrationInterface {
    name = 'AddDataToWebhookHistory1761468674144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_histories" ADD "data" jsonb NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "bodyType" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhooks" ALTER COLUMN "bodyType" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "webhook_histories" DROP COLUMN "data"`);
    }

}
