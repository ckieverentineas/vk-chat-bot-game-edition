/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uid` to the `Region` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subuid` to the `Road` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Region" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_location" INTEGER NOT NULL,
    "uid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "mob_min" INTEGER NOT NULL,
    "mob_max" INTEGER NOT NULL,
    CONSTRAINT "Region_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Region" ("id", "id_location", "mob_max", "mob_min", "name") SELECT "id", "id_location", "mob_max", "mob_min", "name" FROM "Region";
DROP TABLE "Region";
ALTER TABLE "new_Region" RENAME TO "Region";
CREATE TABLE "new_Road" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_region_input" INTEGER NOT NULL,
    "id_region_output" INTEGER NOT NULL,
    "subuid" INTEGER NOT NULL,
    CONSTRAINT "Road_id_region_input_fkey" FOREIGN KEY ("id_region_input") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Road_id_region_output_fkey" FOREIGN KEY ("id_region_output") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Road" ("id", "id_region_input", "id_region_output") SELECT "id", "id_region_input", "id_region_output" FROM "Road";
DROP TABLE "Road";
ALTER TABLE "new_Road" RENAME TO "Road";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");
