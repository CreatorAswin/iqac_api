# AQAR Hub - NAAC Documentation Management System

A comprehensive web-based platform for managing NAAC (National Assessment and Accreditation Council) AQAR (Annual Quality Assurance Report) documentation, built with React and PHP.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

AQAR Hub is a modern, role-based document management system designed specifically for educational institutions to streamline their NAAC accreditation process. The platform enables efficient collaboration between administrators, IQAC coordinators, management, and faculty members for document submission, verification, and reporting.

### Key Highlights

- **Role-Based Access Control**: Four distinct user roles (Admin, IQAC, Management, Faculty)
- **Document Management**: Upload, track, and verify documents across 7 NAAC criteria
- **Assignment System**: Assign specific criteria to faculty members
- **Real-time Status Tracking**: Monitor document approval status (Pending/Approved/Declined)
- **Analytics & Reporting**: Comprehensive dashboards with charts and statistics
- **Local File Storage**: Secure file storage in organized folder structure
- **Responsive Design**: Modern UI built with shadcn/ui and Tailwind CSS

## ✨ Features

### For Administrators
- 👥 **User Management**: Create, edit, and manage user accounts
- 📊 **System Overview**: Complete dashboard with system-wide statistics
- 📝 **Assignment Management**: Assign criteria to faculty members
- 📈 **Advanced Reports**: Detailed analytics and progress tracking
- 🔍 **Document Verification**: Review and approve/decline submissions

### For IQAC Coordinators
- ✅ **Document Verification**: Approve or decline faculty submissions
- 👀 **Approval Queue**: Quick access to pending documents
- 📊 **Progress Tracking**: Monitor criteria-wise completion status
- 👥 **Faculty Monitoring**: Track individual faculty contributions
- 📋 **Criteria Overview**: View all criteria with faculty assignments

### For Management
- 📊 **Dashboard Access**: View system statistics and progress
- 📈 **Reports & Analytics**: Access comprehensive reports
- 🔍 **Document Review**: Monitor document submissions and approvals

### For Faculty
- 📤 **Document Upload**: Submit documents for assigned criteria
- 📋 **Assignment View**: See all assigned criteria and sub-criteria
- 🔄 **Re-upload Capability**: Re-submit declined documents
- 📊 **Personal Dashboard**: Track personal submission status
- 🔔 **Status Notifications**: View approval/decline status with remarks

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Routing**: React Router DOM 6.30
- **Charts**: Recharts 2.15
- **State Management**: React Context API + TanStack Query
- **Form Handling**: React Hook Form + Zod

### Backend
- **Language**: PHP 7.4+
- **Database**: MySQL 5.7+ / MariaDB 10.2+
- **Server**: Apache (XAMPP)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local filesystem

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Code Formatting**: Prettier (via Tailwind)
- **Version Control**: Git

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  (React + TypeScript + Vite + Tailwind CSS)                 │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Admin   │  │   IQAC   │  │Management│  │ Faculty  │   │
│  │Dashboard │  │Dashboard │  │Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  Pages: Login, Criteria, Upload, Verification, Reports,     │
│         Assignments, Users, Settings                         │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                      Backend (PHP)                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Auth     │  │  Documents   │  │     Users    │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Assignments  │  │     Stats    │                        │
│  │   Service    │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                   Database (MySQL)                           │
│                                                              │
│  Tables: users, documents, assignments, sessions,            │
│          activity_logs                                       │
│                                                              │
│  Views: v_documents_by_criteria, v_documents_by_year,       │
│         v_faculty_summary                                    │
└─────────────────────────────────────────────────────────────┘
                            ↕ File I/O
┌─────────────────────────────────────────────────────────────┐
│                  File Storage (Local)                        │
│                                                              │
│  Structure: IQAC/[Year]/[Criteria]/[SubCriteria]/files      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **XAMPP** (v8.0 or higher) or any Apache + PHP + MySQL stack
- **PHP** (v7.4 or higher)
- **MySQL** (v5.7 or higher) or **MariaDB** (v10.2 or higher)
- **Git** (for version control)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/aqar-hub.git
cd aqar-hub
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend URL
# VITE_API_BASE_URL=http://localhost/aqar-hub-backend
```

### 3. Backend Setup

```bash
# Navigate to XAMPP htdocs directory
cd C:\xampp\htdocs  # Windows
# or
cd /opt/lampp/htdocs  # Linux

# Clone or copy the backend
git clone https://github.com/yourusername/aqar-hub-backend.git
```

### 4. Database Setup

```bash
# Start XAMPP (Apache + MySQL)
# Open phpMyAdmin: http://localhost/phpmyadmin

# Create database and import schema
mysql -u root -p < DATABASE_SCHEMA.sql
```

**Or manually:**
1. Open phpMyAdmin
2. Create database: `aqar_hub`
3. Import `DATABASE_SCHEMA.sql`

### 5. Configure Backend

```php
// backend/includes/config.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'aqar_hub');
define('DB_USER', 'root');
define('DB_PASS', '');
define('JWT_SECRET', 'your-secret-key-here'); // Change this!
```

### 6. Create Upload Directory

```bash
# Create IQAC folder in backend root
mkdir C:\xampp\htdocs\aqar-hub-backend\IQAC  # Windows
# or
mkdir /opt/lampp/htdocs/aqar-hub-backend/IQAC  # Linux

