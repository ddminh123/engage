/*
  Warnings:

  - You are about to drop the column `process_owner_id` on the `auditable_entity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `auditable_entity` DROP FOREIGN KEY `auditable_entity_process_owner_id_fkey`;

-- DropIndex
DROP INDEX `auditable_entity_process_owner_id_idx` ON `auditable_entity`;

-- AlterTable
ALTER TABLE `auditable_entity` DROP COLUMN `process_owner_id`;

-- CreateTable
CREATE TABLE `auditable_entity_contact_point` (
    `entity_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`entity_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auditable_entity_contact_point` ADD CONSTRAINT `auditable_entity_contact_point_entity_id_fkey` FOREIGN KEY (`entity_id`) REFERENCES `auditable_entity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditable_entity_contact_point` ADD CONSTRAINT `auditable_entity_contact_point_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
