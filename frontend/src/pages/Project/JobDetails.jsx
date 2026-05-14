import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { formatCurrency, formatRelativeDate, getUserInitials } from "../../utils/formatters";

const initialProposal = { coverLetter: "", bidAmount: "", deliveryTime: "1 week" };

const STATUS_COLORS = {
  open: 'var(--blue)',
  'in-progress': 'var(--yellow)',
  delivered: 'var(--blue)',
  completed: 'var(--ink)',
  revision: 'var(--red)',
  cancelled: 'var(--red)',
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
      } finally { setLoading(false); }
    };
    load();
  }, [id, loadJob, navigate, user]);

  const startChat = async () => {
    if (!user) { toast.info("Log in first to start a conversation."); navigate("/login"); return; }
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
    if (!user) { toast.info("Log in first to submit a proposal."); navigate("/login"); return; }
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
    } finally { setSubmitting(false); }
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
      toast.success("Proposal accepted.");
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
    } finally { setUpdatingStatus(false); }
  };

  if (loading) {
    return (
      <div className="container page-section">
        <div className="card-static neo-loading" style={{ padding: 40, textAlign: 'center' }}>Loading project...</div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="container page-section">
      {/* HEADER */}
      <div style={{ borderBottom: '4px solid var(--ink)', paddingBottom: 32, marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 12 }}>
          PROJECT / POSTED {formatRelativeDate(job.createdAt)?.toUpperCase()}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 20 }}>
          {job.title}
        </h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="badge">{job.category}</span>
          <span className="badge">{job.experienceLevel || "Intermediate"}</span>
          <span className="badge">{job.duration || "1-3 months"}</span>
          <span className="badge" style={{ background: STATUS_COLORS[job.status], color: job.status === 'in-progress' ? 'var(--ink)' : 'var(--white)' }}>
            {job.status?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="two-column-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* DESCRIPTION */}
          <div className="card-static">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 8 }}>§ DESCRIPTION</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', marginBottom: 16 }}>Project Brief</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: "var(--ink)", fontSize: 16, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {job.description}
            </p>
            {job.skillsRequired?.length ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 20, paddingTop: 20, borderTop: '3px solid var(--ink)' }}>
                {job.skillsRequired.map((skill) => (
                  <span key={skill} className="badge">{skill}</span>
                ))}
              </div>
            ) : null}
          </div>

          {/* ASSIGNED FREELANCER */}
          {job.assignedFreelancer && (
            <div className="card-static" style={{ background: 'var(--yellow)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>§ ASSIGNED</div>
              <Link to={`/users/${job.assignedFreelancer._id}`}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', borderBottom: '3px solid var(--ink)', display: 'inline-block' }}>
                  {job.assignedFreelancer.name}
                </h3>
              </Link>
              <p style={{ fontFamily: 'var(--font-body)', color: "var(--ink)", marginTop: 6, fontStyle: 'italic' }}>
                {job.assignedFreelancer.profile?.title || "Freelancer"}
              </p>
            </div>
          )}

          {/* DELIVERY */}
          {job.deliveryMessage && ["delivered", "completed"].includes(job.status) && (
            <div className="card-static" style={{ background: 'var(--blue)', color: 'var(--white)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--yellow)', marginBottom: 8 }}>§ DELIVERY</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase', color: 'var(--white)', marginBottom: 14 }}>Delivered Work</h3>
              <p style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 14 }}>
                {job.deliveryMessage}
              </p>
              {job.deliveryLinks?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {job.deliveryLinks.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{
                      padding: '10px 14px',
                      border: '3px solid var(--white)',
                      background: 'var(--ink)',
                      color: 'var(--yellow)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: 12,
                      wordBreak: 'break-all',
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                    }}>
                      → {link}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REVISION */}
          {job.revisionMessage && job.status === "revision" && (
            <div className="card-static" style={{ background: 'var(--red)', color: 'var(--white)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--yellow)', marginBottom: 8 }}>§ REVISION REQUESTED</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase', color: 'var(--white)', marginBottom: 14 }}>Client Feedback</h3>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--white)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{job.revisionMessage}"
              </p>
            </div>
          )}

          {/* PROPOSAL FORM */}
          {showProposalForm && (
            <form className="card-static" style={{ background: 'var(--paper)' }} onSubmit={submitProposal}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 8 }}>§ NEW PROPOSAL</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, textTransform: 'uppercase', marginBottom: 24 }}>Submit Proposal</h2>
              <div style={{ marginBottom: 18 }}>
                <label className="input-label" htmlFor="bidAmount">Your Price ($)</label>
                <input id="bidAmount" className="input-field" type="number" min="1" required
                  value={proposal.bidAmount}
                  onChange={(e) => setProposal((c) => ({ ...c, bidAmount: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="input-label" htmlFor="deliveryTime">Delivery Time</label>
                <select id="deliveryTime" className="input-field"
                  value={proposal.deliveryTime}
                  onChange={(e) => setProposal((c) => ({ ...c, deliveryTime: e.target.value }))}>
                  <option>Less than 1 week</option>
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>1 month</option>
                  <option>2+ months</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="input-label" htmlFor="coverLetter">Cover Letter</label>
                <textarea id="coverLetter" className="input-field" rows="6" required
                  value={proposal.coverLetter}
                  onChange={(e) => setProposal((c) => ({ ...c, coverLetter: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Send Proposal →"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowProposalForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {/* INCOMING PROPOSALS */}
          {isOwner && (
            <div className="card-static">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 8 }}>§ INCOMING ({bids.length})</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, textTransform: 'uppercase', marginBottom: 20 }}>Proposals</h2>
              {bids.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', padding: 24, border: '3px solid var(--ink)', background: 'var(--paper)', textAlign: 'center', fontStyle: 'italic' }}>
                  No proposals yet. Freelancers will appear here once they pitch.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {bids.map((bid) => (
                    <div key={bid._id} style={{ padding: 20, border: '3px solid var(--ink)', background: 'var(--white)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: '50%',
                              border: '3px solid var(--ink)',
                              background: 'var(--yellow)',
                              display: 'grid', placeItems: 'center',
                              fontFamily: 'var(--font-display)', fontSize: 18,
                            }}>{getUserInitials(bid.freelancer?.name)}</div>
                            <div>
                              <Link to={`/users/${bid.freelancer?._id}`}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, textTransform: 'uppercase', borderBottom: '3px solid var(--ink)', display: 'inline-block' }}>
                                  {bid.freelancer?.name}
                                </h3>
                              </Link>
                              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: "var(--muted)", textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
                                {bid.freelancer?.profile?.title || "FREELANCER"}
                              </p>
                            </div>
                          </div>
                          <p style={{ fontFamily: 'var(--font-body)', color: "var(--muted)", marginBottom: 10, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
                            {bid.proposal}
                          </p>
                        </div>
                        <div style={{ width: 180 }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1, marginBottom: 6 }}>{formatCurrency(bid.amount)}</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 14 }}>
                            DELIVERY: {bid.deliveryTime?.toUpperCase()}
                          </p>
                          {bid.status === "pending" && job.status === "open" ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <Button size="sm" style={{ width: "100%" }} onClick={() => acceptBid(bid._id)}>✓ Accept</Button>
                              <Button variant="outline" size="sm" style={{ width: "100%" }} onClick={() => rejectBid(bid._id)}>✕ Reject</Button>
                              <Button variant="ghost" size="sm" style={{ width: "100%" }} onClick={() => messageFreelancer(bid)}>Message</Button>
                            </div>
                          ) : (
                            <span className="badge" style={{ background: STATUS_COLORS[bid.status] || 'var(--ink)', color: 'var(--white)' }}>{bid.status?.toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card-static" style={{ background: 'var(--yellow)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>BUDGET</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1, margin: '8px 0' }}>
              {job.budgetType === "hourly" && (job.budgetMin || job.budgetMax)
                ? `${formatCurrency(job.budgetMin || job.budget)}–${formatCurrency(job.budgetMax || job.budget)}/HR`
                : formatCurrency(job.budget)}
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, paddingBottom: 16, borderBottom: '3px solid var(--ink)' }}>
              {job.bidsCount || 0} PROPOSAL{job.bidsCount === 1 ? "" : "S"} RECEIVED
            </p>

            {!isOwner && user?.role !== "client" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button
                  onClick={() => setShowProposalForm(true)}
                  disabled={Boolean(myBid) || job.status !== "open"}
                  variant="dark"
                  style={{ width: "100%" }}>
                  {myBid ? `Proposal ${myBid.status}` : "Submit Proposal →"}
                </Button>
                {myBid && myBid.status === "pending" && (
                  <Button variant="outline" onClick={withdrawBid} style={{ width: "100%" }}>Withdraw</Button>
                )}
                <Button variant="outline" onClick={startChat} style={{ width: "100%" }}>Message Client</Button>
              </div>
            ) : null}

            {isOwner ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button variant="dark" disabled={updatingStatus || job.status === "completed"} onClick={() => updateStatus("completed")} style={{ width: "100%" }}>
                  ✓ Mark Completed
                </Button>
                <Button variant="danger" disabled={updatingStatus || job.status === "cancelled"} onClick={() => updateStatus("cancelled")} style={{ width: "100%" }}>
                  ✕ Cancel Project
                </Button>
              </div>
            ) : null}
          </div>

          {/* CLIENT CARD */}
          <div className="card-static">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 12 }}>CLIENT</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid var(--ink)',
                background: 'var(--blue)',
                color: 'var(--white)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-display)', fontSize: 20,
              }}>{getUserInitials(job.client?.name)}</div>
              <div>
                <Link to={`/users/${job.client?._id}`}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, textTransform: 'uppercase', borderBottom: '3px solid var(--ink)', display: 'inline-block' }}>
                    {job.client?.name}
                  </h3>
                </Link>
                <p style={{ fontFamily: 'var(--font-body)', color: "var(--muted)", fontSize: 13, fontStyle: 'italic' }}>
                  {job.client?.profile?.title || "Marketplace client"}
                </p>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>
              {job.client?.profile?.bio || "No bio yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
