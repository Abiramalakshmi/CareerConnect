import { Router } from 'express';
import { requireClerkAuth, attachAuthContext } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  getJobs, getJob, postJob, getMyJobs, patchJob, removeJob,
} from '../controllers/jobController.js';

const router = Router();

// Public — no login required.
router.get('/', getJobs);

// Recruiter-only. Must be registered before "/:id" so "mine" isn't
// swallowed as a job id.
router.get('/mine', requireClerkAuth, attachAuthContext, requireRole('recruiter'), getMyJobs);
router.post('/', requireClerkAuth, attachAuthContext, requireRole('recruiter'), postJob);
router.patch('/:id', requireClerkAuth, attachAuthContext, requireRole('recruiter'), patchJob);
router.delete('/:id', requireClerkAuth, attachAuthContext, requireRole('recruiter'), removeJob);

// Public — after "/mine" so ordering above holds for GET.
router.get('/:id', getJob);

export default router;