# Set permissions (Linux/Mac)
chmod 755 IQAC
```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost/aqar-hub-backend
```

### Default Credentials

After running the database schema, you'll have these default accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@iqac.edu | demo123 |
| IQAC | iqac@iqac.edu | demo123 |
| Management | management@iqac.edu | demo123 |
| Faculty | john.smith@iqac.edu | demo123 |

**⚠️ Important**: Change these passwords immediately after first login!

## 🎮 Usage

### Development Mode

```bash
# Start frontend development server
npm run dev

# Access application
# http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend

```bash
# Ensure XAMPP Apache and MySQL are running
# Backend will be available at:
# http://localhost/aqar-hub-backend
```

## 👥 User Roles

### Admin
- Full system access
- User management (create, edit, delete users)
- Assignment management
- Document verification
- System reports and analytics

### IQAC Coordinator
- Document verification and approval
- Faculty monitoring
- Criteria progress tracking
- User management (Faculty and IQAC only)

### Management
- View-only access to dashboards
- Access to reports and analytics
- Document review capabilities

### Faculty
- Upload documents for assigned criteria
- View assignment status
- Re-upload declined documents
- Track personal submission progress

## 📚 API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Reference

**Base URL**: `http://localhost/aqar-hub-backend/api`

**Authentication**: Bearer Token (JWT)

**Key Endpoints**:
- `POST /auth/login` - User authentication
- `GET /documents` - Fetch documents
- `POST /documents/upload` - Upload document
- `PUT /documents/status` - Update document status
- `GET /users` - Get all users (Admin/IQAC only)
- `GET /assignments` - Get assignments
- `GET /stats` - Get system statistics

## 🗄️ Database Schema

The system uses 5 main tables:

1. **users** - User credentials and roles
2. **documents** - Document metadata and tracking
3. **assignments** - Faculty-criteria assignments
4. **sessions** - Authentication sessions
5. **activity_logs** - Audit trail

See [DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql) for complete schema.

## 📁 Project Structure

```
aqar-hub/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── dashboards/      # Role-specific dashboards
│   │   ├── layout/          # Layout components
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── DataContext.tsx  # Data management
│   ├── data/                # Static data and constants
│   │   └── criteriaData.ts  # NAAC criteria definitions
│   ├── hooks/               # Custom React hooks
│   │   └── useApiData.ts    # API data fetching hooks
│   ├── pages/               # Application pages
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Criteria.tsx
│   │   ├── Upload.tsx
│   │   ├── Verification.tsx
│   │   ├── Assignments.tsx
│   │   ├── Reports.tsx
│   │   ├── Users.tsx
│   │   └── Settings.tsx
│   ├── services/            # API services
│   │   └── localApi.ts      # API client
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── DATABASE_SCHEMA.sql      # Database schema
├── API_DOCUMENTATION.md     # API documentation
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Tailwind CSS**: Utility-first CSS framework
- **Component Structure**: Functional components with hooks

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Update documentation if needed
4. Commit: `git commit -m "Add: your feature description"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

## 🚀 Deployment

### Frontend Deployment

```bash
# Build production bundle
npm run build

# Deploy dist/ folder to your hosting service
# (Vercel, Netlify, GitHub Pages, etc.)
```

### Backend Deployment

1. Upload backend files to web server
2. Configure database connection
3. Set proper file permissions
4. Update CORS settings for production domain
5. Enable HTTPS (recommended)

### Production Checklist

- [ ] Change default passwords
- [ ] Update JWT secret key
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure file upload limits
- [ ] Set up error logging
- [ ] Enable rate limiting
- [ ] Review security settings

## 🔒 Security Features

- **Password Hashing**: Bcrypt encryption
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Granular permissions
- **SQL Injection Protection**: Prepared statements
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Controlled cross-origin requests
- **Session Management**: Automatic session cleanup
- **Activity Logging**: Complete audit trail

## 📊 NAAC Criteria Coverage

The system supports all 7 NAAC criteria:

1. **Criteria 1**: Curricular Aspects
2. **Criteria 2**: Teaching-Learning and Evaluation
3. **Criteria 3**: Research, Innovations and Extension
4. **Criteria 4**: Infrastructure and Learning Resources
5. **Criteria 5**: Student Support and Progression
6. **Criteria 6**: Governance, Leadership and Management
7. **Criteria 7**: Institutional Values and Best Practices

Each criteria contains multiple sub-criteria for detailed documentation.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful UI components
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Recharts** for data visualization
- **NAAC** for accreditation standards

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@aqarhub.com
- Documentation: [Wiki](https://github.com/yourusername/aqar-hub/wiki)

## 🗺️ Roadmap

- [ ] Email notifications for document status changes
- [ ] Bulk document upload
- [ ] Advanced search and filtering
- [ ] Document version history
- [ ] Export reports to PDF/Excel
- [ ] Mobile app (React Native)
- [ ] Integration with institutional systems
- [ ] Multi-language support

---

**Built with ❤️ for educational institutions**

**Version**: 1.0.0  
**Last Updated**: January 2026
