-- CreateTable
CREATE TABLE `Property` (
    `propertyId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `rent` DOUBLE NOT NULL,
    `area` DOUBLE NOT NULL,
    `yearBuilt` INTEGER NOT NULL,
    `renovated` BOOLEAN NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`propertyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resource` (
    `resourceId` INTEGER NOT NULL AUTO_INCREMENT,
    `propertyId` INTEGER NOT NULL,
    `url` TEXT NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`resourceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Resource` ADD CONSTRAINT `Resource_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`propertyId`) ON DELETE RESTRICT ON UPDATE CASCADE;
