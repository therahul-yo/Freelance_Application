import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../components/Button";

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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeTab, setActiveTab] = useState("best");

  // Redirect clients - they should not browse jobs (they post them)
  useEffect(() => {
    if (user?.role === "client") {
      toast.info("Go to Dashboard to manage your job postings");
      navigate("/dashboard");
    }
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get("http://localhost:5001/api/projects");
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Don't render for clients
  if (user?.role === "client") return null;

  return (
    <div className="browse-layout">
      {/* Sidebar Filters */}
      <aside className="browse-sidebar">
        <h3 className="browse-sidebar-title">🎯 Find Jobs</h3>
        
        {/* Category Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: 14, 
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--nb-text-muted)',
          }}>
            Category
          </label>
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

      {/* Main Content */}
      <main className="browse-main">
        {/* Search Bar */}
        <div className="browse-search">
          <input
            type="text"
            placeholder="🔍 Search for jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ maxWidth: "500px", fontSize: "15px" }}
          />
        </div>

        {/* Tabs */}
        <div className="neo-tabs" style={{ marginBottom: 24, display: 'inline-flex' }}>
          <button 
            className={`neo-tab ${activeTab === "best" ? 'active' : ''}`}
            onClick={() => setActiveTab("best")}
          >
            ★ Best Matches
          </button>
          <button 
            className={`neo-tab ${activeTab === "recent" ? 'active' : ''}`}
            onClick={() => setActiveTab("recent")}
          >
            🕐 Most Recent
          </button>
        </div>

        {/* Results Count */}
        <p style={{ fontSize: 13, color: "var(--nb-text-muted)", marginBottom: 20, fontWeight: 600 }}>
          {loading ? (
            <span className="neo-loading">Loading...</span>
          ) : `${filteredJobs.length} jobs available`}
        </p>

        {/* No Jobs Message */}
        {!loading && filteredJobs.length === 0 && (
          <div className="card-static" style={{ textAlign: "center", padding: "60px 20px", background: 'var(--nb-cream)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ marginBottom: 8, fontFamily: 'var(--font-heading)' }}>No jobs found</h3>
            <p style={{ color: "var(--nb-text-secondary)" }}>
              Check back later for new opportunities
            </p>
          </div>
        )}

        {/* Job Listings */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredJobs.map((job) => (
            <div key={job._id} className="job-listing">
              {/* Posted Time */}
              <p className="job-listing-time">
                Posted {formatDate(job.createdAt)}
              </p>

              {/* Title */}
              <Link to={`/jobs/${job._id}`}>
                <h3 className="job-listing-title">{job.title}</h3>
              </Link>

              {/* Job Meta */}
              <div className="job-listing-meta">
                <span style={{ fontWeight: 700 }}>
                  {job.budgetType === "hourly" 
                    ? `$${job.budgetMin || job.budget} - $${job.budgetMax || job.budget}/hr`
                    : `Fixed: $${job.budget?.toLocaleString()}`
                  }
                </span>
                <span>•</span>
                <span>{job.experienceLevel || "Intermediate"}</span>
                <span>•</span>
                <span>{job.duration || "1-3 months"}</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: "var(--nb-text-secondary)", lineHeight: "1.6", marginBottom: 14 }}>
                {job.description.length > 250 ? job.description.substring(0, 250) + "..." : job.description}
              </p>

              {/* Skills */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {job.skillsRequired?.map((skill, i) => (
                  <span key={skill} className={`badge ${['badge-blue', 'badge-purple', 'badge-lime', 'badge-orange', 'badge-pink'][i % 5]}`} style={{ fontSize: 11, padding: '4px 10px' }}>
                    {skill}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="job-listing-actions">
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--nb-text-muted)", fontWeight: 600 }}>
                  <span>📋 Proposals: {job.bidsCount || 0}</span>
                </div>
                <Link to={`/jobs/${job._id}`}>
                  <Button size="small">Apply Now →</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Projects;
