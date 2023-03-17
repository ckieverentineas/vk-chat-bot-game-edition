/*
  Warnings:

  - You are about to alter the column `uid` on the `Region` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `subuid` to the `Region` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Region" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_location" INTEGER NOT NULL,
    "uid" INTEGER NOT NULL,
    "subuid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "mob_min" INTEGER NOT NULL,
    "mob_max" INTEGER NOT NULL,
    CONSTRAINT "Region_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Region" ("id", "id_location", "mob_max", "mob_min", "name", "uid") SELECT "id", "id_location", "mob_max", "mob_min", "name", "uid" FROM "Region";
DROP TABLE "Region";
ALTER TABLE "new_Region" RENAME TO "Region";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
