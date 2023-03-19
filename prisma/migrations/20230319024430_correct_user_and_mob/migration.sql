/*
  Warnings:

  - You are about to drop the column `hp` on the `User` table. All the data in the column will be lost.
  - Added the required column `xp` to the `Mob` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_location" INTEGER NOT NULL,
    "id_classify" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "atk" INTEGER NOT NULL,
    "health" INTEGER NOT NULL,
    "health_max" INTEGER NOT NULL,
    "mana" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    CONSTRAINT "Mob_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mob_id_classify_fkey" FOREIGN KEY ("id_classify") REFERENCES "Classify" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Mob" ("atk", "health", "health_max", "id", "id_classify", "id_location", "mana", "name", "skill") SELECT "atk", "health", "health_max", "id", "id_classify", "id_location", "mana", "name", "skill" FROM "Mob";
DROP TABLE "Mob";
ALTER TABLE "new_Mob" RENAME TO "Mob";
CREATE UNIQUE INDEX "Mob_name_key" ON "Mob"("name");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idvk" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'zero',
    "lvl" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 2,
    "health_max" INTEGER NOT NULL DEFAULT 2,
    "atk" INTEGER NOT NULL DEFAULT 1,
    "mana" INTEGER NOT NULL DEFAULT 0,
    "point" INTEGER NOT NULL DEFAULT 2,
    "id_region" INTEGER NOT NULL DEFAULT 0,
    "crdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("atk", "crdate", "id", "id_region", "idvk", "lvl", "mana", "name", "point") SELECT "atk", "crdate", "id", "id_region", "idvk", "lvl", "mana", "name", "point" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
