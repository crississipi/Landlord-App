-- AlterTable
ALTER TABLE `Users` ADD COLUMN `hasLeftProperty` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `leftDate` DATETIME(3) NULL;
