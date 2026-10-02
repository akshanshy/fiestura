# Fiestura — Event Management Platform

> A full-stack event management platform with authentication, role-based access, online payments, database optimization, Redis caching, and containerized backend services.

**Live:** https://fiestura.vercel.app  
 **GitHub:** https://github.com/akshanshy/fiestura

---

## Overview

Fiestura is a full-stack event management platform built to simplify event discovery, registration, payments, and administration.

Users can browse and register for events, make online payments, and view their registrations. Administrators can create, update, and manage events, users, and registrations through protected admin functionality.

The project was developed with a strong focus on **backend engineering, API design, database performance, caching, payment reliability, and scalability**.

---

##  Key Features

###  User

- Secure signup and login using JWT authentication
- Protected routes
- Browse and filter events
- Automatic event status: Upcoming / Ongoing / Past
- Register for events
- Online event payments using Razorpay
- View registered events

###  Admin

- Role-based access control (RBAC)
- Protected admin operations
- Create, update, and delete events
- Manage users and registrations
- Admin dashboard

###  Backend & Scalability

- RESTful API architecture
- Server-side input validation
- Structured error handling
- Pagination and result limiting
- MongoDB indexing
- Aggregation pipelines
- N+1 query optimization
- Redis caching
- TTL-based cache expiration
- Cache invalidation

###  Payment Reliability

- Server-side Razorpay order creation
- Payment verification
- Razorpay webhook handling
- Payment failure handling
- Idempotent payment processing to prevent duplicate operations

###  DevOps

- Dockerized backend
- Docker Compose
- Redis container
- Container health checks
- Environment-based configuration

---
##  Architecture

```text
                    ┌──────────────────┐
                    │   React Client   │
                    │     (Vite)       │
                    └────────┬─────────┘
                             │
                             │ REST API
                             ▼
                    ┌──────────────────┐
                    │  Node.js /       │
                    │  Express Backend │
                    └──────┬─────┬─────┘
                           │     │
                 ┌─────────┘     └─────────┐
                 ▼                         ▼
          ┌──────────────┐          ┌──────────────┐
          │   MongoDB    │          │    Redis     │
          │   Database   │          │    Cache     │
          └──────────────┘          └──────────────┘
                 │
                 ▼
          ┌──────────────┐
          │   Razorpay   │
          │   Payments   │
          └──────────────┘
