import {
  listJobs, getJobById, createJob, listJobsByRecruiter, updateJob, deleteJob,
} from '../services/jobService.js';
import { validateJobInput } from '../utils/validators.js';

// GET /api/jobs?keyword=&location=&jobType=&experienceLevel=&page=&pageSize=
export async function getJobs(req, res, next) {
  try {
    const { keyword, location, jobType, experienceLevel, page, pageSize } = req.query;

    const result = await listJobs({
      keyword,
      location,
      jobType,
      experienceLevel,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/:id
export async function getJob(req, res, next) {
  try {
    const job = await getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.status(200).json({ job });
  } catch (err) {
    next(err);
  }
}

// POST /api/jobs — recruiter only. req.dbUser comes from requireRole('recruiter').
export async function postJob(req, res, next) {
  try {
    const { title, company, description } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({ error: 'title, company, and description are required' });
    }

    const validationErrors = validateJobInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join('; ') });
    }

    const job = await createJob(req.dbUser.id, req.body);
    return res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs/mine — recruiter only.
export async function getMyJobs(req, res, next) {
  try {
    const jobs = await listJobsByRecruiter(req.dbUser.id);
    return res.status(200).json({ jobs });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/jobs/:id — recruiter only, must own the job.
export async function patchJob(req, res, next) {
  try {
    const validationErrors = validateJobInput(req.body, { partial: true });
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join('; ') });
    }

    const job = await updateJob(req.params.id, req.dbUser.id, req.body);

    if (!job) {
      return res.status(404).json({ error: 'Job not found or not owned by you' });
    }

    return res.status(200).json({ job });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/jobs/:id — recruiter only, must own the job.
export async function removeJob(req, res, next) {
  try {
    const job = await deleteJob(req.params.id, req.dbUser.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found or not owned by you' });
    }

    return res.status(200).json({ job });
  } catch (err) {
    next(err);
  }
}
