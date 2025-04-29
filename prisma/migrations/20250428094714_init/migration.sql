/*
  Warnings:

  - You are about to drop the column `blocked` on the `users` table. All the data in the column will be lost.
  - Added the required column `nickname` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `blocked`,
    ADD COLUMN `enable` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `nickname` VARCHAR(191) NOT NULL;
