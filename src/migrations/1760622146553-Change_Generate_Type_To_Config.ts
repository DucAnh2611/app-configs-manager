import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeGenerateTypeToConfig1760622146553 implements MigrationInterface {
    name = 'ChangeGenerateTypeToConfig1760622146553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "configs" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "configs" ALTER COLUMN "id" DROP DEFAULT`);
    }

}
