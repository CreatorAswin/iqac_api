/**
 * IQAC - AQAR Management System
 * Google Apps Script Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Copy this entire code into the script editor
 * 3. Replace SPREADSHEET_ID with your Google Sheet ID
 * 4. Replace ROOT_FOLDER_ID with your Google Drive folder ID for "IQAC_Documents"
 * 5. Deploy as Web App:
 *    - Click Deploy > New Deployment
 *    - Select "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *    - Click Deploy and copy the Web App URL
 * 6. Add the Web App URL to your React app's .env file as VITE_GOOGLE_SCRIPT_URL
 */

// ============== CONFIGURATION ==============
const SPREADSHEET_ID = '1RyIzQmcOLJL3SalZBdqnVrh2dL2GmsGw9aCskVMfWlw'; // Replace with your Google Sheet ID
const ROOT_FOLDER_ID = '1RVJCBeFP-zDC3u-I_K_9B4M3PHUkJby0'; // Replace with your IQAC_Documents folder ID

// Sheet names
const TRACK_SHEET = 'track_sheet';
const CREDENTIALS_SHEET = 'credentials';
const ASSIGNMENTS_SHEET = 'assignments';

// ============== WEB APP HANDLERS ==============

function doPost(e) {
  try {
    // Handle both JSON and form data formats
    let params;
    if (e.postData && e.postData.contents) {
      // Check if it's JSON format
      if (e.postData.type === 'application/json' || e.postData.contents.charAt(0) === '{') {
        params = JSON.parse(e.postData.contents);
      } else {
        // Form data format from direct browser request
        params = {};
        for (var param in e.parameters) {
          params[param] = e.parameters[param];
          
          // Try to parse if it looks like JSON (for objects sent as strings)
          if (typeof params[param] === 'string' && 
              (params[param].startsWith('{') || params[param].startsWith('['))) {
            try {
              params[param] = JSON.parse(params[param]);
            } catch (e) {
              // If parsing fails, keep as string
            }
          }
        }
      }
    } else {
      // Form data format from direct browser request
      params = {};
      for (var param in e.parameters) {
        params[param] = e.parameters[param];
        
        // Try to parse if it looks like JSON (for objects sent as strings)
        if (typeof params[param] === 'string' && 
            (params[param].startsWith('{') || params[param].startsWith('['))) {
          try {
            params[param] = JSON.parse(params[param]);
          } catch (e) {
            // If parsing fails, keep as string
          }
        }
      }
    }
    
    const action = params.action;
    
    let result;
    
    switch (action) {
      case 'login':
        result = handleLogin(params.email, params.password);
        break;
      case 'getDocuments':
        result = handleGetDocuments(params);
        break;
      case 'uploadDocument':
        result = handleUploadDocument(params);
        break;
      case 'updateDocumentStatus':
        result = handleUpdateDocumentStatus(params);
        break;
      case 'deleteDocument':
        result = handleDeleteDocument(params.documentId);
        break;
      case 'getUsers':
        result = handleGetUsers();
        break;
      case 'createUser':
        result = handleCreateUser(params);
        break;
      case 'updateUser':
        result = handleUpdateUser(params);
        break;
      case 'deleteUser':
        result = handleDeleteUser(params.userId);
        break;
      case 'getAssignments':
        result = handleGetAssignments(params.facultyId);
        break;
      case 'createAssignment':
        result = handleCreateAssignment(params);
        break;
      case 'deleteAssignment':
        result = handleDeleteAssignment(params.assignmentId);
        break;
      case 'getStats':
        result = handleGetStats();
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'IQAC API is running. Use POST requests for API calls.'
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============== AUTHENTICATION ==============

function handleLogin(email, password) {
  const sheet = getSheet(CREDENTIALS_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const emailIdx = headers.indexOf('email');
  const passwordIdx = headers.indexOf('password');
  const nameIdx = headers.indexOf('name');
  const roleIdx = headers.indexOf('role');
  const statusIdx = headers.indexOf('status');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[emailIdx].toLowerCase() === email.toLowerCase()) {
      // Simple password check (in production, use proper hashing)
      if (row[passwordIdx] === password) {
        if (row[statusIdx] !== 'Active') {
          return { success: false, error: 'Account is inactive. Contact administrator.' };
        }
        return {
          success: true,
          data: {
            id: 'u' + i,
            name: row[nameIdx],
            email: row[emailIdx],
            role: row[roleIdx].toLowerCase(),
            status: row[statusIdx]
          }
        };
      } else {
        return { success: false, error: 'Invalid password' };
      }
    }
  }
  
  return { success: false, error: 'User not found' };
}

// ============== DOCUMENTS ==============

function handleGetDocuments(filters) {
  const sheet = getSheet(TRACK_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const documents = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const doc = {
      id: 'd' + (i + 1),
      date: formatDate(row[headers.indexOf('date')]),
      criteria: row[headers.indexOf('criteria')],
      subCriteria: row[headers.indexOf('sub_criteria')],
      facultyName: row[headers.indexOf('faculty_name')],
      facultyId: row[headers.indexOf('faculty_id')] || '',
      academicYear: row[headers.indexOf('academic_year')],
      documentUrl: row[headers.indexOf('document_url')],
      fileName: row[headers.indexOf('file_name')] || 'Document',
      uploadStatus: row[headers.indexOf('upload_status')],
      iqacStatus: row[headers.indexOf('iqac_status')],
      remarks: row[headers.indexOf('remarks')] || '',
      approvedBy: row[headers.indexOf('approved_by')] || '',
      approvedDate: formatDate(row[headers.indexOf('approved_date')])
    };
    
    // Apply filters
    let include = true;
    if (filters.facultyId && doc.facultyId !== filters.facultyId) include = false;
    if (filters.criteria && doc.criteria !== filters.criteria) include = false;
    if (filters.year && doc.academicYear !== filters.year) include = false;
    if (filters.status && doc.iqacStatus !== filters.status) include = false;
    
    if (include && doc.documentUrl) {
      documents.push(doc);
    }
  }
  
  return { success: true, data: documents };
}

function handleUploadDocument(params) {
  try {
    // Check if this is a reupload (documentId provided)
    const isReupload = params.documentId && params.documentId !== '';
    
    if (isReupload) {
      // REUPLOAD MODE: Replace existing document
      return handleReuploadDocument(params);
    }
    
    // NORMAL UPLOAD MODE: Create new document
    // Create folder hierarchy: IQAC_Documents / Year / Criteria_X / Sub_Criteria_X.X.X
    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    
    // Year folder
    const yearFolder = getOrCreateFolder(rootFolder, params.academicYear);
    
    // Criteria folder
    const criteriaFolder = getOrCreateFolder(yearFolder, 'Criteria_' + params.criteria);
    
    // Sub-criteria folder
    const subCriteriaFolder = getOrCreateFolder(criteriaFolder, 'Sub_Criteria_' + params.subCriteria);
    
    // Decode base64 and create file
    const blob = Utilities.newBlob(
      Utilities.base64Decode(params.fileData),
      params.mimeType,
      params.fileName
    );
    
    const file = subCriteriaFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = file.getUrl();
    
    // Add entry to track_sheet
    const sheet = getSheet(TRACK_SHEET);
    const newRow = [
      new Date(), // date
      params.criteria, // criteria
      params.subCriteria, // sub_criteria
      params.facultyName, // faculty_name
      params.facultyId, // faculty_id
      params.academicYear, // academic_year
      fileUrl, // document_url
      params.fileName, // file_name
      'Uploaded', // upload_status
      'Pending', // iqac_status
      params.remarks || '', // remarks
      '', // approved_by
      '' // approved_date
    ];
    
    sheet.appendRow(newRow);
    
    const docId = 'd' + sheet.getLastRow();
    
    return {
      success: true,
      data: {
        id: docId,
        date: formatDate(new Date()),
        criteria: params.criteria,
        subCriteria: params.subCriteria,
        facultyName: params.facultyName,
        facultyId: params.facultyId,
        academicYear: params.academicYear,
        documentUrl: fileUrl,
        fileName: params.fileName,
        uploadStatus: 'Uploaded',
        iqacStatus: 'Pending',
        remarks: params.remarks || '',
        approvedBy: '',
        approvedDate: ''
      },
      message: 'Document uploaded successfully'
    };
    
  } catch (error) {
    return { success: false, error: 'Upload failed: ' + error.message };
  }
}

function handleReuploadDocument(params) {
  try {
    const sheet = getSheet(TRACK_SHEET);
    
    // Extract row number from documentId (format: 'd<number>')
    let idNumber;
    if (params.documentId.startsWith('d')) {
      idNumber = parseInt(params.documentId.replace('d', ''));
    } else {
      idNumber = parseInt(params.documentId);
    }
    
    const rowNum = idNumber;
    
    // Validate row number
    if (isNaN(idNumber) || rowNum < 2 || rowNum > sheet.getLastRow()) {
      return { success: false, error: 'Document not found or invalid ID: ' + params.documentId };
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const urlCol = headers.indexOf('document_url') + 1;
    
    // Get old file URL and delete old file from Drive
    const oldUrl = sheet.getRange(rowNum, urlCol).getValue();
    try {
      const oldFileId = extractFileIdFromUrl(oldUrl);
      if (oldFileId) {
        DriveApp.getFileById(oldFileId).setTrashed(true);
      }
    } catch (e) {
      // Old file may already be deleted, continue
      Logger.log('Could not delete old file: ' + e.message);
    }
    
    // Create folder hierarchy for new file
    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const yearFolder = getOrCreateFolder(rootFolder, params.academicYear);
    const criteriaFolder = getOrCreateFolder(yearFolder, 'Criteria_' + params.criteria);
    const subCriteriaFolder = getOrCreateFolder(criteriaFolder, 'Sub_Criteria_' + params.subCriteria);
    
    // Upload new file
    const blob = Utilities.newBlob(
      Utilities.base64Decode(params.fileData),
      params.mimeType,
      params.fileName
    );
    
    const newFile = subCriteriaFolder.createFile(blob);
    newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const newFileUrl = newFile.getUrl();
    
    // Update document row
    const dateCol = headers.indexOf('date') + 1;
    const fileNameCol = headers.indexOf('file_name') + 1;
    const iqacStatusCol = headers.indexOf('iqac_status') + 1;
    const remarksCol = headers.indexOf('remarks') + 1;
    const approvedByCol = headers.indexOf('approved_by') + 1;
    const approvedDateCol = headers.indexOf('approved_date') + 1;
    
    sheet.getRange(rowNum, dateCol).setValue(new Date());
    sheet.getRange(rowNum, urlCol).setValue(newFileUrl);
    sheet.getRange(rowNum, fileNameCol).setValue(params.fileName);
    sheet.getRange(rowNum, iqacStatusCol).setValue('Pending');
    sheet.getRange(rowNum, remarksCol).setValue(params.remarks || '');
    sheet.getRange(rowNum, approvedByCol).setValue('');
    sheet.getRange(rowNum, approvedDateCol).setValue('');
    
    // Commit changes
    SpreadsheetApp.flush();
    
    return {
      success: true,
      data: {
        id: params.documentId,
        date: formatDate(new Date()),
        criteria: params.criteria,
        subCriteria: params.subCriteria,
        facultyName: params.facultyName,
        facultyId: params.facultyId,
        academicYear: params.academicYear,
        documentUrl: newFileUrl,
        fileName: params.fileName,
        uploadStatus: 'Uploaded',
        iqacStatus: 'Pending',
        remarks: params.remarks || '',
        approvedBy: '',
        approvedDate: ''
      },
      message: 'Document re-uploaded successfully'
    };
    
  } catch (error) {
    return { success: false, error: 'Reupload failed: ' + error.message };
  }
}

function handleUpdateDocumentStatus(params) {
  const sheet = getSheet(TRACK_SHEET);
  
  // Extract row number from documentId (format: 'd<number>')
  let idNumber;
  if (params.documentId.startsWith('d')) {
    idNumber = parseInt(params.documentId.replace('d', ''));
  } else {
    idNumber = parseInt(params.documentId);
  }
  
  // Convert ID number to actual sheet row number
  // ID 'd1' corresponds to row 2 (first data row after header)
  // ID 'd2' corresponds to row 3, etc.
  const rowNum = idNumber;
  
  // Ensure row number is valid (first row is headers)
  if (isNaN(idNumber) || rowNum < 2 || rowNum > sheet.getLastRow()) {
    return { success: false, error: 'Document not found or invalid ID: ' + params.documentId + '. Expected sheet row: ' + rowNum };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const iqacStatusCol = headers.indexOf('iqac_status') + 1;
  const remarksCol = headers.indexOf('remarks') + 1;
  const approvedByCol = headers.indexOf('approved_by') + 1;
  const approvedDateCol = headers.indexOf('approved_date') + 1;
  
  // Log for debugging purposes
  console.log('Updating document status for row:', rowNum, 'from ID:', params.documentId, 'status:', params.status);
  
  sheet.getRange(rowNum, iqacStatusCol).setValue(params.status);
  if (params.remarks) {
    sheet.getRange(rowNum, remarksCol).setValue(params.remarks);
  }
  sheet.getRange(rowNum, approvedByCol).setValue(params.approvedBy);
  sheet.getRange(rowNum, approvedDateCol).setValue(new Date());
  
  // Commit changes to ensure they're saved
  SpreadsheetApp.flush();
  
  return {
    success: true,
    message: 'Document status updated to ' + params.status
  };
}

function handleDeleteDocument(documentId) {
  const sheet = getSheet(TRACK_SHEET);
  
  // Extract ID number from documentId (format: 'd<number>')
  let idNumber;
  if (documentId.startsWith('d')) {
    idNumber = parseInt(documentId.replace('d', ''));
  } else {
    idNumber = parseInt(documentId);
  }
  
  // Convert ID number to actual sheet row number
  // ID 'd1' corresponds to row 2 (first data row after header)
  // ID 'd2' corresponds to row 3, etc.
  const rowNum = idNumber;
  
  if (isNaN(idNumber) || rowNum < 2 || rowNum > sheet.getLastRow()) {
    return { success: false, error: 'Document not found or invalid ID: ' + documentId };
  }
  
  // Optionally delete file from Drive
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const urlCol = headers.indexOf('document_url') + 1;
  const url = sheet.getRange(rowNum, urlCol).getValue();
  
  try {
    const fileId = extractFileIdFromUrl(url);
    if (fileId) {
      DriveApp.getFileById(fileId).setTrashed(true);
    }
  } catch (e) {
    // File may already be deleted, continue
  }
  
  sheet.deleteRow(rowNum);
  
  return { success: true, message: 'Document deleted' };
}

// ============== USERS ==============

function handleGetUsers() {
  const sheet = getSheet(CREDENTIALS_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const users = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    users.push({
      id: 'u' + (i + 1),
      name: row[headers.indexOf('name')],
      email: row[headers.indexOf('email')],
      role: row[headers.indexOf('role')],
      status: row[headers.indexOf('status')]
    });
  }
  
  return { success: true, data: users };
}

function handleCreateUser(params) {
  const sheet = getSheet(CREDENTIALS_SHEET);
  
  // Check if email already exists
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIdx = headers.indexOf('email');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailIdx].toLowerCase() === params.email.toLowerCase()) {
      return { success: false, error: 'Email already exists' };
    }
  }
  
  const newRow = [
    params.name,
    params.email,
    params.password || 'password123', // Default password
    params.role,
    params.status || 'Active'
  ];
  
  sheet.appendRow(newRow);
  
  return {
    success: true,
    data: {
      id: 'u' + sheet.getLastRow(),
      name: params.name,
      email: params.email,
      role: params.role,
      status: params.status || 'Active'
    },
    message: 'User created successfully'
  };
}

function handleUpdateUser(params) {
  const sheet = getSheet(CREDENTIALS_SHEET);
  
  // Extract ID number from userId (format: 'u<number>')
  let idNumber;
  if (params.id.startsWith('u')) {
    idNumber = parseInt(params.id.replace('u', ''));
  } else {
    idNumber = parseInt(params.id);
  }
  
  // Convert ID number to actual sheet row number
  // ID 'u1' corresponds to row 2 (first data row after header)
  // ID 'u2' corresponds to row 3, etc.
  const rowNum = idNumber;
  
  if (isNaN(idNumber) || rowNum < 2 || rowNum > sheet.getLastRow()) {
    return { success: false, error: 'User not found or invalid ID: ' + params.id };
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (params.name) sheet.getRange(rowNum, headers.indexOf('name') + 1).setValue(params.name);
  if (params.email) sheet.getRange(rowNum, headers.indexOf('email') + 1).setValue(params.email);
  if (params.password) sheet.getRange(rowNum, headers.indexOf('password') + 1).setValue(params.password);
  if (params.role) sheet.getRange(rowNum, headers.indexOf('role') + 1).setValue(params.role);
  if (params.status) sheet.getRange(rowNum, headers.indexOf('status') + 1).setValue(params.status);
  
  return { success: true, message: 'User updated successfully' };
}

function handleDeleteUser(userId) {
  const sheet = getSheet(CREDENTIALS_SHEET);
  
  // Extract ID number from userId (format: 'u<number>')
  let idNumber;
  if (userId.startsWith('u')) {
    idNumber = parseInt(userId.replace('u', ''));
  } else {
    idNumber = parseInt(userId);
  }
  
  // Convert ID number to actual sheet row number
  // ID 'u1' corresponds to row 2 (first data row after header)
  // ID 'u2' corresponds to row 3, etc.
  const rowNum = idNumber;
  
  if (isNaN(idNumber) || rowNum < 2 || rowNum > sheet.getLastRow()) {
    return { success: false, error: 'User not found or invalid ID: ' + userId };
  }
  
  sheet.deleteRow(rowNum);
  
  return { success: true, message: 'User deleted' };
}

// ============== ASSIGNMENTS ==============

function handleGetAssignments(facultyId) {
  const sheet = getSheet(ASSIGNMENTS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return { success: true, data: [] };
  }
  
  const headers = data[0];
  const assignments = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const assignment = {
      id: 'a' + (i + 1),
      facultyId: row[headers.indexOf('faculty_id')],
      facultyName: row[headers.indexOf('faculty_name')],
      criteriaId: row[headers.indexOf('criteria_id')],
      subCriteriaId: row[headers.indexOf('sub_criteria_id')],
      assignedBy: row[headers.indexOf('assigned_by')],
      assignedDate: formatDate(row[headers.indexOf('assigned_date')])
    };
    
    if (!facultyId || assignment.facultyId === facultyId) {
      assignments.push(assignment);
    }
  }
  
  return { success: true, data: assignments };
}

function handleCreateAssignment(params) {
  const sheet = getSheet(ASSIGNMENTS_SHEET);
  
  // Check if assignment already exists
  const data = sheet.getDataRange().getValues();
  if (data.length > 1) {
    const headers = data[0];
    const facultyIdx = headers.indexOf('faculty_id');
    const subCriteriaIdx = headers.indexOf('sub_criteria_id');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][facultyIdx] === params.facultyId && 
          data[i][subCriteriaIdx] === params.subCriteriaId) {
        return { success: false, error: 'Assignment already exists' };
      }
    }
  }
  
  const newRow = [
    params.facultyId,
    params.facultyName,
    params.criteriaId,
    params.subCriteriaId,
    params.assignedBy,
    new Date()
  ];
  
  sheet.appendRow(newRow);
  
  return {
    success: true,
    data: {
      id: 'a' + sheet.getLastRow(),
      ...params,
      assignedDate: formatDate(new Date())
    },
    message: 'Assignment created successfully'
  };
}

