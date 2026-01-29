// Assignment Recreation Script
// This script helps recreate assignments with complete data structure
// Run this in the browser console when logged in as admin

class AssignmentManager {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3001/api';
  }

  async apiCall(action, data = {}) {
    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllAssignments() {
    return await this.apiCall('getAssignments');
  }

  async getAllUsers() {
    return await this.apiCall('getUsers');
  }

  async deleteAssignment(assignmentId) {
    return await this.apiCall('deleteAssignment', { assignmentId });
  }

  async createAssignment(assignmentData) {
    return await this.apiCall('createAssignment', assignmentData);
  }

  async diagnoseCurrentAssignments() {
    console.log('=== Assignment Diagnosis ===');
    
    const assignmentsResult = await this.getAllAssignments();
    const usersResult = await this.getAllUsers();
    
    console.log('Current assignments:', assignmentsResult);
    console.log('All users:', usersResult);
    
    if (assignmentsResult.success) {
      console.log('\nAssignment Analysis:');
      assignmentsResult.data.forEach((assignment, index) => {
        console.log(`Assignment ${index + 1}:`, {
          id: assignment.id,
          facultyName: assignment.facultyName,
          facultyId: assignment.facultyId,
          criteriaId: assignment.criteriaId,
          subCriteriaId: assignment.subCriteriaId,
          assignedBy: assignment.assignedBy,
          assignedDate: assignment.assignedDate,
          isComplete: !!(assignment.facultyId && assignment.criteriaId && assignment.subCriteriaId)
        });
      });
    }
    
    if (usersResult.success) {
      console.log('\nFaculty Users:');
      const facultyUsers = usersResult.data.filter(u => u.role === 'Faculty');
      facultyUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email})`);
      });
    }
    
    return { assignments: assignmentsResult, users: usersResult };
  }

  async cleanupIncompleteAssignments() {
    console.log('=== Cleaning up incomplete assignments ===');
    
    const assignmentsResult = await this.getAllAssignments();
    if (!assignmentsResult.success) {
      console.error('Failed to get assignments');
      return false;
    }
    
    const incompleteAssignments = assignmentsResult.data.filter(a => 
      !(a.facultyId && a.criteriaId && a.subCriteriaId)
    );
    
    if (incompleteAssignments.length === 0) {
      console.log('No incomplete assignments found');
      return true;
    }
    
    console.log(`Found ${incompleteAssignments.length} incomplete assignments to delete:`);
    incompleteAssignments.forEach(a => console.log(`- ${a.id}: ${a.facultyName}`));
    
    for (const assignment of incompleteAssignments) {
      console.log(`Deleting assignment ${assignment.id}...`);
      const result = await this.deleteAssignment(assignment.id);
      if (result.success) {
        console.log(`✓ Deleted ${assignment.id}`);
      } else {
        console.error(`✗ Failed to delete ${assignment.id}:`, result.error);
      }
    }
    
    return true;
  }

  // Sample assignment creation - customize as needed
  async createSampleAssignments() {
    console.log('=== Creating sample assignments ===');
    
    const usersResult = await this.getAllUsers();
    if (!usersResult.success) {
      console.error('Failed to get users');
      return;
    }
    
    const facultyUsers = usersResult.data.filter(u => u.role === 'Faculty');
    
    // Sample assignments data - modify according to your needs
    const sampleAssignments = [
      {
        facultyEmail: 'aswin@cutmap.ac.in',
        facultyName: 'Mr Aswini Kumar',
        criteriaId: 'c1',
        subCriteriaId: '1.1.1',
        description: 'Curriculum Design and Development'
      },
      {
        facultyEmail: 'aswin@cutmap.ac.in', 
        facultyName: 'Mr Aswini Kumar',
        criteriaId: 'c2',
        subCriteriaId: '2.1.1', 
        description: 'Student Enrollment and Entry Qualifications'
      },
      {
        facultyEmail: 'faculty@iqac.edu',
        facultyName: 'Dr. Faculty One',
        criteriaId: 'c3',
        subCriteriaId: '3.1.1',
        description: 'Promotion of Research'
      }
    ];
    
    console.log('Creating assignments...');
    
    for (const assignment of sampleAssignments) {
      // Verify faculty exists
      const facultyExists = facultyUsers.some(f => f.email === assignment.facultyEmail);
      if (!facultyExists) {
        console.warn(`Skipping ${assignment.facultyEmail} - user not found`);
        continue;
      }
      
      console.log(`Creating assignment for ${assignment.facultyName}: ${assignment.subCriteriaId}`);
      
      const result = await this.createAssignment({
        facultyId: assignment.facultyEmail,
        facultyName: assignment.facultyName,
        criteriaId: assignment.criteriaId,
        subCriteriaId: assignment.subCriteriaId,
        assignedBy: 'admin@iqac.edu'
      });
      
      if (result.success) {
        console.log(`✓ Created assignment ${result.data.id}`);
      } else {
        console.error(`✗ Failed to create assignment:`, result.error);
      }
    }
  }

  async fullRecreationProcess() {
    console.log('=== Full Assignment Recreation Process ===');
    
    // Step 1: Diagnose current state
    await this.diagnoseCurrentAssignments();
    
    // Step 2: Clean up incomplete assignments
    await this.cleanupIncompleteAssignments();
    
    // Step 3: Create new assignments with complete data
    await this.createSampleAssignments();
    
    // Step 4: Verify results
    console.log('\n=== Final Verification ===');
    await this.diagnoseCurrentAssignments();
    
    console.log('\n✅ Assignment recreation process completed!');
    console.log('Faculty members should now see their assigned criteria.');
  }
}

// Make it available globally
const assignmentManager = new AssignmentManager();

// Convenience functions
window.diagnoseAssignments = () => assignmentManager.diagnoseCurrentAssignments();
window.cleanupAssignments = () => assignmentManager.cleanupIncompleteAssignments();
window.createSampleAssignments = () => assignmentManager.createSampleAssignments();
window.recreateAllAssignments = () => assignmentManager.fullRecreationProcess();

console.log('=== Assignment Management Tools Loaded ===');
console.log('Available commands:');
console.log('- diagnoseAssignments()        // Check current assignment status');
console.log('- cleanupAssignments()         // Remove incomplete assignments');
console.log('- createSampleAssignments()    // Create sample assignments');
console.log('- recreateAllAssignments()     // Complete recreation process');

// Auto-run diagnosis
assignmentManager.diagnoseCurrentAssignments();