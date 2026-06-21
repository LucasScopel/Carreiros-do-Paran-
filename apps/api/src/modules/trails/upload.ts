import multer from "multer";

export const trailImageUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    cb(null, allowed.includes(file.mimetype));
  },
});
