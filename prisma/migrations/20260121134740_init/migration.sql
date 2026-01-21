-- CreateEnum
CREATE TYPE "IngredientUnit" AS ENUM ('G', 'KG', 'ML', 'L', 'PCS');

-- CreateEnum
CREATE TYPE "OverheadMode" AS ENUM ('FLAT_UGX', 'PERCENT_OF_SUBTOTAL');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "PricingMode" AS ENUM ('MARKUP', 'TARGET_PROFIT', 'TARGET_MARGIN', 'AUTO_RECOMMENDED');

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamSettings" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "bakeryName" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'UGX',
    "defaultMarkupBps" INTEGER NOT NULL DEFAULT 0,
    "defaultOverheadMode" "OverheadMode" NOT NULL DEFAULT 'FLAT_UGX',
    "defaultOverheadValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCosting" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yieldUnits" INTEGER,
    "yieldUnitLabel" TEXT,
    "notes" TEXT,
    "laborHours" DECIMAL(10,2),
    "laborRateUGXPerHour" INTEGER,
    "laborCostUGX" INTEGER,
    "overheadMode" "OverheadMode" NOT NULL DEFAULT 'FLAT_UGX',
    "overheadValue" INTEGER NOT NULL DEFAULT 0,
    "subtotalUGX" INTEGER NOT NULL,
    "overheadUGX" INTEGER NOT NULL,
    "totalCostUGX" INTEGER NOT NULL,
    "costPerUnitUGX" INTEGER,
    "markupBps" INTEGER,
    "targetProfitUGX" INTEGER,
    "targetMarginBps" INTEGER,
    "pricingMode" "PricingMode" NOT NULL DEFAULT 'AUTO_RECOMMENDED',
    "autoRecommendedPriceUGX" INTEGER,
    "userSellingPriceUGX" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientLine" (
    "id" TEXT NOT NULL,
    "productCostingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" DECIMAL(12,3) NOT NULL,
    "unit" "IngredientUnit" NOT NULL,
    "unitCostUGX" INTEGER NOT NULL,
    "lineCostUGX" INTEGER NOT NULL,

    CONSTRAINT "IngredientLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingLine" (
    "id" TEXT NOT NULL,
    "productCostingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costUGX" INTEGER NOT NULL,

    CONSTRAINT "PackagingLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingCosting" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "clientName" TEXT,
    "eventDate" TIMESTAMP(3),
    "notes" TEXT,
    "totalCostUGX" INTEGER NOT NULL,
    "costPerServingUGX" INTEGER,
    "markupBps" INTEGER,
    "targetProfitUGX" INTEGER,
    "targetMarginBps" INTEGER,
    "autoRecommendedPriceUGX" INTEGER,
    "userSellingPriceUGX" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeddingCosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingTier" (
    "id" TEXT NOT NULL,
    "weddingCostingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "servings" INTEGER,
    "flavor" TEXT,
    "linkedProductCostingId" TEXT,
    "tierCostSnapshotUGX" INTEGER,
    "manualTierCostUGX" INTEGER,

    CONSTRAINT "WeddingTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingExtra" (
    "id" TEXT NOT NULL,
    "weddingCostingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costUGX" INTEGER NOT NULL,

    CONSTRAINT "WeddingExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesEntry" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "productCostingId" TEXT,
    "productNameSnapshot" TEXT NOT NULL,
    "unitsSold" INTEGER NOT NULL,
    "sellingPricePerUnitUGX" INTEGER NOT NULL,
    "costPerUnitSnapshotUGX" INTEGER NOT NULL,
    "revenueUGX" INTEGER NOT NULL,
    "cogsUGX" INTEGER NOT NULL,
    "profitUGX" INTEGER NOT NULL,
    "channel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamSettings_teamId_key" ON "TeamSettings"("teamId");

-- CreateIndex
CREATE INDEX "ProductCosting_teamId_idx" ON "ProductCosting"("teamId");

-- CreateIndex
CREATE INDEX "WeddingCosting_teamId_idx" ON "WeddingCosting"("teamId");

-- CreateIndex
CREATE INDEX "SalesEntry_teamId_idx" ON "SalesEntry"("teamId");

-- CreateIndex
CREATE INDEX "SalesEntry_date_idx" ON "SalesEntry"("date");

-- AddForeignKey
ALTER TABLE "IngredientLine" ADD CONSTRAINT "IngredientLine_productCostingId_fkey" FOREIGN KEY ("productCostingId") REFERENCES "ProductCosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagingLine" ADD CONSTRAINT "PackagingLine_productCostingId_fkey" FOREIGN KEY ("productCostingId") REFERENCES "ProductCosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingTier" ADD CONSTRAINT "WeddingTier_weddingCostingId_fkey" FOREIGN KEY ("weddingCostingId") REFERENCES "WeddingCosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingTier" ADD CONSTRAINT "WeddingTier_linkedProductCostingId_fkey" FOREIGN KEY ("linkedProductCostingId") REFERENCES "ProductCosting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingExtra" ADD CONSTRAINT "WeddingExtra_weddingCostingId_fkey" FOREIGN KEY ("weddingCostingId") REFERENCES "WeddingCosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesEntry" ADD CONSTRAINT "SalesEntry_productCostingId_fkey" FOREIGN KEY ("productCostingId") REFERENCES "ProductCosting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