function handleDeleteAssignment(assignmentId) {
  const sheet = getSheet(ASSIGNMENTS_SHEET);
  
  // Extract ID number from assignmentId (format: 'a<number>')
  let idNumber;
  if (assignmentId.startsWith('a')) {
    idNumber = parseInt(assignmentId.replace('a', ''));
  } else {
    idNumber = parseInt(assignmentId);
  }
  
  // Convert ID number to actual sheet row number
  // ID 'a1' corresponds to row 2 (first data row after header)
  // ID 'a2' corresponds to row 3, etc.
  const rowNum = idNumber;
  
  if (isNaN(idNumber) || rowNum < 2 || rowNum > sheet.getLastRow()) {
    return { success: false, error: 'Assignment not found or invalid ID: ' + assignmentId };
  }
  
  sheet.deleteRow(rowNum);
  
  return { success: true, message: 'Assignment deleted' };
}

// ============== STATISTICS ==============

function handleGetStats() {
  const sheet = getSheet(TRACK_SHEET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return {
      success: true,
      data: {
        totalDocuments: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        byYear: {},
        byCriteria: {}
      }
    };
  }
  
  const headers = data[0];
  const criteriaIdx = headers.indexOf('criteria');
  const yearIdx = headers.indexOf('academic_year');
  const statusIdx = headers.indexOf('iqac_status');
  
  let approved = 0, pending = 0, rejected = 0;
  const byYear = {};
  const byCriteria = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[statusIdx];
    const year = row[yearIdx];
    const criteria = row[criteriaIdx];
    
    // Count by status
    if (status === 'Approved') approved++;
    else if (status === 'Pending') pending++;
    else if (status === 'Rejected') rejected++;
    
    // Count by year
    if (year) {
      byYear[year] = (byYear[year] || 0) + 1;
    }
    
    // Count by criteria
    if (criteria) {
      if (!byCriteria[criteria]) {
        byCriteria[criteria] = { completed: 0, pending: 0 };
      }
      if (status === 'Approved') {
        byCriteria[criteria].completed++;
      } else {
        byCriteria[criteria].pending++;
      }
    }
  }
  
  return {
    success: true,
    data: {
      totalDocuments: data.length - 1,
      approved,
      pending,
      rejected,
      byYear,
      byCriteria
    }
  };
}

