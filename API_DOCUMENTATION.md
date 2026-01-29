# AQAR Hub API Documentation

Complete API reference for the PHP backend.

## Base URL

```
Development: http://localhost:8000/api
Production: https://your-domain.com/api
```

## Authentication

All endpoints except `/auth/login` require authentication via Bearer token.

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Authentication Endpoints

### POST /auth/login

Authenticate user and receive session token.

**Request:**
```json
{
  "email": "admin@iqac.edu",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@iqac.edu",
    "role": "Admin",
    "status": "Active"
  },
  "token": "abc123def456..."
}
```

### POST /auth/logout

Invalidate current session token.

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true
}
```

### GET /auth/verify

Verify current session token is valid.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@iqac.edu",
    "role": "Admin"
  }
}
```

---

## Document Endpoints

### GET /documents

Get all documents with optional filters.

**Query Parameters:**
- `facultyId` (optional): Filter by faculty ID
- `criteria` (optional): Filter by criteria number
- `year` (optional): Filter by academic year
- `status` (optional): Filter by IQAC status (Pending, Approved, Rejected)

**Example:**
```
GET /documents?facultyId=john.smith@iqac.edu&status=Pending
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2024-01-26T10:30:00Z",
      "criteria": "1",
      "subCriteria": "1.1.1",
      "facultyName": "Dr. John Smith",
      "facultyId": "john.smith@iqac.edu",
      "academicYear": "2024-25",
      "documentUrl": "https://drive.google.com/file/d/...",
      "driveFileId": "abc123...",
      "fileName": "document.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "uploadStatus": "Uploaded",
      "iqacStatus": "Pending",
      "remarks": "Initial submission",
      "approvedBy": null,
      "approvedDate": null
    }
  ]
}
```

### POST /documents/upload

Upload a new document or re-upload existing document.

**Request:**
```json
{
  "fileName": "document.pdf",
  "fileData": "base64_encoded_file_data",
  "mimeType": "application/pdf",
  "criteria": "1",
  "subCriteria": "1.1.1",
  "academicYear": "2024-25",
  "facultyId": "john.smith@iqac.edu",
  "facultyName": "Dr. John Smith",
  "remarks": "Updated version",
  "documentId": 5  // Optional: for re-upload
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-01-26T10:30:00Z",
    "criteria": "1",
    "subCriteria": "1.1.1",
    "facultyName": "Dr. John Smith",
    "facultyId": "john.smith@iqac.edu",
    "academicYear": "2024-25",
    "documentUrl": "https://drive.google.com/file/d/...",
    "fileName": "document.pdf",
    "iqacStatus": "Pending"
  },
  "message": "Document uploaded successfully"
}
```

### PUT /documents/status

Update document approval status (IQAC/Management only).

**Request:**
```json
{
  "documentId": 1,
  "status": "Approved",
  "remarks": "Meets all criteria",
  "approvedBy": "IQAC Coordinator"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document status updated to Approved"
}
```

### DELETE /documents

Delete a document.

**Request:**
```json
{
  "documentId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted"
}
```

---

## User Management Endpoints

### GET /users

Get all users (Admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "email": "admin@iqac.edu",
      "role": "Admin",
      "status": "Active"
    }
  ]
}
```

### POST /users

Create a new user (Admin only).

**Request:**
```json
{
  "name": "Dr. John Smith",
  "email": "john.smith@iqac.edu",
  "password": "password123",
  "role": "Faculty",
  "status": "Active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Dr. John Smith",
    "email": "john.smith@iqac.edu",
    "role": "Faculty",
    "status": "Active"
  },
  "message": "User created successfully"
}
```

### PUT /users

Update existing user (Admin only).

**Request:**
```json
{
  "id": 5,
  "name": "Dr. John Smith",
  "email": "john.smith@iqac.edu",
  "role": "Faculty",
  "status": "Inactive"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

### DELETE /users

Delete a user (Admin only).

**Request:**
```json
{
  "userId": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

## Assignment Endpoints

### GET /assignments

Get all assignments or assignments for specific faculty.

**Query Parameters:**
- `facultyId` (optional): Filter by faculty ID

**Example:**
```
GET /assignments?facultyId=john.smith@iqac.edu
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "facultyId": "john.smith@iqac.edu",
      "facultyName": "Dr. John Smith",
      "criteriaId": "1",
      "subCriteriaId": "1.1.1",
      "assignedBy": "Admin",
      "assignedDate": "2024-01-26T10:00:00Z"
    }
  ]
}
```

### POST /assignments

Create a new assignment (Admin only).

**Request:**
```json
{
  "facultyId": "john.smith@iqac.edu",
  "facultyName": "Dr. John Smith",
  "criteriaId": "1",
  "subCriteriaId": "1.1.1",
  "assignedBy": "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "facultyId": "john.smith@iqac.edu",
    "facultyName": "Dr. John Smith",
    "criteriaId": "1",
    "subCriteriaId": "1.1.1",
    "assignedBy": "Admin",
    "assignedDate": "2024-01-26T10:00:00Z"
  },
  "message": "Assignment created successfully"
}
```

### DELETE /assignments

Delete an assignment (Admin only).

**Request:**
```json
{
  "assignmentId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment deleted"
}
```

---

## Statistics Endpoints

### GET /stats

Get system-wide statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 150,
    "approved": 100,
    "pending": 40,
    "rejected": 10,
    "byYear": {
      "2024-25": 75,
      "2023-24": 75
    },
    "byCriteria": {
      "1": {
        "completed": 20,
        "pending": 5
      },
      "2": {
        "completed": 18,
        "pending": 7
      }
    }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

---

## File Upload Specifications

### Supported File Types

- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Images: `image/jpeg`, `image/png`, `image/gif`

### File Size Limits

- Maximum file size: 50 MB
- Recommended: Under 10 MB for optimal performance

### File Encoding

Files must be base64 encoded in the request body.

**JavaScript Example:**
```javascript
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
```

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iqac.edu","password":"admin123"}'
```

### Get Documents (with token)
```bash
curl -X GET http://localhost:8000/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Upload Document
```bash
curl -X POST http://localhost:8000/api/documents/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d @upload_payload.json
```

---

## Postman Collection

Import this collection into Postman for easy testing:

```json
{
  "info": {
    "name": "AQAR Hub API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

Save your token after login and use `{{token}}` in Authorization headers.
