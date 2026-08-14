-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'REGION_ADMIN', 'CIRCLE_ADMIN', 'DIVISION_ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('MINISTER', 'ADVISOR', 'CHIEF_MINISTER', 'SECRETARY_CLIMATE_CHANGE', 'SECRETARY', 'CHIEF_CONSERVATOR', 'CONSERVATOR', 'DFO', 'OTHER');

-- CreateEnum
CREATE TYPE "OperationKind" AS ENUM ('MARKING', 'HARVESTING', 'ACTION', 'MONITORING');

-- CreateEnum
CREATE TYPE "CampaignScope" AS ENUM ('URBAN', 'RURAL', 'BOTH');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('COMPLETED', 'ONGOING', 'FUTURE');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('PRESS_RELEASE', 'PRESS_NOTE', 'NEWS_COVERAGE', 'INTERVIEW', 'MYTH_VS_FACT', 'RAPID_RESPONSE');

-- CreateEnum
CREATE TYPE "RequestKind" AS ENUM ('PLANT', 'RESEARCH', 'GENERAL');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'FULFILLED');

-- CreateEnum
CREATE TYPE "DownloadKind" AS ENUM ('ACT', 'RULE', 'POLICY', 'FORM', 'REPORT', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('FACEBOOK', 'X', 'INSTAGRAM', 'YOUTUBE', 'LINKEDIN', 'TIKTOK', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NavTarget" AS ENUM ('SELF', 'BLANK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "designation" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "regionId" TEXT,
    "circleId" TEXT,
    "divisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "siteName" TEXT NOT NULL DEFAULT 'Forest Department, Khyber Pakhtunkhwa',
    "siteNameUr" TEXT,
    "tagline" TEXT,
    "taglineUr" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "emblemUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#166534',
    "accentColor" TEXT NOT NULL DEFAULT '#ca8a04',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "helplineNumber" TEXT,
    "footerNote" TEXT,
    "googleAnalytics" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelUr" TEXT,
    "href" TEXT,
    "icon" TEXT,
    "target" "NavTarget" NOT NULL DEFAULT 'SELF',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isMegaMenu" BOOLEAN NOT NULL DEFAULT false,
    "isDynamicRegions" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "subtitle" TEXT,
    "subtitleUr" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "secondaryCtaLabel" TEXT,
    "secondaryCtaHref" TEXT,
    "overlayOpacity" INTEGER NOT NULL DEFAULT 45,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "MessageKind" NOT NULL DEFAULT 'OTHER',
    "personName" TEXT NOT NULL,
    "personNameUr" TEXT,
    "designation" TEXT NOT NULL,
    "designationUr" TEXT,
    "photoUrl" TEXT,
    "excerpt" TEXT,
    "excerptUr" TEXT,
    "body" TEXT NOT NULL,
    "bodyUr" TEXT,
    "signatureUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatCounter" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelUr" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "suffix" TEXT,
    "prefix" TEXT,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',

    CONSTRAINT "StatCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameUr" TEXT,
    "headquarters" TEXT NOT NULL,
    "shortDesc" TEXT,
    "description" TEXT,
    "descriptionUr" TEXT,
    "coverImage" TEXT,
    "officerName" TEXT,
    "officerDesignation" TEXT,
    "officerPhoto" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "address" TEXT,
    "mapGeoJson" JSONB,
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "areaHectares" DOUBLE PRECISION,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Circle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameUr" TEXT,
    "headquarters" TEXT,
    "shortDesc" TEXT,
    "description" TEXT,
    "descriptionUr" TEXT,
    "coverImage" TEXT,
    "officerName" TEXT,
    "officerDesignation" TEXT DEFAULT 'Conservator of Forests',
    "officerPhoto" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "address" TEXT,
    "mapGeoJson" JSONB,
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "areaHectares" DOUBLE PRECISION,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Circle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameUr" TEXT,
    "headquarters" TEXT,
    "shortDesc" TEXT,
    "description" TEXT,
    "descriptionUr" TEXT,
    "coverImage" TEXT,
    "officerName" TEXT,
    "officerDesignation" TEXT DEFAULT 'Divisional Forest Officer',
    "officerPhoto" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "address" TEXT,
    "mapGeoJson" JSONB,
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "areaHectares" DOUBLE PRECISION,
    "forestType" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "circleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubDivision" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameUr" TEXT,
    "description" TEXT,
    "officerName" TEXT,
    "officerDesignation" TEXT DEFAULT 'Sub-Divisional Forest Officer',
    "contactPhone" TEXT,
    "beats" TEXT,
    "areaHectares" DOUBLE PRECISION,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "divisionId" TEXT NOT NULL,

    CONSTRAINT "SubDivision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "caption" TEXT,
    "folder" TEXT DEFAULT 'uploads',
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryAlbum" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "regionId" TEXT,
    "circleId" TEXT,
    "divisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "caption" TEXT,
    "captionUr" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "summary" TEXT,
    "body" TEXT,
    "coverImage" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "regionId" TEXT,
    "circleId" TEXT,
    "divisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForestOperation" (
    "id" TEXT NOT NULL,
    "kind" "OperationKind" NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "species" TEXT,
    "volumeCft" DOUBLE PRECISION,
    "treeCount" INTEGER,
    "compartment" TEXT,
    "operationDate" TIMESTAMP(3),
    "officerName" TEXT,
    "documentUrl" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "divisionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForestOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantationCampaign" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "scope" "CampaignScope" NOT NULL DEFAULT 'BOTH',
    "season" TEXT,
    "year" INTEGER NOT NULL,
    "targetPlants" INTEGER NOT NULL DEFAULT 0,
    "achievedPlants" INTEGER NOT NULL DEFAULT 0,
    "targetArea" DOUBLE PRECISION,
    "achievedArea" DOUBLE PRECISION,
    "species" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "mapGeoJson" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "divisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "coverImage" TEXT,
    "location" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "projectStatus" "ProjectStatus" NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "costPkr" DOUBLE PRECISION,
    "fundingSource" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "coverImage" TEXT,
    "documentUrl" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "regionId" TEXT,
    "circleId" TEXT,
    "divisionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "bodyUr" TEXT,
    "coverImage" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "summary" TEXT,
    "body" TEXT,
    "coverImage" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "videoUrl" TEXT,
    "documentUrl" TEXT,
    "mythText" TEXT,
    "factText" TEXT,
    "publishedAt" TIMESTAMP(3),
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPerson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "photoUrl" TEXT,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "divisionId" TEXT,

    CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "handle" TEXT,
    "divisionId" TEXT,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WildlifeSpecies" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "commonNameUr" TEXT,
    "scientificName" TEXT,
    "category" TEXT,
    "conservationStatus" TEXT,
    "habitat" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',

    CONSTRAINT "WildlifeSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowYourForestArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "coverImage" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowYourForestArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicRequest" (
    "id" TEXT NOT NULL,
    "ticketNo" TEXT NOT NULL,
    "kind" "RequestKind" NOT NULL,
    "fullName" TEXT NOT NULL,
    "cnic" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "district" TEXT,
    "address" TEXT,
    "species" TEXT,
    "quantity" INTEGER,
    "purpose" TEXT,
    "institution" TEXT,
    "topic" TEXT,
    "attachmentUrl" TEXT,
    "requestStatus" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "officerNote" TEXT,
    "handledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleUr" TEXT,
    "kind" "DownloadKind" NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "documentDate" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_regionId_circleId_divisionId_idx" ON "User"("regionId", "circleId", "divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "NavItem_parentId_orderIndex_idx" ON "NavItem"("parentId", "orderIndex");

-- CreateIndex
CREATE INDEX "HeroSlide_status_orderIndex_idx" ON "HeroSlide"("status", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Message_slug_key" ON "Message"("slug");

-- CreateIndex
CREATE INDEX "Message_status_orderIndex_idx" ON "Message"("status", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE INDEX "Region_status_orderIndex_idx" ON "Region"("status", "orderIndex");

-- CreateIndex
CREATE INDEX "Circle_regionId_orderIndex_idx" ON "Circle"("regionId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Circle_regionId_slug_key" ON "Circle"("regionId", "slug");

-- CreateIndex
CREATE INDEX "Division_circleId_orderIndex_idx" ON "Division"("circleId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Division_circleId_slug_key" ON "Division"("circleId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "SubDivision_divisionId_slug_key" ON "SubDivision"("divisionId", "slug");

-- CreateIndex
CREATE INDEX "MediaAsset_folder_createdAt_idx" ON "MediaAsset"("folder", "createdAt");

-- CreateIndex
CREATE INDEX "GalleryAlbum_divisionId_idx" ON "GalleryAlbum"("divisionId");

-- CreateIndex
CREATE INDEX "GalleryImage_albumId_orderIndex_idx" ON "GalleryImage"("albumId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_slug_key" ON "Activity"("slug");

-- CreateIndex
CREATE INDEX "ForestOperation_divisionId_kind_operationDate_idx" ON "ForestOperation"("divisionId", "kind", "operationDate");

-- CreateIndex
CREATE UNIQUE INDEX "PlantationCampaign_slug_key" ON "PlantationCampaign"("slug");

-- CreateIndex
CREATE INDEX "PlantationCampaign_year_status_idx" ON "PlantationCampaign"("year", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SuccessStory_slug_key" ON "SuccessStory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_projectStatus_status_idx" ON "Project"("projectStatus", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_status_orderIndex_idx" ON "Page"("status", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "MediaPost_slug_key" ON "MediaPost"("slug");

-- CreateIndex
CREATE INDEX "MediaPost_kind_status_publishedAt_idx" ON "MediaPost"("kind", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "ContactPerson_isEmergency_orderIndex_idx" ON "ContactPerson"("isEmergency", "orderIndex");

-- CreateIndex
CREATE INDEX "SocialLink_divisionId_idx" ON "SocialLink"("divisionId");

-- CreateIndex
CREATE UNIQUE INDEX "WildlifeSpecies_slug_key" ON "WildlifeSpecies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "KnowYourForestArticle_slug_key" ON "KnowYourForestArticle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PublicRequest_ticketNo_key" ON "PublicRequest"("ticketNo");

-- CreateIndex
CREATE INDEX "PublicRequest_kind_requestStatus_createdAt_idx" ON "PublicRequest"("kind", "requestStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Download_kind_status_orderIndex_idx" ON "Download"("kind", "status", "orderIndex");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavItem" ADD CONSTRAINT "NavItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Circle" ADD CONSTRAINT "Circle_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubDivision" ADD CONSTRAINT "SubDivision_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForestOperation" ADD CONSTRAINT "ForestOperation_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantationCampaign" ADD CONSTRAINT "PlantationCampaign_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStory" ADD CONSTRAINT "SuccessStory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PlantationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

