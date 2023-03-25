-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idvk" INTEGER NOT NULL,
    "id_classify" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'zero',
    "lvl" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 2,
    "health_max" INTEGER NOT NULL DEFAULT 2,
    "atk" INTEGER NOT NULL DEFAULT 1,
    "mana" INTEGER NOT NULL DEFAULT 0,
    "point" INTEGER NOT NULL DEFAULT 2,
    "id_region" INTEGER NOT NULL DEFAULT 0,
    "skill" TEXT NOT NULL,
    "crdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_id_classify_fkey" FOREIGN KEY ("id_classify") REFERENCES "Classify" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User" ("atk", "crdate", "health", "health_max", "id", "id_classify", "id_region", "idvk", "lvl", "mana", "name", "point", "skill", "xp") SELECT "atk", "crdate", "health", "health_max", "id", "id_classify", "id_region", "idvk", "lvl", "mana", "name", "point", "skill", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
