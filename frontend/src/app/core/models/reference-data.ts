/**
 * Static reference data used by forms and content sections.
 * These are option lists, not claims about where the company has placed workers.
 */

export const DESTINATION_COUNTRIES = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Oman',
  'Bahrain',
  'Malaysia',
  'Singapore',
  'Jordan',
  'Romania',
  'Poland',
  'Croatia',
  'Japan',
  'Other',
];

export const INDUSTRIES = [
  'Construction',
  'Oil, Gas & Energy',
  'Manufacturing & Industrial',
  'Hospitality & Catering',
  'Healthcare',
  'Logistics & Warehousing',
  'Facility Management',
  'Engineering & Technical',
  'Retail',
  'Agriculture',
  'Other',
];

export const JOB_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Welder / Fabricator',
  'Mason',
  'Carpenter',
  'Steel Fixer',
  'Painter',
  'HVAC Technician',
  'Mechanic / Fitter',
  'Machine Operator',
  'Heavy Equipment Operator',
  'Driver',
  'Cook / Chef',
  'Waiter / Steward',
  'Housekeeping / Cleaner',
  'Security Guard',
  'Warehouse / Storekeeper',
  'Helper / General Labour',
  'Nursing Assistant / Caregiver',
  'Engineer',
  'Supervisor / Foreman',
  'Office / Administration',
  'Other',
];

export const QUALIFICATIONS = [
  'Below 10th',
  '10th Pass',
  '12th Pass',
  'ITI',
  'Diploma',
  'Graduate',
  'Post Graduate',
  'B.Tech / B.E.',
  'Nursing (ANM / GNM / B.Sc)',
  'Other',
];

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full time',
  contract: 'Contract',
  part_time: 'Part time',
};

export interface ServiceInfo {
  slug: string;
  title: string;
  image: string;
  summary: string;
  body: string;
  roles: string[];
}

export const SERVICES: ServiceInfo[] = [
  {
    slug: 'overseas-manpower-recruitment',
    title: 'Overseas Manpower Recruitment',
    image: 'service-overseas',
    summary: 'Sourcing and screening workers from India for employers abroad, from a single position to bulk requirements.',
    body: 'We take a requirement from the employer — trade, numbers, experience, salary and terms — and run sourcing and screening against it. Shortlisted candidates are presented with their documents and experience details so the employer can interview with confidence.',
    roles: ['Requirement analysis', 'Candidate sourcing', 'Document screening', 'Interview coordination'],
  },
  {
    slug: 'skilled-and-unskilled-manpower',
    title: 'Skilled and Unskilled Manpower',
    image: 'service-skilled',
    summary: 'Tradespeople, technicians, helpers and general workers for projects of every size.',
    body: 'From certified tradespeople to general helpers, we source workers whose experience matches the job. Skilled candidates are asked to show proof of experience and, where the employer requires it, take a practical assessment.',
    roles: ['Electricians', 'Plumbers', 'Welders', 'Masons', 'Helpers', 'Cleaners', 'Loaders'],
  },
  {
    slug: 'industrial-workforce',
    title: 'Industrial Workforce',
    image: 'service-industrial',
    summary: 'Operators, fitters and production staff for factories, plants and warehouses.',
    body: 'Industrial employers need workers who understand shift work, safety rules and machine discipline. We screen for relevant plant or factory experience and brief candidates on the working conditions before interviews.',
    roles: ['Machine operators', 'Mechanical fitters', 'Production workers', 'Storekeepers', 'Forklift operators'],
  },
  {
    slug: 'construction-manpower',
    title: 'Construction Manpower',
    image: 'service-construction',
    summary: 'Site trades and supervisors for building, infrastructure and finishing works.',
    body: 'Construction projects run on schedules, so dependable site workers matter. We source experienced trades for structure and finishing works and can coordinate trade tests at a location agreed with the employer.',
    roles: ['Masons', 'Carpenters', 'Steel fixers', 'Shuttering carpenters', 'Painters', 'Scaffolders', 'Foremen'],
  },
  {
    slug: 'hospitality-recruitment',
    title: 'Hospitality Recruitment',
    image: 'service-hospitality',
    summary: 'Kitchen, service and housekeeping staff for hotels, restaurants and catering companies.',
    body: 'Hospitality roles depend on presentation and attitude as much as skill. We screen for relevant hotel or restaurant experience and basic communication skills, and share candidate profiles that reflect both.',
    roles: ['Cooks', 'Kitchen helpers', 'Waiters', 'Housekeeping staff', 'Laundry staff', 'Drivers'],
  },
  {
    slug: 'healthcare-recruitment',
    title: 'Healthcare Recruitment',
    image: 'service-healthcare',
    summary: 'Support staff for hospitals, clinics and care facilities.',
    body: 'Healthcare employers require verified qualifications. We collect and check certificates and experience letters before a profile is shared. Licensed professional roles are shortlisted only when the candidate holds the registration the destination country requires.',
    roles: ['Nursing assistants', 'Caregivers', 'Ward helpers', 'Patient care staff', 'Lab assistants'],
  },
  {
    slug: 'technical-and-engineering-recruitment',
    title: 'Technical and Engineering Recruitment',
    image: 'service-technical',
    summary: 'Engineers, supervisors and technicians for projects, maintenance and operations.',
    body: 'For technical roles we look closely at qualifications, project history and tools used. Profiles are prepared with the details engineering managers need to make a shortlist quickly.',
    roles: ['Site engineers', 'Supervisors', 'HVAC technicians', 'Electrical technicians', 'QA/QC inspectors', 'Draughtsmen'],
  },
  {
    slug: 'employer-recruitment-support',
    title: 'Employer Recruitment Support',
    image: 'service-employer',
    summary: 'A single point of contact for your hiring — from the first requirement to candidate joining.',
    body: 'Employers get one contact who understands the requirement and keeps them informed. We maintain a record of every candidate presented, interviewed and selected, and follow up with selected candidates until they join.',
    roles: ['Interview scheduling', 'Shortlist reports', 'Selection follow-up', 'Documentation coordination', 'Joining follow-up'],
  },
];

