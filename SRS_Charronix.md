# Software Requirements Specification (SRS) for Charronix

## Table of Contents
- Table of Contents (ii)
- Revision History (ii)
1. **Introduction** (1)
   - 1.1 Purpose
   - 1.2 Document Conventions
   - 1.3 Intended Audience and Reading Suggestions
   - 1.4 Product Scope
   - 1.5 References
2. **Overall Description** (2)
   - 2.1 Product Perspective
   - 2.2 Product Functions
   - 2.3 User Classes and Characteristics
   - 2.4 Operating Environment
   - 2.5 Design and Implementation Constraints
   - 2.6 User Documentation
   - 2.7 Assumptions and Dependencies
3. **External Interface Requirements** (3)
   - 3.1 User Interfaces
   - 3.2 Hardware Interfaces
   - 3.3 Software Interfaces
   - 3.4 Communications Interfaces
4. **System Features** (4)
   - 4.1 System Feature 1: User Authentication & Role Management
   - 4.2 System Feature 2: Attendance Tracking & Analytics
   - 4.3 System Feature 3: Academic Grade & Exam Management
   - 4.4 System Feature 4: Timetable Generation & Management
   - 4.5 System Feature 5: AI-Powered Insights & Assistant
   - 4.6 System Feature 6: Notification & Notice Center
5. **Other Nonfunctional Requirements** (4)
   - 5.1 Performance Requirements
   - 5.2 Safety Requirements
   - 5.3 Security Requirements
   - 5.4 Software Quality Attributes
   - 5.5 Business Rules
6. **Other Requirements** (5)
- Appendix A: Glossary
- Appendix B: Analysis Models
- Appendix C: To Be Determined List

---

## Revision History
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-23 | 1.0.0 | Initial SRS Draft | Antigravity AI |

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to provide a detailed Software Requirements Specification for the Charronix School Management System. It outlines the functional and non-functional requirements of the platform, serving as a blueprint for developers, stakeholders, and quality assurance teams.

### 1.2 Document Conventions
- **Standard**: IEEE 830-1998 format.
- **Priority**: Requirements are categorized as High (H), Medium (M), and Low (L).

### 1.3 Intended Audience and Reading Suggestions
This document is intended for:
- **Developers**: For implementation details and feature mapping.
- **Admins/Management**: To verify business alignment.
- **Testers**: To build test cases based on functional specs.

### 1.4 Product Scope
Charronix is an AI-driven, full-stack school management system designed to streamline institutional administration. It includes modules for student and teacher management, attendance tracking, grading, automated timetable generation, and AI-assisted insights.

### 1.5 References
- IEEE Std 830-1998 for SRS documents.
- Project Technical Guide (`CHARRONIX_FULLSTACK_COMPLETE_GUIDE.txt`).
- Project Database Analysis (`DATABASE_ANALYSIS_REPORT.md`).

---

## 2. Overall Description

### 2.1 Product Perspective
Charronix is a standalone web-based platform that replaces legacy paper-based school management systems. It leverages a modern tech stack (React, Node.js, Prisma, PostgreSQL) and integrates with Google Gemini AI for advanced analytics.

### 2.2 Product Functions
- **User Management**: Authentication and granular permission control.
- **Attendance**: Daily tracking with automated statistics and percentage reporting.
- **Academics**: Exam grade entry, report generation, and performance tracking.
- **Scheduling**: Automated and manual timetable management.
- **Communication**: Integrated notification system and school-wide notices.
- **AI Integration**: Chat history and smart dashboard insights.

### 2.3 User Classes and Characteristics
- **Admin**: Full system access, including staff hiring, system settings, and audit logs.
- **Teacher**: Manage class attendance, enter grades, and view personal timetables.
- **Student**: View personal grades, attendance, timetable, and receive notifications.
- **Parent**: Track child’s progress, attendance, and school announcements.

### 2.4 Operating Environment
- **Browser**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge).
- **Backend**: Node.js v18+, PostgreSQL v14+.
- **Display**: Responsive design supporting Desktop, Tablet, and Mobile.

### 2.5 Design and Implementation Constraints
- **Database**: Must use Prisma ORM for type-safe database interactions.
- **UI**: Must use Tailwind CSS for modular styling.
- **Aesthetics**: High emphasis on modern design (Glassmorphism, animations).

### 2.6 User Documentation
- Integrated Quick Start Guide (`INDEX.md`).
- Admin/Teacher Implementation Summary.
- Contextual help within the UI portals.

