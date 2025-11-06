-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "stageId" TEXT;

-- CreateTable
CREATE TABLE "TaskStage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskStage_userId_idx" ON "TaskStage"("userId");

-- CreateIndex
CREATE INDEX "TaskStage_order_idx" ON "TaskStage"("order");

-- CreateIndex
CREATE UNIQUE INDEX "TaskStage_userId_key_key" ON "TaskStage"("userId", "key");

-- CreateIndex
CREATE INDEX "Task_stageId_idx" ON "Task"("stageId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "TaskStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStage" ADD CONSTRAINT "TaskStage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
