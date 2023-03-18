-- CreateTable
CREATE TABLE "Classify" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Mob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_location" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "atk" INTEGER NOT NULL,
    "health" INTEGER NOT NULL,
    "health_max" INTEGER NOT NULL,
    "mana" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "id_classify" INTEGER NOT NULL,
    CONSTRAINT "Mob_id_location_fkey" FOREIGN KEY ("id_location") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mob_id_classify_fkey" FOREIGN KEY ("id_classify") REFERENCES "Classify" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Classify_name_key" ON "Classify"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Mob_name_key" ON "Mob"("name");