### 2.7 Assumptions and Dependencies
- Stable Internet connection for cloud database and AI API calls.
- Google GenAI API key availability for AI features.
- Accurate initial data ingestion (Students, Teachers, Classes).

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- **Student/Parent Portal**: Light/Dark mode compatible, dashboard-driven layout.
- **Teacher/Admin Dashboard**: Statistics-heavy view with data tables and charts (Recharts).
- **Redesigned Hero**: Modern entrance with interactive 3D elements.

### 3.2 Hardware Interfaces
No specific hardware requirement aside from standard server hardware for hosting (AWS/DigitalOcean/Local) and user client devices.

### 3.3 Software Interfaces
- **Database**: PostgreSQL communicating via TCP.
- **ORM**: Prisma Client.
- **External AI**: Google Gemini AI API via HTTPS/REST.
- **PDF Generation**: jsPDF and html2canvas for browser-side report generation.

### 3.4 Communications Interfaces
- HTTPS for secure web transmission.
- JSON format for internal API communication (RESTful).
- Potential SMS fallback for urgent notices (infra present in schema).

---

## 4. System Features

### 4.1 System Feature 1: User Authentication & Role Management
- **Description**: Secure login and session management based on user roles (Admin, Teacher, Student, Parent).
- **Functional Requirements**:
  - Encrypted password storage.
  - Multi-factor authentication (MFA) capability.
  - Granular RBAC (Role-Based Access Control).

### 4.2 System Feature 2: Attendance Tracking & Analytics
- **Description**: Daily attendance marking with automated percentage calculation.
- **Functional Requirements**:
  - Interactive calendar view.
  - Monthly/Term-wise attendance summaries.
  - Alerts for low attendance (below 75%).

### 4.3 System Feature 3: Academic Grade & Exam Management
- **Description**: Management of subject-wise grades across different terms.
- **Functional Requirements**:
  - Grade entry interface for teachers.
  - Automatic calculation of averages and GPA.
  - PDF Export for report cards.

### 4.4 System Feature 4: Timetable Generation & Management
- **Description**: Managing school schedules for different classes and sections.
- **Functional Requirements**:
  - Automated timetable generation based on teacher availability.
  - Support for elective and core subjects.
  - Visual grid display for all users.

### 4.5 System Feature 5: AI-Powered Insights & Assistant
- **Description**: Integration of Google Gemini AI for system analysis and user support.
- **Functional Requirements**:
  - AI Chat history persistent per user.
  - Smart dashboard highlights (performance trends).

### 4.6 System Feature 6: Notification & Notice Center
- **Description**: Centralized hub for school announcements and alerts.
- **Functional Requirements**:
  - Categorization (Urgent, Alert, Info).
  - Target-audience filtering.
  - Mark-as-read and history tracking.

---

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements
- Page load time under 2 seconds on broadband.
- API response time for basic CRUD operations under 500ms.
- Support for 500+ concurrent student sessions.

### 5.2 Safety Requirements
- Audit logging of all critical actions (grade changes, user deletions).
- Database backup and recovery procedures (Daily backups).

### 5.3 Security Requirements
- JWT (JSON Web Token) for stateless session security.
- HTTPS encryption (SSL/TLS).
- SQL injection prevention via Prisma's automated sanitization.

### 5.4 Software Quality Attributes
- **Usability**: intuitive UI requiring minimal training.
- **Maintainability**: Modular React components and separate logic layers.
- **Scalability**: Backend optimized for vertical and horizontal scaling.

### 5.5 Business Rules
- Only Admins can modify Teacher credentials.
- Grades cannot be modified after the end-of-term freeze period.
- Minimum 75% attendance required for exam eligibility.

---

## 6. Other Requirements
- Internationalization support for multi-language deployment (future).
- Integration with external LMS (Learning Management Systems).

---

## Appendix A: Glossary
- **SRS**: Software Requirements Specification.
- **ORM**: Object-Relational Mapping.
- **MFA**: Multi-Factor Authentication.
- **RBAC**: Role-Based Access Control.

## Appendix B: Analysis Models
- **Database Schema**: See `prisma/schema.prisma` for ERD structure.
- **Flow Diagrams**: User login flow and Report generation flow.

## Appendix C: To Be Determined List
- Exact SMS provider for communication fallback.
- Pricing model for SaaS deployment.
