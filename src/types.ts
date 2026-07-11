export type UserRole = 'learner' | 'mentor' | 'admin';

export interface User {
  id: string; // Used as unique identifier
  email: string;
  name: string;
  role: UserRole;
  photo?: string;
  bio?: string;
  skills: string[];
  country: string;
  language: 'en' | 'fr';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleFr: string;
  duration: string; // e.g., "15 mins"
  content: string; // markdown content or HTML
  contentFr: string;
  videoUrl?: string; // Max 720p adaptive mockup
  order: number;
}

export interface Module {
  id: string;
  title: string;
  titleFr: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  category: 'digital' | 'coding' | 'entrepreneurship' | 'finance' | 'communication';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // e.g., "10 hours"
  imageUrl: string;
  modules: Module[];
  published: boolean;
  enrollmentsCount: number;
  completionsCount: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  completedLessons: string[]; // lessonIds
  completedAt?: string; // timestamp if fully completed
  enrolledAt: string;
}

export interface MentorshipSession {
  id: string;
  learnerId: string;
  learnerName: string;
  mentorId: string;
  mentorName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  goal: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  videoRoomUrl?: string; // Whereby/Daily.co mockup link
  rating?: number; // 1-5 stars
  review?: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  titleFr: string;
  company: string;
  companyLogo?: string;
  type: 'job' | 'internship' | 'grant';
  category: string;
  location: string; // e.g., "Kigali, Rwanda", "Remote"
  country: string;
  sector: string;
  deadline: string; // YYYY-MM-DD
  description: string;
  descriptionFr: string;
  applyLink: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorPhoto?: string;
  channel: 'tech' | 'business' | 'wellbeing';
  title: string;
  content: string;
  replies: ForumReply[];
  reportsCount: number;
  isFlagged: boolean;
  createdAt: string;
}

export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorPhoto?: string;
  content: string;
  reportsCount: number;
  isFlagged: boolean;
  createdAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  hash: string; // certificate verification hash
}

export interface Bookmark {
  id: string;
  userId: string;
  opportunityId: string;
  createdAt: string;
}

export interface DashboardMetrics {
  activeUsersCount: number;
  enrollmentsCount: number;
  completionRate: number; // percentage
  topCourses: { title: string; enrollments: number; completions: number }[];
  sessionsCount: number;
  opportunitiesCount: number;
}
