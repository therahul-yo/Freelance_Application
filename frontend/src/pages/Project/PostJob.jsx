import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "../../components/Button";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Web Development",
    budgetType: "fixed",
    budgetMin: "",
    budgetMax: "",
    experienceLevel: "Intermediate",
    duration: "1 to 3 months",
    skills: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseFloat(formData.budgetMax) || parseFloat(formData.budgetMin),
        budgetType: formData.budgetType,
        budgetMin: parseFloat(formData.budgetMin),
        budgetMax: parseFloat(formData.budgetMax),
        experienceLevel: formData.experienceLevel,
        duration: formData.duration,
        skillsRequired: formData.skills.split(",").map(s => s.trim()).filter(s => s)
      };

      await axios.post("http://localhost:5001/api/projects", jobData);
      toast.success("Job posted successfully!");
      navigate("/projects");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: "60px", textAlign: "center" }}>
        <h2>Please login to post a job</h2>
        <Button onClick={() => navigate("/login")} style={{ marginTop: "20px" }}>Login</Button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px", maxWidth: "700px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Post a Job</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px", fontSize: "14px" }}>
        Describe what you need done and find the perfect freelancer
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
            placeholder="e.g. Build a responsive e-commerce website"
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
            placeholder="Describe your project in detail. Include requirements, deliverables, and timeline expectations."
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
          </select>
        </div>

        {/* Budget Type */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Budget Type</label>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, budgetType: "fixed" })}
              className={formData.budgetType === "fixed" ? "btn btn-primary" : "btn btn-outline"}
              style={{ flex: 1 }}
            >
              Fixed Price
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, budgetType: "hourly" })}
              className={formData.budgetType === "hourly" ? "btn btn-primary" : "btn btn-outline"}
              style={{ flex: 1 }}
            >
              Hourly Rate
            </button>
          </div>
        </div>

        {/* Budget Range */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>
            Budget Range {formData.budgetType === "hourly" ? "($/hr)" : "($)"}
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="number"
              name="budgetMin"
              value={formData.budgetMin}
              onChange={handleChange}
              placeholder="Min"
              className="input-field"
              required
            />
            <input
              type="number"
              name="budgetMax"
              value={formData.budgetMax}
              onChange={handleChange}
              placeholder="Max"
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Experience Level */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Experience Level</label>
          <select
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            className="input-field"
          >
            <option>Entry Level</option>
            <option>Intermediate</option>
            <option>Expert</option>
          </select>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Project Duration</label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="input-field"
          >
            <option>Less than 1 week</option>
            <option>1 to 4 weeks</option>
            <option>1 to 3 months</option>
            <option>3 to 6 months</option>
            <option>More than 6 months</option>
          </select>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Required Skills</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, MongoDB (comma separated)"
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
