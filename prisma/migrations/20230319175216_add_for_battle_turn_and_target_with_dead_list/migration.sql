/*
  Warnings:

  - Added the required column `queue_dead` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turn` to the `Battle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Battle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_user" INTEGER NOT NULL,
    "queue_battle" TEXT NOT NULL,
    "effect_list" TEXT NOT NULL,
    "queue_dead" TEXT NOT NULL,
    "turn" INTEGER NOT NULL,
    "target" INTEGER NOT NULL,
    CONSTRAINT "Battle_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Battle" ("effect_list", "id", "id_user", "queue_battle") SELECT "effect_list", "id", "id_user", "queue_battle" FROM "Battle";
DROP TABLE "Battle";
ALTER TABLE "new_Battle" RENAME TO "Battle";
CREATE UNIQUE INDEX "Battle_id_user_key" ON "Battle"("id_user");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
