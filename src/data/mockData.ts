import { Employee, DepartmentNode, KnowledgeArticle, CompanyEvent, OffboardingRecord, Announcement, NotificationItem, User } from '../types/workhub';

export const INITIAL_CURRENT_USER: User = {
  id: 'emp-001',
  name: 'John Doe',
  email: 'john.doe@workhub.internal',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'employee',
  jobTitle: 'Software Engineer',
  department: 'Engineering',
  team: 'Backend',
  managerName: 'John Smith',
  managerEmail: 'john.smith@workhub.internal',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA (HQ)',
  joinDate: '15 Jan 2023'
};

export const DEMO_USERS: User[] = [
  INITIAL_CURRENT_USER,
  {
    id: 'emp-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@workhub.internal',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'manager',
    jobTitle: 'Product Manager',
    department: 'Product',
    team: 'Core Platform',
    phone: '+1 (555) 345-6789',
    location: 'San Francisco, CA (HQ)',
    joinDate: '10 Mar 2022'
  },
  {
    id: 'emp-006',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@workhub.internal',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    jobTitle: 'Head of People & HR',
    department: 'HR',
    team: 'People Operations',
    phone: '+1 (555) 890-1234',
    location: 'San Francisco, CA (HQ)',
    joinDate: '01 Nov 2021'
  }
];

export const EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    name: 'John Doe',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    team: 'Backend',
    email: 'john.doe@workhub.internal',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    skills: ['Python', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL'],
    projects: ['Payment Platform', 'User Service API'],
    manager: 'John Smith',
    location: 'San Francisco, CA (HQ)',
    bio: 'Software engineer focusing on resilient distributed backend systems and asynchronous event streaming.',
    status: 'offboarding'
  },
  {
    id: 'emp-003',
    name: 'Arun Kumar',
    jobTitle: 'Senior Backend Engineer',
    department: 'Engineering',
    team: 'Backend Team',
    email: 'arun.kumar@workhub.internal',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skills: ['Python', 'AWS', 'Go', 'Redis', 'Microservices', 'FastAPI'],
    projects: ['Payment Platform', 'Payment API Gateway', 'Subscription Engine'],
    manager: 'John Smith',
    location: 'Austin, TX',
    bio: 'Lead architect for the company Payment Platform and Payment API integrations. Over 7 years scaling financial processing gateways.',
    status: 'active'
  },
  {
    id: 'emp-002',
    name: 'Priya Sharma',
    jobTitle: 'Product Manager',
    department: 'Product',
    team: 'Core Platform',
    email: 'priya.sharma@workhub.internal',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    skills: ['Product', 'Core Platform', 'Strategy', 'Roadmapping', 'Agile', 'Data Analysis'],
    projects: ['Core Platform', 'Developer Experience Portal', 'Billing Modernization'],
    manager: 'David Vance',
    location: 'San Francisco, CA (HQ)',
    bio: 'Passionate product lead bridging engineering feasibility and customer success across our multi-tenant SaaS foundation.',
    status: 'active'
  },
  {
    id: 'emp-004',
    name: 'Rahul Mehta',
    jobTitle: 'DevOps Engineer',
    department: 'Engineering',
    team: 'DevOps',
    email: 'rahul.mehta@workhub.internal',
    phone: '+1 (555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    skills: ['DevOps', 'Infrastructure', 'AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    projects: ['Cloud Infrastructure Modernization', 'Zero Trust VPN', 'Observability Stack'],
    manager: 'Elena Rostova',
    location: 'Seattle, WA',
    bio: 'Kubernetes specialist ensuring 99.99% uptime, automated failover pipelines, and zero-downtime blue/green rollouts.',
    status: 'active'
  },
  {
    id: 'emp-005',
    name: 'Sneha Iyer',
    jobTitle: 'ML Engineer',
    department: 'Engineering',
    team: 'AI/ML',
    email: 'sneha.iyer@workhub.internal',
    phone: '+1 (555) 678-9012',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd26cb9?w=150&auto=format&fit=crop&q=80',
    skills: ['AI/ML', 'Recommendation', 'Python', 'Machine Learning', 'PyTorch', 'Vector DB'],
    projects: ['Internal Search RAG', 'Customer Recommendation Pipeline', 'Fraud Detection'],
    manager: 'Elena Rostova',
    location: 'New York, NY',
    bio: 'Machine Learning specialist building our semantic search infrastructure, enterprise embeddings, and neural rankers.',
    status: 'active'
  },
  {
    id: 'emp-007',
    name: 'John Smith',
    jobTitle: 'Engineering Director',
    department: 'Engineering',
    team: 'Backend',
    email: 'john.smith@workhub.internal',
    phone: '+1 (555) 789-0123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    skills: ['Leadership', 'System Design', 'Backend Architecture', 'Mentorship'],
    projects: ['Payment Platform', 'Platform Reliability'],
    manager: 'David Vance',
    location: 'San Francisco, CA (HQ)',
    bio: 'Engineering Director overseeing Core Backend and Payment Platform teams.',
    status: 'active'
  },
  {
    id: 'emp-006',
    name: 'Sarah Jenkins',
    jobTitle: 'Head of People & HR',
    department: 'HR',
    team: 'Employee Relations',
    email: 'sarah.jenkins@workhub.internal',
    phone: '+1 (555) 890-1234',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    skills: ['People Ops', 'Talent Strategy', 'Employee Experience', 'Compliance'],
    projects: ['Hybrid Work Policy 2026', 'Global Onboarding Refresh'],
    manager: 'CEO Office',
    location: 'San Francisco, CA (HQ)',
    bio: 'Leading people experience, career development, culture programs, and offboarding transitions.',
    status: 'active'
  },
  {
    id: 'emp-008',
    name: 'Alex Chen',
    jobTitle: 'Frontend Architect',
    department: 'Engineering',
    team: 'Frontend',
    email: 'alex.chen@workhub.internal',
    phone: '+1 (555) 901-2345',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Design Systems', 'Next.js', 'Tailwind CSS'],
    projects: ['Design System 2.0', 'WorkHub Web Client'],
    manager: 'John Smith',
    location: 'San Francisco, CA (HQ)',
    bio: 'Crafting pixel-perfect design systems, web performance, and accessible web experiences.',
    status: 'active'
  }
];

