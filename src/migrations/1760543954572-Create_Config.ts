import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConfig1760543954572 implements MigrationInterface {
    name = 'CreateConfig1760543954572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "configs" ("id" uuid NOT NULL, "appId" uuid NOT NULL, "configs" text NOT NULL, "version" integer NOT NULL DEFAULT '1', "namespace" character varying(50) NOT NULL, "isUse" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_002b633ec0d45f5c6f928fea292" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "configs" ADD CONSTRAINT "FK_820201aaa74a238d5f224f7f389" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "configs" DROP CONSTRAINT "FK_820201aaa74a238d5f224f7f389"`);
        await queryRunner.query(`DROP TABLE "configs"`);
    }

}
