# Design Spec: Gig Approval and Tracking

Turn the existing "messaging-only" flow into a fully working hiring and tracking process for both Gigs and Projects.

## Problem Statement
Users can currently message each other, but there is no formal "Hire" or "Purchase" step for Gigs. For Projects, the "Accept Proposal" button is hidden deep in the Project Details page, making it hard to approve a freelancer while chatting.

## Goals
- Allow clients to "Buy" a Gig directly.
- Allow clients to "Hire" a freelancer directly from the Chat window.
- Track all active work (Gigs and Projects) in a unified "My Orders" or "Manage Projects" view.

## Proposed Changes

### 1. Data Models & Backend
- **Gig Purchase:** Add `POST /api/gigs/:id/purchase`.
  - Creates a `Project` with `status: "in-progress"`.
  - Sets `assignedFreelancer: gig.freelancer`.
  - Sets `client: req.user._id`.
  - Sets `budget: gig.price`.
  - Sets `title: gig.title`.
- **Chat Context:** Update `Chat` model (optional) or just use the existing chat to link to projects.
  - When a chat is started from a Gig/Project, store that `contextId` in the Chat object.

### 2. Frontend Components
- **GigDetails Page:**
  - Replace "Contact freelancer" with a primary **"Order Now"** button and a secondary "Message" button.
- **Chat Interface:**
  - Add a **Context Header Bar** at the top of the message area.
  - Show "Discussing: [Project/Gig Title]".
  - If a Client is chatting with a Freelancer who has a `pending` bid on that project, show a **"Hire Now"** button in the header.
  - If they are chatting about a Gig, show an **"Order Gig"** button in the header.
- **Dashboard / My Projects:**
  - Create a unified view for both roles.
  - **Client:** "My Hires" (active), "Pending Proposals", "Past Work".
  - **Freelancer:** "My Jobs" (active), "Sent Proposals", "Finished Work".

### 3. User Flow
1. Client finds a Gig.
2. Client clicks "Order Now" OR messages the Freelancer first.
3. If messaging, the Client can click "Order Now" from the top of the chat at any time.
4. Once ordered, a "Project" is created in `in-progress` state.
5. Both see the project in their dashboard to track completion.

## Success Criteria
- A Client can go from a Gig listing to an "in-progress" project in 2 clicks.
- A Client can hire a freelancer from the Chat interface.
- Both users can see their active "Work in Progress" in a central location.
