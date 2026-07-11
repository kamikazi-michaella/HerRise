import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { getMockUsers, mockCourses, mockOpportunities, mockForumPosts } from './src/data.ts';
import { User, Course, Opportunity, ForumPost, MentorshipSession, Enrollment, Certificate, Bookmark, UserRole } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'herrise-secret-key-for-jwt-tokens';
const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface for database file schema
interface AppDatabase {
  users: Array<User & { passwordHash: string }>;
  courses: Course[];
  enrollments: Enrollment[];
  sessions: MentorshipSession[];
  opportunities: Opportunity[];
  forumPosts: ForumPost[];
  bookmarks: Bookmark[];
  certificates: Certificate[];
}

// Global database object
let db: AppDatabase = {
  users: [],
  courses: [],
  enrollments: [],
  sessions: [],
  opportunities: [],
  forumPosts: [],
  bookmarks: [],
  certificates: [],
};

// Load database from file or initialize with seed data
function initDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      console.log('Database loaded successfully from', DB_FILE);
    } else {
      console.log('Database file not found. Seeding initial database...');
      // Seed users (with default password: 'Password123')
      const salt = bcrypt.genSaltSync(10);
      const defaultHash = bcrypt.hashSync('Password123', salt);
      
      const seedUsers = getMockUsers().map(user => ({
        ...user,
        passwordHash: defaultHash,
      }));

      // Create some default bookmarks for demo learners
      const seedBookmarks: Bookmark[] = [
        {
          id: 'bm_1',
          userId: 'usr_learner_1',
          opportunityId: 'opp_1',
          createdAt: new Date().toISOString(),
        }
      ];

      // Create some default mentorship sessions
      const seedSessions: MentorshipSession[] = [
        {
          id: 'sess_1',
          learnerId: 'usr_learner_1',
          learnerName: 'Aisha Umutesi',
          mentorId: 'usr_mentor_1',
          mentorName: 'Divine Mugisha',
          date: '2026-07-12',
          time: '14:00',
          goal: 'Discuss learning roadmap for React and PostgreSQL.',
          status: 'accepted',
          videoRoomUrl: 'https://whereby.com/herrise-session-demo-1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sess_2',
          learnerId: 'usr_learner_2',
          learnerName: 'Béatrice Uwamahoro',
          mentorId: 'usr_mentor_2',
          mentorName: 'Claudine Uwera',
          date: '2026-07-15',
          time: '10:00',
          goal: 'Tailoring business proposal and MTN MoMo paycasual merchant code setup feedback.',
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
      ];

      // Create default enrollments
      const seedEnrollments: Enrollment[] = [
        {
          id: 'enr_1',
          userId: 'usr_learner_1',
          courseId: 'course_1',
          completedLessons: ['c1_m1_l1'],
          enrolledAt: new Date().toISOString(),
        }
      ];

      db = {
        users: seedUsers,
        courses: mockCourses,
        enrollments: seedEnrollments,
        sessions: seedSessions,
        opportunities: mockOpportunities,
        forumPosts: mockForumPosts,
        bookmarks: seedBookmarks,
        certificates: [],
      };

      saveDatabase();
      console.log('Database seeded and saved.');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Save database state
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

// Initial DB boot
initDatabase();

// Middleware to authorize JWT tokens
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

async function startServer() {
  const app = express();
  app.use(express.json());

  // ---------------------------------------------------------------------------
  // AUTHENTICATION API
  // ---------------------------------------------------------------------------

  // POST /api/auth/register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, role, country, language } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const id = 'usr_' + Date.now();

    const newUser: User = {
      id,
      email: email.toLowerCase(),
      name,
      role: role as UserRole,
      skills: [],
      country: country || 'Rwanda',
      language: language || 'en',
      isVerified: true, // Auto-verified for pilot
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    db.users.push({ ...newUser, passwordHash });
    saveDatabase();

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: newUser });
  });

  // POST /api/auth/login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account is currently deactivated.' });
    }

    const passwordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Strip passwordHash before sending
    const { passwordHash, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: safeUser });
  });

  // GET /api/auth/verify
  app.get('/api/auth/verify', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = db.users.find(u => u.id === req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // POST /api/auth/reset-password
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(404).json({ error: 'Email not found' });

    // Simulated email sending
    res.json({ message: 'Password reset link sent to ' + email });
  });

  // ---------------------------------------------------------------------------
  // USERS PROFILE API
  // ---------------------------------------------------------------------------

  // GET /api/users/profile
  app.get('/api/users/profile', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = db.users.find(u => u.id === req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // PUT /api/users/profile
  app.put('/api/users/profile', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { name, photo, bio, skills, country, language } = req.body;
    const userIndex = db.users.findIndex(u => u.id === req.user!.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    const updatedUser = {
      ...db.users[userIndex],
      name: name || db.users[userIndex].name,
      photo: photo !== undefined ? photo : db.users[userIndex].photo,
      bio: bio !== undefined ? bio : db.users[userIndex].bio,
      skills: skills || db.users[userIndex].skills,
      country: country || db.users[userIndex].country,
      language: language || db.users[userIndex].language,
    };

    db.users[userIndex] = updatedUser;
    saveDatabase();

    const { passwordHash, ...safeUser } = updatedUser;
    res.json({ user: safeUser });
  });

  // ---------------------------------------------------------------------------
  // COURSE MANAGEMENT API
  // ---------------------------------------------------------------------------

  // GET /api/courses
  app.get('/api/courses', (req: Request, res: Response) => {
    const { category, level, search } = req.query;
    let filtered = db.courses.filter(c => c.published);

    if (category) {
      filtered = filtered.filter(c => c.category === category);
    }
    if (level) {
      filtered = filtered.filter(c => c.level === level);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.titleFr.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) ||
        c.descriptionFr.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  });

  // GET /api/courses/my-enrollments
  app.get('/api/courses/my-enrollments', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userEnrollments = db.enrollments.filter(e => e.userId === req.user!.id);
    res.json(userEnrollments);
  });

  // POST /api/courses/:id/enroll
  app.post('/api/courses/:id/enroll', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const courseId = req.params.id;
    const course = db.courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const existing = db.enrollments.find(e => e.userId === req.user!.id && e.courseId === courseId);
    if (existing) {
      return res.json(existing);
    }

    const newEnrollment: Enrollment = {
      id: 'enr_' + Date.now(),
      userId: req.user!.id,
      courseId,
      completedLessons: [],
      enrolledAt: new Date().toISOString(),
    };

    db.enrollments.push(newEnrollment);
    
    // Update course enrollments count
    course.enrollmentsCount = (course.enrollmentsCount || 0) + 1;
    saveDatabase();

    res.status(201).json(newEnrollment);
  });

  // POST /api/courses/:id/progress
  app.post('/api/courses/:id/progress', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const courseId = req.params.id;
    const { lessonId } = req.body;
    if (!lessonId) return res.status(400).json({ error: 'Lesson ID is required' });

    const enrollment = db.enrollments.find(e => e.userId === req.user!.id && e.courseId === courseId);
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    // Check if course is fully completed
    const course = db.courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const totalLessons: string[] = [];
    course.modules.forEach(mod => {
      mod.lessons.forEach(l => totalLessons.push(l.id));
    });

    const isAllCompleted = totalLessons.every(id => enrollment.completedLessons.includes(id));
    let certificate: Certificate | null = null;

    if (isAllCompleted && !enrollment.completedAt) {
      enrollment.completedAt = new Date().toISOString();
      course.completionsCount = (course.completionsCount || 0) + 1;

      // Generate a digital certificate
      const userObj = db.users.find(u => u.id === req.user!.id);
      certificate = {
        id: 'cert_' + Date.now(),
        userId: req.user!.id,
        userName: userObj ? userObj.name : 'Learner',
        courseId,
        courseTitle: course.title,
        issuedAt: new Date().toISOString(),
        hash: 'HR-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      };
      db.certificates.push(certificate);
    }

    saveDatabase();
    res.json({ enrollment, completed: !!enrollment.completedAt, certificate });
  });

  // GET /api/certificates
  app.get('/api/certificates', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userCertificates = db.certificates.filter(c => c.userId === req.user!.id);
    res.json(userCertificates);
  });

  // ---------------------------------------------------------------------------
  // MENTORSHIP SYSTEM API
  // ---------------------------------------------------------------------------

  // GET /api/mentors
  app.get('/api/mentors', (req: Request, res: Response) => {
    const { skills, search } = req.query;
    let mentors = db.users.filter(u => u.role === 'mentor' && u.isActive && u.isVerified);

    if (skills) {
      const skillsArray = (skills as string).split(',');
      mentors = mentors.filter(m => 
        m.skills.some(s => skillsArray.includes(s))
      );
    }

    if (search) {
      const q = (search as string).toLowerCase();
      mentors = mentors.filter(m => 
        m.name.toLowerCase().includes(q) || 
        (m.bio && m.bio.toLowerCase().includes(q))
      );
    }

    // Strip hashed password
    const safeMentors = mentors.map(({ passwordHash, ...m }) => m);
    res.json(safeMentors);
  });

  // GET /api/sessions (My requested and conducted sessions)
  app.get('/api/sessions', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    let userSessions;
    if (req.user!.role === 'mentor') {
      userSessions = db.sessions.filter(s => s.mentorId === req.user!.id);
    } else {
      userSessions = db.sessions.filter(s => s.learnerId === req.user!.id);
    }
    res.json(userSessions);
  });

  // POST /api/sessions
  app.post('/api/sessions', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { mentorId, date, time, goal } = req.body;
    if (!mentorId || !date || !time || !goal) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const mentor = db.users.find(u => u.id === mentorId && u.role === 'mentor');
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    const learner = db.users.find(u => u.id === req.user!.id);
    if (!learner) return res.status(404).json({ error: 'Learner profile not found' });

    const newSession: MentorshipSession = {
      id: 'sess_' + Date.now(),
      learnerId: req.user!.id,
      learnerName: learner.name,
      mentorId,
      mentorName: mentor.name,
      date,
      time,
      goal,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.sessions.push(newSession);
    saveDatabase();

    res.status(201).json(newSession);
  });

  // POST /api/sessions/:id/action
  app.post('/api/sessions/:id/action', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const sessionId = req.params.id;
    const { action } = req.body; // 'accept', 'decline', 'complete'
    
    const sessionIndex = db.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return res.status(404).json({ error: 'Session not found' });

    const session = db.sessions[sessionIndex];

    // Check authorization: only the mentor can accept/decline. Either can complete
    if (req.user!.role === 'mentor' && session.mentorId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (action === 'accept') {
      session.status = 'accepted';
      // Auto-generate virtual Whereby conference room URL
      session.videoRoomUrl = `https://whereby.com/herrise-room-${session.id}`;
    } else if (action === 'decline') {
      session.status = 'declined';
    } else if (action === 'complete') {
      session.status = 'completed';
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    db.sessions[sessionIndex] = session;
    saveDatabase();

    res.json(session);
  });

  // POST /api/sessions/:id/rate
  app.post('/api/sessions/:id/rate', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const sessionId = req.params.id;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    const sessionIndex = db.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return res.status(404).json({ error: 'Session not found' });

    const session = db.sessions[sessionIndex];
    if (session.learnerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only learners can rate sessions' });
    }

    session.rating = rating;
    session.review = review || '';
    session.status = 'completed'; // Auto mark as completed on review if not already

    db.sessions[sessionIndex] = session;
    saveDatabase();

    res.json(session);
  });

  // ---------------------------------------------------------------------------
  // OPPORTUNITIES BOARD API
  // ---------------------------------------------------------------------------

  // GET /api/opportunities
  app.get('/api/opportunities', (req: Request, res: Response) => {
    const { type, country, category, search } = req.query;
    let filtered = db.opportunities;

    if (type) {
      filtered = filtered.filter(o => o.type === type);
    }
    if (country) {
      filtered = filtered.filter(o => o.country.toLowerCase() === (country as string).toLowerCase());
    }
    if (category) {
      filtered = filtered.filter(o => o.category === category);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(o => 
        o.title.toLowerCase().includes(q) || 
        o.titleFr.toLowerCase().includes(q) || 
        o.company.toLowerCase().includes(q) || 
        o.description.toLowerCase().includes(q) ||
        o.descriptionFr.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  });

  // GET /api/opportunities/bookmarks
  app.get('/api/opportunities/bookmarks', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userBookmarks = db.bookmarks.filter(b => b.userId === req.user!.id);
    res.json(userBookmarks);
  });

  // POST /api/opportunities/:id/bookmark
  app.post('/api/opportunities/:id/bookmark', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const oppId = req.params.id;
    const opp = db.opportunities.find(o => o.id === oppId);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });

    const existingIndex = db.bookmarks.findIndex(b => b.userId === req.user!.id && b.opportunityId === oppId);
    if (existingIndex !== -1) {
      // Toggle off (unbookmark)
      db.bookmarks.splice(existingIndex, 1);
      saveDatabase();
      return res.json({ bookmarked: false });
    } else {
      // Toggle on (bookmark)
      const newBookmark: Bookmark = {
        id: 'bm_' + Date.now(),
        userId: req.user!.id,
        opportunityId: oppId,
        createdAt: new Date().toISOString(),
      };
      db.bookmarks.push(newBookmark);
      saveDatabase();
      return res.status(201).json({ bookmarked: true, bookmark: newBookmark });
    }
  });

  // ---------------------------------------------------------------------------
  // COMMUNITY FORUM API
  // ---------------------------------------------------------------------------

  // GET /api/forum
  app.get('/api/forum', (req: Request, res: Response) => {
    const { channel } = req.query;
    let filtered = db.forumPosts.filter(p => !p.isFlagged);

    if (channel) {
      filtered = filtered.filter(p => p.channel === channel);
    }

    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(filtered);
  });

  // POST /api/forum
  app.post('/api/forum', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { title, content, channel } = req.body;
    if (!title || !content || !channel) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const author = db.users.find(u => u.id === req.user!.id);
    if (!author) return res.status(404).json({ error: 'User profile not found' });

    const newPost: ForumPost = {
      id: 'post_' + Date.now(),
      authorId: req.user!.id,
      authorName: author.name,
      authorRole: author.role,
      authorPhoto: author.photo,
      channel,
      title,
      content,
      replies: [],
      reportsCount: 0,
      isFlagged: false,
      createdAt: new Date().toISOString(),
    };

    db.forumPosts.push(newPost);
    saveDatabase();

    res.status(201).json(newPost);
  });

  // POST /api/forum/:id/reply
  app.post('/api/forum/:id/reply', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const postId = req.params.id;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    const postIndex = db.forumPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

    const author = db.users.find(u => u.id === req.user!.id);
    if (!author) return res.status(404).json({ error: 'User profile not found' });

    const newReply = {
      id: 'rep_' + Date.now(),
      postId,
      authorId: req.user!.id,
      authorName: author.name,
      authorRole: author.role,
      authorPhoto: author.photo,
      content,
      reportsCount: 0,
      isFlagged: false,
      createdAt: new Date().toISOString(),
    };

    db.forumPosts[postIndex].replies.push(newReply);
    saveDatabase();

    res.status(201).json(db.forumPosts[postIndex]);
  });

  // POST /api/forum/report (Post or reply reporting)
  app.post('/api/forum/report', authenticateJWT, (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { postId, replyId } = req.body;
    if (!postId) return res.status(400).json({ error: 'Post ID is required' });

    const postIndex = db.forumPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });

    if (replyId) {
      // Report a reply
      const replyIndex = db.forumPosts[postIndex].replies.findIndex(r => r.id === replyId);
      if (replyIndex === -1) return res.status(404).json({ error: 'Reply not found' });
      
      db.forumPosts[postIndex].replies[replyIndex].reportsCount += 1;
      // Auto-flag if reports exceed 2 for moderation review
      if (db.forumPosts[postIndex].replies[replyIndex].reportsCount >= 3) {
        db.forumPosts[postIndex].replies[replyIndex].isFlagged = true;
      }
    } else {
      // Report a post
      db.forumPosts[postIndex].reportsCount += 1;
      if (db.forumPosts[postIndex].reportsCount >= 3) {
        db.forumPosts[postIndex].isFlagged = true;
      }
    }

    saveDatabase();
    res.json({ message: 'Content reported successfully.' });
  });

  // ---------------------------------------------------------------------------
  // ADMIN DASHBOARD API
  // ---------------------------------------------------------------------------

  // Helper middleware for admin verification
  const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin permissions required' });
    }
    next();
  };

  // GET /api/admin/users
  app.get('/api/admin/users', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const safeUsers = db.users.map(({ passwordHash, ...u }) => u);
    res.json(safeUsers);
  });

  // POST /api/admin/users/:id/toggle-active
  app.post('/api/admin/users/:id/toggle-active', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const userId = req.params.id;
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    db.users[userIndex].isActive = !db.users[userIndex].isActive;
    saveDatabase();

    const { passwordHash, ...safeUser } = db.users[userIndex];
    res.json(safeUser);
  });

  // DELETE /api/admin/users/:id
  app.delete('/api/admin/users/:id', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const userId = req.params.id;
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    db.users.splice(userIndex, 1);
    saveDatabase();

    res.json({ success: true, message: 'User deleted successfully' });
  });

  // POST /api/admin/courses (Create/Update course content)
  app.post('/api/admin/courses', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const courseData = req.body;
    if (!courseData.title || !courseData.category || !courseData.modules) {
      return res.status(400).json({ error: 'Incomplete course content' });
    }

    const newCourse: Course = {
      id: 'course_' + Date.now(),
      title: courseData.title,
      titleFr: courseData.titleFr || courseData.title,
      description: courseData.description || '',
      descriptionFr: courseData.descriptionFr || '',
      category: courseData.category,
      level: courseData.level || 'beginner',
      duration: courseData.duration || '2 hours',
      imageUrl: courseData.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600',
      published: courseData.published !== undefined ? courseData.published : true,
      enrollmentsCount: 0,
      completionsCount: 0,
      modules: courseData.modules,
    };

    db.courses.push(newCourse);
    saveDatabase();

    res.status(201).json(newCourse);
  });

  // PUT /api/admin/courses/:id
  app.put('/api/admin/courses/:id', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const courseId = req.params.id;
    const courseIndex = db.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return res.status(404).json({ error: 'Course not found' });

    db.courses[courseIndex] = {
      ...db.courses[courseIndex],
      ...req.body,
    };

    saveDatabase();
    res.json(db.courses[courseIndex]);
  });

  // DELETE /api/admin/courses/:id
  app.delete('/api/admin/courses/:id', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const courseId = req.params.id;
    const courseIndex = db.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return res.status(404).json({ error: 'Course not found' });

    db.courses.splice(courseIndex, 1);
    saveDatabase();
    res.json({ success: true, message: 'Course deleted successfully' });
  });

  // POST /api/admin/opportunities
  app.post('/api/admin/opportunities', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const data = req.body;
    if (!data.title || !data.company || !data.applyLink) {
      return res.status(400).json({ error: 'Missing title, company, or application link' });
    }

    const newOpp: Opportunity = {
      id: 'opp_' + Date.now(),
      title: data.title,
      titleFr: data.titleFr || data.title,
      company: data.company,
      companyLogo: data.companyLogo || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=150',
      type: data.type || 'job',
      category: data.category || 'tech',
      location: data.location || 'Kigali, Rwanda',
      country: data.country || 'Rwanda',
      sector: data.sector || 'General',
      deadline: data.deadline || '2026-12-31',
      description: data.description || '',
      descriptionFr: data.descriptionFr || '',
      applyLink: data.applyLink,
      createdAt: new Date().toISOString(),
    };

    db.opportunities.push(newOpp);
    saveDatabase();

    res.status(201).json(newOpp);
  });

  // PUT /api/admin/opportunities/:id
  app.put('/api/admin/opportunities/:id', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const oppId = req.params.id;
    const index = db.opportunities.findIndex(o => o.id === oppId);
    if (index === -1) return res.status(404).json({ error: 'Opportunity not found' });

    db.opportunities[index] = {
      ...db.opportunities[index],
      ...req.body,
    };

    saveDatabase();
    res.json(db.opportunities[index]);
  });

  // DELETE /api/admin/opportunities/:id
  app.delete('/api/admin/opportunities/:id', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const oppId = req.params.id;
    const index = db.opportunities.findIndex(o => o.id === oppId);
    if (index === -1) return res.status(404).json({ error: 'Opportunity not found' });

    db.opportunities.splice(index, 1);
    saveDatabase();
    res.json({ success: true, message: 'Opportunity deleted' });
  });

  // GET /api/admin/analytics
  app.get('/api/admin/analytics', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const learners = db.users.filter(u => u.role === 'learner');
    const mentors = db.users.filter(u => u.role === 'mentor');

    const totalEnrollments = db.enrollments.length;
    const totalCompletions = db.enrollments.filter(e => !!e.completedAt).length;
    const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;

    const topCourses = db.courses.map(c => ({
      title: c.title,
      enrollments: db.enrollments.filter(e => e.courseId === c.id).length,
      completions: db.enrollments.filter(e => e.courseId === c.id && !!e.completedAt).length,
    })).sort((a, b) => b.enrollments - a.enrollments).slice(0, 5);

    res.json({
      activeUsersCount: db.users.filter(u => u.isActive).length,
      learnersCount: learners.length,
      mentorsCount: mentors.length,
      enrollmentsCount: totalEnrollments,
      completionRate,
      topCourses,
      sessionsCount: db.sessions.length,
      opportunitiesCount: db.opportunities.length,
    });
  });

  // GET /api/admin/export-csv
  app.get('/api/admin/export-csv', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
    const { type } = req.query; // 'users', 'courses', 'sessions'

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=herrise-${type}-report.csv`);

    let csvContent = '';

    if (type === 'users') {
      csvContent += 'ID,Name,Email,Role,Country,Language,Verified,Active,Created At\n';
      db.users.forEach(u => {
        csvContent += `"${u.id}","${u.name}","${u.email}","${u.role}","${u.country}","${u.language}",${u.isVerified},${u.isActive},"${u.createdAt}"\n`;
      });
    } else if (type === 'courses') {
      csvContent += 'ID,Title,Category,Level,Duration,Enrollments,Completions\n';
      db.courses.forEach(c => {
        const enrollCount = db.enrollments.filter(e => e.courseId === c.id).length;
        const compCount = db.enrollments.filter(e => e.courseId === c.id && !!e.completedAt).length;
        csvContent += `"${c.id}","${c.title}","${c.category}","${c.level}","${c.duration}",${enrollCount},${compCount}\n`;
      });
    } else if (type === 'sessions') {
      csvContent += 'ID,Learner Name,Mentor Name,Date,Time,Goal,Status,Rating\n';
      db.sessions.forEach(s => {
        csvContent += `"${s.id}","${s.learnerName}","${s.mentorName}","${s.date}","${s.time}","${s.goal.replace(/"/g, '""')}","${s.status}",${s.rating || ''}\n`;
      });
    } else {
      return res.status(400).send('Invalid export type');
    }

    res.send(csvContent);
  });

  // ---------------------------------------------------------------------------
  // VITE DEVELOPMENT MIDDLEWARE OR STATIC SERVER FOR PRODUCTION
  // ---------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware loaded.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static files serving loaded from', distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
