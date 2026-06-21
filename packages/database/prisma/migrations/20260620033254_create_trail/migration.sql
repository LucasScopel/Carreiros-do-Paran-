CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateTable
CREATE TABLE "Trail" (
    "id" BIGSERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "point" geometry(Point,4326) NOT NULL,
    "address" TEXT NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "Trail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrailImage" (
    "id" SERIAL NOT NULL,
    "trailId" BIGINT NOT NULL,
    "position" INTEGER NOT NULL,
    "format" TEXT NOT NULL,

    CONSTRAINT "TrailImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trail_publicId_key" ON "Trail"("publicId");

-- CreateIndex
CREATE INDEX "Trail_publicId_idx" ON "Trail"("publicId");

-- CreateIndex
CREATE INDEX "TrailImage_id_trailId_idx" ON "TrailImage"("id", "trailId");

-- AddForeignKey
ALTER TABLE "TrailImage" ADD CONSTRAINT "TrailImage_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "Trail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
