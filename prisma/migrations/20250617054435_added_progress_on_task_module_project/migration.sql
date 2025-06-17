-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "progress" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "total_work_hours" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "progress" DOUBLE PRECISION DEFAULT 0;
