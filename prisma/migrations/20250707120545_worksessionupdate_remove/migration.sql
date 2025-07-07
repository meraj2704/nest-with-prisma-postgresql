/*
  Warnings:

  - Made the column `user_id` on table `work_sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `project_id` on table `work_sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `module_id` on table `work_sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `task_id` on table `work_sessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `department_id` on table `work_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_department_id_fkey";

-- DropForeignKey
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_module_id_fkey";

-- DropForeignKey
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_project_id_fkey";

-- DropForeignKey
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_task_id_fkey";

-- DropForeignKey
ALTER TABLE "work_sessions" DROP CONSTRAINT "work_sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "work_sessions" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "project_id" SET NOT NULL,
ALTER COLUMN "module_id" SET NOT NULL,
ALTER COLUMN "task_id" SET NOT NULL,
ALTER COLUMN "department_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
