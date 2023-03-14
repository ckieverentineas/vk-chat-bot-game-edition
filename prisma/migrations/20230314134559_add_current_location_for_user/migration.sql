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
    "location" TEXT NOT NULL DEFAULT 'begin',
    "crdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("atk", "crdate", "hp", "id", "idvk", "lvl", "mana", "name", "point") SELECT "atk", "crdate", "hp", "id", "idvk", "lvl", "mana", "name", "point" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
