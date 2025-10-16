import React, { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface Job {
  job_id: string;
  job_title: string;
  employer_name?: string;
  employer_logo?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_apply_link: string;
  job_description?: string;
  job_employment_type?: string;
}

interface SearchParams {
  what: string;
  where: string;
}

const JobSearch: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(() => {
    // ✅ Initialize from localStorage
    const cached = localStorage.getItem('jobSearchResults');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState<SearchParams>(() => {
    // ✅ Initialize search from localStorage
    const cached = localStorage.getItem('jobSearchParams');
    return cached ? JSON.parse(cached) : { what: "software engineer", where: "Lagos" };
  });
  
  const [page, setPage] = useState(() => {
    // ✅ Initialize page from localStorage
    const cached = localStorage.getItem('jobSearchPage');
    return cached ? parseInt(cached) : 1;
  });
  
  const [totalResults, setTotalResults] = useState(0);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [savingJob, setSavingJob] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(() => {
    // ✅ Track if user has searched before
    return localStorage.getItem('jobSearchResults') !== null;
  });

  const fetchJobs = async (newPage = page, searchParams = search) => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        ...searchParams,
        page: newPage.toString(),
      }).toString();

      const response = await fetch(`/api/jobs?${query}`);
      
      if (!response.ok) throw new Error("Failed to fetch jobs");
      
      const data = await response.json();
      
      const jobsData = data.data || [];
      setJobs(jobsData);
      setTotalResults(jobsData.length);
      setHasSearched(true);
      
      // ✅ Cache results in localStorage
      localStorage.setItem('jobSearchResults', JSON.stringify(jobsData));
      localStorage.setItem('jobSearchParams', JSON.stringify(searchParams));
      localStorage.setItem('jobSearchPage', newPage.toString());
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveApplication = async (job: Job) => {
    setSavingJob(job.job_id);
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: job.job_title,
          company: job.employer_name || 'Unknown Company',
          link: job.job_apply_link,
          status: 'applied',
          notes: `Location: ${job.job_city ? `${job.job_city}, ${job.job_state}` : 'Not specified'}\nEmployment Type: ${job.job_employment_type || 'Not specified'}`,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save application');
      }

      setSavedJobs(prev => new Set(prev).add(job.job_id));
      alert('Application saved successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save application');
    } finally {
      setSavingJob(null);
    }
  };

  // ✅ REMOVED: Empty useEffect that was causing re-fetch
  // Jobs are now loaded from localStorage on mount
  // Only fetch when user clicks Search button

  const handleSearch = () => {
    setPage(1);
    fetchJobs(1, search);
  };

  const handleNext = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, search);
  };

  const handlePrev = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchJobs(prevPage, search);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700 text-center">
        Find Your Next Job
      </h1>
      
      <p className="text-center text-sm text-gray-600">
        {totalResults > 0 ? `${totalResults} results` : hasSearched ? "No results found" : "Enter search criteria and click Search"}
      </p>

      {/* Search Controls */}
      <div className="flex flex-wrap justify-center gap-3">
        <input
          type="text"
          placeholder="Job title (e.g. Software Engineer)"
          value={search.what}
          onChange={(e) => setSearch({ ...search, what: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="border border-gray-300 rounded-lg p-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Location (e.g. Lagos)"
          value={search.where}
          onChange={(e) => setSearch({ ...search, where: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="border border-gray-300 rounded-lg p-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && <p className="text-center text-gray-500">Loading jobs...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Jobs Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.job_id}
              className="border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative"
            >
              {/* Company Logo */}
              {job.employer_logo && (
                <img 
                  src={job.employer_logo} 
                  alt={job.employer_name}
                  className="w-12 h-12 object-contain mb-3"
                />
              )}
              
              <h3 className="font-semibold text-lg text-gray-800 mb-1">
                {job.job_title}
              </h3>
              <p className="text-gray-600 mb-2">
                {job.employer_name || "Unknown Company"}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                {job.job_city && job.job_state
                  ? `${job.job_city}, ${job.job_state}`
                  : job.job_city || job.job_state || "Unknown Location"}
              </p>
              {job.job_employment_type && (
                <p className="text-xs text-gray-400 mb-3">
                  {job.job_employment_type}
                </p>
              )}
              
              <div className="flex gap-2 mt-4">
                <a
                  href={job.job_apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Apply Now
                </a>
                
                <button
                  onClick={() => saveApplication(job)}
                  disabled={savedJobs.has(job.job_id) || savingJob === job.job_id}
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1 text-sm font-medium ${
                    savedJobs.has(job.job_id)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                  title={savedJobs.has(job.job_id) ? 'Saved' : 'Save to tracker'}
                >
                  {savedJobs.has(job.job_id) ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  {savingJob === job.job_id ? '...' : savedJobs.has(job.job_id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && hasSearched && (
            <p className="text-center text-gray-500 col-span-full">
              No jobs found. Try different search terms.
            </p>
          )
        )}
        
        {!hasSearched && !loading && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-2">Ready to find your next opportunity?</p>
            <p className="text-sm text-gray-400">Enter your job title and location above, then click Search</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {jobs.length > 0 && (
        <div className="flex justify-center gap-4 items-center pt-4">
          <button
            onClick={handlePrev}
            disabled={page === 1 || loading}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-gray-700 font-medium">Page {page}</span>
          <button
            onClick={handleNext}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
