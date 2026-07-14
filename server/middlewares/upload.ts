import multer from 'multer';

// Use memory storage for quick buffering in sandboxed environment
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for digital forensic evidence
  }
});
