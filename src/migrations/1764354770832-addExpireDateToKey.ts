import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpireDateToKey1764354770832 implements MigrationInterface {
    name = 'AddExpireDateToKey1764354770832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "keys" ADD "expireAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "keys" DROP COLUMN "expireAt"`);
    }

}
