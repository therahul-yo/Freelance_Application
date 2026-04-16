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
        <div className="card">Loading gig...</div>
      </div>
    );
  }

  if (!gig) return null;

  return (
    <div className="container page-section">
      <div className="two-column-grid">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                background: "rgba(125, 211, 252, 0.14)",
                border: "1px solid rgba(125, 211, 252, 0.2)",
              }}
            >
              {getUserInitials(gig.freelancer?.name)}
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700 }}>{gig.freelancer?.name}</p>
              <p style={{ color: "var(--color-text-secondary)" }}>
                {gig.freelancer?.profile?.title || "Freelancer"}
              </p>
            </div>
          </div>

          <h1 style={{ fontSize: 38, marginBottom: 14 }}>{gig.title}</h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <span className="badge">{gig.category}</span>
            <span className="badge">{gig.deliveryTime}</span>
            <span className="badge">Seller rating {gig.freelancer?.rating?.toFixed?.(1) || "0.0"}</span>
          </div>

          <p style={{ color: "var(--color-text-secondary)", fontSize: 16, marginBottom: 24, whiteSpace: "pre-wrap" }}>
            {gig.description}
          </p>

          {gig.skills?.length ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {gig.skills.map((skill) => (
                <span key={skill} className="badge">
                  {skill}
                </span>
              ))}
            </div>
          ) : null}

          <div className="card">
            <h2 style={{ fontSize: 26, marginBottom: 10 }}>About the freelancer</h2>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: 10 }}>
              {gig.freelancer?.profile?.bio || "This freelancer has not filled out a public bio yet."}
            </p>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: 6 }}>
              Location: {gig.freelancer?.profile?.location || "Remote"}
            </p>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: 6 }}>
              Hourly rate: {gig.freelancer?.profile?.hourlyRate ? formatCurrency(gig.freelancer.profile.hourlyRate) : "Not set"}
            </p>
            <p style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>
              Contact email: {gig.freelancer?.email}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <p style={{ color: "var(--color-text-tertiary)", fontSize: 13, marginBottom: 6 }}>Starting price</p>
            <h2 style={{ fontSize: 36, marginBottom: 12 }}>{formatCurrency(gig.price)}</h2>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: 18 }}>
              Delivery in {gig.deliveryTime}
            </p>

            {isOwner ? (
              <p style={{ color: "var(--color-text-secondary)" }}>
                This is your gig listing. Update the details from your dashboard if you want to
                improve conversion.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {user?.role === "client" && (
                  <Button onClick={handlePurchase} style={{ width: "100%" }}>
                    Order Now
                  </Button>
                )}
                <Button onClick={startChat} variant={user?.role === "client" ? "outline" : "primary"} style={{ width: "100%" }}>
                  Contact freelancer
                </Button>
                <Button variant="outline" onClick={() => navigate("/projects")} style={{ width: "100%" }}>
                  Compare open projects
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
