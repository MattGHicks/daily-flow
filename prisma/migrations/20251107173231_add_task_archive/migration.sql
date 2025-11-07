-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Task_archived_idx" ON "Task"("archived");
