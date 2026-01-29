import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../components/Button";

const CATEGORIES = [
  "All",
  "Web Development",
  "Mobile Development",
  "Design",
  "Data Science",
  "Writing",
  "Marketing",
  "Video & Animation",
  "Music & Audio",
];

const BrowseGigs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Redirect freelancers - they should not browse gigs
  useEffect(() => {
    if (user?.role === "freelancer") {
      toast.info("Go to Dashboard to manage your gigs");
      navigate("/dashboard");
    }
  }, [user]);

  useEffect(() => {
    fetchGigs();
  }, [selectedCategory]);

  const fetchGigs = async () => {
    try {
      let url = "http://localhost:5001/api/gigs";
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (params.toString()) url += `?${params.toString()}`;
      
      const { data } = await axios.get(url);
      setGigs(data);
    } catch (error) {
      console.error("Error fetching gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = gigs.filter(gig => 
    gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gig.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startChat = async (freelancerId) => {
    if (!user) {
      toast.info("Please login to message");
      navigate("/login");
      return;
    }
    try {
      const { data } = await axios.post("http://localhost:5001/api/chat", {
        userId: freelancerId
      });
      navigate("/chat", { state: { selectedChatId: data._id } });
    } catch (error) {
      toast.error("Could not start chat");
    }
  };

  // Don't render for freelancers
  if (user?.role === "freelancer") return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ 
        width: "260px", 
        borderRight: "1px solid var(--color-border)", 
        padding: "24px",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto"
      }}>
        <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Find Talent</h3>
        
        {/* Category Filter */}
        <div>
          <h4 style={{ fontSize: "13px", marginBottom: "12px", color: "var(--color-text-secondary)" }}>Category</h4>
          {CATEGORIES.map(cat => (
            <label 
              key={cat} 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                marginBottom: "8px",
                cursor: "pointer",
                fontSize: "13px",
                color: selectedCategory === cat ? "var(--color-text-primary)" : "var(--color-text-secondary)"
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              <span style={{ 
                width: "16px", 
                height: "16px", 
                border: "1px solid var(--color-border)", 
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {selectedCategory === cat && (
                  <span style={{ width: "8px", height: "8px", background: "white", borderRadius: "50%" }} />
                )}
              </span>
              {cat}
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "24px 32px" }}>
        {/* Search */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Search for services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ maxWidth: "500px", fontSize: "15px" }}
          />
        </div>

        {/* Results */}
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
          {loading ? "Loading..." : `${filteredGigs.length} freelancers available`}
        </p>

        {/* No Gigs */}
        {!loading && filteredGigs.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h3 style={{ marginBottom: "8px" }}>No freelancers found</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Check back later for new talent
            </p>
          </div>
        )}

        {/* Gig Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {filteredGigs.map(gig => (
            <div key={gig._id} className="card" style={{ display: "flex", flexDirection: "column" }}>
              {/* Gig Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ 
                    width: "32px", 
                    height: "32px", 
                    borderRadius: "50%", 
                    background: "var(--color-bg-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px"
                  }}>
                    {gig.freelancer?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "500" }}>{gig.freelancer?.name}</p>
                  </div>
                </div>
                
                <Link to={`/gigs/${gig._id}`}>
                  <h4 style={{ fontSize: "15px", marginBottom: "8px", lineHeight: "1.4" }}>
                    {gig.title}
                  </h4>
                </Link>
                
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px", lineHeight: "1.5" }}>
                  {gig.description.length > 100 ? gig.description.substring(0, 100) + "..." : gig.description}
                </p>

                {/* Skills */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                  {gig.skills?.slice(0, 3).map(skill => (
                    <span key={skill} className="badge" style={{ fontSize: "11px", padding: "3px 8px" }}>{skill}</span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Starting at</p>
                  <p style={{ fontSize: "18px", fontWeight: "600" }}>${gig.price}</p>
                </div>
                <Button 
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                  onClick={() => startChat(gig.freelancer?._id)}
                >
                  Hire Me
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BrowseGigs;
