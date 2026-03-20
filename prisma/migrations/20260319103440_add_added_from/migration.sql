-- AlterTable
ALTER TABLE `engagement_objective` ADD COLUMN `added_from` VARCHAR(191) NOT NULL DEFAULT 'execution';

-- AlterTable
ALTER TABLE `engagement_procedure` ADD COLUMN `added_from` VARCHAR(191) NOT NULL DEFAULT 'execution';

-- AlterTable
ALTER TABLE `engagement_section` ADD COLUMN `added_from` VARCHAR(191) NOT NULL DEFAULT 'execution';
