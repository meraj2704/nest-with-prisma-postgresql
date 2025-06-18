-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "due_date" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "projects_due_date_idx" ON "projects"("due_date");
