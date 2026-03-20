/*
  Warnings:

  - You are about to drop the column `approved_at` on the `risk_assessment` table. All the data in the column will be lost.
  - You are about to drop the column `assessed_at` on the `risk_assessment` table. All the data in the column will be lost.
  - You are about to drop the column `assessed_by` on the `risk_assessment` table. All the data in the column will be lost.
  - You are about to drop the column `impact` on the `risk_assessment` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `risk_assessment` table. All the data in the column will be lost.
  - You are about to drop the column `likelihood` on the `risk_assessment` table. All the data in the column will be lost.
  - You are about to drop the column `rationale` on the `risk_assessment` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `risk_assessment` table. All the data in the column will be lost.
  - Added the required column `inherent_impact` to the `risk_assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inherent_level` to the `risk_assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inherent_likelihood` to the `risk_assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inherent_score` to the `risk_assessment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `risk_assessment_assessed_at_idx` ON `risk_assessment`;

-- AlterTable
ALTER TABLE `auditable_entity` ADD COLUMN `inherent_risk_level` VARCHAR(191) NULL,
    ADD COLUMN `inherent_risk_score` INTEGER NULL;

-- AlterTable
ALTER TABLE `risk_assessment` DROP COLUMN `approved_at`,
    DROP COLUMN `assessed_at`,
    DROP COLUMN `assessed_by`,
    DROP COLUMN `impact`,
    DROP COLUMN `level`,
    DROP COLUMN `likelihood`,
    DROP COLUMN `rationale`,
    DROP COLUMN `score`,
    ADD COLUMN `assessment_source` VARCHAR(191) NULL,
    ADD COLUMN `control_effectiveness` VARCHAR(191) NULL,
    ADD COLUMN `evaluated_by` VARCHAR(191) NULL,
    ADD COLUMN `evaluation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `inherent_impact` INTEGER NOT NULL,
    ADD COLUMN `inherent_level` VARCHAR(191) NOT NULL,
    ADD COLUMN `inherent_likelihood` INTEGER NOT NULL,
    ADD COLUMN `inherent_score` INTEGER NOT NULL,
    ADD COLUMN `note` TEXT NULL,
    ADD COLUMN `residual_level` VARCHAR(191) NULL,
    ADD COLUMN `residual_score` INTEGER NULL,
    ADD COLUMN `risk_factors` JSON NULL;

-- CreateIndex
CREATE INDEX `risk_assessment_evaluation_date_idx` ON `risk_assessment`(`evaluation_date`);
