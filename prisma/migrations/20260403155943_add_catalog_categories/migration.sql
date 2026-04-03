-- AlterTable
ALTER TABLE `control_catalog_item` ADD COLUMN `category_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `procedure_catalog_item` ADD COLUMN `category_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `control_catalog_item_category_id_idx` ON `control_catalog_item`(`category_id`);

-- CreateIndex
CREATE INDEX `procedure_catalog_item_category_id_idx` ON `procedure_catalog_item`(`category_id`);

-- AddForeignKey
ALTER TABLE `control_catalog_item` ADD CONSTRAINT `control_catalog_item_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `risk_catalog_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_catalog_item` ADD CONSTRAINT `procedure_catalog_item_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `risk_catalog_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
