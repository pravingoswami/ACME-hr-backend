import multer from "multer";
import { sendError } from "../utils/response";
import { Request, Response, NextFunction } from "express";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

export const csvUpload = upload.single("file");

export function handleUploadError(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    return sendError(res, err.message, 400);
  }
  if (err instanceof Error) {
    return sendError(res, err.message, 400);
  }
  next(err);
}
