import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { formatCurrency, getUserInitials } from "../../utils/formatters";

const GigDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/gigs/${id}`);
        setGig(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Gig not found");
        navigate("/gigs");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const isOwner = useMemo(() => {
    if (!gig || !user) return false;
    return gig.freelancer?._id === user._id;
  }, [gig, user]);

  const startChat = async () => {
    if (!user) {
      toast.info("Log in first to contact this freelancer.");
      navigate("/login");
      return;
    }

    if (user.role === "freelancer") {
      toast.info("Clients contact freelancers from gigs. Use the projects marketplace to win work.");
      return;
    }

    try {
      const { data } = await api.post("/chat", { userId: gig.freelancer._id });
      navigate("/chat", { state: { selectedChatId: data._id } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not start chat");
    }
  };

  const handlePurchase = async () => {
    try {
      await api.post(`/gigs/${id}/purchase`);
      toast.success("Gig purchased! Project is now in-progress.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Purchase failed");
    }
  };

  if (loading) {
    return (
      <div className="container page-section">
        <div className="card-static neo-loading" style={{ padding: 40 }}>Loading gig...</div>
      </div>
    );
  }

  if (!gig) return null;

  return (
    <div className="container page-section">
      <div className="two-column-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Freelancer Header */}
          <div className="card-static">
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  background: "var(--nb-blue)",
                  border: "var(--nb-border)",
                  fontSize: 22,
                  boxShadow: 'var(--nb-shadow-sm)',
                }}
              >
                {getUserInitials(gig.freelancer?.name)}
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{gig.freelancer?.name}</p>
                <p style={{ color: "var(--nb-text-secondary)" }}>
                  {gig.freelancer?.profile?.title || "Freelancer"}
                </p>
              </div>
            </div>

            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 16, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              {gig.title}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <span className="badge badge-blue">{gig.category}</span>
              <span className="badge badge-purple">{gig.deliveryTime}</span>
              <span className="badge badge-orange">⭐ {gig.freelancer?.rating?.toFixed?.(1) || "0.0"}</span>
            </div>

            <p style={{ color: "var(--nb-text-secondary)", fontSize: 16, marginBottom: 24, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {gig.description}
            </p>

            {gig.skills?.length ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {gig.skills.map((skill, i) => (
                  <span key={skill} className={`badge ${['badge-lime', 'badge-blue', 'badge-pink', 'badge-orange', 'badge-purple'][i % 5]}`}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* About Freelancer */}
          <div className="card-static" style={{ background: 'var(--nb-cream)' }}>
            <span className="badge badge-dark" style={{ marginBottom: 16 }}>👤 About</span>
            <h2 style={{ fontSize: 24, marginBottom: 12, fontFamily: 'var(--font-heading)' }}>About the Freelancer</h2>
            <p style={{ color: "var(--nb-text-secondary)", marginBottom: 12, fontSize: 15 }}>
              {gig.freelancer?.profile?.bio || "This freelancer has not filled out a public bio yet."}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, border: 'var(--nb-border-thin)', background: 'var(--nb-white)' }}>
                <p style={{ fontSize: 12, color: 'var(--nb-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>📍 Location</p>
                <p style={{ fontWeight: 600 }}>{gig.freelancer?.profile?.location || "Remote"}</p>
              </div>
              <div style={{ padding: 12, border: 'var(--nb-border-thin)', background: 'var(--nb-white)' }}>
                <p style={{ fontSize: 12, color: 'var(--nb-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>💰 Rate</p>
                <p style={{ fontWeight: 600 }}>{gig.freelancer?.profile?.hourlyRate ? formatCurrency(gig.freelancer.profile.hourlyRate) + "/hr" : "Not set"}</p>
              </div>
            </div>
            <p style={{ color: "var(--nb-text-muted)", fontSize: 13, marginTop: 14 }}>
              ✉ {gig.freelancer?.email}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card-static" style={{ background: 'var(--nb-yellow)' }}>
            <label style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-heading)', letterSpacing: '0.5px', color: 'var(--nb-text-muted)' }}>
              Starting Price
            </label>
            <h2 style={{ fontSize: 40, marginBottom: 12, fontFamily: 'var(--font-display)' }}>{formatCurrency(gig.price)}</h2>
            <p style={{ color: "var(--nb-text-secondary)", marginBottom: 24, fontWeight: 600 }}>
              📦 Delivery in {gig.deliveryTime}
            </p>

            {isOwner ? (
              <div style={{ padding: 16, border: 'var(--nb-border-thin)', background: 'var(--nb-white)' }}>
                <p style={{ color: "var(--nb-text-secondary)", fontSize: 14 }}>
                  This is your gig listing. Update the details from your dashboard to improve conversion.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {user?.role === "client" && (
                  <Button onClick={handlePurchase} style={{ width: "100%", background: 'var(--nb-black)', color: 'var(--nb-yellow)' }}>
                    🛒 Order Now
                  </Button>
                )}
                <Button onClick={startChat} variant={user?.role === "client" ? "outline" : "primary"} style={{ width: "100%" }}>
                  💬 Contact Freelancer
                </Button>
                <Button variant="outline" onClick={() => navigate("/projects")} style={{ width: "100%" }}>
                  Compare Open Projects
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
