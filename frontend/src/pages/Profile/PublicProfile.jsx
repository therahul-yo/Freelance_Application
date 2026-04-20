import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { formatCurrency } from "../../utils/formatters";

const PublicProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/reviews/user/${id}`),
        ]);
        setProfile(profileRes.data);
        setReviews(reviewsRes.data);

        // If freelancer, also load their gigs
        if (profileRes.data.role === "freelancer") {
          try {
            const gigsRes = await api.get(`/gigs?freelancerId=${id}`);
            setGigs(gigsRes.data);
          } catch {
            // Gigs endpoint might not support freelancerId filter yet
          }
        }
      } catch {
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container page-section">
        <div className="card-static neo-loading" style={{ padding: 40 }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container page-section" style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
        <h2 style={{ fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
          User not found
        </h2>
      </div>
    );
  }

  const colors = ["var(--nb-hot-pink)", "var(--nb-blue)", "var(--nb-yellow)", "var(--nb-lime)", "var(--nb-purple)", "var(--nb-orange)"];
  const avatarColor = colors[profile.name.charCodeAt(0) % colors.length];
  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <div className="container page-section">
      <div className="two-column-grid" style={{ gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>

        {/* ===== LEFT SIDEBAR ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Avatar + Basic Info Card */}
          <div className="card-static" style={{ textAlign: "center" }}>
            <div
              style={{
                width: 100,
                height: 100,
                border: "var(--nb-border)",
                background: avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 42,
                fontFamily: "var(--font-display)",
                color: "var(--nb-white)",
                margin: "0 auto 16px",
                boxShadow: "var(--nb-shadow-sm)",
              }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <h1 style={{ fontSize: 24, fontFamily: "var(--font-display)", textTransform: "uppercase", marginBottom: 4 }}>
              {profile.name}
            </h1>

            {profile.profile?.title && (
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                {profile.profile.title}
              </p>
            )}

            {profile.profile?.tagline && (
              <p style={{ color: "var(--nb-text-secondary)", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
                {profile.profile.tagline}
              </p>
            )}

            <span className={`badge ${profile.role === "freelancer" ? "badge-pink" : "badge-blue"}`}>
              {profile.role === "freelancer" ? "⚡ Freelancer" : "👤 Client"}
            </span>

            {/* Rating */}
            {profile.numReviews > 0 && (
              <div style={{ marginTop: 16, padding: "12px 0", borderTop: "var(--nb-border-thin)" }}>
                <div style={{ fontSize: 28, fontFamily: "var(--font-display)", color: "var(--nb-yellow)" }}>
                  {"★".repeat(Math.round(profile.rating))}
                  {"☆".repeat(5 - Math.round(profile.rating))}
                </div>
                <p style={{ fontSize: 13, color: "var(--nb-text-secondary)", marginTop: 4 }}>
                  {profile.rating.toFixed(1)} ({profile.numReviews} review{profile.numReviews !== 1 ? "s" : ""})
                </p>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="card-static" style={{ background: "var(--nb-cream)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 14, textTransform: "uppercase", marginBottom: 14 }}>
              Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {profile.profile?.location && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--nb-text-muted)", fontWeight: 600 }}>📍 Location</span>
                  <span style={{ fontWeight: 600 }}>{profile.profile.location}</span>
                </div>
              )}
              {profile.role === "freelancer" && profile.profile?.hourlyRate > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--nb-text-muted)", fontWeight: 600 }}>💰 Hourly Rate</span>
                  <span style={{ fontWeight: 700 }}>{formatCurrency(profile.profile.hourlyRate)}/hr</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--nb-text-muted)", fontWeight: 600 }}>📅 Joined</span>
                <span style={{ fontWeight: 600 }}>
                  {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isOwnProfile ? (
            <Link to="/profile/edit">
              <Button style={{ width: "100%" }}>✏️ Edit Profile</Button>
            </Link>
          ) : currentUser ? (
            <Link to="/chat" state={{ startChatWith: profile._id }}>
              <Button style={{ width: "100%" }}>💬 Message</Button>
            </Link>
          ) : null}
        </div>

        {/* ===== RIGHT CONTENT ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Bio */}
          {profile.profile?.bio && (
            <div className="card-static">
              <h2 style={{ fontSize: 22, fontFamily: "var(--font-heading)", marginBottom: 14 }}>About</h2>
              <p style={{ color: "var(--nb-text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {profile.profile.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {profile.profile?.skills?.length > 0 && (
            <div className="card-static">
              <h2 style={{ fontSize: 22, fontFamily: "var(--font-heading)", marginBottom: 14 }}>Skills</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile.profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className={`badge ${["badge-blue", "badge-pink", "badge-lime", "badge-orange", "badge-purple"][i % 5]}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Links */}
          {profile.profile?.portfolio?.length > 0 && (
            <div className="card-static">
              <h2 style={{ fontSize: 22, fontFamily: "var(--font-heading)", marginBottom: 14 }}>Portfolio</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {profile.profile.portfolio.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card"
                    style={{ background: "var(--nb-cream)", display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 20 }}>🔗</span>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, wordBreak: "break-all" }}>
                      {url}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Gigs (Freelancers) */}
          {profile.role === "freelancer" && gigs.length > 0 && (
            <div className="card-static">
              <h2 style={{ fontSize: 22, fontFamily: "var(--font-heading)", marginBottom: 14 }}>
                Gigs ({gigs.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {gigs.map((gig) => (
                  <Link
                    key={gig._id}
                    to={`/gigs/${gig._id}`}
                    className="card"
                    style={{ background: "var(--nb-cream)" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontFamily: "var(--font-heading)", marginBottom: 6 }}>
                          {gig.title}
                        </h3>
                        <span className="badge" style={{ fontSize: 11, padding: "3px 8px" }}>
                          {gig.category}
                        </span>
                      </div>
                      <p style={{ fontWeight: 700, fontFamily: "var(--font-heading)", fontSize: 18, whiteSpace: "nowrap" }}>
                        {formatCurrency(gig.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card-static">
            <h2 style={{ fontSize: 22, fontFamily: "var(--font-heading)", marginBottom: 14 }}>
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--nb-text-muted)", fontSize: 14 }}>No reviews yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {reviews.map((review) => (
                  <div key={review._id} className="card" style={{ background: "var(--nb-cream)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14 }}>
                        {review.reviewer?.name || "User"}
                      </span>
                      <span style={{ color: "var(--nb-yellow)", fontSize: 16 }}>
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p style={{ color: "var(--nb-text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                      {review.comment}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--nb-text-muted)", marginTop: 8 }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
