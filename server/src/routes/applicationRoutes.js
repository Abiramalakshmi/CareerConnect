import { Router } from 'express';
import { requireClerkAuth, attachAuthContext } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  postApplication,
  getMyApplications,
  getApplicantsForJob,
  patchApplicationStatus,
  getApplicantResume,
  removeApplication,
} from '../controllers/applicationController.js';

const router = Router();

// Candidate-only
router.post('/', requireClerkAuth, attachAuthContext, requireRole('candidate'), postApplication);
router.get('/mine', requireClerkAuth, attachAuthContext, requireRole('candidate'), getMyApplications);
router.delete('/:id', requireClerkAuth, attachAuthContext, requireRole('candidate'), removeApplication);

// Recruiter-only — ownership of the underlying job is checked in the service layer
router.get('/job/:jobId', requireClerkAuth, attachAuthContext, requireRole('recruiter'), getApplicantsForJob);
router.patch('/:id/status', requireClerkAuth, attachAuthContext, requireRole('recruiter'), patchApplicationStatus);
router.get('/:id/resume', requireClerkAuth, attachAuthContext, requireRole('recruiter'), getApplicantResume);

export default router;
