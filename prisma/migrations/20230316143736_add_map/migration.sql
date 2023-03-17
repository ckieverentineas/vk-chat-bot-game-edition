/*
  Warnings:

  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Region" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_location" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "mob_min" INTEGER NOT NULL,
    "mob_max" INTEGER NOT NULL,
    CONSTRAINT "Region_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Road" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_region_input" INTEGER NOT NULL,
    "id_region_output" INTEGER NOT NULL,
    CONSTRAINT "Road_id_region_input_fkey" FOREIGN KEY ("id_region_input") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Road_id_region_output_fkey" FOREIGN KEY ("id_region_output") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idvk" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'zero',
    "lvl" INTEGER NOT NULL DEFAULT 1,
    "hp" INTEGER NOT NULL DEFAULT 2,
    "atk" INTEGER NOT NULL DEFAULT 1,
    "mana" INTEGER NOT NULL DEFAULT 0,
    "point" INTEGER NOT NULL DEFAULT 2,
    "id_region" INTEGER NOT NULL DEFAULT 0,
    "crdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("atk", "crdate", "hp", "id", "idvk", "lvl", "mana", "name", "point") SELECT "atk", "crdate", "hp", "id", "idvk", "lvl", "mana", "name", "point" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
