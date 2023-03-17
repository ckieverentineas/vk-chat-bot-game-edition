/*
  Warnings:

  - A unique constraint covering the columns `[id_location,uid,subuid]` on the table `Region` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Region_id_location_uid_subuid_key" ON "Region"("id_location", "uid", "subuid");
