/*
  Warnings:

  - You are about to drop the column `work_sessions` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "work_sessions";

-- CreateTable
CREATE TABLE "work_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3),
    "duration_minutes" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "progress" DOUBLE PRECISION,

    CONSTRAINT "work_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_sessions_user_id_idx" ON "work_sessions"("user_id");

-- CreateIndex
CREATE INDEX "work_sessions_project_id_idx" ON "work_sessions"("project_id");

-- CreateIndex
CREATE INDEX "work_sessions_module_id_idx" ON "work_sessions"("module_id");

-- CreateIndex
CREATE INDEX "work_sessions_task_id_idx" ON "work_sessions"("task_id");

-- CreateIndex
CREATE INDEX "work_sessions_start_idx" ON "work_sessions"("start");

-- CreateIndex
CREATE INDEX "work_sessions_end_idx" ON "work_sessions"("end");

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
