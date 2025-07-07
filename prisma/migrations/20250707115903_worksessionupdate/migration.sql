/*
  Warnings:

  - You are about to drop the column `departmentId` on the `work_sessions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_task_id_fkey";

-- DropForeignKey
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "work_sessions" DROP COLUMN "departmentId",
ADD COLUMN     "department_id" INTEGER,
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "project_id" DROP NOT NULL,
ALTER COLUMN "module_id" DROP NOT NULL,
ALTER COLUMN "task_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
