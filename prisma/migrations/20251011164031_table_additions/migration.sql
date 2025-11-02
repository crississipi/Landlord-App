-- ✅ Step 1: Rename old users table instead of dropping it
DROP TABLE IF EXISTS `users`;

-- ✅ Step 2: Create new Users table with the correct structure
CREATE TABLE `Users` (
    `userID` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `firstName` VARCHAR(100) NULL,
    `lastName` VARCHAR(100) NULL,
    `middleInitial` CHAR(1) NULL,
    `sex` VARCHAR(10) NULL,
    `bday` DATE NULL,
    `propertyId` INTEGER NULL,
    `email` VARCHAR(255) NULL,
    `firstNumber` VARCHAR(20) NULL,
    `secondNumber` VARCHAR(20) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`userID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ✅ Step 3: Copy data from old table into new Users table
INSERT INTO `Users` (username, password, role, created_at)
SELECT username, password, role, created_at FROM `Users`;

-- ✅ Step 4: (Optional) Drop the old table once verified
-- DROP TABLE `users_old`;

-- ✅ Step 5: Add new columns to Resource safely (preserving data)
ALTER TABLE `Resource`
ADD COLUMN `referenceId` INTEGER NULL,
ADD COLUMN `referenceType` VARCHAR(191) NULL;

-- ✅ Step 6: Populate new columns based on old data (if possible)
-- If Resource.propertyId used to reference Property, you can do:
UPDATE `Resource`
SET referenceId = propertyId,
    referenceType = 'Property'
WHERE propertyId IS NOT NULL;

-- ✅ Step 7: Remove old propertyId only after confirming migration
ALTER TABLE `Resource`
DROP FOREIGN KEY `Resource_propertyId_fkey`;

ALTER TABLE `Resource`
DROP COLUMN `propertyId`;

-- ✅ Step 8: Now enforce NOT NULL constraints safely
ALTER TABLE `Resource`
MODIFY `referenceId` INTEGER NOT NULL,
MODIFY `referenceType` VARCHAR(191) NOT NULL;

-- ✅ Step 9: Add back your foreign keys
ALTER TABLE `Users`
ADD CONSTRAINT `Users_propertyId_fkey`
FOREIGN KEY (`propertyId`) REFERENCES `Property`(`propertyId`)
ON DELETE SET NULL ON UPDATE CASCADE;

-- ✅ (Continue creating new tables safely)
CREATE TABLE IF NOT EXISTS `Expenses` (
    `expensesID` INTEGER NOT NULL AUTO_INCREMENT,
    `paidRent` DOUBLE NOT NULL,
    `paidWater` DOUBLE NOT NULL,
    `paidElectric` DOUBLE NOT NULL,
    `datePaid` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`expensesID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Billing` (
    `billingID` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` INTEGER NOT NULL,
    `propertyId` INTEGER NOT NULL,
    `totalRent` DOUBLE NOT NULL,
    `totalWater` DOUBLE NOT NULL,
    `totalElectric` DOUBLE NOT NULL,
    `dateIssued` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`billingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Maintenance` (
    `maintenanceID` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` INTEGER NOT NULL,
    `propertyId` INTEGER NOT NULL,
    `rawRequest` TEXT NOT NULL,
    `processedRequest` TEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `schedule` DATETIME(3) NULL,
    `dateIssued` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`maintenanceID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Documentation` (
    `docuID` INTEGER NOT NULL AUTO_INCREMENT,
    `maintenanceID` INTEGER NOT NULL,
    `documentation` TEXT NOT NULL,
    `dateIssued` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`docuID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Feedback` (
    `feedbackID` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `propertyId` INTEGER NOT NULL,
    `userID` INTEGER NULL,
    `ratings` DOUBLE NOT NULL,
    `message` TEXT NOT NULL,
    `dateIssued` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`feedbackID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Messages` (
    `messageID` INTEGER NOT NULL AUTO_INCREMENT,
    `senderID` INTEGER NOT NULL,
    `receiverID` INTEGER NOT NULL,
    `message` TEXT NULL,
    `dateSent` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`messageID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ✅ Step 10: Add foreign keys back
ALTER TABLE `Billing`
ADD CONSTRAINT `Billing_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `Users`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT `Billing_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`propertyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Maintenance`
ADD CONSTRAINT `Maintenance_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `Users`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT `Maintenance_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`propertyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Documentation`
ADD CONSTRAINT `Documentation_maintenanceID_fkey` FOREIGN KEY (`maintenanceID`) REFERENCES `Maintenance`(`maintenanceID`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Feedback`
ADD CONSTRAINT `Feedback_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`propertyId`) ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT `Feedback_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `Users`(`userID`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Messages`
ADD CONSTRAINT `Messages_senderID_fkey` FOREIGN KEY (`senderID`) REFERENCES `Users`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT `Messages_receiverID_fkey` FOREIGN KEY (`receiverID`) REFERENCES `Users`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;
