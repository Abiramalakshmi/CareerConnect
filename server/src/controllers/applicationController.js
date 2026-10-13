import {
  applyToJob,
  listApplicationsByCandidate,
  listApplicantsForJob,
  updateApplicationStatus,
  getApplicantResumeUrl,
  withdrawApplication,
} from '../services/applicationService.js';

// POST /api/applications — candidate only. Body: { jobId, coverLetter }
export async function postApplication(req, res, next) {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const application = await applyToJob(req.dbUser.id, jobId, {
      coverLetter,
      resumePath: req.dbUser.resume_path,
    });

    return res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/mine — candidate only
export async function getMyApplications(req, res, next) {
  try {
    const applications = await listApplicationsByCandidate(req.dbUser.id);
    return res.status(200).json({ applications });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/job/:jobId — recruiter only, must own the job
export async function getApplicantsForJob(req, res, next) {
  try {
    const result = await listApplicantsForJob(req.params.jobId, req.dbUser.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/applications/:id/status — recruiter only. Body: { status }
export async function patchApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const application = await updateApplicationStatus(req.params.id, req.dbUser.id, status);
    return res.status(200).json({ application });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/applications/:id — candidate only, withdraws their own application
export async function removeApplication(req, res, next) {
  try {
    const application = await withdrawApplication(req.params.id, req.dbUser.id);
    return res.status(200).json({ application });
  } catch (err) {
    next(err);
  }
}

// GET /api/applications/:id/resume — recruiter only, must own the underlying job
export async function getApplicantResume(req, res, next) {
  try {
    const url = await getApplicantResumeUrl(req.params.id, req.dbUser.id);

    if (!url) {
      return res.status(404).json({ error: 'No resume on this application' });
    }

    return res.status(200).json({ url });
  } catch (err) {
    next(err);
  }
}
