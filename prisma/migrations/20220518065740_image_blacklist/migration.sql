-- CreateTable
CREATE TABLE "GuildImageBlacklist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildID" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "hash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildImageBlacklist_guildID_hash_key" ON "GuildImageBlacklist"("guildID", "hash");
