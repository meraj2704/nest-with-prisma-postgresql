/*
  Warnings:

  - Made the column `departmentId` on table `modules` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departmentId` on table `projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departmentId` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departmentId` on table `work_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "modules" DROP CONSTRAINT "modules_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_departmentId_fkey";

-- AlterTable
ALTER TABLE "modules" ALTER COLUMN "departmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "departmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "departmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "work_sessions" ALTER COLUMN "departmentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
