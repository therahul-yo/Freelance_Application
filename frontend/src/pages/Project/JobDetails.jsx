import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { formatCurrency, formatRelativeDate, getUserInitials } from "../../utils/formatters";

const initialProposal = {
  coverLetter: "",
  bidAmount: "",
  deliveryTime: "1 week",
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [myBid, setMyBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposal, setProposal] = useState(initialProposal);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isOwner = useMemo(() => {
    if (!job || !user) return false;
    return job.client?._id === user._id;
  }, [job, user]);

  const loadJob = useCallback(async () => {
    const { data } = await api.get(`/projects/${id}`);
    setJob(data);
    return data;
  }, [id]);

  useEffect(() => {
    const load = async () => {
      try {
        const project = await loadJob();

        if (user?.role === "client" && project.client?._id === user._id) {
          const { data } = await api.get(`/bids/project/${id}`);
          setBids(data);
        }

        if (user?.role === "freelancer") {
          const { data } = await api.get("/bids/my");
          const matchingBid = data.find((bid) => bid.project?._id === id);
          setMyBid(matchingBid || null);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Project not found");
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, loadJob, navigate, user]);

  const startChat = async () => {
    if (!user) {
      toast.info("Log in first to start a conversation.");
      navigate("/login");
      return;
    }

    try {
      const { data } = await api.post("/chat", {
        userId: job.client._id,
        contextId: job._id,
        contextType: "project",
        contextTitle: job.title,
      });

      navigate("/chat", { state: { selectedChatId: data._id } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not start chat");
    }
  };

  const messageFreelancer = async (bid) => {
    try {
      const { data } = await api.post("/chat", {
        userId: bid.freelancer._id,
        contextId: job._id,
        contextType: "project",
        contextTitle: job.title,
        contextBidId: bid._id,
      });

      navigate("/chat", { state: { selectedChatId: data._id } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not start chat");
    }
  };

  const submitProposal = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.info("Log in first to submit a proposal.");
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post("/bids", {
        project: id,
        amount: Number(proposal.bidAmount),
        proposal: proposal.coverLetter,
        deliveryTime: proposal.deliveryTime,
      });

      setMyBid(data);
      setProposal(initialProposal);
      setShowProposalForm(false);
      await loadJob();
      toast.success("Proposal submitted.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Proposal could not be submitted");
    } finally {
      setSubmitting(false);
    }
  };

  const acceptBid = async (bidId) => {
    try {
      await api.put(`/bids/${bidId}/accept`);
      const [projectResponse, bidsResponse] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/bids/project/${id}`),
      ]);
      setJob(projectResponse.data);
      setBids(bidsResponse.data);
      toast.success("Proposal accepted. Project moved to in-progress.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not accept proposal");
    }
  };

  const rejectBid = async (bidId) => {
    try {
      await api.put(`/bids/${bidId}/reject`);
      const { data } = await api.get(`/bids/project/${id}`);
      setBids(data);
      toast.success("Proposal rejected.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not reject proposal");
    }
  };

  const withdrawBid = async () => {
    if (!myBid) return;
    try {
      await api.delete(`/bids/${myBid._id}`);
      setMyBid(null);
      await loadJob();
      toast.success("Proposal withdrawn.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not withdraw proposal");
    }
  };

  const updateStatus = async (status) => {
    setUpdatingStatus(true);

    try {
      const { data } = await api.put(`/projects/${id}/status`, { status });
      setJob(data);
      toast.success(`Project marked as ${status}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-section">
        <div className="card-static neo-loading" style={{ padding: 40 }}>Loading project...</div>
      </div>
    );
  }

  if (!job) return null;

  const statusBadge = (status) => {
    const map = { open: 'badge-blue', 'in-progress': 'badge-orange', delivered: 'badge-purple', completed: 'badge-green', cancelled: 'badge-pink', revision: 'badge-pink' };
    return map[status] || '';
  };

  return (
    <div className="container page-section">
      <div className="two-column-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Job Info Card */}
          <div className="card-static">
            <p style={{ color: "var(--nb-text-muted)", fontSize: 13, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase' }}>
              Posted {formatRelativeDate(job.createdAt)}
            </p>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 14, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              {job.title}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <span className="badge badge-blue">{job.category}</span>
              <span className="badge">{job.experienceLevel || "Intermediate"}</span>
              <span className="badge badge-purple">{job.duration || "1 to 3 months"}</span>
              <span className={`badge ${statusBadge(job.status)}`}>{job.status}</span>
            </div>
            <p style={{ color: "var(--nb-text-secondary)", fontSize: 16, marginBottom: 24, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {job.description}
            </p>
            {job.skillsRequired?.length ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {job.skillsRequired.map((skill, i) => (
                  <span key={skill} className={`badge ${['badge-lime', 'badge-orange', 'badge-blue', 'badge-pink', 'badge-purple'][i % 5]}`}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Assigned Freelancer */}
          {job.assignedFreelancer && (
            <div className="card-static" style={{ background: 'var(--nb-lime)', color: '#08080A' }}>
              <span className="badge badge-dark" style={{ marginBottom: 12 }}>✅ Assigned</span>
              <Link to={`/users/${job.assignedFreelancer._id}`} style={{ textDecoration: 'none', color: '#08080A' }}>
                <h3 style={{ fontSize: 22, marginBottom: 4, fontFamily: 'var(--font-heading)', textDecoration: 'underline', textDecorationThickness: 2, textUnderlineOffset: 3 }}>{job.assignedFreelancer.name}</h3>
              </Link>
              <p style={{ color: "var(--nb-text-secondary)" }}>
                {job.assignedFreelancer.profile?.title || "Freelancer"}
              </p>
            </div>
          )}

          {/* Delivery Content */}
          {job.deliveryMessage && ["delivered", "completed"].includes(job.status) && (
            <div className="card-static" style={{ background: 'var(--nb-lavender)', color: '#08080A' }}>
              <span className="badge badge-purple" style={{ marginBottom: 12 }}>📦 Delivery</span>
              <h3 style={{ fontSize: 20, marginBottom: 10, fontFamily: 'var(--font-heading)' }}>Delivered Work</h3>
              <p style={{ color: 'rgba(26, 26, 46, 0.85)', whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 12 }}>
                {job.deliveryMessage}
              </p>
              {job.deliveryLinks?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {job.deliveryLinks.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '2px solid #08080A', background: '#F5F0E8', color: '#08080A', fontWeight: 600, fontSize: 13, wordBreak: 'break-all' }}>
                      🔗 {link}
                    </a>
                  ))}
                </div>
              )}
              {job.deliveredAt && (
                <p style={{ color: 'rgba(26, 26, 46, 0.7)', fontSize: 12, marginTop: 10 }}>Delivered {formatRelativeDate(job.deliveredAt)}</p>
              )}
            </div>
          )}

          {/* Revision Message */}
          {job.revisionMessage && job.status === "revision" && (
            <div className="card-static" style={{ background: 'var(--nb-hot-pink)', color: 'var(--nb-white)' }}>
              <span className="badge" style={{ background: 'var(--nb-white)', color: 'var(--nb-hot-pink)', marginBottom: 12 }}>🔄 Revision Requested</span>
              <h3 style={{ fontSize: 20, marginBottom: 10, fontFamily: 'var(--font-heading)', color: 'var(--nb-white)' }}>Client Feedback</h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {job.revisionMessage}
              </p>
            </div>
          )}

          {/* Proposal Form */}
          {showProposalForm && (
            <form className="card-static" style={{ background: 'var(--nb-cream)' }} onSubmit={submitProposal}>
              <span className="badge badge-pink" style={{ marginBottom: 16 }}>📝 Proposal</span>
              <h2 style={{ fontSize: 26, marginBottom: 20, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Submit Proposal</h2>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="bidAmount" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                  Your price ($)
                </label>
                <input
                  id="bidAmount"
                  className="input-field"
                  type="number"
                  min="1"
                  required
                  value={proposal.bidAmount}
                  onChange={(event) =>
                    setProposal((current) => ({ ...current, bidAmount: event.target.value }))
                  }
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="deliveryTime" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                  Delivery time
                </label>
                <select
                  id="deliveryTime"
                  className="input-field"
                  value={proposal.deliveryTime}
                  onChange={(event) =>
                    setProposal((current) => ({ ...current, deliveryTime: event.target.value }))
                  }
                >
                  <option>Less than 1 week</option>
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>1 month</option>
                  <option>2+ months</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="coverLetter" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                  Cover letter
                </label>
                <textarea
                  id="coverLetter"
                  className="input-field"
                  rows="7"
                  required
                  value={proposal.coverLetter}
                  onChange={(event) =>
                    setProposal((current) => ({ ...current, coverLetter: event.target.value }))
                  }
                  style={{ resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Button type="button" variant="outline" onClick={() => setShowProposalForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Send Proposal →"}
                </Button>
              </div>
            </form>
          )}

          {/* Client: Incoming Proposals */}
          {isOwner && (
            <div className="card-static">
              <span className="badge badge-orange" style={{ marginBottom: 16 }}>📋 Proposals</span>
              <h2 style={{ fontSize: 28, marginBottom: 8, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                Incoming Proposals
              </h2>
              <p style={{ color: "var(--nb-text-secondary)", fontSize: 14, marginBottom: 20 }}>
                Review applicants and accept one to start delivery.
              </p>

              {bids.length === 0 ? (
                <p style={{ color: "var(--nb-text-secondary)", padding: 24, background: 'var(--nb-cream)', border: 'var(--nb-border-thin)', textAlign: 'center' }}>
                  No proposals yet. Freelancers will appear here once they pitch.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {bids.map((bid) => (
                    <div key={bid._id} className="card" style={{ background: 'var(--nb-cream)' }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{
                              width: 44,
                              height: 44,
                              border: 'var(--nb-border)',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 800,
                              background: 'var(--nb-yellow)',
                              fontSize: 16,
                            }}>
                              {getUserInitials(bid.freelancer?.name)}
                            </div>
                            <div>
                              <Link to={`/users/${bid.freelancer?._id}`}>
                                <h3 style={{ fontSize: 18, fontFamily: 'var(--font-heading)', textDecoration: 'underline', textDecorationThickness: 2, textUnderlineOffset: 3 }}>{bid.freelancer?.name}</h3>
                              </Link>
                              <p style={{ color: "var(--nb-text-secondary)", fontSize: 13 }}>
                                {bid.freelancer?.profile?.title || "Freelancer"}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                <span style={{ color: 'var(--nb-yellow)', fontSize: 13, letterSpacing: 1 }}>
                                  {"★".repeat(Math.round(bid.freelancer?.rating || 0))}{"☆".repeat(5 - Math.round(bid.freelancer?.rating || 0))}
                                </span>
                                {bid.freelancer?.numReviews > 0 && (
                                  <span style={{ fontSize: 11, color: 'var(--nb-text-muted)', fontWeight: 600 }}>
                                    {bid.freelancer.rating.toFixed(1)} ({bid.freelancer.numReviews} review{bid.freelancer.numReviews !== 1 ? 's' : ''})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p style={{ color: "var(--nb-text-secondary)", marginBottom: 10, whiteSpace: "pre-wrap", fontSize: 14 }}>
                            {bid.proposal}
                          </p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {bid.freelancer?.profile?.skills?.slice(0, 4).map((skill, i) => (
                              <span key={skill} className={`badge ${['badge-blue', 'badge-lime', 'badge-purple', 'badge-orange'][i % 4]}`} style={{ fontSize: 11, padding: '3px 8px' }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ width: 200 }}>
                          <p style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                            {formatCurrency(bid.amount)}
                          </p>
                          <p style={{ color: "var(--nb-text-secondary)", marginBottom: 6, fontSize: 13 }}>
                            📦 Delivery: {bid.deliveryTime}
                          </p>
                          <p style={{ marginBottom: 14, fontSize: 13 }}>
                            <span className={`badge ${bid.status === 'accepted' ? 'badge-green' : ''}`} style={{ fontSize: 11, padding: '3px 8px' }}>
                              {bid.status}
                            </span>
                          </p>
                          {bid.status === "pending" && job.status === "open" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <Button style={{ width: "100%" }} size="small" onClick={() => acceptBid(bid._id)}>
                                ✅ Accept
                              </Button>
                              <Button
                                variant="outline"
                                style={{ width: "100%" }}
                                size="small"
                                onClick={() => rejectBid(bid._id)}
                              >
                                ✕ Reject
                              </Button>
                              <Button
                                variant="outline"
                                style={{ width: "100%" }}
                                size="small"
                                onClick={() => messageFreelancer(bid)}
                              >
                                💬 Message
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Budget Card */}
          <div className="card-static" style={{ background: 'var(--nb-yellow)', color: '#08080A' }}>
            <label style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-heading)', letterSpacing: '0.5px', color: 'rgba(26, 26, 46, 0.7)' }}>
              Budget
            </label>
            <h2 style={{ fontSize: 36, marginBottom: 14, fontFamily: 'var(--font-display)' }}>
              {job.budgetType === "hourly" && (job.budgetMin || job.budgetMax)
                ? `${formatCurrency(job.budgetMin || job.budget)} - ${formatCurrency(
                    job.budgetMax || job.budget
                  )}/hr`
                : formatCurrency(job.budget)}
            </h2>
            <p style={{ color: "rgba(26, 26, 46, 0.85)", marginBottom: 20, fontWeight: 600 }}>
              📋 {job.bidsCount || 0} proposal{job.bidsCount === 1 ? "" : "s"} received
            </p>

            {!isOwner && user?.role !== "client" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button
                  onClick={() => setShowProposalForm(true)}
                  disabled={Boolean(myBid) || job.status !== "open"}
                  variant="dark"
                  style={{ width: "100%" }}
                >
                  {myBid ? `Proposal ${myBid.status}` : "Submit Proposal →"}
                </Button>
                {myBid && myBid.status === "pending" && (
                  <Button variant="outline" onClick={withdrawBid} style={{ width: "100%" }}>
                    ✕ Withdraw Proposal
                  </Button>
                )}
                <Button variant="outline" onClick={startChat} style={{ width: "100%" }}>
                  💬 Message Client
                </Button>
              </div>
            ) : null}

            {isOwner ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button
                  variant="outline"
                  disabled={updatingStatus || job.status === "completed"}
                  onClick={() => updateStatus("completed")}
                  style={{ width: "100%" }}
                >
                  ✅ Mark Completed
                </Button>
                <Button
                  variant="danger"
                  disabled={updatingStatus || job.status === "cancelled"}
                  onClick={() => updateStatus("cancelled")}
                  style={{ width: "100%" }}
                >
                  ✕ Cancel Project
                </Button>
              </div>
            ) : null}
          </div>

          {/* Client Card */}
          <div className="card-static">
            <label style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-heading)', letterSpacing: '0.5px', color: 'var(--nb-text-muted)', marginBottom: 12, display: 'block' }}>
              Client
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  display: "grid",
                  placeItems: "center",
                  background: "var(--nb-lime)",
                  border: "var(--nb-border)",
                  fontWeight: 800,
                  fontSize: 18,
                  boxShadow: 'var(--nb-shadow-sm)',
                }}
              >
                {getUserInitials(job.client?.name)}
              </div>
              <div>
                <Link to={`/users/${job.client?._id}`}>
                  <h3 style={{ fontSize: 20, fontFamily: 'var(--font-heading)', textDecoration: 'underline', textDecorationThickness: 2, textUnderlineOffset: 3 }}>{job.client?.name}</h3>
                </Link>
                <p style={{ color: "var(--nb-text-secondary)", fontSize: 14 }}>
                  {job.client?.profile?.title || "Marketplace client"}
                </p>
              </div>
            </div>
            <p style={{ color: "var(--nb-text-secondary)", marginBottom: 8, fontSize: 14 }}>
              {job.client?.profile?.bio || "This client has not filled out a company bio yet."}
            </p>
            <p style={{ color: "var(--nb-text-muted)", fontSize: 13 }}>
              ✉ {job.client?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
