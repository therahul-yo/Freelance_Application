import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../components/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const GigDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/gigs/${id}`);
        setGig(data);
      } catch (error) {
        toast.error("Gig not found");
        navigate("/gigs");
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [id]);

  const startChat = async () => {
    if (!user) {
      toast.info("Please login to message");
      navigate("/login");
      return;
    }
    if (user.role === "freelancer") {
      toast.info("Only clients can hire freelancers");
      return;
    }
    try {
      const { data } = await axios.post(`${API_URL}/api/chat`, {
        userId: gig.freelancer._id
      });
      navigate("/chat", { state: { selectedChatId: data._id } });
    } catch (error) {
      toast.error("Could not start chat");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "60px" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  if (!gig) return null;

  const isOwner = user?._id === gig.freelancer?._id;

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "32px" }}>
        {/* Main Content */}
        <div>
          {/* Freelancer Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "50%", 
              background: "var(--color-bg-tertiary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}>
              {gig.freelancer?.name?.charAt(0) || "?"}
            </div>
            <div>
              <p style={{ fontWeight: "500" }}>{gig.freelancer?.name}</p>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Freelancer</p>
            </div>
          </div>

          <h1 style={{ fontSize: "24px", marginBottom: "16px", lineHeight: "1.4" }}>{gig.title}</h1>
          
          {/* Category & Delivery */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
            <span>{gig.category}</span>
            <span>•</span>
            <span>Delivery: {gig.deliveryTime}</span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>About This Gig</h3>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
              {gig.description}
            </p>
          </div>

          {/* Skills */}
          {gig.skills && gig.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Skills</h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {gig.skills.map(skill => (
                  <span key={skill} className="badge">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="card" style={{ position: "sticky", top: "20px" }}>
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginBottom: "4px" }}>Starting at</p>
              <p style={{ fontSize: "32px", fontWeight: "600" }}>${gig.price}</p>
            </div>
            
            <div style={{ marginBottom: "16px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>Delivery Time</span>
                <span style={{ color: "var(--color-text-primary)" }}>{gig.deliveryTime}</span>
              </div>
            </div>

            {isOwner ? (
              <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", textAlign: "center" }}>
                This is your gig
              </p>
            ) : user?.role === "freelancer" ? (
              <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)", textAlign: "center" }}>
                Only clients can hire freelancers
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Button onClick={startChat} style={{ width: "100%" }}>
                  Contact & Hire
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
