import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Web Development",
    budget: "",
    budgetType: "fixed",
    experienceLevel: "Intermediate",
    duration: "1 to 3 months",
    deadline: "",
    skillsRequired: "",
  });

  const updateField = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      await api.post("/projects", {
        ...formData,
        budget: Number(formData.budget),
        skillsRequired: formData.skillsRequired
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        deadline: formData.deadline || undefined,
      });

      toast.success("Project posted successfully.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create project");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "client") {
    return (
      <div className="container page-section">
        <div className="card-static" style={{ textAlign: "center", padding: "56px 24px", maxWidth: 550, marginInline: 'auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h1 style={{ fontSize: 28, marginBottom: 12, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            Only clients can post projects.
          </h1>
          <p style={{ color: "var(--nb-text-secondary)", marginBottom: 24, fontSize: 16 }}>
            Freelancer accounts should publish gigs instead of client-side project requests.
          </p>
          <Button onClick={() => navigate("/post-gig")}>⚡ Create a gig</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-section" style={{ maxWidth: 880 }}>
      <div className="card-static form-page-header" style={{ marginBottom: 20, background: 'var(--nb-yellow)' }}>
        <span className="badge badge-dark" style={{ marginBottom: 12 }}>👤 Client Intake</span>
        <h1 className="form-page-title" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
          Post a project
        </h1>
        <p className="form-page-desc">
          Clear scope, budget, and skills reduce noisy proposals and get better freelancer matches.
        </p>
      </div>

      <form className="card-static" onSubmit={submit}>
        <div style={{ display: "grid", gap: 20 }}>
          <div>
            <label htmlFor="title" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
              Project title
            </label>
            <input
              id="title"
              name="title"
              className="input-field"
              placeholder="Build a SaaS landing page and dashboard"
              value={formData.title}
              onChange={updateField}
              required
            />
          </div>

          <div>
            <label htmlFor="description" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
              Scope and requirements
            </label>
            <textarea
              id="description"
              name="description"
              className="input-field"
              rows="8"
              placeholder="Explain the deliverables, quality bar, stack, and what a successful handoff looks like."
              value={formData.description}
              onChange={updateField}
              required
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="three-column-grid">
            <div>
              <label htmlFor="category" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                Category
              </label>
              <select id="category" name="category" className="input-field" value={formData.category} onChange={updateField}>
                <option>Web Development</option>
                <option>Mobile Development</option>
                <option>Design</option>
                <option>Data Science</option>
                <option>Writing</option>
                <option>Marketing</option>
                <option>Video & Animation</option>
                <option>Music & Audio</option>
              </select>
            </div>
            <div>
              <label htmlFor="budgetType" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                Budget type
              </label>
              <select id="budgetType" name="budgetType" className="input-field" value={formData.budgetType} onChange={updateField}>
                <option value="fixed">Fixed price</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
            <div>
              <label htmlFor="budget" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                Budget ($)
              </label>
              <input
                id="budget"
                name="budget"
                className="input-field"
                type="number"
                min="1"
                placeholder="2500"
                value={formData.budget}
                onChange={updateField}
                required
              />
            </div>
          </div>

          <div className="three-column-grid">
            <div>
              <label htmlFor="experienceLevel" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                Experience level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                className="input-field"
                value={formData.experienceLevel}
                onChange={updateField}
              >
                <option>Entry Level</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>
            <div>
              <label htmlFor="duration" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                Estimated duration
              </label>
              <select id="duration" name="duration" className="input-field" value={formData.duration} onChange={updateField}>
                <option>Less than 1 month</option>
                <option>1 to 3 months</option>
                <option>3 to 6 months</option>
                <option>6+ months</option>
              </select>
            </div>
            <div>
              <label htmlFor="deadline" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                Target deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                className="input-field"
                value={formData.deadline}
                onChange={updateField}
              />
            </div>
          </div>

          <div>
            <label htmlFor="skillsRequired" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
              Required skills
            </label>
            <input
              id="skillsRequired"
              name="skillsRequired"
              className="input-field"
              placeholder="React, Node.js, MongoDB, Stripe"
              value={formData.skillsRequired}
              onChange={updateField}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish Project →"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