export const DEPARTMENTS_STRUCTURE: DepartmentNode[] = [
  {
    id: 'dept-eng',
    name: 'Engineering',
    memberCount: 65,
    color: 'blue',
    subteams: [
      {
        id: 'team-frontend',
        name: 'Frontend',
        memberCount: 12,
        lead: 'Alex Chen',
        description: 'Builds modern, accessible web interfaces and design systems.',
        responsibilities: ['Web App Development', 'Design System Maintenance', 'Performance Optimization'],
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'State Management'],
        projects: ['WorkHub Web Client', 'Design System 2.0', 'Customer Portal']
      },
      {
        id: 'team-backend',
        name: 'Backend',
        memberCount: 18,
        lead: 'John Smith',
        description: 'Scales high-throughput APIs, distributed services, and databases.',
        responsibilities: ['Payment API', 'Auth & Identity Service', 'Database Scalability'],
        skills: ['Python', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka'],
        projects: ['Payment Platform', 'User Service API', 'Event Bus']
      },
      {
        id: 'team-aiml',
        name: 'AI/ML',
        memberCount: 15,
        lead: 'Sneha Iyer',
        description: 'Develops LLM applications, RAG pipelines, and recommendation algorithms.',
        responsibilities: ['Enterprise RAG Engine', 'Search Embeddings', 'Model Governance'],
        skills: ['Python', 'PyTorch', 'Vector DB', 'Prompt Engineering', 'FastAPI'],
        projects: ['Company Assistant RAG', 'Intelligent Search', 'Ticket Auto-triaging']
      },
      {
        id: 'team-devops',
        name: 'DevOps',
        memberCount: 12,
        lead: 'Elena Rostova',
        description: 'Maintains cloud infrastructure, CI/CD pipelines, and security compliance.',
        responsibilities: ['Kubernetes Clusters', 'Cloud Security', 'Observability & Metrics'],
        skills: ['AWS', 'Kubernetes', 'Terraform', 'Datadog', 'GitHub Actions'],
        projects: ['Zero Trust VPN', 'Cloud Infrastructure Modernization', 'SOC-2 Compliance']
      },
      {
        id: 'team-qa',
        name: 'QA',
        memberCount: 8,
        lead: 'Carlos Silva',
        description: 'Guarantees product quality through end-to-end testing and performance audits.',
        responsibilities: ['E2E Automated Suites', 'Regression Testing', 'Release Certification'],
        skills: ['Playwright', 'Jest', 'Load Testing', 'TestRail'],
        projects: ['Automated Release Gates', 'Mobile Test Matrix']
      }
    ]
  },
  {
    id: 'dept-prod',
    name: 'Product',
    memberCount: 60,
    color: 'emerald',
    subteams: [
      {
        id: 'team-pm',
        name: 'Product Management',
        memberCount: 12,
        lead: 'Priya Sharma',
        description: 'Defines product vision, feature roadmaps, and cross-functional alignment.',
        responsibilities: ['Roadmap Definition', 'User Research Analysis', 'KPI Tracking'],
        skills: ['Product Strategy', 'Roadmapping', 'Agile Scrum', 'Analytics'],
        projects: ['Core Platform', 'Billing Modernization']
      },
      {
        id: 'team-pdesign',
        name: 'Product Design',
        memberCount: 12,
        lead: 'Maya Patel',
        description: 'Creates user journeys, interactive wireframes, and design specs.',
        responsibilities: ['Figma Libraries', 'User Testing', 'Accessibility Audits'],
        skills: ['Figma', 'Prototyping', 'Design Systems', 'UX Research'],
        projects: ['Mobile WorkHub App', 'Dashboard Redesign']
      },
      {
        id: 'team-analytics',
        name: 'Business Analytics',
        memberCount: 10,
        lead: 'Liam Foster',
        description: 'Extracts actionable data intelligence to guide executive decision-making.',
        responsibilities: ['Company Dashboards', 'Funnel Optimization', 'Revenue Forecasting'],
        skills: ['SQL', 'Tableau', 'dbt', 'Python'],
        projects: ['Executive Pulse', 'Customer Churn Predictor']
      },
      {
        id: 'team-data',
        name: 'Data',
        memberCount: 8,
        lead: 'Rachel Green',
        description: 'Builds data pipelines, warehousing, and ETL transformation jobs.',
        responsibilities: ['Data Warehouse', 'ETL Pipelines', 'Data Quality SLAs'],
        skills: ['Snowflake', 'Airflow', 'dbt', 'Postgres'],
        projects: ['Central Data Lakehouse', 'Event Ingestion']
      }
    ]
  },
  {
    id: 'dept-design',
    name: 'Design',
    memberCount: 20,
    color: 'rose',
    subteams: [
      {
        id: 'team-uiux',
        name: 'UI/UX',
        memberCount: 12,
        lead: 'Maya Patel',
        description: 'Focused on UI design, micro-interactions, and visual harmony.',
        responsibilities: ['Interface Design', 'Component Tokens', 'Design Critiques'],
        skills: ['Figma', 'UI Animation', 'Design Tokens', 'Web Usability'],
        projects: ['Design Tokens 2.0', 'Accessible Contrast Audit']
      },
      {
        id: 'team-creative',
        name: 'Creative',
        memberCount: 8,
        lead: 'Julian Moore',
        description: 'Brand identity, marketing collateral, illustrations, and 3D imagery.',
        responsibilities: ['Brand Guidelines', 'Marketing Illustrations', 'Video Motion'],
        skills: ['Illustrator', 'After Effects', 'Blender', 'Generative AI'],
        projects: ['Company Rebrand 2026', 'Marketing Launchpad']
      }
    ]
  },
  {
    id: 'dept-marketing',
    name: 'Marketing',
    memberCount: 18,
    color: 'amber',
    subteams: [
      {
        id: 'team-content',
        name: 'Content',
        memberCount: 8,
        lead: 'Emily Watson',
        description: 'Technical blog articles, newsletters, product documentation, and PR.',
        responsibilities: ['Company Blog', 'Product Case Studies', 'Social Media'],
        skills: ['Technical Writing', 'SEO', 'Editorial Strategy'],
        projects: ['Tech Blog Re-launch', 'Quarterly Customer Stories']
      },
      {
        id: 'team-growth',
        name: 'Growth',
        memberCount: 10,
        lead: 'Marcus Vance',
        description: 'Acquisition funnels, user retention campaigns, and paid performance.',
        responsibilities: ['Campaign Management', 'A/B Testing', 'Lead Generation'],
        skills: ['Performance Marketing', 'SEO/SEM', 'Google Ads', 'HubSpot'],
        projects: ['Global Expansion Campaign', 'Self-Serve Onboarding Funnel']
      }
    ]
  },
  {
    id: 'dept-hr',
    name: 'HR',
    memberCount: 12,
    color: 'purple',
    subteams: [
      {
        id: 'team-recruitment',
        name: 'Recruitment',
        memberCount: 6,
        lead: 'Sarah Jenkins',
        description: 'Talent acquisition, candidate interviews, campus outreach, and offers.',
        responsibilities: ['Engineering Sourcing', 'Candidate Experience', 'Diversity Hiring'],
        skills: ['Talent Sourcing', 'Interview Coordination', 'Lever/Greenhouse'],
        projects: ['2026 Engineering Hiring Sprint', 'Internship Cohort']
      },
      {
        id: 'team-emprel',
        name: 'Employee Relations',
        memberCount: 6,
        lead: 'Amanda Miller',
        description: 'Workplace culture, employee benefits, wellness programs, and offboarding.',
        responsibilities: ['Offboarding Support', 'Health Benefits', 'Culture Workshops'],
        skills: ['People Operations', 'Conflict Resolution', 'Benefits Admin'],
        projects: ['Offboarding Flow 2.0', 'Wellness Benefit Stipend']
      }
    ]
  }
];

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art-001',
    title: 'Employee Handbook',
    category: 'Company Policies',
    summary: 'Essential company policies, code of conduct, core values, working hours, and operational guidelines.',
    updatedAt: 'Updated 2 weeks ago',
    author: 'Sarah Jenkins (Head of People)',
    readTime: '8 min read',
    tags: ['policies', 'handbook', 'culture', 'standards'],
    accessLevel: 'all',
    content: `# WorkHub Employee Handbook

Welcome to WorkHub! This handbook summarizes our culture, policies, working guidelines, and benefits.

## 1. Our Mission & Values
- **Transparency & Trust**: We communicate openly and document everything asynchronously.
- **Customer First**: Every engineering decision and product design solves real customer pain.
- **Continuous Learning**: We encourage experimentation, knowledge sharing, and peer mentoring.

## 2. Working Hours & Flexibility
Standard core collaboration hours are between **9:00 AM and 6:00 PM** in your regional time zone. We value results and deliverables over rigid seat time.

## 3. Communication Channels
- **Slack / Teams**: For day-to-day real-time chat and urgent notifications.
- **WorkHub Knowledge Base**: Single source of truth for technical architecture, PRDs, and policies.
- **Company Standups**: Asynchronous updates through WorkHub daily notes.`
  },
  {
    id: 'art-002',
    title: 'Work From Home & Hybrid Policy',
    category: 'Company Policies',
    summary: 'Our company follows a hybrid work policy with 3 days in office and 2 days remote.',
    updatedAt: 'Updated 3 weeks ago',
    author: 'Sarah Jenkins (Head of People)',
    readTime: '4 min read',
    tags: ['wfh', 'hybrid', 'office', 'remote'],
    accessLevel: 'all',
    content: `# Work From Home & Hybrid Policy

Our company follows a balanced hybrid work policy:

- **3 days work from office** (Monday, Tuesday, Thursday)
- **2 days work from home** (Wednesday, Friday)
- **Flexible timing** between 9:00 AM – 6:00 PM
- **Home Office Stipend**: Every full-time employee receives an annual $750 tech and ergonomic stipend for home setup.
- **Applying for WFH Changes**: Requests for full-time remote or changing days must be submitted through WorkHub HR Portal and approved by your manager.`
  },
  {
    id: 'art-003',
    title: 'Leave Policy',
    category: 'Company Policies',
    summary: 'Comprehensive information regarding paid time off, sick leave, parental leave, and public holidays.',
    updatedAt: 'Updated 1 month ago',
    author: 'Amanda Miller (HR)',
    readTime: '5 min read',
    tags: ['leave', 'vacation', 'sick leave', 'holidays'],
    accessLevel: 'all',
    content: `# Leave & Paid Time Off Policy

We encourage every employee to take regular rest to maintain healthy work-life balance.

## Leave Allocations
1. **Annual Paid Time Off (PTO)**: 24 days per calendar year, accrued monthly.
2. **Casual & Sick Leave**: 12 days per year for illness, medical appointments, or family emergencies.
3. **Parental Leave**: 16 weeks fully paid leave for primary caregivers; 6 weeks for secondary caregivers.
4. **Public Holidays**: 12 designated company holidays per year.

## Submitting a Leave Request
- Navigate to **WorkHub Dashboard -> Quick Links -> HR Portal -> Leave Request**.
- Give at least 5 business days notice for planned leaves exceeding 3 days.`
  },
  {
    id: 'art-004',
    title: 'Code Review Process',
    category: 'Processes',
    summary: 'Best practices for pull requests, automated linting, CI security gates, and constructive peer reviews.',
    updatedAt: 'Updated 3 weeks ago',
    author: 'Alex Chen (Frontend Architect)',
    readTime: '6 min read',
    tags: ['engineering', 'github', 'code-review', 'best-practices'],
    accessLevel: 'all',
    content: `# Code Review & Pull Request Guidelines

Maintaining high code quality and psychological safety across all software teams.

## Pull Request Checklist
1. **Clear Description**: Describe *Why* this change was made, link the JIRA/Linear ticket, and include before/after screenshots for UI updates.
2. **Small Scope**: PRs should ideally be under 400 lines of changed code for fast, comprehensive review.
3. **Automated Tests**: Every new endpoint or feature requires corresponding unit and integration tests.
4. **Approvals**: At least one senior peer review approval is required before merging to \`main\`.`
  },
  {
    id: 'art-005',
    title: 'Payment Platform Documentation',
    category: 'Project Documentation',
    summary: 'Technical architecture, API specifications, and service ownership for the Payment API and checkout pipeline.',
    updatedAt: 'Updated 1 week ago',
    author: 'Arun Kumar (Senior Backend Engineer)',
    readTime: '10 min read',
    tags: ['payment-api', 'backend', 'architecture', 'stripe'],
    accessLevel: 'all',
    content: `# Payment Platform Technical Overview

The Payment Platform is the core transactional backbone of WorkHub services.

## Service Ownership
- **Primary Owner**: **Arun Kumar** (Senior Backend Engineer, Backend Team)
- **Secondary Owner**: **John Doe** (Software Engineer, Backend Team)
- **Engineering Lead**: **John Smith** (Engineering Director)

## Architecture
The system consists of:
1. **Payment API Gateway**: Built with FastAPI and Go, handling idempotency, rate limiting, and tokenization.
2. **Provider Connectors**: Stripe, Adyen, and PayPal webhooks with automatic retries via SQS queues.
3. **Ledger Service**: Immutable PostgreSQL double-entry bookkeeping ledger for audit compliance.

## Sandbox & Staging Testing
Use test API keys located in the 1Password Engineering vault under \`Payment-API-Dev-Keys\`.`
  },
  {
    id: 'art-006',
    title: 'IT Support & Hardware Access',
    category: 'Tools & Resources',
    summary: 'How to request software licenses, VPN credentials, hardware replacements, and report incidents.',
    updatedAt: 'Updated 1 month ago',
    author: 'IT Helpdesk',
    readTime: '3 min read',
    tags: ['it-support', 'hardware', 'vpn', 'credentials'],
    accessLevel: 'all',
    content: `# IT Support & Hardware Access

Need assistance with your workstation, VPN, or developer tools?

- **Helpdesk Email**: itsupport@workhub.internal
- **Slack Channel**: #it-support-helpdesk
- **Laptop Replacement**: Standard refresh cycle is 24 months. For broken screens or battery issues, raise a ticket via WorkHub Quick Links -> IT Support.`
  }
];

