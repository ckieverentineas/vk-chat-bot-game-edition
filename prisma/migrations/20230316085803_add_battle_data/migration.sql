-- CreateTable
CREATE TABLE "Battle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_user" INTEGER NOT NULL,
    "queue_battle" TEXT NOT NULL,
    "effect_list" TEXT NOT NULL,
    CONSTRAINT "Battle_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Battle_id_user_key" ON "Battle"("id_user");
