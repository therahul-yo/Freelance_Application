import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../components/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Web Development",
    budget: "",
    deadline: "",
    skillsRequired: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline || undefined,
        skillsRequired: formData.skillsRequired.split(",").map(s => s.trim()).filter(s => s)
      };

      await axios.post(`${API_URL}/api/projects`, jobData);
      toast.success("Job posted successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not logged in or not a client
  if (!user) {
    return (
      <div className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "16px" }}>Please login to continue</h2>
        <Button onClick={() => navigate("/login")}>Login</Button>
      </div>
    );
  }

  if (user.role !== "client") {
    return (
      <div className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "16px" }}>Only clients can post jobs</h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "20px" }}>
          As a freelancer, you can create gigs instead.
        </p>
        <Button onClick={() => navigate("/post-gig")}>Create a Gig</Button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px", maxWidth: "700px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Post a Job</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px", fontSize: "14px" }}>
        Describe your project and find the perfect freelancer
      </p>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Job Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Build a responsive e-commerce website"
            className="input-field"
            required
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project in detail. What are the requirements? What outcome do you expect?"
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

        {/* Budget */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Budget ($) *</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="500"
            className="input-field"
            required
            min="10"
          />
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Deadline (optional)</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Required Skills</label>
          <input
            type="text"
            name="skillsRequired"
            value={formData.skillsRequired}
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
            {loading ? "Posting..." : "Post Job"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
