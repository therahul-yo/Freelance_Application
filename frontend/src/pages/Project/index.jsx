import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { JobRowSkeleton } from "../../components/Skeleton";

const CATEGORIES = [
  "All Categories",
  "Web Development",
  "Mobile Development",
  "Design",
  "Data Science",
  "Writing",
  "Marketing",
];

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeTab, setActiveTab] = useState("best");

  useEffect(() => {
    if (user?.role === "client") {
      toast.info("Go to Dashboard to manage your job postings");
      navigate("/dashboard");
    }
  }, [user]);

  useEffect(() => { fetchJobs(1); }, [selectedCategory]);

  const fetchJobs = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects?${params}`);
      const list = Array.isArray(data) ? data : (data.projects || []);
      setJobs(list);
      setTotal(Array.isArray(data) ? data.length : (data.total || 0));
      setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1));
      setPage(Array.isArray(data) ? 1 : (data.page || 1));
    } catch {
      toast.error("Could not load jobs");
    } finally { setLoading(false); }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return "JUST NOW";
    if (hours < 24) return `${hours}H AGO`;
    if (days < 7) return `${days}D AGO`;
    return date.toLocaleDateString();
  };

  if (user?.role === "client") return null;

  return (
    <div className="browse-layout">
      {/* SIDEBAR */}
      <aside className="browse-sidebar">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 6 }}>
          § FILTERS
        </div>
        <h3 className="browse-sidebar-title">Find Jobs</h3>
        <div>
          <label className="input-label">Category</label>
          {CATEGORIES.map(cat => (
            <div
              key={cat}
              className={`category-option ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <div className="category-radio">
                {selectedCategory === cat && <div className="category-radio-dot" />}
              </div>
              {cat}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main className="browse-main">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 24 }}>
          Find <span style={{ background: 'var(--yellow)', padding: '0 12px', border: '4px solid var(--ink)' }}>Work</span>
        </h1>

        <div className="browse-search" style={{ marginBottom: 24, display: 'flex', gap: 0, alignItems: 'stretch' }}>
          <input
            type="text"
            placeholder="SEARCH JOBS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchJobs(1)}
            className="input-field"
            style={{ flex: 1, boxShadow: 'none', fontSize: 14 }}
          />
          <Button onClick={() => fetchJobs(1)} style={{ marginLeft: -4, boxShadow: 'none' }}>Search</Button>
        </div>

        <div className="neo-tabs" style={{ marginBottom: 24 }}>
          <button className={`neo-tab ${activeTab === "best" ? 'active' : ''}`} onClick={() => setActiveTab("best")}>
            ★ Best Matches
          </button>
          <button className={`neo-tab ${activeTab === "recent" ? 'active' : ''}`} onClick={() => setActiveTab("recent")}>
            ↻ Most Recent
          </button>
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          {loading ? "// LOADING..." : `// ${total} JOBS AVAILABLE`}
        </p>

        {loading && (
          <div>
            <JobRowSkeleton />
            <JobRowSkeleton />
            <JobRowSkeleton />
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="card-static" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, opacity: 0.2 }}>—</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', marginBottom: 8 }}>No Jobs Found</h3>
            <p style={{ fontFamily: 'var(--font-body)', color: "var(--muted)" }}>Check back later for new opportunities.</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div style={{ borderTop: '4px solid var(--ink)' }}>
            {jobs.map((job) => (
              <div key={job._id} className="job-row job-listing">
                <p className="job-listing-time">POSTED {formatDate(job.createdAt)}</p>
                <Link to={`/jobs/${job._id}`}>
                  <h3 className="job-listing-title">{job.title}</h3>
                </Link>
                <div className="job-listing-meta">
                  <span style={{ fontWeight: 700 }}>
                    {job.budgetType === "hourly"
                      ? `$${job.budgetMin || job.budget} – $${job.budgetMax || job.budget}/HR`
                      : `FIXED · $${job.budget?.toLocaleString()}`}
                  </span>
                  <span>·</span>
                  <span>{(job.experienceLevel || "Intermediate").toUpperCase()}</span>
                  <span>·</span>
                  <span>{(job.duration || "1-3 months").toUpperCase()}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14, maxWidth: 720 }}>
                  {job.description.length > 250 ? job.description.substring(0, 250) + "..." : job.description}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {job.skillsRequired?.map((skill) => (
                    <span key={skill} className="badge">{skill}</span>
                  ))}
                </div>
                <div className="job-listing-actions">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: "var(--muted)", textTransform: 'uppercase', letterSpacing: 1 }}>
                    {job.bidsCount || 0} PROPOSALS
                  </span>
                  <Link to={`/jobs/${job._id}`}>
                    <Button size="sm">Apply Now →</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 32, justifyContent: "center" }}>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchJobs(page - 1)}>← Prev</Button>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchJobs(page + 1)}>Next →</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