// ============== HELPER FUNCTIONS ==============

function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    // Add headers based on sheet type
    if (sheetName === TRACK_SHEET) {
      sheet.appendRow([
        'date', 'criteria', 'sub_criteria', 'faculty_name', 'faculty_id',
        'academic_year', 'document_url', 'file_name', 'upload_status',
        'iqac_status', 'remarks', 'approved_by', 'approved_date'
      ]);
    } else if (sheetName === CREDENTIALS_SHEET) {
      sheet.appendRow(['name', 'email', 'password', 'role', 'status']);
      // Add default admin user
      sheet.appendRow(['Admin', 'admin@iqac.edu', 'admin123', 'Admin', 'Active']);
    } else if (sheetName === ASSIGNMENTS_SHEET) {
      sheet.appendRow([
        'faculty_id', 'faculty_name', 'criteria_id', 'sub_criteria_id',
        'assigned_by', 'assigned_date'
      ]);
    }
  }
  
  return sheet;
}

function getOrCreateFolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(name);
}

function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function extractFileIdFromUrl(url) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

// ============== INITIALIZATION ==============

/**
 * Run this function once to set up all required sheets
 */
function initializeSheets() {
  getSheet(TRACK_SHEET);
  getSheet(CREDENTIALS_SHEET);
  getSheet(ASSIGNMENTS_SHEET);
  
  Logger.log('All sheets initialized successfully!');
}

/**
 * Run this function to add sample users for testing
 */
function addSampleUsers() {
  const sheet = getSheet(CREDENTIALS_SHEET);
  
  const sampleUsers = [
    ['Management User', 'management@iqac.edu', 'demo123', 'Management', 'Active'],
    ['IQAC Coordinator', 'iqac@iqac.edu', 'demo123', 'IQAC', 'Active'],
    ['Dr. Faculty', 'faculty@iqac.edu', 'demo123', 'Faculty', 'Active']
  ];
  
  sampleUsers.forEach(user => sheet.appendRow(user));
  
  Logger.log('Sample users added!');
}
