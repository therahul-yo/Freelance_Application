import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

const PostGig = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Web Development",
    price: "",
    deliveryTime: "3 days",
    skills: "",
  });

  const updateField = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  // Draft loading and Discard check
  useEffect(() => {
    const saved = localStorage.getItem("draft_gig");
    if (saved) {
      try { setFormData(JSON.parse(saved)); } catch (e) {}
    }
    
    const handleBeforeUnload = (e) => {
      const hasContent = Object.values(formData).some(v => v !== "" && v !== "Web Development" && v !== "3 days");
      if (hasContent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // Intentionally empty to only run once for load

  // Draft saving
  useEffect(() => {
    localStorage.setItem("draft_gig", JSON.stringify(formData));
  }, [formData]);

  const clearDraft = () => localStorage.removeItem("draft_gig");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/gigs", {
        ...formData,
        price: Number(formData.price),
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      toast.success("Gig published.");
      clearDraft();
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not publish gig");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "freelancer") {
    return (
      <div className="container page-section">
        <div className="card-static" style={{ textAlign: "center", padding: "80px 24px", maxWidth: 600, marginInline: 'auto', background: 'var(--nb-cream)' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🚫</div>
          <h1 style={{ fontSize: 32, marginBottom: 12, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Creator Account Required</h1>
          <p style={{ color: "var(--nb-text-secondary)", marginBottom: 24, fontSize: 18 }}>
            Your current account is set as a <strong>{user.role}</strong>. Only users registered as 'freelancer' can publish service gigs.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button onClick={() => navigate("/post-job")}>📋 Post a Project instead</Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
          </div>
          <p style={{ marginTop: 32, fontSize: 12, color: 'var(--nb-text-muted)' }}>
            Logged in as: {user.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-section" style={{ maxWidth: 880 }}>
      <div className="card-static form-page-header" style={{ marginBottom: 20, background: 'var(--nb-hot-pink)', color: 'var(--nb-white)' }}>
        <span className="badge badge-dark" style={{ marginBottom: 12 }}>⚡ Freelancer Storefront</span>
        <h1 className="form-page-title" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--nb-white)' }}>
          Create a gig
        </h1>
        <p className="form-page-desc" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Strong positioning, clear deliverables, and realistic pricing make your listing easier to buy.
        </p>
      </div>

      <form className="card-static" onSubmit={submit}>
        <div style={{ display: "grid", gap: 20 }}>
          <div>
            <label htmlFor="title" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
              Gig title
            </label>
            <input
              id="title"
              name="title"
              className="input-field"
              placeholder="I will build a fast React and Node.js SaaS MVP"
              value={formData.title}
              onChange={updateField}
              minLength="10"
              maxLength="80"
              required
            />
            <span style={{ fontSize: 11, color: "var(--nb-text-muted)", marginTop: 4, display: "block" }}>
              {formData.title.length}/80 characters (min. 10)
            </span>
          </div>

          <div>
            <label htmlFor="description" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
              What the buyer gets
            </label>
            <textarea
              id="description"
              name="description"
              className="input-field"
              rows="8"
              placeholder="Describe your deliverables, communication style, revision policy, and why you are credible."
              value={formData.description}
              onChange={updateField}
              minLength="50"
              maxLength="2000"
              required
              style={{ resize: "vertical" }}
            />
            <span style={{ fontSize: 11, color: "var(--nb-text-muted)", marginTop: 4, display: "block" }}>
              {formData.description.length}/2000 characters (min. 50 required for visibility)
            </span>
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
              <label htmlFor="price" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                Starting price ($)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="1"
                className="input-field"
                placeholder="350"
                value={formData.price}
                onChange={updateField}
                required
              />
            </div>
            <div>
              <label htmlFor="deliveryTime" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                Delivery time
              </label>
              <select
                id="deliveryTime"
                name="deliveryTime"
                className="input-field"
                value={formData.deliveryTime}
                onChange={updateField}
              >
                <option>1 day</option>
                <option>2 days</option>
                <option>3 days</option>
                <option>5 days</option>
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="skills" style={{ display: "block", marginBottom: 8, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
              Search tags
            </label>
            <input
              id="skills"
              name="skills"
              className="input-field"
              placeholder="React, Next.js, Node.js, MongoDB"
              value={formData.skills}
              onChange={updateField}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish Gig →"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostGig;
