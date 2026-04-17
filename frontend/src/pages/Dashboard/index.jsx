import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { formatCurrency, formatRelativeDate } from "../../utils/formatters";

const ReviewModal = ({ project, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'grid', placeItems: 'center', zIndex: 100
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <h2 style={{ marginBottom: 16 }}>Leave a Review</h2>
        <p style={{ marginBottom: 20, color: 'var(--color-text-secondary)' }}>
          Rate your experience with this project.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Rating (1-5)</label>
            <select
              className="input-field"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} Stars</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Comment</label>
            <textarea
              className="input-field"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the collaboration?"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Submit Review"}
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

const StatCard = ({ label, value, hint }) => (
  <div className="card">
    <div className="card-laser-border" />
    <p style={{ color: "var(--color-text-tertiary)", fontSize: 12, textTransform: "uppercase" }}>
      {label}
    </p>
    <p style={{ fontSize: 30, fontWeight: 700, margin: "6px 0" }}>{value}</p>
    {hint ? <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{hint}</p> : null}
  </div>
);

const EmptyState = ({ title, body, ctaLabel, ctaTo }) => (
  <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
    <div className="card-laser-border" />
    <h3 style={{ fontSize: 22, marginBottom: 10 }}>{title}</h3>
    <p style={{ color: "var(--color-text-secondary)", marginBottom: 20 }}>{body}</p>
    <Link to={ctaTo}>
      <Button>{ctaLabel}</Button>
    </Link>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [selectedProjectForReview, setSelectedProjectForReview] = useState(null);

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
    (p) => p.assignedFreelancer?._id === user._id && ["in-progress", "delivered"].includes(p.status)
  );

  return (
    <div className="container page-section">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ color: "var(--color-accent-primary)", fontSize: 13, marginBottom: 8 }}>
            {user.role === "client" ? "Client command center" : "Freelancer command center"}
          </p>
          <h1 style={{ fontSize: 40, marginBottom: 8 }}>Welcome back, {user.name}</h1>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: 620 }}>
            {user.role === "client"
              ? "Review your active projects, incoming demand, and delivery pipeline."
              : "Track your gigs, proposal pipeline, and accepted work from one place."}
          </p>
        </div>
        <Link to={user.role === "client" ? "/post-job" : "/post-gig"}>
          <Button>{user.role === "client" ? "Post another project" : "Create a new gig"}</Button>
        </Link>
      </div>

      {loading ? (
        <div className="card">Loading dashboard...</div>
      ) : user.role === "client" ? (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <StatCard
              label="Open projects"
              value={projects.filter((item) => item.status === "open").length}
              hint="Collecting fresh proposals"
            />
            <StatCard
              label="Active hires"
              value={projects.filter((item) => ["in-progress", "delivered"].includes(item.status)).length}
              hint="Work currently underway"
            />
            <StatCard
              label="Completed"
              value={projects.filter((item) => item.status === "completed").length}
              hint="Successfully closed"
            />
            <StatCard label="Total spend" value={formatCurrency(clientSpend)} hint="Paid to freelancers" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {projects.filter((p) => ["in-progress", "delivered"].includes(p.status)).length > 0 && (
              <div className="card">
                <div className="card-laser-border" />
                <h2 style={{ fontSize: 24, marginBottom: 18 }}>Active Hires</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {projects
                    .filter((p) => ["in-progress", "delivered"].includes(p.status))
                    .map((project) => (
                      <div key={project._id} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="card-laser-border" />
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                          <div>
                            <h3 style={{ fontSize: 20, marginBottom: 4 }}>{project.title}</h3>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 12 }}>
                              Hired: {project.assignedFreelancer?.name || "Freelancer"}
                            </p>
                            <span
                              className="badge"
                              style={{
                                background: project.status === "delivered" ? "rgba(190, 242, 100, 0.1)" : "rgba(255,255,255,0.05)",
                                color: project.status === "delivered" ? "var(--color-accent-secondary)" : "inherit",
                              }}
                            >
                              {project.status === "delivered" ? "Pending Approval" : project.status}
                            </span>
                          </div>
                          <div style={{ textAlign: "right", minWidth: 180 }}>
                            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{formatCurrency(project.budget)}</p>
                            {project.status === "delivered" ? (
                              <Button size="small" onClick={() => updateProjectStatus(project._id, "completed")}>
                                Approve & Complete
                              </Button>
                            ) : (
                              <Button variant="outline" size="small" onClick={() => startChat(project)}>
                                Message
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-laser-border" />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 24 }}>Project pipeline</h2>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
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
                      <div key={project._id} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="card-laser-border" />
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                          <Link to={`/jobs/${project._id}`} style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 18, marginBottom: 8 }}>{project.title}</h3>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
                              Status: {project.status} . {project.bidsCount || 0} Proposals
                            </p>
                          </Link>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontWeight: 600, marginBottom: 8 }}>{formatCurrency(project.budget)}</p>
                            {project.status === "completed" && (
                              <Button
                                variant="outline"
                                size="small"
                                onClick={() => setSelectedProjectForReview(project)}
                              >
                                Leave Review
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
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <StatCard label="Active Work" value={activeWork.length} hint="Orders in progress" />
            <StatCard
              label="Pending Review"
              value={activeWork.filter((p) => p.status === "delivered").length}
              hint="Waiting for client approval"
            />
            <StatCard label="Accepted Bids" value={bids.filter((bid) => bid.status === "accepted").length} hint="Won projects" />
            <StatCard label="Total Earnings" value={formatCurrency(freelancerEarnings)} hint="From completed jobs" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {activeWork.length > 0 && (
              <div className="card">
                <div className="card-laser-border" />
                <h2 style={{ fontSize: 24, marginBottom: 18 }}>Active Work</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {activeWork.map((project) => (
                    <div key={project._id} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="card-laser-border" />
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                        <div>
                          <h3 style={{ fontSize: 20, marginBottom: 4 }}>{project.title}</h3>
                          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 12 }}>
                            Client: {project.client?.name}
                          </p>
                          <span
                            className="badge"
                            style={{
                              background: project.status === "delivered" ? "rgba(125, 211, 252, 0.1)" : "rgba(255,255,255,0.05)",
                              color: project.status === "delivered" ? "var(--color-accent-primary)" : "inherit",
                            }}
                          >
                            {project.status === "delivered" ? "Delivered (Awaiting Approval)" : "In Progress"}
                          </span>
                        </div>
                        <div style={{ textAlign: "right", minWidth: 180 }}>
                          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{formatCurrency(project.budget)}</p>
                          {project.status === "in-progress" ? (
                            <Button size="small" onClick={() => updateProjectStatus(project._id, "delivered")}>
                              Deliver Work
                            </Button>
                          ) : (
                            <Button variant="outline" size="small" onClick={() => startChat(project)}>
                              Message Client
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="two-column-grid">
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 24 }}>Your storefront</h2>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Manage your published gigs.</p>
                  </div>
                  <Link to="/post-gig">
                    <Button variant="outline" size="small">
                      Add gig
                    </Button>
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
                      <Link key={gig._id} to={`/gigs/${gig._id}`} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                          <div>
                            <h3 style={{ fontSize: 18, marginBottom: 4 }}>{gig.title}</h3>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{gig.category}</p>
                          </div>
                          <p style={{ fontWeight: 600 }}>{formatCurrency(gig.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 24 }}>Recent proposals</h2>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Track your sent bids.</p>
                  </div>
                  <Link to="/projects">
                    <Button variant="outline" size="small">
                      Find work
                    </Button>
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
                        style={{ background: "rgba(255,255,255,0.02)" }}
                      >
                        <h3 style={{ fontSize: 18, marginBottom: 4 }}>{bid.project?.title || "Project"}</h3>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>Status: {bid.status}</p>
                          <p style={{ fontWeight: 600 }}>{formatCurrency(bid.amount)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {projects.filter((p) => p.status === "completed" && p.assignedFreelancer?._id === user._id).length > 0 && (
              <div className="card">
                <h2 style={{ fontSize: 24, marginBottom: 18 }}>Completed History</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {projects
                    .filter((p) => p.status === "completed" && p.assignedFreelancer?._id === user._id)
                    .map((project) => (
                      <div key={project._id} className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                          <div>
                            <h3 style={{ fontSize: 18, marginBottom: 4 }}>{project.title}</h3>
                            <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
                              Client: {project.client?.name} . {formatRelativeDate(project.updatedAt)}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontWeight: 600, marginBottom: 8 }}>{formatCurrency(project.budget)}</p>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => setSelectedProjectForReview(project)}
                            >
                              Leave Review
                            </Button>
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
    </div>
  );
};

export default Dashboard;
