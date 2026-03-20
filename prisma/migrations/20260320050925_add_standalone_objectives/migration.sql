-- Step 1: Add engagement_id as nullable
ALTER TABLE `engagement_objective` ADD COLUMN `engagement_id` VARCHAR(191) NULL;

-- Step 2: Backfill engagement_id from the parent section
UPDATE `engagement_objective` o
  JOIN `engagement_section` s ON o.section_id = s.id
  SET o.engagement_id = s.engagement_id;

-- Step 3: Make engagement_id NOT NULL
ALTER TABLE `engagement_objective` MODIFY `engagement_id` VARCHAR(191) NOT NULL;

-- Step 4: Make section_id nullable (for standalone objectives)
ALTER TABLE `engagement_objective` MODIFY `section_id` VARCHAR(191) NULL;

-- Step 5: Add index
CREATE INDEX `engagement_objective_engagement_id_idx` ON `engagement_objective`(`engagement_id`);

-- Step 6: Add foreign key
ALTER TABLE `engagement_objective` ADD CONSTRAINT `engagement_objective_engagement_id_fkey` FOREIGN KEY (`engagement_id`) REFERENCES `engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