export const UPCOMING_EVENTS: CompanyEvent[] = [
  {
    id: 'evt-001',
    title: 'Team Standup',
    date: '2026-08-12',
    displayDate: { month: 'AUG', day: '12' },
    time: '10:00 AM – 10:30 AM',
    team: 'Engineering Team',
    type: 'Team Meeting',
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/hub-eng-sync',
    participants: ['John Doe', 'Arun Kumar', 'Rahul Mehta', 'Alex Chen', 'John Smith'],
    description: 'Daily asynchronous blocker clearing, release updates, and sprint progress check.',
    isUserAttending: true
  },
  {
    id: 'evt-002',
    title: '1:1 with Manager',
    date: '2026-08-12',
    displayDate: { month: 'AUG', day: '12' },
    time: '12:00 PM – 12:30 PM',
    team: 'Engineering Management',
    type: '1:1',
    location: 'Zoom Room 402 / Online',
    meetingLink: 'https://zoom.us/j/987654321',
    participants: ['John Doe', 'John Smith'],
    description: 'Bi-weekly 1:1 to discuss sprint priorities, career growth, and offboarding transition.',
    isUserAttending: true
  },
  {
    id: 'evt-003',
    title: 'Product Demo',
    date: '2026-08-12',
    displayDate: { month: 'AUG', day: '12' },
    time: '02:00 PM – 03:00 PM',
    team: 'Payment Platform',
    type: 'Project Meeting',
    location: 'Auditorium A & Stream',
    meetingLink: 'https://meet.google.com/hub-demo-pay',
    participants: ['Arun Kumar', 'Priya Sharma', 'John Doe', 'Sneha Iyer'],
    description: 'Live demonstration of the new Payment API idempotency engine and developer dashboard.',
    isUserAttending: true
  },
  {
    id: 'evt-004',
    title: 'New Joiner Orientation',
    date: '2026-08-14',
    displayDate: { month: 'AUG', day: '14' },
    time: '11:00 AM – 12:00 PM',
    team: 'HR Team',
    type: 'Orientation',
    location: 'Training Room B / Remote',
    meetingLink: 'https://meet.google.com/hub-hr-welcome',
    participants: ['Sarah Jenkins', 'Amanda Miller', 'New Joiners'],
    description: 'Introduction to company culture, tool access, team intros, and benefit enrollment.',
    isUserAttending: false
  },
  {
    id: 'evt-005',
    title: 'Q3 All Hands',
    date: '2026-08-20',
    displayDate: { month: 'AUG', day: '20' },
    time: '03:00 PM – 04:00 PM',
    team: 'Company Event',
    type: 'Company Event',
    location: 'Global Virtual Stream',
    meetingLink: 'https://meet.google.com/hub-q3-allhands',
    participants: ['All 250+ Employees'],
    description: 'Quarterly company review, revenue roadmap, product milestones, and open AMA with leadership.',
    isUserAttending: true
  }
];

