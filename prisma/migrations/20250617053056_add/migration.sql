/*
  Warnings:

  - Made the column `module_id` on table `tasks` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_module_id_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
ADD COLUMN     "total_work_hours" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "work_sessions" JSONB,
ALTER COLUMN "module_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
