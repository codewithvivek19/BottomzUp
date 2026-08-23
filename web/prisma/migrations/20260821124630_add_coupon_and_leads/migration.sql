-- CreateTable
CREATE TABLE "CouponSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "discountLabel" TEXT NOT NULL DEFAULT '10%',
    "headline" TEXT NOT NULL DEFAULT 'In-house only',
    "note" TEXT NOT NULL DEFAULT 'Valid on food. Not stackable with other offers. Ask your server.',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "topic" TEXT,
    "preferred" TEXT,
    "message" TEXT,
    "eventDate" TEXT,
    "guests" TEXT,
    "eventType" TEXT,
    "notes" TEXT,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "bundlesJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
