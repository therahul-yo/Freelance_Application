import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../components/Button";

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
    skills: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const gigData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        deliveryTime: formData.deliveryTime,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s)
      };

      await axios.post("http://localhost:5001/api/gigs", gigData);
      toast.success("Gig posted successfully!");
      navigate("/gigs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post gig");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <h2>Please login to post a gig</h2>
        <Button onClick={() => navigate("/login")} style={{ marginTop: "20px" }}>Login</Button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px", maxWidth: "700px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Create a Gig</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px", fontSize: "14px" }}>
        Showcase your skills and let clients find you
      </p>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Gig Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="I will build a professional React website"
            className="input-field"
            required
          />
          <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginTop: "6px" }}>
            Start with "I will" to describe what you offer
          </p>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your service in detail. What do you offer? What makes you stand out?"
            className="input-field"
            rows="6"
            style={{ resize: "vertical", minHeight: "150px" }}
            required
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-field"
          >
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

        {/* Price */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Starting Price ($) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="50"
            className="input-field"
            required
            min="5"
          />
        </div>

        {/* Delivery Time */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Delivery Time</label>
          <select
            name="deliveryTime"
            value={formData.deliveryTime}
            onChange={handleChange}
            className="input-field"
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

        {/* Skills */}
        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Skills / Tags</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB (comma separated)"
            className="input-field"
          />
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} style={{ flex: 1 }}>
            {loading ? "Publishing..." : "Publish Gig"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostGig;
