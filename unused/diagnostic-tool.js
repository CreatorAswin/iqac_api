// Diagnostic tool to check and fix assignments
// Run this in the browser console when logged in as admin

async function diagnoseAssignments() {
  try {
    // Get all assignments
    const response = await fetch('http://localhost:3001/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getAssignments' })
    });
    
    const result = await response.json();
    console.log('Current assignments:', result);
    
    if (result.success && result.data.length > 0) {
      console.log('Assignment structure analysis:');
      result.data.forEach((assignment, index) => {
        console.log(`Assignment ${index + 1}:`, {
          id: assignment.id,
          facultyId: assignment.facultyId,
          facultyName: assignment.facultyName,
          criteriaId: assignment.criteriaId,
          subCriteriaId: assignment.subCriteriaId,
          hasRequiredFields: !!(assignment.facultyId && assignment.criteriaId && assignment.subCriteriaId)
        });
      });
    }
    
    // Get all users to verify faculty emails
    const usersResponse = await fetch('http://localhost:3001/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getUsers' })
    });
    
    const usersResult = await usersResponse.json();
    console.log('Faculty users:', usersResult.data.filter(u => u.role === 'Faculty'));
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
}

// Function to recreate assignments properly
async function recreateAssignment(facultyEmail, facultyName, criteriaId, subCriteriaId) {
  try {
    const response = await fetch('http://localhost:3001/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createAssignment',
        facultyId: facultyEmail,
        facultyName: facultyName,
        criteriaId: criteriaId,
        subCriteriaId: subCriteriaId,
        assignedBy: 'admin@iqac.edu' // or current user email
      })
    });
    
    const result = await response.json();
    console.log('Assignment creation result:', result);
    return result;
  } catch (error) {
    console.error('Assignment creation error:', error);
  }
}

// Usage examples:
console.log('=== Assignment Diagnostic Tool ===');
console.log('Run diagnoseAssignments() to check current assignments');
console.log('Run recreateAssignment(email, name, criteriaId, subCriteriaId) to create new assignments');

// Export for use
window.diagnoseAssignments = diagnoseAssignments;
window.recreateAssignment = recreateAssignment;