export const SECTORS = [
  { name: 'Construction & Infrastructure', note: 'Site trades, finishing works, supervisors' },
  { name: 'Oil, Gas & Energy', note: 'Technicians, fitters, maintenance crews' },
  { name: 'Manufacturing', note: 'Operators, production and quality staff' },
  { name: 'Hospitality & Catering', note: 'Kitchen, service and housekeeping' },
  { name: 'Healthcare', note: 'Care and patient support staff' },
  { name: 'Logistics & Warehousing', note: 'Drivers, storekeepers, loaders' },
  { name: 'Facility Management', note: 'Cleaning, maintenance, security' },
  { name: 'Engineering Services', note: 'Engineers, MEP technicians, draughtsmen' },
];

export const PROCESS_STEPS = [
  { title: 'Requirement', text: 'The employer shares the trades, numbers, experience, salary and terms required.' },
  { title: 'Sourcing', text: 'We advertise the vacancy and search our candidate database and local network.' },
  { title: 'Screening', text: 'Experience, documents and suitability are checked before a profile is shortlisted.' },
  { title: 'Interview & assessment', text: 'Interviews and trade tests are arranged in person or online with the employer.' },
  { title: 'Selection & documentation', text: 'Selected candidates are guided through offer acceptance and the paperwork required.' },
  { title: 'Joining & follow-up', text: 'We stay in touch with the candidate and employer until the worker has joined.' },
];

export const WHY_CHOOSE_US = [
  { title: 'Requirement-first approach', text: 'Sourcing starts only after we understand the job, the site and the terms in detail.' },
  { title: 'Screened profiles', text: 'Experience and documents are checked before a candidate is presented to an employer.' },
  { title: 'Honest communication', text: 'Candidates are told plainly about the role, salary and conditions before they commit.' },
  { title: 'Single point of contact', text: 'Employers and candidates deal with one responsible person throughout the process.' },
  { title: 'Strong local network', text: 'Rooted in Gorakhpur, with access to skilled workers across Eastern Uttar Pradesh.' },
  { title: 'Registered business', text: 'A registered establishment in Uttar Pradesh with a physical office you can visit.' },
];
