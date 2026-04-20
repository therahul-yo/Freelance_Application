import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { formatCurrency, formatRelativeDate } from "../../utils/formatters";

const ReviewModal = ({ project, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", { projectId: project._id, rating, comment });
      toast.success("Review submitted!");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoveredStar || rating;

  return (
    <div className="modal-overlay">
      <div className="card-static" style={{ width: '100%', maxWidth: 440 }}>
        <span className="badge badge-orange" style={{ marginBottom: 16 }}>⭐ Review</span>
        <h2 style={{ marginBottom: 12, fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: 24 }}>
          Review the Freelancer
        </h2>
        <p style={{ marginBottom: 24, color: 'var(--nb-text-secondary)' }}>
          Rate your experience working on "{project.title}"
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label className="input-label">
              Rating {rating > 0 && `— ${rating}/5`}
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoveredStar(n)}
                  onMouseLeave={() => setHoveredStar(0)}
                  style={{
                    width: 52,
                    height: 52,
                    border: 'var(--nb-border)',
                    background: activeRating >= n ? 'var(--nb-yellow)' : 'var(--nb-white)',
                    fontSize: 24,
                    cursor: 'pointer',
                    boxShadow: activeRating >= n ? 'var(--nb-shadow-sm)' : 'none',
                    transform: activeRating >= n ? 'translate(-2px, -2px)' : 'none',
                    transition: 'all 0.15s ease',
                    color: activeRating >= n ? 'var(--nb-black)' : 'var(--nb-text-muted)',
                    fontFamily: 'var(--font-body)',
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  {activeRating >= n ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="input-label">
              Comment
            </label>
            <textarea
              className="input-field"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the collaboration? Would you work with them again?"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" disabled={submitting || rating === 0}>
              {submitting ? "Sending..." : `Submit ${rating > 0 ? rating + '★' : ''} Review`}
            </Button>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, hint, color = 'var(--nb-white)' }) => (
  <div className="card" style={{ background: color }}>
    <p style={{ 
      color: "var(--nb-text-muted)", 
      fontSize: 12, 
      textTransform: "uppercase",
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      letterSpacing: '0.5px',
    }}>
      {label}
    </p>
    <p className="neo-stat-number" style={{ margin: "8px 0", fontSize: 36 }}>{value}</p>
    {hint ? <p style={{ color: "var(--nb-text-secondary)", fontSize: 13, fontWeight: 500 }}>{hint}</p> : null}
  </div>
);

const EmptyState = ({ title, body, ctaLabel, ctaTo }) => (
  <div className="card-static" style={{ textAlign: "center", padding: "48px 24px", background: 'var(--nb-cream)' }}>
    <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
    <h3 style={{ fontSize: 20, marginBottom: 10, fontFamily: 'var(--font-heading)' }}>{title}</h3>
    <p style={{ color: "var(--nb-text-secondary)", marginBottom: 20 }}>{body}</p>
    <Link to={ctaTo}>
      <Button>{ctaLabel} →</Button>
    </Link>
  </div>
);
const DeliveryModal = ({ project, onClose, onSuccess }) => {
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please describe what you're delivering");
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/projects/${project._id}/status`, {
        status: "delivered",
        deliveryMessage: message.trim(),
        deliveryLinks: links.split("\n").map(l => l.trim()).filter(Boolean),
      });
      toast.success("Work delivered!");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to deliver");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card-static" style={{ width: '100%', maxWidth: 500 }}>
        <span className="badge badge-purple" style={{ marginBottom: 16 }}>📦 Deliver Work</span>
        <h2 style={{ marginBottom: 12, fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: 22 }}>
          Deliver: {project.title}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label className="input-label">What are you delivering?</label>
            <textarea
              className="input-field"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the deliverables, what's included, and any notes..."
              required
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="input-label">Links (one per line, optional)</label>
            <textarea
              className="input-field"
              rows="3"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              placeholder={"https://drive.google.com/...\nhttps://github.com/..."}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "📦 Submit Delivery"}
            </Button>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RevisionModal = ({ project, onClose, onSuccess }) => {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/projects/${project._id}/status`, {
        status: "revision",
        revisionMessage: message.trim(),
      });
      toast.success("Revision requested!");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request revision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card-static" style={{ width: '100%', maxWidth: 500 }}>
        <span className="badge badge-pink" style={{ marginBottom: 16 }}>🔄 Request Revision</span>
        <h2 style={{ marginBottom: 12, fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: 22 }}>
          Request Changes
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label className="input-label">What needs to change?</label>
            <textarea
              className="input-field"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what changes or improvements you'd like..."
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "🔄 Request Revision"}
            </Button>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [selectedProjectForReview, setSelectedProjectForReview] = useState(null);
  const [selectedProjectForDelivery, setSelectedProjectForDelivery] = useState(null);
  const [selectedProjectForRevision, setSelectedProjectForRevision] = useState(null);

  const load = async () => {
    try {
      if (user.role === "client") {
        const { data } = await api.get("/projects/my");
        setProjects(data);
      } else {
        const [projectsResponse, bidsResponse, gigsResponse] = await Promise.all([
          api.get("/projects/my"),
          api.get("/bids/my"),
          api.get("/gigs/my"),
        ]);
        setProjects(projectsResponse.data);
        setBids(bidsResponse.data);
        setGigs(gigsResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    load();
  }, [navigate, user]);

  const updateProjectStatus = async (projectId, status) => {
    try {
      await api.put(`/projects/${projectId}/status`, { status });
      const action = status === "delivered" ? "delivered" : "completed";
      toast.success(`Project ${action} successfully!`);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const startChat = async (project) => {
    const otherUser = user.role === "client" ? project.assignedFreelancer : project.client;
    if (!otherUser) {
      toast.error("No other party found for this project chat.");
      return;
    }

    try {
      const { data } = await api.post("/chat", {
        userId: otherUser._id,
        contextId: project._id,
        contextType: "project",
        contextTitle: project.title,
      });
      navigate("/chat", { state: { selectedChatId: data._id } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not start chat");
    }
  };

  if (!user) return null;

  const clientSpend = projects
    .filter((project) => project.status === "completed")
    .reduce((total, project) => total + Number(project.budget || 0), 0);

  const freelancerEarnings = projects
    .filter((project) => project.status === "completed" && project.assignedFreelancer?._id === user._id)
    .reduce((total, project) => total + Number(project.budget || 0), 0);

  const activeWork = projects.filter(
    (p) => p.assignedFreelancer?._id === user._id && ["in-progress", "delivered", "revision"].includes(p.status)
  );

  const statusBadgeColor = (status) => {
    switch(status) {
      case 'open': return 'badge-blue';
      case 'in-progress': return 'badge-orange';
      case 'delivered': return 'badge-purple';
      case 'completed': return 'badge-green';
      case 'revision': return 'badge-pink';
      case 'cancelled': return 'badge-dark';
      default: return '';
    }
  };

  const profileComplete = user.profile?.bio && (user.role === "client" || user.profile?.skills?.length > 0);

  return (
    <div className="container page-section">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-greeting" style={{ color: 'var(--nb-hot-pink)' }}>
            {user.role === "client" ? "👤 Client Command Center" : "⚡ Freelancer Command Center"}
          </div>
          <h1 className="dashboard-name" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            Welcome back, {user.name}
          </h1>
          <p style={{ color: "var(--nb-text-secondary)", maxWidth: 620, fontSize: 15 }}>
            {user.role === "client"
              ? "Review your active projects, incoming demand, and delivery pipeline."
              : "Track your gigs, proposal pipeline, and accepted work from one place."}
          </p>
        </div>
        <Link to={user.role === "client" ? "/post-job" : "/post-gig"}>
          <Button>{user.role === "client" ? "📋 Post another project" : "⚡ Create a new gig"}</Button>
        </Link>
      </div>

      {/* Profile Completion Banner */}
      {!profileComplete && (
        <div className="card-static" style={{
          background: 'var(--nb-yellow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 8,
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, marginBottom: 4 }}>
              ⚡ Complete Your Profile
            </h3>
            <p style={{ color: 'var(--nb-text-secondary)', fontSize: 14 }}>
              Add your bio, skills, and portfolio to stand out and build trust.
            </p>
          </div>
          <Link to="/profile/edit">
            <Button variant="dark">
              Complete Profile →
            </Button>
          </Link>
        </div>
      )}

      {loading ? (
        <div className="card-static neo-loading" style={{ padding: 40 }}>Loading dashboard...</div>
      ) : user.role === "client" ? (
        <>
          {/* Client Stats */}
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            <StatCard
              label="Open projects"
              value={projects.filter((item) => item.status === "open").length}
              hint="Collecting proposals"
              color="var(--nb-blue)"
            />
            <StatCard
              label="Active hires"
              value={projects.filter((item) => ["in-progress", "delivered"].includes(item.status)).length}
              hint="Work underway"
              color="var(--nb-yellow)"
            />
            <StatCard
              label="Completed"
              value={projects.filter((item) => item.status === "completed").length}
              hint="Successfully closed"
              color="var(--nb-lime)"
            />
            <StatCard
              label="Total spend"
              value={formatCurrency(clientSpend)}
              hint="Paid to freelancers"
              color="var(--nb-lavender)"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Active Hires */}
            {projects.filter((p) => ["in-progress", "delivered"].includes(p.status)).length > 0 && (
              <div className="card-static">
                <span className="badge badge-orange" style={{ marginBottom: 16 }}>🔥 Active</span>
                <h2 style={{ fontSize: 24, marginBottom: 20, fontFamily: 'var(--font-heading)' }}>Active Hires</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {projects
                    .filter((p) => ["in-progress", "delivered"].includes(p.status))
                    .map((project) => (
                      <div key={project._id} className="card" style={{ background: "var(--nb-cream)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                          <div>
                            <h3 style={{ fontSize: 20, marginBottom: 6, fontFamily: 'var(--font-heading)' }}>{project.title}</h3>
                            <p style={{ color: "var(--nb-text-secondary)", fontSize: 14, marginBottom: 12 }}>
                              Hired: {project.assignedFreelancer?.name || "Freelancer"}
                            </p>
                            <span className={`badge ${project.status === "delivered" ? 'badge-purple' : 'badge-orange'}`}>
                              {project.status === "delivered" ? "⏳ Pending Approval" : "🔄 " + project.status}
                            </span>
                          </div>
                          <div style={{ textAlign: "right", minWidth: 180 }}>
                            <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, fontFamily: 'var(--font-display)' }}>
                              {formatCurrency(project.budget)}
                            </p>
                            {project.status === "delivered" ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <Button size="small" onClick={() => updateProjectStatus(project._id, "completed")}>
                                  ✅ Approve
                                </Button>
                                <Button variant="outline" size="small" onClick={() => setSelectedProjectForRevision(project)}>
                                  🔄 Request Revision
                                </Button>
                              </div>
                            ) : (
                              <Button variant="outline" size="small" onClick={() => startChat(project)}>
                                💬 Message
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Project Pipeline */}
            <div className="card-static">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
                <div>
                  <span className="badge badge-blue" style={{ marginBottom: 12 }}>📋 Pipeline</span>
                  <h2 style={{ fontSize: 24, fontFamily: 'var(--font-heading)' }}>Project Pipeline</h2>
                  <p style={{ color: "var(--nb-text-secondary)", fontSize: 14 }}>
                    Manage your open projects and view history.
                  </p>
                </div>
              </div>

              {projects.length === 0 ? (
                <EmptyState
                  title="No projects posted yet"
                  body="Start by publishing a scoped project so freelancers can pitch you."
                  ctaLabel="Post your first project"
                  ctaTo="/post-job"
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {projects
                    .filter((p) => !["in-progress", "delivered"].includes(p.status))
                    .map((project) => (
                      <div key={project._id} className="card" style={{ background: "var(--nb-cream)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                          <Link to={`/jobs/${project._id}`} style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 18, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>{project.title}</h3>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span className={`badge ${statusBadgeColor(project.status)}`}>
                                {project.status}
                              </span>
                              <span style={{ color: "var(--nb-text-secondary)", fontSize: 13, fontWeight: 600 }}>
                                {project.bidsCount || 0} Proposals
                              </span>
                            </div>
                          </Link>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 18, fontFamily: 'var(--font-heading)' }}>
                              {formatCurrency(project.budget)}
                            </p>
                            {project.status === "completed" && (
                              <Button
                                variant="outline"
                                size="small"
                                onClick={() => setSelectedProjectForReview(project)}
                              >
                                ⭐ Leave Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Freelancer Stats */}
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            <StatCard label="Active Work" value={activeWork.length} hint="Orders in progress" color="var(--nb-yellow)" />
            <StatCard
              label="Pending Review"
              value={activeWork.filter((p) => p.status === "delivered").length}
              hint="Awaiting client approval"
              color="var(--nb-lavender)"
            />
            <StatCard label="Accepted Bids" value={bids.filter((bid) => bid.status === "accepted").length} hint="Won projects" color="var(--nb-blue)" />
            <StatCard label="Total Earnings" value={formatCurrency(freelancerEarnings)} hint="From completed jobs" color="var(--nb-lime)" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Active Work */}
            {activeWork.length > 0 && (
              <div className="card-static">
                <span className="badge badge-orange" style={{ marginBottom: 16 }}>🔥 Active</span>
                <h2 style={{ fontSize: 24, marginBottom: 20, fontFamily: 'var(--font-heading)' }}>Active Work</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {activeWork.map((project) => (
                    <div key={project._id} className="card" style={{ background: "var(--nb-cream)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                        <div>
                          <h3 style={{ fontSize: 20, marginBottom: 6, fontFamily: 'var(--font-heading)' }}>{project.title}</h3>
                          <p style={{ color: "var(--nb-text-secondary)", fontSize: 14, marginBottom: 12 }}>
                            Client: {project.client?.name}
                          </p>
                          <span className={`badge ${project.status === "delivered" ? 'badge-purple' : project.status === "revision" ? 'badge-pink' : 'badge-orange'}`}>
                            {project.status === "delivered" ? "📦 Delivered (Awaiting Approval)" : project.status === "revision" ? "🔄 Revision Requested" : "🔄 In Progress"}
                          </span>
                          {project.revisionMessage && project.status === "revision" && (
                            <p style={{ color: 'var(--nb-hot-pink)', fontSize: 13, marginTop: 8, fontWeight: 600 }}>
                              Client says: "{project.revisionMessage}"
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: "right", minWidth: 180 }}>
                          <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, fontFamily: 'var(--font-display)' }}>
                            {formatCurrency(project.budget)}
                          </p>
                          {(project.status === "in-progress" || project.status === "revision") ? (
                            <Button size="small" onClick={() => setSelectedProjectForDelivery(project)}>
                              📦 Deliver Work
                            </Button>
                          ) : (
                            <Button variant="outline" size="small" onClick={() => startChat(project)}>
                              💬 Message Client
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Storefront + Proposals */}
            <div className="two-column-grid">
              <div className="card-static">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
                  <div>
                    <span className="badge badge-green" style={{ marginBottom: 12 }}>🏪 Storefront</span>
                    <h2 style={{ fontSize: 22, fontFamily: 'var(--font-heading)' }}>Your Gigs</h2>
                    <p style={{ color: "var(--nb-text-secondary)", fontSize: 14 }}>Manage your published gigs.</p>
                  </div>
                  <Link to="/post-gig">
                    <Button variant="outline" size="small">+ Add gig</Button>
                  </Link>
                </div>

                {gigs.length === 0 ? (
                  <EmptyState
                    title="No gigs published"
                    body="Create a gig so clients can discover you."
                    ctaLabel="Create a gig"
                    ctaTo="/post-gig"
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {gigs.map((gig) => (
                      <Link key={gig._id} to={`/gigs/${gig._id}`} className="card" style={{ background: "var(--nb-cream)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                          <div>
                            <h3 style={{ fontSize: 16, marginBottom: 4, fontFamily: 'var(--font-heading)' }}>{gig.title}</h3>
                            <span className="badge" style={{ fontSize: 11, padding: '3px 8px' }}>{gig.category}</span>
                          </div>
                          <p style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: 18 }}>{formatCurrency(gig.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-static">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 12 }}>
                  <div>
                    <span className="badge badge-purple" style={{ marginBottom: 12 }}>📄 Proposals</span>
                    <h2 style={{ fontSize: 22, fontFamily: 'var(--font-heading)' }}>Recent Proposals</h2>
                    <p style={{ color: "var(--nb-text-secondary)", fontSize: 14 }}>Track your sent bids.</p>
                  </div>
                  <Link to="/projects">
                    <Button variant="outline" size="small">Find work</Button>
                  </Link>
                </div>

                {bids.length === 0 ? (
                  <EmptyState
                    title="No proposals sent"
                    body="Browse projects and start pitching."
                    ctaLabel="Browse projects"
                    ctaTo="/projects"
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {bids.map((bid) => (
                      <Link
                        key={bid._id}
                        to={`/jobs/${bid.project?._id}`}
                        className="card"
                        style={{ background: "var(--nb-cream)" }}
                      >
                        <h3 style={{ fontSize: 16, marginBottom: 6, fontFamily: 'var(--font-heading)' }}>{bid.project?.title || "Project"}</h3>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span className={`badge ${bid.status === 'accepted' ? 'badge-green' : bid.status === 'rejected' ? 'badge-pink' : ''}`}>
                            {bid.status}
                          </span>
                          <p style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{formatCurrency(bid.amount)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Completed History */}
            {projects.filter((p) => p.status === "completed" && p.assignedFreelancer?._id === user._id).length > 0 && (
              <div className="card-static">
                <span className="badge badge-green" style={{ marginBottom: 16 }}>✅ Completed</span>
                <h2 style={{ fontSize: 24, marginBottom: 20, fontFamily: 'var(--font-heading)' }}>Completed History</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {projects
                    .filter((p) => p.status === "completed" && p.assignedFreelancer?._id === user._id)
                    .map((project) => (
                      <div key={project._id} className="card" style={{ background: "var(--nb-cream)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                          <div>
                            <h3 style={{ fontSize: 18, marginBottom: 6, fontFamily: 'var(--font-heading)' }}>{project.title}</h3>
                            <p style={{ color: "var(--nb-text-secondary)", fontSize: 14 }}>
                              Client: {project.client?.name} · {formatRelativeDate(project.updatedAt)}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-heading)', fontSize: 18 }}>
                              {formatCurrency(project.budget)}
                            </p>
                            <span className="badge badge-green" style={{ fontSize: 12 }}>✅ Completed</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {selectedProjectForReview && (
        <ReviewModal
          project={selectedProjectForReview}
          onClose={() => setSelectedProjectForReview(null)}
          onSuccess={() => {
            setSelectedProjectForReview(null);
            load();
          }}
        />
      )}

      {selectedProjectForDelivery && (
        <DeliveryModal
          project={selectedProjectForDelivery}
          onClose={() => setSelectedProjectForDelivery(null)}
          onSuccess={() => {
            setSelectedProjectForDelivery(null);
            load();
          }}
        />
      )}

      {selectedProjectForRevision && (
        <RevisionModal
          project={selectedProjectForRevision}
          onClose={() => setSelectedProjectForRevision(null)}
          onSuccess={() => {
            setSelectedProjectForRevision(null);
            load();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
