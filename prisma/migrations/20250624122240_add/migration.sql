-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "departmentId" INTEGER;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "departmentId" INTEGER;

-- AlterTable
ALTER TABLE "work_sessions" ADD COLUMN     "departmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
