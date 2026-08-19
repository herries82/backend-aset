-- CreateTable
CREATE TABLE "AsetICT" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sekolah" TEXT NOT NULL,
    "kodSekolah" TEXT NOT NULL,
    "jenisTag" TEXT NOT NULL,
    "jenamaModel" TEXT NOT NULL,
    "noSiri" TEXT NOT NULL,
    "fasa" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
