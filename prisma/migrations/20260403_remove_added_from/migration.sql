-- Remove added_from column from engagement_section, engagement_objective, engagement_procedure tables

ALTER TABLE `engagement_section` DROP COLUMN `added_from`;

ALTER TABLE `engagement_objective` DROP COLUMN `added_from`;

ALTER TABLE `engagement_procedure` DROP COLUMN `added_from`;
