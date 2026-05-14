import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/gigs/${id}`);
        setGig(data);
        if (data.freelancer?._id) {
          try {
            const reviewsRes = await api.get(`/reviews/user/${data.freelancer._id}`);
            setReviews(reviewsRes.data);
          } catch { /* no reviews */ }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Gig not found");
        navigate("/gigs");
      } finally { setLoading(false); }
    };
    load();
  }, [id, navigate]);

  const isOwner = useMemo(() => {
    if (!gig || !user) return false;
    return gig.freelancer?._id === user._id;
  }, [gig, user]);

  const startChat = async () => {
    if (!user) { toast.info("Log in first to contact this freelancer."); navigate("/login"); return; }
    if (user.role === "freelancer") {
      toast.info("Clients contact freelancers from gigs.");
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
        <div className="card-static neo-loading" style={{ padding: 40, textAlign: 'center' }}>Loading gig...</div>
      </div>
    );
  }

  if (!gig) return null;

  return (
    <div className="container page-section">
      {/* HERO */}
      <div style={{ borderBottom: '4px solid var(--ink)', paddingBottom: 32, marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 12 }}>
          GIG / {gig.category?.toUpperCase()}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 20 }}>
          {gig.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              border: '4px solid var(--ink)',
              background: 'var(--yellow)',
              display: 'grid', placeItems: 'center',
              fontFamily: 'var(--font-display)', fontSize: 22,
            }}>
              {getUserInitials(gig.freelancer?.name)}
            </div>
            <div>
              <Link to={`/users/${gig.freelancer?._id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', borderBottom: '3px solid var(--ink)' }}>
                {gig.freelancer?.name}
              </Link>
              <p style={{ fontFamily: 'var(--font-body)', color: "var(--muted)", fontSize: 13, fontStyle: 'italic' }}>
                {gig.freelancer?.profile?.title || "Freelancer"}
              </p>
            </div>
          </div>
          <span className="badge">★ {gig.freelancer?.rating?.toFixed?.(1) || "0.0"}</span>
          <span className="badge">{gig.deliveryTime}</span>
        </div>
      </div>

      <div className="two-column-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* DESCRIPTION */}
          <div className="card-static">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 8 }}>
              § DESCRIPTION
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', marginBottom: 16 }}>About This Gig</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: "var(--ink)", fontSize: 16, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {gig.description}
            </p>
            {gig.skills?.length ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 20, paddingTop: 20, borderTop: '3px solid var(--ink)' }}>
                {gig.skills.map((skill) => (
                  <span key={skill} className="badge">{skill}</span>
                ))}
              </div>
            ) : null}
          </div>

          {/* ABOUT FREELANCER */}
          <div className="card-static" style={{ background: 'var(--paper)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 8 }}>
              § ABOUT
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', marginBottom: 16 }}>The Freelancer</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', marginBottom: 16, fontSize: 15, lineHeight: 1.6 }}>
              {gig.freelancer?.profile?.bio || "This freelancer has not filled out a public bio yet."}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 14, border: '3px solid var(--ink)', background: 'var(--white)' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>LOCATION</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>{gig.freelancer?.profile?.location || "REMOTE"}</p>
              </div>
              <div style={{ padding: 14, border: '3px solid var(--ink)', background: 'var(--white)' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>RATE</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>{gig.freelancer?.profile?.hourlyRate ? formatCurrency(gig.freelancer.profile.hourlyRate) + "/HR" : "—"}</p>
              </div>
            </div>
          </div>

          {/* REVIEWS */}
          <div className="card-static">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 8 }}>
              § REVIEWS ({reviews.length})
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', marginBottom: 16 }}>Client Reviews</h2>
            {reviews.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', color: "var(--muted)", fontStyle: 'italic' }}>No reviews yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.slice(0, 5).map((review) => (
                  <div key={review._id} style={{ padding: 16, border: '3px solid var(--ink)', background: 'var(--paper)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                        {review.reviewer?.name || 'User'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 1 }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STICKY SIDEBAR */}
        <div style={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card-static" style={{ background: 'var(--yellow)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--ink)' }}>
              STARTING PRICE
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, lineHeight: 1, margin: '8px 0' }}>
              {formatCurrency(gig.price)}
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24, paddingBottom: 16, borderBottom: '3px solid var(--ink)' }}>
              DELIVERY IN {gig.deliveryTime?.toUpperCase()}
            </p>

            {isOwner ? (
              <div style={{ padding: 14, border: '3px solid var(--ink)', background: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: 13, fontStyle: 'italic' }}>
                This is your gig listing. Update details from your dashboard.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {user?.role === "client" && (
                  <Button onClick={handlePurchase} variant="dark" style={{ width: "100%" }}>
                    Order Now →
                  </Button>
                )}
                <Button onClick={startChat} variant={user?.role === "client" ? "outline" : "primary"} style={{ width: "100%" }}>
                  Contact Freelancer
                </Button>
              </div>
            )}
          </div>

          <Button variant="outline" onClick={() => navigate("/projects")} style={{ width: "100%" }}>
            Compare Open Projects
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
