CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chats` text NOT NULL,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`created_at` integer
);
