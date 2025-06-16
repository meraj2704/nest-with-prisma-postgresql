/*
  Warnings:

  - The values [AUTHENTICATION,PAYMENT,NOTIFICATION,REPORTING,INTEGRATION,UI_COMPONENTS] on the enum `ModuleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ModuleType_new" AS ENUM ('FRONTEND', 'BACKEND', 'DATABASE', 'FULLSTACK');
ALTER TABLE "modules" ALTER COLUMN "type" TYPE "ModuleType_new" USING ("type"::text::"ModuleType_new");
ALTER TYPE "ModuleType" RENAME TO "ModuleType_old";
ALTER TYPE "ModuleType_new" RENAME TO "ModuleType";
DROP TYPE "ModuleType_old";
COMMIT;
