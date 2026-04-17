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

const avatarColors = ['var(--nb-pink)', 'var(--nb-blue)', 'var(--nb-yellow)', 'var(--nb-lime)', 'var(--nb-purple)', 'var(--nb-orange)'];

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
    <div className="browse-layout">
      {/* Sidebar */}
      <aside className="browse-sidebar">
        <h3 className="browse-sidebar-title">🏪 Find Talent</h3>
        
        {/* Category Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: 14, 
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--nb-text-muted)',
          }}>
            Category
          </label>
          {CATEGORIES.map(cat => (
            <div 
              key={cat} 
              className={`category-option ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <div className="category-radio">
                {selectedCategory === cat && <div className="category-radio-dot" />}
              </div>
              {cat}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="browse-main">
        {/* Search */}
        <div className="browse-search">
          <input
            type="text"
            placeholder="🔍 Search for services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ maxWidth: "500px", fontSize: "15px" }}
          />
        </div>

        {/* Results */}
        <p style={{ fontSize: 13, color: "var(--nb-text-muted)", marginBottom: 20, fontWeight: 600 }}>
          {loading ? (
            <span className="neo-loading">Loading...</span>
          ) : `${filteredGigs.length} freelancers available`}
        </p>

        {/* No Gigs */}
        {!loading && filteredGigs.length === 0 && (
          <div className="card-static" style={{ textAlign: "center", padding: "60px 20px", background: 'var(--nb-cream)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ marginBottom: 8, fontFamily: 'var(--font-heading)' }}>No freelancers found</h3>
            <p style={{ color: "var(--nb-text-secondary)" }}>
              Check back later for new talent
            </p>
          </div>
        )}

        {/* Gig Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filteredGigs.map((gig, idx) => (
            <div key={gig._id} className="gig-card">
              {/* Header */}
              <div className="gig-card-header">
                <div className="gig-card-avatar" style={{ background: avatarColors[idx % avatarColors.length] }}>
                  {gig.freelancer?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{gig.freelancer?.name}</p>
                </div>
              </div>

              {/* Body */}
              <div className="gig-card-body">
                <Link to={`/gigs/${gig._id}`}>
                  <h4 style={{ fontSize: 16, marginBottom: 10, lineHeight: 1.4, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                    {gig.title}
                  </h4>
                </Link>
                
                <p style={{ fontSize: 13, color: "var(--nb-text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
                  {gig.description.length > 100 ? gig.description.substring(0, 100) + "..." : gig.description}
                </p>

                {/* Skills */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {gig.skills?.slice(0, 3).map((skill, i) => (
                    <span key={skill} className={`badge ${['badge-blue', 'badge-lime', 'badge-purple'][i % 3]}`} style={{ fontSize: 11, padding: '3px 8px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="gig-card-footer">
                <div>
                  <p style={{ fontSize: 11, color: "var(--nb-text-muted)", fontWeight: 600, textTransform: 'uppercase' }}>Starting at</p>
                  <p className="gig-card-price">${gig.price}</p>
                </div>
                <Button 
                  size="small"
                  onClick={() => startChat(gig.freelancer?._id)}
                >
                  Hire Me →
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
