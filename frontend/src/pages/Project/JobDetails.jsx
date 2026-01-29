import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../components/Button";

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposal, setProposal] = useState({ coverLetter: "", bidAmount: "", deliveryTime: "1 week" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5001/api/projects/${id}`);
        setJob(data);
      } catch (error) {
        toast.error("Job not found");
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to submit a proposal");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post("http://localhost:5001/api/bids", {
        project: id,
        amount: parseFloat(proposal.bidAmount),
        proposal: proposal.coverLetter,
        deliveryTime: proposal.deliveryTime
      });
      toast.success("Proposal submitted successfully!");
      setShowProposalForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const startChat = async () => {
    if (!user) {
      toast.info("Please login to message");
      navigate("/login");
      return;
    }
    try {
      const { data } = await axios.post("http://localhost:5001/api/chat", {
        userId: job.client._id || job.client
      });
      navigate("/chat", { state: { selectedChatId: data._id } });
    } catch (error) {
      toast.error("Could not start chat");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "60px" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "32px" }}>
        {/* Main Content */}
        <div>
          <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginBottom: "8px" }}>
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </p>
          <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>{job.title}</h1>
          
          {/* Meta */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
            <span>{job.category}</span>
            <span>•</span>
            <span>{job.experienceLevel || "Intermediate"}</span>
            <span>•</span>
            <span>{job.duration || "1-3 months"}</span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Description</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
              {job.description}
            </p>
          </div>

          {/* Skills */}
          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Skills Required</h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {job.skillsRequired.map(skill => (
                  <span key={skill} className="badge">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Proposal Form */}
          {showProposalForm && (
            <div className="card" style={{ marginTop: "32px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>Submit a Proposal</h3>
              <form onSubmit={handleSubmitProposal}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Your Bid Amount ($)</label>
                  <input
                    type="number"
                    value={proposal.bidAmount}
                    onChange={(e) => setProposal({ ...proposal, bidAmount: e.target.value })}
                    placeholder="Enter your price"
                    className="input-field"
                    required
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Delivery Time</label>
                  <select
                    value={proposal.deliveryTime}
                    onChange={(e) => setProposal({ ...proposal, deliveryTime: e.target.value })}
                    className="input-field"
                  >
                    <option>Less than 1 week</option>
                    <option>1 week</option>
                    <option>2 weeks</option>
                    <option>1 month</option>
                    <option>2+ months</option>
                  </select>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Cover Letter</label>
                  <textarea
                    value={proposal.coverLetter}
                    onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })}
                    placeholder="Introduce yourself and explain why you're the best fit for this project..."
                    className="input-field"
                    rows="6"
                    style={{ resize: "vertical" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Button type="button" variant="outline" onClick={() => setShowProposalForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Proposal"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="card" style={{ marginBottom: "16px" }}>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginBottom: "4px" }}>Budget</p>
              <p style={{ fontSize: "24px", fontWeight: "600" }}>${job.budget?.toLocaleString() || "N/A"}</p>
            </div>
            
            {!showProposalForm && user?.role !== "client" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Button onClick={() => setShowProposalForm(true)} style={{ width: "100%" }}>
                  Apply Now
                </Button>
                <Button variant="outline" onClick={startChat} style={{ width: "100%" }}>
                  Message Client
                </Button>
              </div>
            )}

            {user?.role === "client" && (
              <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", textAlign: "center" }}>
                This is your job posting
              </p>
            )}
          </div>

          {/* Client Info */}
          <div className="card">
            <h4 style={{ fontSize: "14px", marginBottom: "16px" }}>About the Client</h4>
            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              <p style={{ marginBottom: "8px" }}>✓ Payment Verified</p>
              <p style={{ marginBottom: "8px" }}>★ 4.8 rating</p>
              <p style={{ marginBottom: "8px" }}>12 jobs posted</p>
              <p>Member since 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
