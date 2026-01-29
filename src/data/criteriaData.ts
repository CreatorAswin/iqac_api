export interface SubCriteria {
  id: string;
  code: string;
  title: string;
  description: string;
}

export interface Criteria {
  id: string;
  number: number;
  title: string;
  description: string;
  subCriteria: SubCriteria[];
}

export const naacCriteria: Criteria[] = [
  {
    id: 'c1',
    number: 1,
    title: 'Curricular Aspects',
    description: 'Curriculum Design and Development',
    subCriteria: [
      { id: 'c1.1.1', code: '1.1.1', title: 'Curricular Planning', description: 'Curriculum is developed and reviewed by involving stakeholders' },
      { id: 'c1.1.2', code: '1.1.2', title: 'Academic Flexibility', description: 'Choice based credit system and range of courses' },
      { id: 'c1.2.1', code: '1.2.1', title: 'New Courses', description: 'New courses introduced during the last five years' },
      { id: 'c1.2.2', code: '1.2.2', title: 'Programs with CBCS', description: 'Programmes with Choice Based Credit System' },
      { id: 'c1.3.1', code: '1.3.1', title: 'Cross-cutting Issues', description: 'Integration of cross-cutting issues in curriculum' },
      { id: 'c1.3.2', code: '1.3.2', title: 'Value Added Courses', description: 'Number of value-added courses offered' },
      { id: 'c1.4.1', code: '1.4.1', title: 'Feedback System', description: 'Structured feedback from stakeholders' },
      { id: 'c1.4.2', code: '1.4.2', title: 'Feedback Analysis', description: 'Analysis and action taken on feedback' },
    ],
  },
  {
    id: 'c2',
    number: 2,
    title: 'Teaching-Learning and Evaluation',
    description: 'Student Enrollment and Learning Process',
    subCriteria: [
      { id: 'c2.1.1', code: '2.1.1', title: 'Student Enrollment', description: 'Enrollment percentage and demand ratio' },
      { id: 'c2.1.2', code: '2.1.2', title: 'Reserved Categories', description: 'Seats filled against reserved categories' },
      { id: 'c2.2.1', code: '2.2.1', title: 'Student-Teacher Ratio', description: 'Student-teacher ratio for the institution' },
      { id: 'c2.3.1', code: '2.3.1', title: 'Student-centric Methods', description: 'ICT enabled tools and student-centric methods' },
      { id: 'c2.3.2', code: '2.3.2', title: 'Mentoring', description: 'Number of mentors and mentees' },
      { id: 'c2.4.1', code: '2.4.1', title: 'Full-time Teachers', description: 'Percentage of full-time teachers' },
      { id: 'c2.4.2', code: '2.4.2', title: 'Faculty Qualifications', description: 'Teachers with Ph.D and NET/SET' },
      { id: 'c2.5.1', code: '2.5.1', title: 'Evaluation Reforms', description: 'Reforms in examination and evaluation' },
      { id: 'c2.6.1', code: '2.6.1', title: 'Learning Outcomes', description: 'Program outcomes and course outcomes' },
      { id: 'c2.6.2', code: '2.6.2', title: 'Attainment of Outcomes', description: 'Attainment of POs and COs' },
    ],
  },
  {
    id: 'c3',
    number: 3,
    title: 'Research, Innovations and Extension',
    description: 'Promotion of Research and Extension Activities',
    subCriteria: [
      { id: 'c3.1.1', code: '3.1.1', title: 'Research Grants', description: 'Grants received for research projects' },
      { id: 'c3.1.2', code: '3.1.2', title: 'Research Facilities', description: 'Research facilities and seed money' },
      { id: 'c3.2.1', code: '3.2.1', title: 'Ecosystem for Innovation', description: 'Innovation ecosystem in institution' },
      { id: 'c3.2.2', code: '3.2.2', title: 'Workshops & Seminars', description: 'Workshops and seminars conducted' },
      { id: 'c3.3.1', code: '3.3.1', title: 'Research Papers', description: 'Papers published in journals' },
      { id: 'c3.3.2', code: '3.3.2', title: 'Books & Chapters', description: 'Books and chapters published' },
      { id: 'c3.4.1', code: '3.4.1', title: 'Extension Activities', description: 'Extension and outreach activities' },
      { id: 'c3.4.2', code: '3.4.2', title: 'Awards for Extension', description: 'Awards received for extension' },
      { id: 'c3.5.1', code: '3.5.1', title: 'Collaborations', description: 'MoUs and collaborations' },
    ],
  },
  {
    id: 'c4',
    number: 4,
    title: 'Infrastructure and Learning Resources',
    description: 'Physical and Academic Support Facilities',
    subCriteria: [
      { id: 'c4.1.1', code: '4.1.1', title: 'Physical Facilities', description: 'Infrastructure for teaching-learning' },
      { id: 'c4.1.2', code: '4.1.2', title: 'Cultural Activities', description: 'Facilities for cultural activities' },
      { id: 'c4.2.1', code: '4.2.1', title: 'Library Automation', description: 'Library automation and resources' },
      { id: 'c4.2.2', code: '4.2.2', title: 'Library Usage', description: 'Library usage by students and staff' },
      { id: 'c4.3.1', code: '4.3.1', title: 'IT Facilities', description: 'IT facilities and bandwidth' },
      { id: 'c4.3.2', code: '4.3.2', title: 'Student-Computer Ratio', description: 'Ratio of students to computers' },
      { id: 'c4.4.1', code: '4.4.1', title: 'Maintenance Budget', description: 'Expenditure on infrastructure maintenance' },
    ],
  },
  {
    id: 'c5',
    number: 5,
    title: 'Student Support and Progression',
    description: 'Student Mentoring and Support',
    subCriteria: [
      { id: 'c5.1.1', code: '5.1.1', title: 'Scholarships', description: 'Students benefited by scholarships' },
      { id: 'c5.1.2', code: '5.1.2', title: 'Career Counseling', description: 'Career counseling activities' },
      { id: 'c5.2.1', code: '5.2.1', title: 'Placement', description: 'Student placement percentage' },
      { id: 'c5.2.2', code: '5.2.2', title: 'Higher Education', description: 'Students progressing to higher education' },
      { id: 'c5.3.1', code: '5.3.1', title: 'Competitive Exams', description: 'Students qualifying exams' },
      { id: 'c5.3.2', code: '5.3.2', title: 'Sports & Cultural', description: 'Sports and cultural achievements' },
      { id: 'c5.4.1', code: '5.4.1', title: 'Alumni Association', description: 'Registered alumni association' },
      { id: 'c5.4.2', code: '5.4.2', title: 'Alumni Contribution', description: 'Alumni contribution and engagement' },
    ],
  },
  {
    id: 'c6',
    number: 6,
    title: 'Governance, Leadership and Management',
    description: 'Institutional Vision and Leadership',
    subCriteria: [
      { id: 'c6.1.1', code: '6.1.1', title: 'Vision & Mission', description: 'Governance reflecting vision and mission' },
      { id: 'c6.1.2', code: '6.1.2', title: 'Decentralization', description: 'Decentralization and participative management' },
      { id: 'c6.2.1', code: '6.2.1', title: 'Strategic Plan', description: 'Perspective/Strategic development plan' },
      { id: 'c6.2.2', code: '6.2.2', title: 'Organizational Structure', description: 'Organogram and governance' },
      { id: 'c6.3.1', code: '6.3.1', title: 'Faculty Empowerment', description: 'Faculty empowerment strategies' },
      { id: 'c6.3.2', code: '6.3.2', title: 'FDPs', description: 'Faculty development programmes' },
      { id: 'c6.4.1', code: '6.4.1', title: 'Financial Management', description: 'Resource mobilization and management' },
      { id: 'c6.4.2', code: '6.4.2', title: 'Grants Utilization', description: 'Utilization of funds and grants' },
      { id: 'c6.5.1', code: '6.5.1', title: 'IQAC', description: 'IQAC contribution and initiatives' },
      { id: 'c6.5.2', code: '6.5.2', title: 'Quality Assurance', description: 'Quality assurance initiatives' },
    ],
  },
  {
    id: 'c7',
    number: 7,
    title: 'Institutional Values and Best Practices',
    description: 'Institutional Values and Social Responsibility',
    subCriteria: [
      { id: 'c7.1.1', code: '7.1.1', title: 'Gender Equity', description: 'Gender equity initiatives' },
      { id: 'c7.1.2', code: '7.1.2', title: 'Environmental Initiatives', description: 'Environmental consciousness' },
      { id: 'c7.1.3', code: '7.1.3', title: 'Disabled-friendly', description: 'Facilities for divyangjan' },
      { id: 'c7.1.4', code: '7.1.4', title: 'Constitutional Values', description: 'Constitutional obligations and values' },
      { id: 'c7.2.1', code: '7.2.1', title: 'Best Practices', description: 'Institutional best practices' },
      { id: 'c7.3.1', code: '7.3.1', title: 'Distinctiveness', description: 'Institutional distinctiveness' },
    ],
  },
];

export const academicYears = ['2020-21', '2021-22', '2022-23', '2023-24', '2024-25', '2025-26'];
