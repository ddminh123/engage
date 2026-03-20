/*
  Warnings:

  - You are about to drop the column `assessment_source` on the `risk_assessment` table. All the data in the column will be lost.
  - Made the column `inherent_score` on table `risk_assessment` required. This step will fail if there are existing NULL values in that column.

*/
-- Backfill NULL inherent_score: use impact×likelihood if available, else map from inherent_level
UPDATE `risk_assessment`
SET `inherent_score` = COALESCE(
  `inherent_impact` * `inherent_likelihood`,
  CASE `inherent_level`
    WHEN 'Low' THEN 2
    WHEN 'Medium' THEN 7
    WHEN 'High' THEN 12
    WHEN 'Critical' THEN 20
    ELSE 7
  END
)
WHERE `inherent_score` IS NULL;

-- AlterTable
ALTER TABLE `risk_assessment` DROP COLUMN `assessment_source`,
    ADD COLUMN `assessment_source_id` VARCHAR(191) NULL,
    ADD COLUMN `conclusion` TEXT NULL,
    ADD COLUMN `control_rationale` TEXT NULL,
    ADD COLUMN `impact_rationale` TEXT NULL,
    ADD COLUMN `likelihood_rationale` TEXT NULL,
    ADD COLUMN `management_request` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `inherent_score` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `assessment_source` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assessment_source_code_key`(`code`),
    INDEX `assessment_source_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `risk_assessment_assessment_source_id_idx` ON `risk_assessment`(`assessment_source_id`);

-- AddForeignKey
ALTER TABLE `risk_assessment` ADD CONSTRAINT `risk_assessment_assessment_source_id_fkey` FOREIGN KEY (`assessment_source_id`) REFERENCES `assessment_source`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
