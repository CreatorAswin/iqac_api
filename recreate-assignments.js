// Utility to recreate assignments with proper data structure
// Run this in browser console when logged in as admin

async function recreateAssignments() {
  console.log('Starting assignment recreation process...');
  
  // Get all users to find faculty members
  const usersResponse = await fetch('http://localhost:3001/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getUsers' })
  });
  const usersData = await usersResponse.json();
  
  if (!usersData.success) {
    console.error('Failed to get users:', usersData.error);
    return;
  }
  
  // Get all current assignments to see what needs to be fixed
  const assignmentsResponse = await fetch('http://localhost:3001/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getAssignments' })
  });
  const assignmentsData = await assignmentsResponse.json();
  
  if (!assignmentsData.success) {
    console.error('Failed to get assignments:', assignmentsData.error);
    return;
  }
  
  console.log('Current assignments:', assignmentsData.data);
  
  // Find faculty users
  const facultyUsers = usersData.data.filter(user => user.role.toLowerCase() === 'faculty');
  console.log('Faculty users found:', facultyUsers);
  
  // Define some sample assignments to recreate
  const sampleAssignments = [
    {
      facultyId: 'aswin@cutmap.ac.in',
      facultyName: 'Mr Aswini Kumar',
      criteriaId: 'c1',
      subCriteriaId: '1.1.1'
    },
    {
      facultyId: 'aswin@cutmap.ac.in',
      facultyName: 'Mr Aswini Kumar',
      criteriaId: 'c2',
      subCriteriaId: '2.1.1'
    },
    {
      facultyId: 'faculty@iqac.edu',
      facultyName: 'Dr. Faculty One',
      criteriaId: 'c3',
      subCriteriaId: '3.1.1'
    }
  ];
  
  // First, delete existing incomplete assignments
  console.log('Deleting existing incomplete assignments...');
  for (const assignment of assignmentsData.data) {
    const deleteResponse = await fetch('http://localhost:3001/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'deleteAssignment',
        assignmentId: assignment.id 
      })
    });
    const deleteResult = await deleteResponse.json();
    console.log(`Deleted assignment ${assignment.id}:`, deleteResult.success);
  }
  
  // Now create new assignments with complete data
  console.log('Creating new assignments with complete data...');
  for (const assignment of sampleAssignments) {
    // Check if faculty user exists
    const facultyExists = facultyUsers.some(f => f.email === assignment.facultyId);
    if (!facultyExists) {
      console.log(`Faculty user ${assignment.facultyId} not found, skipping...`);
      continue;
    }
    
    const createResponse = await fetch('http://localhost:3001/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createAssignment',
        facultyId: assignment.facultyId,
        facultyName: assignment.facultyName,
        criteriaId: assignment.criteriaId,
        subCriteriaId: assignment.subCriteriaId,
        assignedBy: 'admin@iqac.edu'
      })
    });
    const createResult = await createResponse.json();
    
    console.log(`Created assignment for ${assignment.facultyName} - ${assignment.subCriteriaId}:`, createResult);
  }
  
  console.log('Assignment recreation process completed!');
  console.log('Please refresh the application to see updated assignments.');
}

// Add to global scope
window.recreateAssignments = recreateAssignments;

console.log('Assignment recreation utility loaded.');
console.log('Run recreateAssignments() to recreate assignments with proper data structure.');