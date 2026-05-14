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
    if (rating === 0) { toast.error("Please select a star rating"); return; }
    setSubmitting(true);
    try {
      await api.post("/reviews", { projectId: project._id, rating, comment });
      toast.success("Review submitted!");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally { setSubmitting(false); }
  };

  const activeRating = hoveredStar || rating;

  return (
    <div className="modal-overlay">
      <div className="card-static" style={{ width: '100%', maxWidth: 480, boxShadow: '8px 8px 0 var(--ink)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--blue)', marginBottom: 12 }}>
          § REVIEW
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 12 }}>
          Rate the Freelancer
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', marginBottom: 24, fontStyle: 'italic' }}>
          "{project.title}"
        </p>
        <form onSubmit={handleSubmit}>
          <label className="input-label">Rating {rating > 0 && `— ${rating}/5`}</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoveredStar(n)}
                onMouseLeave={() => setHoveredStar(0)}
                style={{
                  width: 52, height: 52,
                  border: '4px solid var(--ink)',
                  background: activeRating >= n ? 'var(--yellow)' : 'var(--white)',
                  fontSize: 22,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  padding: 0,
                  lineHeight: 1,
                  color: 'var(--ink)',
                  boxShadow: activeRating >= n ? '3px 3px 0 var(--ink)' : 'none',
                  transition: 'all 0.1s',
                }}
              >
                {activeRating >= n ? '★' : '☆'}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="input-label">Comment</label>
            <textarea className="input-field" rows="4" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the collaboration?" required />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" disabled={submitting || rating === 0}>
              {submitting ? "Sending..." : "Submit Review"}
            </Button>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeliveryModal = ({ project, onClose, onSuccess }) => {
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { toast.error("Please describe what you're delivering"); return; }
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
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="card-static" style={{ width: '100%', maxWidth: 520, boxShadow: '8px 8px 0 var(--ink)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--blue)', marginBottom: 12 }}>§ DELIVER WORK</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 20 }}>
          Deliver: {project.title}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label className="input-label">What are you delivering?</label>
            <textarea className="input-field" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the deliverables..." required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="input-label">Links (one per line)</label>
            <textarea className="input-field" rows="3" value={links} onChange={(e) => setLinks(e.target.value)} placeholder={"https://drive.google.com/...\nhttps://github.com/..."} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Submit Delivery"}</Button>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
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
      await api.put(`/projects/${project._id}/status`, { status: "revision", revisionMessage: message.trim() });
      toast.success("Revision requested!");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request revision");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="card-static" style={{ width: '100%', maxWidth: 520, boxShadow: '8px 8px 0 var(--ink)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--red)', marginBottom: 12 }}>§ REQUEST REVISION</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 20 }}>
          Request Changes
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label className="input-label">What needs to change?</label>
            <textarea className="input-field" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe changes needed..." required />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Request Revision"}</Button>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const STATUS_COLORS = {
  open: 'var(--blue)',
  'in-progress': 'var(--yellow)',
  delivered: 'var(--blue)',
  completed: 'var(--ink)',
  revision: 'var(--red)',
  cancelled: 'var(--red)',
};

const statusLabel = (s) => s?.toUpperCase().replace('-', ' ');

const StatBlock = ({ label, value, hint, color }) => (
  <div className="stat-block" style={{ borderTopColor: color || 'var(--ink)' }}>
    <div className="stat-block-label">{label}</div>
    <div className="stat-block-number">{value}</div>
    {hint && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>{hint}</div>}
  </div>
);

const EmptyState = ({ title, body, ctaLabel, ctaTo }) => (
  <div className="card-static" style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--paper)' }}>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, lineHeight: 0.9, color: 'var(--ink)', opacity: 0.2, marginBottom: 16 }}>—</div>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase', marginBottom: 12 }}>{title}</h3>
    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>{body}</p>
    <Link to={ctaTo}><Button>{ctaLabel} →</Button></Link>
  </div>
);

