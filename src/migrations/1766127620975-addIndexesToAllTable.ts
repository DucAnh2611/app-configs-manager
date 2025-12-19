import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesToAllTable1766127620975 implements MigrationInterface {
  name = 'AddIndexesToAllTable1766127620975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1a24d812ad1fca759ce552c215" ON "apps" ("code") WHERE "apps"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e86e16f81afd8355159ae59458" ON "apps" ("id", "code") WHERE "apps"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c33e6d6da6495561a6245abb0b" ON "apps" ("deletedAt") WHERE "apps"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d523c088f053cbf0830b83cb7e" ON "api_key" ("publicKey") WHERE "api_key"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8bc821a1086250a0e1b4f304a5" ON "api_key" ("appId", "publicKey") WHERE "api_key"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aa0c8952634e8246e6c8aaf971" ON "api_key" ("appId", "active", "type") WHERE "api_key"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f2206145940b7a202e84b79f2" ON "api_key" ("keyId") WHERE "api_key"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8359c07454a48e54094b754822" ON "api_key" ("deletedAt") WHERE "api_key"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0d4e404d56d9af30334eaabcd7" ON "configs" ("appId", "namespace", "version", "isUse") WHERE "configs"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_25064417636c11e14714b35da4" ON "configs" ("namespace", "version", "isUse") WHERE "configs"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e92edaf2e4dbf81255afae9af" ON "configs" ("deletedAt") WHERE "configs"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c0a49e11f263e3bd96037f463" ON "webhooks" ("appId", "triggerType", "triggerOn") WHERE "webhooks"."deletedAt" IS NULL AND "webhooks"."isActive" = TRUE`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_41f807ea96560d54e4e777c8e2" ON "webhooks" ("triggerType", "triggerOn", "isActive") WHERE "webhooks"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7e37ef4d95f191baf5742de9ef" ON "webhooks" ("deletedAt") WHERE "webhooks"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_45d358f2db357462b563309c96" ON "webhook_histories" ("webhookId", "status") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_37e85939e199894243b5e5bd6a" ON "webhook_histories" ("webhookId", "isSuccess") WHERE "webhook_histories"."status" != 'IN_QUEUE'`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b618335adaaace0a26f14352ec" ON "keys" ("id") WHERE "keys"."deletedAt" IS NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ec5d49a326f61d09d49fc5523b" ON "keys" ("type", "status") WHERE "keys"."deletedAt" IS NULL AND "keys"."status" != 'RETIRED'`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_49c28ff0d8851bd5c712a522d1" ON "keys" ("type", "version") WHERE "keys"."deletedAt" IS NULL AND "keys"."status" != 'RETIRED'`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1671e64b4854614beae86cefc0" ON "keys" ("deletedAt") WHERE "keys"."deletedAt" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_1671e64b4854614beae86cefc0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_49c28ff0d8851bd5c712a522d1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ec5d49a326f61d09d49fc5523b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b618335adaaace0a26f14352ec"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_37e85939e199894243b5e5bd6a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_45d358f2db357462b563309c96"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7e37ef4d95f191baf5742de9ef"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_41f807ea96560d54e4e777c8e2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5c0a49e11f263e3bd96037f463"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3e92edaf2e4dbf81255afae9af"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_25064417636c11e14714b35da4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0d4e404d56d9af30334eaabcd7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8359c07454a48e54094b754822"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5f2206145940b7a202e84b79f2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_aa0c8952634e8246e6c8aaf971"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8bc821a1086250a0e1b4f304a5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d523c088f053cbf0830b83cb7e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c33e6d6da6495561a6245abb0b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e86e16f81afd8355159ae59458"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1a24d812ad1fca759ce552c215"`);
  }
}
