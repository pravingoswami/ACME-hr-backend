export type EmployeeSeedStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

export interface EmployeeSeedData {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
  salary: number;
  status: EmployeeSeedStatus;
}

export const SAMPLE_EMPLOYEES: EmployeeSeedData[] = [
  { employeeCode: "EMP001", firstName: "James", lastName: "Wilson", email: "james.wilson@acme.com", phone: "+1-555-0101", department: "Engineering", position: "Senior Software Engineer", hireDate: "2021-03-15", salary: 95000, status: "ACTIVE" },
  { employeeCode: "EMP002", firstName: "Sarah", lastName: "Chen", email: "sarah.chen@acme.com", phone: "+1-555-0102", department: "Engineering", position: "Frontend Developer", hireDate: "2022-06-01", salary: 82000, status: "ACTIVE" },
  { employeeCode: "EMP003", firstName: "Michael", lastName: "Brown", email: "michael.brown@acme.com", phone: "+1-555-0103", department: "Engineering", position: "Backend Developer", hireDate: "2022-08-20", salary: 85000, status: "ACTIVE" },
  { employeeCode: "EMP004", firstName: "Emily", lastName: "Davis", email: "emily.davis@acme.com", phone: "+1-555-0104", department: "Engineering", position: "DevOps Engineer", hireDate: "2020-11-10", salary: 98000, status: "ACTIVE" },
  { employeeCode: "EMP005", firstName: "David", lastName: "Martinez", email: "david.martinez@acme.com", phone: "+1-555-0105", department: "Engineering", position: "QA Engineer", hireDate: "2023-01-15", salary: 72000, status: "ACTIVE" },
  { employeeCode: "EMP006", firstName: "Lisa", lastName: "Anderson", email: "lisa.anderson@acme.com", phone: "+1-555-0106", department: "Human Resources", position: "HR Specialist", hireDate: "2019-05-20", salary: 68000, status: "ACTIVE" },
  { employeeCode: "EMP007", firstName: "Robert", lastName: "Taylor", email: "robert.taylor@acme.com", phone: "+1-555-0107", department: "Human Resources", position: "Recruiter", hireDate: "2021-09-01", salary: 65000, status: "ACTIVE" },
  { employeeCode: "EMP008", firstName: "Jennifer", lastName: "Thomas", email: "jennifer.thomas@acme.com", phone: "+1-555-0108", department: "Finance", position: "Financial Analyst", hireDate: "2020-02-14", salary: 78000, status: "ACTIVE" },
  { employeeCode: "EMP009", firstName: "William", lastName: "Jackson", email: "william.jackson@acme.com", phone: "+1-555-0109", department: "Finance", position: "Accountant", hireDate: "2018-07-30", salary: 75000, status: "ACTIVE" },
  { employeeCode: "EMP010", firstName: "Amanda", lastName: "White", email: "amanda.white@acme.com", phone: "+1-555-0110", department: "Finance", position: "Payroll Manager", hireDate: "2017-04-12", salary: 88000, status: "ACTIVE" },
  { employeeCode: "EMP011", firstName: "Christopher", lastName: "Harris", email: "christopher.harris@acme.com", phone: "+1-555-0111", department: "Marketing", position: "Marketing Manager", hireDate: "2019-10-05", salary: 92000, status: "ACTIVE" },
  { employeeCode: "EMP012", firstName: "Jessica", lastName: "Clark", email: "jessica.clark@acme.com", phone: "+1-555-0112", department: "Marketing", position: "Content Strategist", hireDate: "2022-03-22", salary: 70000, status: "ACTIVE" },
  { employeeCode: "EMP013", firstName: "Daniel", lastName: "Lewis", email: "daniel.lewis@acme.com", phone: "+1-555-0113", department: "Marketing", position: "Social Media Specialist", hireDate: "2023-06-10", salary: 58000, status: "ACTIVE" },
  { employeeCode: "EMP014", firstName: "Ashley", lastName: "Walker", email: "ashley.walker@acme.com", phone: "+1-555-0114", department: "Sales", position: "Sales Manager", hireDate: "2018-01-08", salary: 95000, status: "ACTIVE" },
  { employeeCode: "EMP015", firstName: "Matthew", lastName: "Hall", email: "matthew.hall@acme.com", phone: "+1-555-0115", department: "Sales", position: "Account Executive", hireDate: "2021-11-15", salary: 72000, status: "ACTIVE" },
  { employeeCode: "EMP016", firstName: "Nicole", lastName: "Allen", email: "nicole.allen@acme.com", phone: "+1-555-0116", department: "Sales", position: "Business Development Rep", hireDate: "2023-02-28", salary: 62000, status: "ACTIVE" },
  { employeeCode: "EMP017", firstName: "Andrew", lastName: "Young", email: "andrew.young@acme.com", phone: "+1-555-0117", department: "Operations", position: "Operations Manager", hireDate: "2016-09-20", salary: 90000, status: "ACTIVE" },
  { employeeCode: "EMP018", firstName: "Stephanie", lastName: "King", email: "stephanie.king@acme.com", phone: "+1-555-0118", department: "Operations", position: "Logistics Coordinator", hireDate: "2020-12-01", salary: 58000, status: "ACTIVE" },
  { employeeCode: "EMP019", firstName: "Joshua", lastName: "Wright", email: "joshua.wright@acme.com", phone: "+1-555-0119", department: "IT", position: "IT Support Specialist", hireDate: "2022-05-18", salary: 60000, status: "ACTIVE" },
  { employeeCode: "EMP020", firstName: "Melissa", lastName: "Lopez", email: "melissa.lopez@acme.com", phone: "+1-555-0120", department: "IT", position: "Systems Administrator", hireDate: "2019-08-25", salary: 82000, status: "ACTIVE" },
  { employeeCode: "EMP021", firstName: "Ryan", lastName: "Hill", email: "ryan.hill@acme.com", phone: "+1-555-0121", department: "Legal", position: "Legal Counsel", hireDate: "2017-06-14", salary: 110000, status: "ACTIVE" },
  { employeeCode: "EMP022", firstName: "Laura", lastName: "Scott", email: "laura.scott@acme.com", phone: "+1-555-0122", department: "Legal", position: "Compliance Officer", hireDate: "2021-04-07", salary: 85000, status: "ACTIVE" },
  { employeeCode: "EMP023", firstName: "Kevin", lastName: "Green", email: "kevin.green@acme.com", phone: "+1-555-0123", department: "Engineering", position: "Tech Lead", hireDate: "2018-03-01", salary: 115000, status: "ACTIVE" },
  { employeeCode: "EMP024", firstName: "Rachel", lastName: "Adams", email: "rachel.adams@acme.com", phone: "+1-555-0124", department: "Human Resources", position: "Training Coordinator", hireDate: "2022-10-12", salary: 62000, status: "ON_LEAVE" },
  { employeeCode: "EMP025", firstName: "Brian", lastName: "Nelson", email: "brian.nelson@acme.com", phone: "+1-555-0125", department: "Operations", position: "Facilities Manager", hireDate: "2015-11-30", salary: 78000, status: "INACTIVE" },
];
