export type Role = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: Role;
  jobTitle: string;
  department: string;
  team: string;
  managerName?: string;
  managerEmail?: string;
  phone?: string;
  location?: string;
  joinDate?: string;
  bio?: string;
  skills?: string[];
  projects?: string[];
}

export interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  team: string;
  email: string;
  phone: string;
  avatar: string;
  skills: string[];
  projects: string[];
  manager: string;
  location: string;
  bio: string;
  status: 'active' | 'onboarding' | 'offboarding';
}

export interface DepartmentNode {
  id: string;
  name: string;
  memberCount: number;
  color: string;
  subteams: {
    id: string;
    name: string;
    memberCount: number;
    lead: string;
    description: string;
    responsibilities: string[];
    skills: string[];
    projects: string[];
  }[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'Company Policies' | 'Culture & Values' | 'Project Documentation' | 'Tools & Resources' | 'Processes' | 'FAQs' | 'Important Links';
  summary: string;
  content: string;
  updatedAt: string;
  author: string;
  readTime: string;
  tags: string[];
  accessLevel: 'all' | 'engineering' | 'management' | 'hr';
}

export interface CompanyEvent {
  id: string;
  title: string;
  date: string;
  displayDate: { month: string; day: string };
  time: string;
  team: string;
  type: 'Team Meeting' | '1:1' | 'Orientation' | 'Company Event' | 'Training' | 'Workshop' | 'Project Meeting';
  location: string;
  meetingLink: string;
  participants: string[];
  description: string;
  isUserAttending?: boolean;
}

export interface OffboardingTask {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'in_progress';
  dueDate?: string;
  completedDate?: string;
  assignedRole: 'employee' | 'manager' | 'hr';
  handoverDetails?: string;
}

export interface OffboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  lastWorkingDay: string;
  managerName: string;
  managerEmail: string;
  hrContact: string;
  progressPercent: number;
  tasks: OffboardingTask[];
  notes?: string;
  status: 'in_progress' | 'approved' | 'completed';
}

export interface Announcement {
  id: string;
  title: string;
  category: string;
  timeAgo: string;
  date: string;
  content: string;
  iconType: 'briefcase' | 'book' | 'calendar' | 'bell';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'meeting' | 'announcement' | 'document' | 'offboarding';
  read: boolean;
  link?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { title: string; category: string; link?: string }[];
  suggestedFollowups?: string[];
}
