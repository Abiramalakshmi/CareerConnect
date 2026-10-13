import { Link, useNavigate } from 'react-router-dom';
import JobForm from '../../components/JobForm';
import { createJob } from '../../services/jobService';

export default function CreateJob() {
  const navigate = useNavigate();

  async function handleCreate(values) {
    await createJob(values);
    navigate('/recruiter/jobs');
  }

  return (
    <div className="page">
      <Link to="/recruiter/jobs" className="text-sm text-muted underline hover:text-ink">
        Back to my jobs
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold">Post a job</h1>
      <JobForm onSubmit={handleCreate} submitLabel="Post job" />
    </div>
  );
}
