# Design Spec: Gig Approval and Tracking (v2)

Turn the existing "messaging-only" flow into a fully working hiring and tracking process for both Clients and Freelancers.

## Problem Statement
The current system lacks a formal "Hire" step for Gigs and makes it difficult to manage projects from the chat. Freelancers also have no way to signal that they have completed work, and neither side has a unified view of their active obligations.

## Goals
- **Client:** "Buy" a Gig or "Hire" a Freelancer directly.
- **Freelancer:** Track orders and "Deliver" completed work.
- **Both:** A unified dashboard to manage the lifecycle of a job (Pending -> Active -> Delivered -> Completed).

## Proposed Changes

### 1. Data Models & Backend
- **Project Status Update:** Add `delivered` to the `status` enum in `Project` model.
  - `status`: ["open", "in-progress", "delivered", "completed", "cancelled"]
- **Gig Purchase:** Add `POST /api/gigs/:id/purchase`.
  - Creates a `Project` with `status: "in-progress"`.
  - Links `client` and `assignedFreelancer`.
- **Status Control:** 
  - Freelancer can move status from `in-progress` to `delivered`.
  - Client can move status from `delivered` to `completed`.

### 2. Frontend Components

#### **Chat Context Header**
- Show the "Current Topic" (Project/Gig) at the top of the chat.
- **Client Actions:**
  - Show "Hire Now" (if pending bid exists).
  - Show "Order Gig" (if chatting from a Gig).
  - Show "Complete & Review" (if status is `delivered`).
- **Freelancer Actions:**
  - Show "Deliver Work" (if status is `in-progress`).

#### **Unified Dashboard (`/dashboard`)**
- **Client Mode:**
  - **Hires:** List of `in-progress` and `delivered` projects.
  - **Proposals:** List of `open` projects with their bid counts.
  - **History:** List of `completed` projects.
- **Freelancer Mode:**
  - **Active Work:** List of `in-progress` projects where they are assigned.
  - **Pending Review:** List of `delivered` projects waiting for client approval.
  - **Proposals:** List of bids they have sent.
  - **Earnings/History:** List of `completed` projects.

### 3. User Flows

#### **The Gig Flow**
1. Client clicks "Order Now" on a Gig page.
2. System creates an `in-progress` Project.
3. Freelancer sees the new order in their Dashboard.
4. Freelancer works and clicks "Deliver Work".
5. Client gets notified (in Chat/Dashboard) and clicks "Approve".
6. Project moves to `completed`.

#### **The Project Flow**
1. Client posts a Project.
2. Freelancer bids.
3. Client/Freelancer chat.
4. Client clicks "Hire Now" in the Chat Header.
5. Project moves to `in-progress`.
6. (Rest follows Gig Flow steps 3-6).

## Success Criteria
- Both Clients and Freelancers have specific actions to move a project forward.
- The Dashboard provides a "one-stop shop" for all active business.
- Chat is no longer just for talking; it's the control center for the hire.
