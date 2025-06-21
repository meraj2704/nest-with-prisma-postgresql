/*
  Warnings:

  - You are about to drop the `_TaskAssignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TaskAssignments" DROP CONSTRAINT "_TaskAssignments_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskAssignments" DROP CONSTRAINT "_TaskAssignments_B_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "assigned_user_id" INTEGER;

-- DropTable
DROP TABLE "_TaskAssignments";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