export const INITIAL_OFFBOARDING: OffboardingRecord = {
  id: 'off-001',
  employeeId: 'emp-001',
  employeeName: 'John Doe',
  employeeRole: 'Software Engineer',
  lastWorkingDay: '30 Sep 2026',
  managerName: 'John Smith',
  managerEmail: 'john.smith@workhub.internal',
  hrContact: 'hr@company.com',
  progressPercent: 60,
  notes: 'Knowledge transfer in progress with Arun Kumar on Payment API documentation.',
  status: 'in_progress',
  tasks: [
    {
      id: 'task-1',
      title: 'Submit resignation',
      description: 'Formal resignation submitted through HR portal and acknowledged by manager.',
      status: 'completed',
      dueDate: '2026-08-05',
      completedDate: 'Completed on 05 Aug 2024',
      assignedRole: 'employee'
    },
    {
      id: 'task-2',
      title: 'Complete exit interview',
      description: '1:1 exit survey and discussion with HR Director Sarah Jenkins.',
      status: 'completed',
      dueDate: '2026-08-08',
      completedDate: 'Completed on 08 Aug 2024',
      assignedRole: 'hr'
    },
    {
      id: 'task-3',
      title: 'Knowledge transfer',
      description: 'Document architecture, handover ongoing PRs, and record Loom walkthroughs.',
      status: 'completed',
      dueDate: '2026-08-10',
      completedDate: 'Completed on 10 Aug 2024',
      assignedRole: 'employee',
      handoverDetails: 'Recorded 3 Loom walkthroughs for Payment Platform idempotency and shared architecture diagrams.'
    },
    {
      id: 'task-4',
      title: 'Project handover',
      description: 'Confirm handover of repository admin permissions and pending feature ownership with manager.',
      status: 'pending',
      dueDate: '2026-09-18',
      assignedRole: 'manager'
    },
    {
      id: 'task-5',
      title: 'Return company assets',
      description: 'Return Apple MacBook Pro M2, YubiKey, building access security card, and company monitors.',
      status: 'pending',
      dueDate: '2026-09-22',
      assignedRole: 'employee'
    },
    {
      id: 'task-6',
      title: 'Access closure',
      description: 'Deprovision AWS IAM roles, GitHub enterprise access, Google Workspace, and VPN.',
      status: 'pending',
      dueDate: '2026-09-27',
      assignedRole: 'hr'
    },
    {
      id: 'task-7',
      title: 'HR clearance',
      description: 'Final payroll calculation, unused PTO encashment, and health insurance continuation paperwork.',
      status: 'pending',
      dueDate: '2026-09-30',
      assignedRole: 'hr'
    },
    {
      id: 'task-8',
      title: 'Download required documents',
      description: 'Download signed Relieving Letter, Experience Certificate, and Form 16/W2 tax documents.',
      status: 'pending',
      dueDate: '2026-10-02',
      assignedRole: 'employee'
    }
  ]
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Office will be closed on 15 Aug',
    category: 'Operations',
    timeAgo: '2 hours ago',
    date: '15 Aug 2026',
    content: 'In observance of the national holiday, all physical offices will be closed. Asynchronous support will remain on call for critical incidents.',
    iconType: 'briefcase'
  },
  {
    id: 'ann-2',
    title: 'New Learning Resources Added',
    category: 'Learning & Dev',
    timeAgo: '1 day ago',
    date: '14 Aug 2026',
    content: 'We have updated our internal learning library with high-performance system design courses and generative AI certifications.',
    iconType: 'book'
  },
  {
    id: 'ann-3',
    title: 'Q3 Team Meet on 20 Aug',
    category: 'Company',
    timeAgo: '2 days ago',
    date: '20 Aug 2026',
    content: 'Join our hybrid global company all-hands meet. We will showcase our upcoming H2 milestones and celebrate top contributors!',
    iconType: 'calendar'
  }
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Upcoming Meeting in 15 mins',
    message: 'Team Standup with Engineering starts at 10:00 AM.',
    timeAgo: '15m ago',
    type: 'meeting',
    read: false
  },
  {
    id: 'notif-2',
    title: 'New Announcement',
    message: 'Office schedule update for 15 Aug has been posted.',
    timeAgo: '2h ago',
    type: 'announcement',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Offboarding Checklist',
    message: 'Project Handover step is awaiting manager review confirmation.',
    timeAgo: '1d ago',
    type: 'offboarding',
    read: true
  }
];
