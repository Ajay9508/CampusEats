## Introduction


| 1 | Mohit Tiwari | 20252651034 |

# 🍔 CampusEats — Tutorial 7: Core Feature Integration & Architecture

Welcome to the **Tutorial 7** module of the **CampusEats** platform. This step focuses on modular backend integration, component-driven frontend architecture, state persistence, and securing API routes across the full application stack.

---

## 📐 System Architecture & Module Flow

The application follows a standard decoupled full-stack architecture:

```text
┌─────────────────┐       HTTP / JSON        ┌─────────────────┐       Mongoose        ┌─────────────────┐
│   React Frontend│ ───────────────────────> │ Express/Spring  │ ────────────────────> │ MongoDB Database│
│  (Port 5173/3000)│ <─────────────────────── │ Backend (8080)  │ <──────────────────── │  (Port 27017)   │
└─────────────────┘     JWT Authorization    └─────────────────┘       Driver          └─────────────────┘