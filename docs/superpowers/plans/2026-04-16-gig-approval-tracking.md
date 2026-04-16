# Gig Approval and Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a complete end-to-end workflow for buying Gigs, hiring from Chat, and tracking project progress for both Clients and Freelancers.

**Architecture:** Use the existing `Project` model as the source of truth for all "Orders". Purchases of Gigs create a Project in `in-progress` state. Status transitions are controlled by both roles (Freelancer delivers, Client completes).

**Tech Stack:** Node.js/Express (Backend), React/Vite (Frontend), MongoDB (Database).

---

### Task 1: Update Project Model Status

**Files:**
- Modify: `backend/models/projectModel.js`

- [ ] **Step 1: Add 'delivered' to status enum**

```javascript
// backend/models/projectModel.js:52
status: {
  type: String,
  enum: ["open", "in-progress", "delivered", "completed", "cancelled"],
  default: "open",
},
```

- [ ] **Step 2: Commit**

```bash
git add backend/models/projectModel.js
git commit -m "feat: add 'delivered' status to project model"
```

---

### Task 2: Backend - Purchase Gig Controller

**Files:**
- Modify: `backend/controllers/gigController.js`
- Modify: `backend/routes/gigRoutes.js`

- [ ] **Step 1: Implement purchaseGig in controller**

```javascript
// backend/controllers/gigController.js
const purchaseGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate("freelancer");
    if (!gig) {
      res.status(404);
      throw new Error("Gig not found");
    }

    const project = await Project.create({
      client: req.user._id,
      assignedFreelancer: gig.freelancer._id,
      title: gig.title,
      description: gig.description,
      category: gig.category,
      budget: gig.price,
      status: "in-progress",
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};
// Add purchaseGig to exports
```

- [ ] **Step 2: Register route**

```javascript
// backend/routes/gigRoutes.js
router.route("/:id/purchase").post(protect, purchaseGig);
```

- [ ] **Step 3: Commit**

```bash
git add backend/controllers/gigController.js backend/routes/gigRoutes.js
git commit -m "feat: add purchase gig endpoint"
```

---

### Task 3: Frontend - Gig Purchase Button

**Files:**
- Modify: `frontend/src/pages/Gig/GigDetails.jsx`

- [ ] **Step 1: Add purchase function and button**

```javascript
const handlePurchase = async () => {
  try {
    const { data } = await api.post(`/gigs/${id}/purchase`);
    toast.success("Gig purchased! Project is now in-progress.");
    navigate("/dashboard");
  } catch (error) {
    toast.error(error.response?.data?.message || "Purchase failed");
  }
};

// In JSX:
{user?.role === "client" && (
  <Button onClick={handlePurchase} style={{ width: "100%", marginBottom: 10 }}>
    Order Now
  </Button>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Gig/GigDetails.jsx
git commit -m "feat: add purchase button to gig details"
```

---

### Task 4: Chat Context Header

**Files:**
- Modify: `frontend/src/pages/Chat/index.jsx`

- [ ] **Step 1: Add Context Bar at top of Chat**

```javascript
// Display context info (can be inferred from previous state or latest messages)
// For now, if we came from a project/gig, show it
const context = location.state?.context; 

// In JSX (above messages):
{selectedChat && (
  <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.03)' }}>
     <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
       Discussing: <strong>{selectedChat.contextTitle || "General Conversation"}</strong>
     </p>
     {/* Add "Hire" or "Order" buttons here if context is present */}
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Chat/index.jsx
git commit -m "feat: add context header to chat"
```

---

### Task 5: Unified Dashboard

**Files:**
- Modify: `frontend/src/pages/Dashboard/index.jsx`

- [ ] **Step 1: Fetch and display projects by status**

```javascript
// Fetch /api/projects/my
// Split into sections:
const active = projects.filter(p => ["in-progress", "delivered"].includes(p.status));
const history = projects.filter(p => ["completed", "cancelled"].includes(p.status));

// Render tabs for Client (My Hires, Proposals) and Freelancer (Active Jobs, Sent Bids)
```

- [ ] **Step 2: Add Status Update Buttons (Deliver/Approve)**

```javascript
const updateStatus = async (projectId, newStatus) => {
  await api.put(`/projects/${projectId}/status`, { status: newStatus });
  loadProjects();
};
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard/index.jsx
git commit -m "feat: implement unified tracking dashboard"
```
