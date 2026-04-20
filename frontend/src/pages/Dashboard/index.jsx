import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../components/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (user.role === "client") {
        // Fetch jobs posted by this client
        const { data } = await axios.get(`${API_URL}/api/projects`);
        const myPostedJobs = data.filter(job => job.client === user._id || job.client?._id === user._id);
        setMyJobs(myPostedJobs);
      } else {
        // Fetch bids by this freelancer
        try {
          const { data: bids } = await axios.get(`${API_URL}/api/bids/my`);
          setMyBids(bids);
        } catch (e) {
          console.log("No bids yet");
        }
        // Fetch gigs by this freelancer
        try {
          const { data: gigs } = await axios.get(`${API_URL}/api/gigs/my`);
          setMyGigs(gigs);
        } catch (e) {
          console.log("No gigs yet");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) return null;

  const isClient = user.role === "client";

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
            Welcome back, {user.name}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            {isClient ? "Manage your job postings and find talent" : "Manage your gigs and proposals"}
          </p>
        </div>
        {isClient ? (
          <Link to="/post-job">
            <Button>+ Post a Job</Button>
          </Link>
        ) : (
          <Link to="/post-gig">
            <Button>+ Create Gig</Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
        {isClient ? (
          <>
            <div className="card">
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                Active Jobs
              </p>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>{myJobs.filter(j => j.status === "open").length}</p>
            </div>
            <div className="card">
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                In Progress
              </p>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>{myJobs.filter(j => j.status === "in-progress").length}</p>
            </div>
            <div className="card">
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                Completed
              </p>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>{myJobs.filter(j => j.status === "completed").length}</p>
            </div>
            <div className="card">
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                Total Spent
              </p>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>$0</p>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                Active Gigs
              </p>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>{myGigs.filter(g => g.status === "active").length}</p>
            </div>
            <div className="card">
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                Pending Proposals
              </p>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>{myBids.filter(b => b.status === "pending").length}</p>
            </div>
            <div className="card">
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                Accepted
              </p>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>{myBids.filter(b => b.status === "accepted").length}</p>
            </div>
            <div className="card">
              <p style={{ color: "var(--color-text-tertiary)", fontSize: "12px", textTransform: "uppercase", marginBottom: "8px" }}>
                Total Earnings
              </p>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>$0</p>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
      ) : isClient ? (
        /* Client: My Posted Jobs */
        <div>
          <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>My Job Postings</h2>
          {myJobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <h3 style={{ marginBottom: "8px" }}>No jobs posted yet</h3>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "20px" }}>
                Post your first job to start hiring talented freelancers
              </p>
              <Link to="/post-job">
                <Button>Post a Job</Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {myJobs.map(job => (
                <div key={job._id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <Link to={`/jobs/${job._id}`}>
                        <h4 style={{ fontSize: "16px", marginBottom: "4px" }}>{job.title}</h4>
                      </Link>
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                        Posted {formatDate(job.createdAt)} • {job.bidsCount || 0} proposals • ${job.budget}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="badge" style={{ 
                        background: job.status === "open" ? "rgba(34, 197, 94, 0.1)" : "var(--color-bg-tertiary)",
                        color: job.status === "open" ? "#22c55e" : "var(--color-text-secondary)"
                      }}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Freelancer: My Gigs and Proposals */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          {/* My Gigs */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px" }}>My Gigs</h2>
              <Link to="/post-gig" style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>+ Add new</Link>
            </div>
            {myGigs.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                <h4 style={{ marginBottom: "8px", fontSize: "14px" }}>No gigs yet</h4>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px", fontSize: "13px" }}>
                  Create a gig to showcase your services
                </p>
                <Link to="/post-gig">
                  <Button style={{ fontSize: "12px", padding: "8px 16px" }}>Create Gig</Button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {myGigs.map(gig => (
                  <div key={gig._id} className="card">
                    <Link to={`/gigs/${gig._id}`}>
                      <h4 style={{ fontSize: "14px", marginBottom: "4px" }}>{gig.title}</h4>
                    </Link>
                    <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      ${gig.price} • {gig.category}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Proposals */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px" }}>My Proposals</h2>
              <Link to="/projects" style={{ color: "var(--color-text-secondary)", fontSize: "13px" }}>Find jobs →</Link>
            </div>
            {myBids.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
                <h4 style={{ marginBottom: "8px", fontSize: "14px" }}>No proposals yet</h4>
                <p style={{ color: "var(--color-text-secondary)", marginBottom: "16px", fontSize: "13px" }}>
                  Apply to jobs to get hired
                </p>
                <Link to="/projects">
                  <Button style={{ fontSize: "12px", padding: "8px 16px" }}>Find Jobs</Button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {myBids.map(bid => (
                  <div key={bid._id} className="card">
                    <Link to={`/jobs/${bid.project?._id}`}>
                      <h4 style={{ fontSize: "14px", marginBottom: "4px" }}>{bid.project?.title || "Job"}</h4>
                    </Link>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                        Your bid: ${bid.amount}
                      </p>
                      <span className="badge" style={{ 
                        background: bid.status === "accepted" ? "rgba(34, 197, 94, 0.1)" : 
                                    bid.status === "rejected" ? "rgba(239, 68, 68, 0.1)" : "var(--color-bg-tertiary)",
                        color: bid.status === "accepted" ? "#22c55e" : 
                               bid.status === "rejected" ? "#ef4444" : "var(--color-text-secondary)",
                        fontSize: "11px"
                      }}>
                        {bid.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
