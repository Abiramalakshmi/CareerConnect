import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import JobForm from '../../components/JobForm';
import { fetchJobById, updateJob } from '../../services/jobService';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const job = await fetchJobById(id);
        if (cancelled) return;

        setInitialValues({
          title: job.title || '',
          company: job.company || '',
          description: job.description || '',
          requirements: job.requirements || '',
          location: job.location || '',
          jobType: job.job_type || '',
          workMode: job.work_mode || '',
          experienceLevel: job.experience_level || '',
          salaryMin: job.salary_min ?? '',
          salaryMax: job.salary_max ?? '',
          deadline: job.deadline || '',
        });
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('This job could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleUpdate(values) {
    await updateJob(id, values);
    navigate('/recruiter/jobs');
  }

  if (loading) return <div className="page text-muted">Loading...</div>;
  if (error) return <div className="page text-danger">{error}</div>;

  return (
    <div className="page">
      <Link to="/recruiter/jobs" className="text-sm text-muted underline hover:text-ink">
        Back to my jobs
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold">Edit job</h1>
      <JobForm initialValues={initialValues} onSubmit={handleUpdate} submitLabel="Save changes" />
    </div>
  );
}
