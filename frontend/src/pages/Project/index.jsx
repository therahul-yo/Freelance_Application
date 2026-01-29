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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Filters */}
      <aside style={{ 
        width: "260px", 
        borderRight: "1px solid var(--color-border)", 
        padding: "24px",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto"
      }}>
        <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Find Jobs</h3>
        
        {/* Category Filter */}
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ fontSize: "13px", marginBottom: "12px", color: "var(--color-text-secondary)" }}>Category</h4>
          {CATEGORIES.map(cat => (
            <label 
              key={cat} 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                marginBottom: "8px",
                cursor: "pointer",
                fontSize: "13px",
                color: selectedCategory === cat ? "var(--color-text-primary)" : "var(--color-text-secondary)"
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              <span style={{ 
                width: "16px", 
                height: "16px", 
                border: "1px solid var(--color-border)", 
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {selectedCategory === cat && (
                  <span style={{ width: "8px", height: "8px", background: "white", borderRadius: "50%" }} />
                )}
              </span>
              {cat}
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "24px 32px" }}>
        {/* Search Bar */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Search for jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ maxWidth: "500px", fontSize: "15px" }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
          <button 
            onClick={() => setActiveTab("best")}
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: "14px",
              color: activeTab === "best" ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
              fontWeight: activeTab === "best" ? "600" : "400",
              cursor: "pointer",
              paddingBottom: "8px",
              borderBottom: activeTab === "best" ? "2px solid white" : "2px solid transparent",
              marginBottom: "-13px"
            }}
          >
            Best Matches
          </button>
          <button 
            onClick={() => setActiveTab("recent")}
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: "14px",
              color: activeTab === "recent" ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
              fontWeight: activeTab === "recent" ? "600" : "400",
              cursor: "pointer",
              paddingBottom: "8px",
              borderBottom: activeTab === "recent" ? "2px solid white" : "2px solid transparent",
              marginBottom: "-13px"
            }}
          >
            Most Recent
          </button>
        </div>

        {/* Results Count */}
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
          {loading ? "Loading..." : `${filteredJobs.length} jobs available`}
        </p>

        {/* No Jobs Message */}
        {!loading && filteredJobs.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h3 style={{ marginBottom: "8px" }}>No jobs found</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Check back later for new opportunities
            </p>
          </div>
        )}

        {/* Job Listings */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredJobs.map((job, index) => (
            <div
              key={job._id}
              style={{ 
                padding: "24px 0", 
                borderBottom: index !== filteredJobs.length - 1 ? "1px solid var(--color-border)" : "none"
              }}
            >
              {/* Posted Time */}
              <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
                Posted {formatDate(job.createdAt)}
              </p>

              {/* Title */}
              <Link to={`/jobs/${job._id}`} style={{ textDecoration: "none" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "12px", cursor: "pointer" }}>
                  {job.title}
                </h3>
              </Link>

              {/* Job Meta */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "12px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                <span>
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
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.6", marginBottom: "12px" }}>
                {job.description.length > 250 ? job.description.substring(0, 250) + "..." : job.description}
              </p>

              {/* Skills */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {job.skillsRequired?.map(skill => (
                  <span key={skill} className="badge">{skill}</span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                  <span>Proposals: {job.bidsCount || 0}</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link to={`/jobs/${job._id}`}>
                    <Button style={{ fontSize: "12px", padding: "6px 12px" }}>
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Projects;
