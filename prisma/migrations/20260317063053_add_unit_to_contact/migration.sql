-- AlterTable
ALTER TABLE `contact` ADD COLUMN `unit_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `contact_unit_id_idx` ON `contact`(`unit_id`);

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
