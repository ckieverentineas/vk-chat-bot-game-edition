/*
  Warnings:

  - You are about to drop the column `subuid` on the `Road` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Road" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_region_input" INTEGER NOT NULL,
    "id_region_output" INTEGER NOT NULL,
    CONSTRAINT "Road_id_region_input_fkey" FOREIGN KEY ("id_region_input") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Road_id_region_output_fkey" FOREIGN KEY ("id_region_output") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Road" ("id", "id_region_input", "id_region_output") SELECT "id", "id_region_input", "id_region_output" FROM "Road";
DROP TABLE "Road";
ALTER TABLE "new_Road" RENAME TO "Road";
CREATE TABLE "new_Region" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_location" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
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
