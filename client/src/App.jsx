import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Onboarding from './pages/auth/Onboarding.jsx';
import CandidateDashboard from './pages/candidate/CandidateDashboard.jsx';
import CandidateProfile from './pages/candidate/CandidateProfile.jsx';
import MyApplications from './pages/candidate/MyApplications.jsx';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard.jsx';
import Home from './pages/public/Home.jsx';
import Jobs from './pages/public/Jobs.jsx';
import NotFound from './pages/public/NotFound.jsx';
import JobDetails from './pages/public/JobDetails.jsx';
import MyJobs from './pages/recruiter/MyJobs.jsx';
import CreateJob from './pages/recruiter/CreateJob.jsx';
import EditJob from './pages/recruiter/EditJob.jsx';
import Applicants from './pages/recruiter/Applicants.jsx';

// Centers Clerk's prebuilt sign-in / sign-up forms on the page.
function AuthPage({ children }) {
  return <div className="flex justify-center px-5 py-12">{children}</div>;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Clerk's prebuilt components handle the actual auth forms */}
          <Route path="/sign-in/*" element={
              <AuthPage>
                <SignIn routing="path" path="/sign-in" />
              </AuthPage>
            } />
          <Route path="/sign-up/*" element={
              <AuthPage>
                <SignUp routing="path" path="/sign-up" />
              </AuthPage>
            } />

          {/* Public — no login required */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute skipOnboardCheck>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute requiredRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute requiredRole="candidate">
                <CandidateProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute requiredRole="candidate">
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/jobs"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <MyJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/jobs/new"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <CreateJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/jobs/:id/edit"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <EditJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/jobs/:jobId/applicants"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <Applicants />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
