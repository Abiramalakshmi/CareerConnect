import { Router } from 'express';
import multer from 'multer';
import { requireClerkAuth, attachAuthContext } from '../middleware/authMiddleware.js';
import {
  getMe,
  onboardUser,
  updateMe,
  uploadMyResume,
  getMyResumeUrl,
} from '../controllers/profileController.js';

const router = Router();

// Files are kept in memory (not written to disk) since we immediately
// stream the buffer to Supabase Storage. 5MB is generous for a resume PDF.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});

// Every route in this file requires a valid Clerk session.
router.use(requireClerkAuth, attachAuthContext);

router.get('/me', getMe);
router.post('/onboard', onboardUser);
router.patch('/me', updateMe);
router.post('/me/resume', upload.single('resume'), uploadMyResume);
router.get('/me/resume', getMyResumeUrl);

export default router;
