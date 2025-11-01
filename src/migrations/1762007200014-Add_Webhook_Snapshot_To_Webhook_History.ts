import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWebhookSnapshotToWebhookHistory1762007200014 implements MigrationInterface {
    name = 'AddWebhookSnapshotToWebhookHistory1762007200014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_histories" ADD "webhookSnapshot" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "webhook_histories" DROP COLUMN "webhookSnapshot"`);
    }

}
