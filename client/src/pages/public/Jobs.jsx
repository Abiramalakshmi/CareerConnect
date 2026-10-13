import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchJobs } from '../../services/jobService';
import JobList from '../../components/JobList';
import SearchBar from '../../components/SearchBar';
import JobFilters from '../../components/JobFilters';

const PAGE_SIZE = 10;
const EMPTY_FILTERS = { location: '', jobType: '', experienceLevel: '' };

export default function Jobs() {
  // The landing page search sends people here with ?keyword=...&location=...
  const [params] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [keyword, setKeyword] = useState(params.get('keyword') || '');
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    location: params.get('location') || '',
  });
  // "filters" follows every keystroke; "appliedFilters" waits for a pause,
  // so typing a location doesn't fire a request per letter.
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [searchKey, setSearchKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(filters);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [filters]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchJobs({
        keyword,
        ...appliedFilters,
        page,
        pageSize: PAGE_SIZE,
      });
      setJobs(result.jobs);
      setTotal(result.total);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError('We could not load jobs. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [keyword, appliedFilters, page]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  function handleSearch(value) {
    setPage(1);
    setKeyword(value);
  }

  function clearAll() {
    setKeyword('');
    setFilters(EMPTY_FILTERS);
    setSearchKey((k) => k + 1); // resets the search box's own text
  }

  function goToPage(p) {
    setPage(p);
    window.scrollTo({ top: 0 });
  }

  const hasFilters = keyword || filters.location || filters.jobType || filters.experienceLevel;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="page">
      <h1 className="text-3xl font-bold">Browse jobs</h1>
      <p className="mt-1 text-muted">
        Search by title or company, then narrow by location, job type and experience.
      </p>

      <div className="mt-6 space-y-3">
        <SearchBar key={searchKey} initialValue={keyword} onSearch={handleSearch} />
        <JobFilters filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-6 mb-3 flex items-center justify-between text-sm text-muted">
        <span aria-live="polite">
          {loading ? 'Searching...' : `${total} ${total === 1 ? 'job' : 'jobs'} found`}
        </span>
        {hasFilters && (
          <button type="button" onClick={clearAll} className="underline hover:text-ink">
            Clear search and filters
          </button>
        )}
      </div>

      {error && <p className="text-danger">{error}</p>}

      {loading && jobs.length === 0 && (
        <div className="divide-y divide-line rounded-lg border border-line bg-surface">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2 px-5 py-4">
              <div className="h-4 w-1/3 rounded bg-line" />
              <div className="h-3 w-1/4 rounded bg-line" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-lg border border-dashed border-line bg-surface px-5 py-10 text-center">
          <p className="font-medium">No jobs match that search.</p>
          <p className="mt-1 text-sm text-muted">
            Try a shorter keyword, or remove the location and experience filters.
          </p>
        </div>
      )}

      {jobs.length > 0 && (
        <div className={loading ? 'opacity-60 transition-opacity' : ''}>
          <JobList jobs={jobs} />
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </button>
          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`h-9 w-9 rounded-md text-sm ${
                p === page ? 'bg-brand text-white' : 'border border-line bg-surface hover:border-ink'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
