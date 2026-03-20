-- AlterTable
ALTER TABLE `engagement_procedure` ADD COLUMN `procedure_category` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `draft_finding_risk_owner` (
    `finding_id` VARCHAR(191) NOT NULL,
    `contact_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`finding_id`, `contact_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `draft_finding_unit_owner` (
    `finding_id` VARCHAR(191) NOT NULL,
    `unit_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`finding_id`, `unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `procedure_control_ref` (
    `procedure_id` VARCHAR(191) NOT NULL,
    `control_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`procedure_id`, `control_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `procedure_risk_ref` (
    `procedure_id` VARCHAR(191) NOT NULL,
    `risk_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`procedure_id`, `risk_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `procedure_objective_ref` (
    `procedure_id` VARCHAR(191) NOT NULL,
    `rcm_objective_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`procedure_id`, `rcm_objective_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `draft_finding_risk_owner` ADD CONSTRAINT `draft_finding_risk_owner_finding_id_fkey` FOREIGN KEY (`finding_id`) REFERENCES `draft_finding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_risk_owner` ADD CONSTRAINT `draft_finding_risk_owner_contact_id_fkey` FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_unit_owner` ADD CONSTRAINT `draft_finding_unit_owner_finding_id_fkey` FOREIGN KEY (`finding_id`) REFERENCES `draft_finding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draft_finding_unit_owner` ADD CONSTRAINT `draft_finding_unit_owner_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `org_unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_control_ref` ADD CONSTRAINT `procedure_control_ref_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_control_ref` ADD CONSTRAINT `procedure_control_ref_control_id_fkey` FOREIGN KEY (`control_id`) REFERENCES `engagement_control`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_risk_ref` ADD CONSTRAINT `procedure_risk_ref_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_risk_ref` ADD CONSTRAINT `procedure_risk_ref_risk_id_fkey` FOREIGN KEY (`risk_id`) REFERENCES `engagement_risk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_objective_ref` ADD CONSTRAINT `procedure_objective_ref_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `engagement_procedure`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `procedure_objective_ref` ADD CONSTRAINT `procedure_objective_ref_rcm_objective_id_fkey` FOREIGN KEY (`rcm_objective_id`) REFERENCES `engagement_rcm_objective`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
