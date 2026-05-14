import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import { CardSkeleton } from "../../components/Skeleton";

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

const BAND_COLORS = ['var(--yellow)', 'var(--blue)', 'var(--red)'];

const BrowseGigs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || "All";
  const initialSearch = searchParams.get('q') || "";

  const [gigs, setGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === "All") searchParams.delete("category");
    else searchParams.set("category", cat);
    setSearchParams(searchParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val) searchParams.delete("q");
    else searchParams.set("q", val);
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    if (user?.role === "freelancer") {
      toast.info("Go to Dashboard to manage your gigs");
      navigate("/dashboard");
    }
  }, [user]);

  useEffect(() => { fetchGigs(1); }, [selectedCategory]);

  const fetchGigs = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/gigs?${params}`);
      const list = Array.isArray(data) ? data : (data.gigs || []);
      setGigs(list);
      setTotal(Array.isArray(data) ? data.length : (data.total || 0));
      setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1));
      setPage(Array.isArray(data) ? 1 : (data.page || 1));
    } catch {
      toast.error("Could not load gigs");
    } finally { setLoading(false); }
  };

  const startChat = async (freelancerId) => {
    if (!user) { toast.info("Please login to message"); navigate("/login"); return; }
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, { userId: freelancerId });
      navigate("/chat", { state: { selectedChatId: data._id } });
    } catch {
      toast.error("Could not start chat");
    }
  };

  if (user?.role === "freelancer") return null;

  return (
    <div className="browse-layout">
      {/* SIDEBAR */}
      <aside className="browse-sidebar">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--blue)', marginBottom: 6 }}>
          § FILTERS
        </div>
        <h3 className="browse-sidebar-title">Find Talent</h3>

        <div>
          <label className="input-label">Category</label>
          {CATEGORIES.map(cat => (
            <div
              key={cat}
              className={`category-option ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              <div className="category-radio">
                {selectedCategory === cat && <div className="category-radio-dot" />}
              </div>
              {cat}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main className="browse-main">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 80px)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 24 }}>
          Browse <span style={{ background: 'var(--yellow)', padding: '0 12px', border: '4px solid var(--ink)' }}>Talent</span>
        </h1>

        <div className="browse-search" style={{ marginBottom: 24, display: 'flex', gap: 0, alignItems: 'stretch' }}>
          <input
            type="text"
            placeholder="SEARCH FOR SERVICES..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === "Enter" && fetchGigs(1)}
            className="input-field"
            style={{ flex: 1, boxShadow: 'none', fontSize: 14 }}
          />
          <Button onClick={() => fetchGigs(1)} style={{ marginLeft: -4, boxShadow: 'none' }}>Search</Button>
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>
          {!loading && `// ${total} FREELANCERS AVAILABLE`}
        </p>

        {!loading && gigs.length === 0 && (
          <div className="card-static" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, opacity: 0.2 }}>—</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', marginBottom: 12 }}>No Freelancers Found</h3>
            <p style={{ fontFamily: 'var(--font-body)', color: "var(--muted)", marginBottom: 20 }}>
              Can't find what you need? Post a targeted project instead.
            </p>
            <Button variant="dark" onClick={() => navigate('/post-job')}>Post a Project</Button>
          </div>
        )}

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        )}

        {!loading && gigs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {gigs.map((gig, idx) => (
              <div key={gig._id} className="gig-card">
                <div className="gig-card-band" style={{ background: BAND_COLORS[idx % BAND_COLORS.length] }} />
                <div className="gig-card-header">
                  <div className="gig-card-avatar" style={{ background: BAND_COLORS[idx % BAND_COLORS.length], color: idx % BAND_COLORS.length === 1 || idx % BAND_COLORS.length === 2 ? 'var(--white)' : 'var(--ink)' }}>
                    {gig.freelancer?.name?.charAt(0) || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{gig.freelancer?.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <span style={{ color: 'var(--ink)', fontSize: 13, letterSpacing: 1 }}>
                        {"★".repeat(Math.round(gig.freelancer?.rating || 0))}{"☆".repeat(5 - Math.round(gig.freelancer?.rating || 0))}
                      </span>
                      {gig.freelancer?.numReviews > 0 && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                          ({gig.freelancer.numReviews})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="gig-card-body">
                  <Link to={`/gigs/${gig._id}`}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, marginBottom: 12, textTransform: 'uppercase' }}>
                      {gig.title}
                    </h4>
                  </Link>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 }}>
                    {gig.description.length > 100 ? gig.description.substring(0, 100) + "..." : gig.description}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {gig.skills?.slice(0, 3).map((skill) => (
                      <span key={skill} className="badge">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="gig-card-footer">
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>STARTING AT</p>
                    <p className="gig-card-price">${gig.price}</p>
                  </div>
                  <Button size="sm" onClick={() => startChat(gig.freelancer?._id)}>Hire →</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 32, justifyContent: "center" }}>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchGigs(page - 1)}>← Prev</Button>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchGigs(page + 1)}>Next →</Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseGigs;
