-- CreateTable
CREATE TABLE "Antiflud" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_user" INTEGER NOT NULL,
    "id_message" TEXT NOT NULL,
    "date_message" DATETIME NOT NULL,
    "busy" BOOLEAN NOT NULL,
    CONSTRAINT "Antiflud_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Antiflud_id_user_key" ON "Antiflud"("id_user");
