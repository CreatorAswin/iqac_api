# AQAR Hub Project Structure

## Directory Structure

```
aqar/
├── backend/           # PHP backend API
│   ├── api/          # API endpoints
│   ├── config/       # Configuration files
│   ├── includes/     # Shared utilities
│   └── vendor/       # Composer dependencies
├── frontend/         # React frontend application
│   ├── components/   # React components
│   ├── contexts/     # React contexts
│   ├── data/         # Data files
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utility libraries
│   ├── pages/        # Page components
│   └── ...           # Configuration files
├── IQAC/             # File storage directory
├── .env*             # Environment configuration files
├── package.json      # Frontend dependencies
└── unused/           # Archived documentation and backup files
```

## Development Setup

### Backend (PHP)
1. Navigate to the backend directory: `cd backend`
2. Install PHP dependencies: `composer install`
3. Configure your database in `backend/config/database.php`
4. Start your web server (XAMPP, WAMP, etc.)

### Frontend (React)
1. Navigate to the frontend directory: `cd frontend`
2. Install Node.js dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the application at `http://localhost:8080`

## Environment Variables

Create `.env` files in both directories for environment-specific configuration.

## Archive Directory

The `unused/` directory contains archived documentation, database schemas, and utility files that are not needed for active development but are preserved for reference.

## Deployment

Use the `prepare-deployment.ps1` script for deployment preparation.