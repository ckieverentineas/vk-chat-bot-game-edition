/*
  Warnings:

  - Added the required column `uid_dead` to the `Region` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Region" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_location" INTEGER NOT NULL,
    "uid" INTEGER NOT NULL,
    "uid_dead" INTEGER NOT NULL,
    "road" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mob_min" INTEGER NOT NULL,
    "mob_max" INTEGER NOT NULL,
    "boss" INTEGER NOT NULL,
    CONSTRAINT "Region_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Region" ("boss", "id", "id_location", "label", "mob_max", "mob_min", "name", "road", "uid") SELECT "boss", "id", "id_location", "label", "mob_max", "mob_min", "name", "road", "uid" FROM "Region";
DROP TABLE "Region";
ALTER TABLE "new_Region" RENAME TO "Region";
CREATE UNIQUE INDEX "Region_uid_key" ON "Region"("uid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
