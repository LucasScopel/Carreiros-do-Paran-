-- CreateIndex
CREATE INDEX "Review_visitDate_id_idx" ON "Review"("visitDate", "id");

-- CreateIndex
CREATE INDEX "Review_rating_id_idx" ON "Review"("rating", "id");

-- CreateIndex
CREATE INDEX "Review_difficultyRating_id_idx" ON "Review"("difficultyRating", "id");
