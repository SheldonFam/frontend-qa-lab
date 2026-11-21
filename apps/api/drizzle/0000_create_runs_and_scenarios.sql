CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`target_url` text NOT NULL,
	`status` text NOT NULL,
	`requirements` text NOT NULL,
	`error` text,
	`created_at` text NOT NULL,
	`started_at` text,
	`completed_at` text,
	`test_plan` text
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`position` integer NOT NULL,
	`language` text NOT NULL,
	`route` text NOT NULL,
	`viewport_name` text NOT NULL,
	`viewport_width` integer NOT NULL,
	`viewport_height` integer NOT NULL,
	`status` text NOT NULL,
	`result` text,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scenarios_run_id_index` ON `scenarios` (`run_id`);