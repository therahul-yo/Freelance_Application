import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "",
    tagline: "",
    bio: "",
    location: "",
    hourlyRate: "",
    skills: "",
    portfolio: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setForm({
          name: data.name || "",
          title: data.profile?.title || "",
          tagline: data.profile?.tagline || "",
          bio: data.profile?.bio || "",
          location: data.profile?.location || "",
          hourlyRate: data.profile?.hourlyRate || "",
          skills: (data.profile?.skills || []).join(", "),
          portfolio: (data.profile?.portfolio || []).join("\n"),
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        title: form.title.trim(),
        tagline: form.tagline.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        hourlyRate: Number(form.hourlyRate) || 0,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        portfolio: form.portfolio
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const { data: updatedUser } = await api.put("/users/profile", payload);
      setUser(updatedUser);
      toast.success("Profile updated!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const completeness = (() => {
    let filled = 0;
    
    // Core fields both roles use
    const coreFields = ['name', 'title', 'tagline', 'bio', 'location'];
    coreFields.forEach(field => {
      if (form[field] && form[field].trim()) filled++;
    });
    
    let total = coreFields.length;
    
    // Freelancer specific fields
    if (user.role === "freelancer") {
      const freelancerFields = ['skills', 'portfolio'];
      freelancerFields.forEach(field => {
        if (form[field] && form[field].trim()) filled++;
      });
      if (Number(form.hourlyRate) > 0) filled++;
      
      total += 3; // skills, portfolio, hourlyRate
    }
    
    return Math.round((filled / total) * 100);
  })();

  return (
    <div className="container page-section">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <span className="badge badge-blue" style={{ marginBottom: 12 }}>
            ✏️ Edit Profile
          </span>
          <h1
            style={{
              fontSize: 36,
              fontFamily: "var(--font-display)",
              textTransform: "uppercase",
            }}
          >
            Your Profile
          </h1>
          <p style={{ color: "var(--nb-text-secondary)", marginTop: 8 }}>
            Keep your profile complete so clients and collaborators can find you.
          </p>
        </div>

        {/* Completeness Bar */}
        <div
          className="card-static"
          style={{ marginBottom: 24, background: "var(--nb-cream)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 13,
                textTransform: "uppercase",
              }}
            >
              Profile Completeness
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                color:
                  completeness === 100
                    ? "var(--nb-green)"
                    : "var(--nb-hot-pink)",
              }}
            >
              {completeness}%
            </span>
          </div>
          <div
            style={{
              height: 12,
              border: "var(--nb-border-thin)",
              background: "var(--nb-white)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${completeness}%`,
                background:
                  completeness === 100
                    ? "var(--nb-lime)"
                    : "var(--nb-hot-pink)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="card-static neo-loading" style={{ padding: 40 }}>
            Loading profile...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="card-static" style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 22,
                  marginBottom: 20,
                  fontFamily: "var(--font-heading)",
                }}
              >
                Basic Info
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    className="input-field"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Professional Title</label>
                  <input
                    className="input-field"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Full-Stack Developer, UI/UX Designer"
                  />
                </div>
                <div>
                  <label className="input-label">Tagline</label>
                  <input
                    className="input-field"
                    name="tagline"
                    value={form.tagline}
                    onChange={handleChange}
                    placeholder="One-liner that describes what you do"
                    maxLength={120}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--nb-text-muted)",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {form.tagline.length}/120 characters
                  </span>
                </div>
                <div>
                  <label className="input-label">Location</label>
                  <input
                    className="input-field"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai, India"
                  />
                </div>
              </div>
            </div>

            <div className="card-static" style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 22,
                  marginBottom: 20,
                  fontFamily: "var(--font-heading)",
                }}
              >
                About You
              </h2>
              <div>
                <label className="input-label">Bio</label>
                <textarea
                  className="input-field"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell clients about your experience, approach, and what makes you stand out..."
                  maxLength={1500}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--nb-text-muted)",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {form.bio.length}/1500 characters
                </span>
              </div>
            </div>

            <div className="card-static" style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 22,
                  marginBottom: 20,
                  fontFamily: "var(--font-heading)",
                }}
              >
                Skills & Expertise
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label className="input-label">Skills (comma separated)</label>
                  <input
                    className="input-field"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="e.g. React, Node.js, Figma, Python"
                  />
                  {form.skills.trim() && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 10,
                      }}
                    >
                      {form.skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((skill, i) => (
                          <span
                            key={i}
                            className={`badge ${
                              [
                                "badge-blue",
                                "badge-pink",
                                "badge-lime",
                                "badge-orange",
                                "badge-purple",
                              ][i % 5]
                            }`}
                            style={{ fontSize: 12 }}
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                {user.role === "freelancer" && (
                  <div>
                    <label className="input-label">Hourly Rate (USD)</label>
                    <input
                      className="input-field"
                      name="hourlyRate"
                      type="number"
                      min="0"
                      value={form.hourlyRate}
                      onChange={handleChange}
                      placeholder="e.g. 50"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="card-static" style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 22,
                  marginBottom: 20,
                  fontFamily: "var(--font-heading)",
                }}
              >
                Portfolio Links
              </h2>
              <div>
                <label className="input-label">
                  Portfolio URLs (one per line)
                </label>
                <textarea
                  className="input-field"
                  name="portfolio"
                  value={form.portfolio}
                  onChange={handleChange}
                  rows={4}
                  placeholder={"https://github.com/yourname\nhttps://dribbble.com/yourname\nhttps://yourportfolio.com"}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Profile →"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