const ProjectCard = ({ project, accent, children }) => (
  <div className="card-static" style={{ padding: 0, display: 'flex', overflow: 'hidden' }}>
    <div style={{ width: 8, background: accent, flexShrink: 0 }} />
    <div style={{ padding: 24, flex: 1, display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
      {children}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
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
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    load();
  }, [navigate, user]);

  const updateProjectStatus = async (projectId, status) => {
    try {
      await api.put(`/projects/${projectId}/status`, { status });
      toast.success(`Project ${status === "delivered" ? "delivered" : "completed"}!`);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const startChat = async (project) => {
    const otherUser = user.role === "client" ? project.assignedFreelancer : project.client;
    if (!otherUser) { toast.error("No other party found for this project chat."); return; }
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

  const clientSpend = projects.filter((p) => p.status === "completed").reduce((t, p) => t + Number(p.budget || 0), 0);
  const freelancerEarnings = projects.filter((p) => p.status === "completed" && p.assignedFreelancer?._id === user._id).reduce((t, p) => t + Number(p.budget || 0), 0);
  const activeWork = projects.filter((p) => p.assignedFreelancer?._id === user._id && ["in-progress", "delivered", "revision"].includes(p.status));
  const profileComplete = user.profile?.bio && (user.role === "client" || user.profile?.skills?.length > 0);

  const TabBtn = ({ id, children }) => (
    <button className={`neo-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
      {children}
    </button>
  );

  return (
    <div className="container page-section" style={{ position: 'relative' }}>
      <div className="section-number" style={{ top: 20, right: 40 }}>{user.role === "client" ? "CL" : "FL"}</div>

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-greeting">
            {user.role === "client" ? "// CLIENT COMMAND" : "// FREELANCER COMMAND"}
          </div>
          <h1 className="dashboard-name">Dashboard</h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', fontSize: 16, fontStyle: 'italic', maxWidth: 560 }}>
            Welcome back, <strong style={{ color: 'var(--ink)', fontStyle: 'normal' }}>{user.name}</strong>.
            {' '}
            {user.role === "client"
              ? "Review your active projects, demand, and delivery pipeline."
              : "Track gigs, proposal pipeline, and accepted work in one place."}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to={user.role === "client" ? "/post-job" : "/post-gig"}>
            <Button>{user.role === "client" ? "+ Post Project" : "+ Create Gig"}</Button>
          </Link>
        </div>
      </div>

      {/* PROFILE BANNER */}
      {!profileComplete && (
        <div className="card-static" style={{
          background: 'var(--yellow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 32,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
              ⚠ NOTICE
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 0.95, textTransform: 'uppercase' }}>
              Complete Your Profile
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)', fontSize: 14, marginTop: 6 }}>
              Add your bio, skills, and portfolio to stand out and build trust.
            </p>
          </div>
          <Link to="/profile/edit"><Button variant="dark">Complete Profile →</Button></Link>
        </div>
      )}

      {loading ? (
        <div className="card-static neo-loading" style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>
      ) : user.role === "client" ? (
        <>
          {/* CLIENT STATS */}
          <div className="stats-grid" style={{ marginBottom: 40 }}>
            <StatBlock label="Open Projects" value={projects.filter((p) => p.status === "open").length} hint="Collecting proposals" color="var(--blue)" />
            <StatBlock label="Active Hires" value={projects.filter((p) => ["in-progress", "delivered"].includes(p.status)).length} hint="Work underway" color="var(--yellow)" />
            <StatBlock label="Completed" value={projects.filter((p) => p.status === "completed").length} hint="Successfully closed" color="var(--ink)" />
            <StatBlock label="Total Spend" value={formatCurrency(clientSpend)} hint="Paid to freelancers" color="var(--red)" />
          </div>

          <hr className="section-rule" style={{ marginBottom: 32 }} />

          {/* TABS */}
          <div className="neo-tabs" style={{ marginBottom: 28 }}>
            <TabBtn id="active">Active</TabBtn>
            <TabBtn id="pipeline">Pipeline</TabBtn>
          </div>

          {activeTab === "active" && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, textTransform: 'uppercase', marginBottom: 20 }}>Active Hires</h2>
              {projects.filter((p) => ["in-progress", "delivered"].includes(p.status)).length === 0 ? (
                <EmptyState title="No Active Hires" body="When you accept a proposal, work appears here." ctaLabel="Post a project" ctaTo="/post-job" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {projects.filter((p) => ["in-progress", "delivered"].includes(p.status)).map((project) => (
                    <ProjectCard key={project._id} project={project} accent={STATUS_COLORS[project.status]}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 0.95, marginBottom: 6 }}>{project.title}</h3>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
                          HIRED: {project.assignedFreelancer?.name || "Freelancer"}
                        </p>
                        <span className="badge" style={{ background: STATUS_COLORS[project.status], color: project.status === 'in-progress' ? 'var(--ink)' : 'var(--white)' }}>
                          {statusLabel(project.status)}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 180 }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1, marginBottom: 14 }}>{formatCurrency(project.budget)}</p>
                        {project.status === "delivered" ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Button size="sm" onClick={() => updateProjectStatus(project._id, "completed")}>✓ Approve</Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedProjectForRevision(project)}>Request Revision</Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => startChat(project)}>Message</Button>
                        )}
                      </div>
                    </ProjectCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "pipeline" && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, textTransform: 'uppercase', marginBottom: 20 }}>Project Pipeline</h2>
              {projects.length === 0 ? (
                <EmptyState title="No Projects Yet" body="Start by publishing a scoped project so freelancers can pitch you." ctaLabel="Post your first project" ctaTo="/post-job" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {projects.filter((p) => !["in-progress", "delivered"].includes(p.status)).map((project) => (
                    <ProjectCard key={project._id} project={project} accent={STATUS_COLORS[project.status]}>
                      <Link to={`/jobs/${project._id}`} style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 0.95, marginBottom: 8 }}>{project.title}</h3>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: STATUS_COLORS[project.status], color: 'var(--white)' }}>{statusLabel(project.status)}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
                            {project.bidsCount || 0} PROPOSALS
                          </span>
                        </div>
                      </Link>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1, marginBottom: 10 }}>{formatCurrency(project.budget)}</p>
                        {project.status === "completed" && (
                          <Button variant="outline" size="sm" onClick={() => setSelectedProjectForReview(project)}>★ Leave Review</Button>
                        )}
                      </div>
                    </ProjectCard>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* FREELANCER STATS */}
          <div className="stats-grid" style={{ marginBottom: 40 }}>
            <StatBlock label="Active Work" value={activeWork.length} hint="Orders in progress" color="var(--yellow)" />
            <StatBlock label="Pending Review" value={activeWork.filter((p) => p.status === "delivered").length} hint="Awaiting approval" color="var(--blue)" />
            <StatBlock label="Accepted Bids" value={bids.filter((b) => b.status === "accepted").length} hint="Won projects" color="var(--ink)" />
            <StatBlock label="Total Earnings" value={formatCurrency(freelancerEarnings)} hint="From completed jobs" color="var(--red)" />
          </div>

          <hr className="section-rule" style={{ marginBottom: 32 }} />

          <div className="neo-tabs" style={{ marginBottom: 28 }}>
            <TabBtn id="active">Active</TabBtn>
            <TabBtn id="gigs">My Gigs</TabBtn>
            <TabBtn id="bids">Proposals</TabBtn>
            <TabBtn id="history">History</TabBtn>
          </div>

          {activeTab === "active" && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, textTransform: 'uppercase', marginBottom: 20 }}>Active Work</h2>
              {activeWork.length === 0 ? (
                <EmptyState title="No Active Work" body="Win a proposal or get hired through a gig to see work here." ctaLabel="Browse projects" ctaTo="/projects" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {activeWork.map((project) => (
                    <ProjectCard key={project._id} project={project} accent={STATUS_COLORS[project.status]}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 0.95, marginBottom: 6 }}>{project.title}</h3>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
                          CLIENT: {project.client?.name}
                        </p>
                        <span className="badge" style={{ background: STATUS_COLORS[project.status], color: project.status === 'in-progress' ? 'var(--ink)' : 'var(--white)' }}>{statusLabel(project.status)}</span>
                        {project.revisionMessage && project.status === "revision" && (
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, marginTop: 10, padding: 12, background: 'var(--paper)', border: '3px solid var(--red)', fontStyle: 'italic' }}>
                            "{project.revisionMessage}"
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 180 }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1, marginBottom: 14 }}>{formatCurrency(project.budget)}</p>
                        {(project.status === "in-progress" || project.status === "revision") ? (
                          <Button size="sm" onClick={() => setSelectedProjectForDelivery(project)}>Deliver Work →</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => startChat(project)}>Message</Button>
                        )}
                      </div>
                    </ProjectCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "gigs" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, textTransform: 'uppercase' }}>Your Gigs</h2>
                <Link to="/post-gig"><Button variant="outline" size="sm">+ Add Gig</Button></Link>
              </div>
              {gigs.length === 0 ? (
                <EmptyState title="No Gigs Published" body="Create a gig so clients can discover and order from you." ctaLabel="Create a gig" ctaTo="/post-gig" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {gigs.map((gig) => (
                    <Link key={gig._id} to={`/gigs/${gig._id}`} className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, marginBottom: 8 }}>{gig.title}</h3>
                        <span className="badge">{gig.category}</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1 }}>{formatCurrency(gig.price)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bids" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, textTransform: 'uppercase' }}>Proposals</h2>
                <Link to="/projects"><Button variant="outline" size="sm">Find Work</Button></Link>
              </div>
              {bids.length === 0 ? (
                <EmptyState title="No Proposals Sent" body="Browse projects and start pitching." ctaLabel="Browse projects" ctaTo="/projects" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {bids.map((bid) => (
                    <Link key={bid._id} to={`/jobs/${bid.project?._id}`} className="card" style={{ padding: 24 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, marginBottom: 10 }}>{bid.project?.title || "Project"}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <span className="badge" style={{
                          background: bid.status === 'accepted' ? 'var(--ink)' : bid.status === 'rejected' ? 'var(--red)' : 'var(--yellow)',
                          color: bid.status === 'accepted' ? 'var(--yellow)' : bid.status === 'rejected' ? 'var(--white)' : 'var(--ink)',
                        }}>{statusLabel(bid.status)}</span>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1 }}>{formatCurrency(bid.amount)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, textTransform: 'uppercase', marginBottom: 20 }}>Completed History</h2>
              {projects.filter((p) => p.status === "completed" && p.assignedFreelancer?._id === user._id).length === 0 ? (
                <EmptyState title="No History" body="Completed projects appear here once finalized." ctaLabel="Browse projects" ctaTo="/projects" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {projects.filter((p) => p.status === "completed" && p.assignedFreelancer?._id === user._id).map((project) => (
                    <ProjectCard key={project._id} project={project} accent="var(--ink)">
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 0.95, marginBottom: 6 }}>{project.title}</h3>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>
                          CLIENT: {project.client?.name} · {formatRelativeDate(project.updatedAt)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1, marginBottom: 8 }}>{formatCurrency(project.budget)}</p>
                        <span className="badge badge-dark">COMPLETED</span>
                      </div>
                    </ProjectCard>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedProjectForReview && <ReviewModal project={selectedProjectForReview} onClose={() => setSelectedProjectForReview(null)} onSuccess={() => { setSelectedProjectForReview(null); load(); }} />}
      {selectedProjectForDelivery && <DeliveryModal project={selectedProjectForDelivery} onClose={() => setSelectedProjectForDelivery(null)} onSuccess={() => { setSelectedProjectForDelivery(null); load(); }} />}
      {selectedProjectForRevision && <RevisionModal project={selectedProjectForRevision} onClose={() => setSelectedProjectForRevision(null)} onSuccess={() => { setSelectedProjectForRevision(null); load(); }} />}
    </div>
  );
};

export default Dashboard;
