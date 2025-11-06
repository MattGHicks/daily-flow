-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "linkedMessageThreadName" TEXT,
ADD COLUMN     "linkedMessageThreadUrl" TEXT,
ADD COLUMN     "linkedProjectName" TEXT,
ADD COLUMN     "linkedProjectUrl" TEXT;
