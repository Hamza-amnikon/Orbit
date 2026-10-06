CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`message` text NOT NULL,
	`delivery` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rule_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`fy` text NOT NULL,
	`effective_from` text NOT NULL,
	`recorded_at` text NOT NULL,
	`payload` text NOT NULL,
	`evidence` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `source_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`checked_at` text NOT NULL,
	`status` text NOT NULL,
	`details` text NOT NULL
);
