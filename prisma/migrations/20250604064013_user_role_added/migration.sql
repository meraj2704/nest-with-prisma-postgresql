-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DEVELOPER', 'TEAM_LEAD', 'MANAGER');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'DEVELOPER';
