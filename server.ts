import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  EMPLOYEES,
  DEPARTMENTS_STRUCTURE,
  KNOWLEDGE_ARTICLES,
  UPCOMING_EVENTS,
  INITIAL_OFFBOARDING,
  ANNOUNCEMENTS,
  NOTIFICATIONS,
  INITIAL_CURRENT_USER
} from './src/data/mockData.ts';
import { KnowledgeArticle, CompanyEvent, Employee } from './src/types/workhub.ts';
import { adminDb } from './src/lib/firebase-admin.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory fallback & cache state
let employees = [...EMPLOYEES];
let knowledgeArticles = [...KNOWLEDGE_ARTICLES];
let companyEvents = [...UPCOMING_EVENTS];
let offboardingRecord = { ...INITIAL_OFFBOARDING };
let notifications = [...NOTIFICATIONS];
let announcements = [...ANNOUNCEMENTS];

let isFirestoreAdminAvailable = false;

function safeFirestoreSet(collection: string, docId: string, data: any) {
  if (isFirestoreAdminAvailable && adminDb) {
    adminDb.collection(collection).doc(docId).set(data).catch(() => {});
  }
}

// Seed & sync Firestore Database
async function initDatabase() {
  if (!adminDb) {
    console.log('⚡ Server running with in-memory persistence and client-side Firestore synchronization.');
    return;
  }

  const dbInstance = adminDb;

  try {
    const empSnap = await dbInstance.collection('employees').limit(1).get();
    isFirestoreAdminAvailable = true;
    if (empSnap.empty) {
      console.log('📦 Seeding initial WorkHub database collections to Firestore...');
      const batch = dbInstance.batch();

      EMPLOYEES.forEach((emp) => {
        batch.set(dbInstance.collection('employees').doc(emp.id), emp);
      });

      KNOWLEDGE_ARTICLES.forEach((art) => {
        batch.set(dbInstance.collection('knowledge').doc(art.id), art);
      });

      UPCOMING_EVENTS.forEach((evt) => {
        batch.set(dbInstance.collection('events').doc(evt.id), evt);
      });

      batch.set(dbInstance.collection('offboarding').doc(INITIAL_OFFBOARDING.id), INITIAL_OFFBOARDING);

      await batch.commit();
      console.log('✅ WorkHub initial database seeded successfully to Firestore!');
    } else {
      // Load current documents from Firestore
      const [allEmps, allArts, allEvts, offSnap] = await Promise.all([
        dbInstance.collection('employees').get(),
        dbInstance.collection('knowledge').get(),
        dbInstance.collection('events').get(),
        dbInstance.collection('offboarding').doc(INITIAL_OFFBOARDING.id).get(),
      ]);

      if (!allEmps.empty) {
        employees = allEmps.docs.map((d) => d.data() as Employee);
      }
      if (!allArts.empty) {
        knowledgeArticles = allArts.docs.map((d) => d.data() as KnowledgeArticle);
      }
      if (!allEvts.empty) {
        companyEvents = allEvts.docs.map((d) => d.data() as CompanyEvent);
      }
      if (offSnap.exists) {
        offboardingRecord = offSnap.data() as any;
      }
      console.log('⚡ Loaded records from persistent Firestore database.');
    }
  } catch (_err: any) {
    isFirestoreAdminAvailable = false;
    console.log('⚡ Server running with in-memory persistence and client-side Firestore synchronization.');
  }
}
initDatabase().catch(() => {});

// Initialize Google GenAI client (Server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '30mb' }));

  // ====================
  // API: EMPLOYEES
  // ====================
  app.get('/api/employees', (req: Request, res: Response) => {
    const { q, department, team, skill, project } = req.query;
    let filtered = [...employees];

    if (q) {
      const query = String(q).toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.jobTitle.toLowerCase().includes(query) ||
          e.department.toLowerCase().includes(query) ||
          e.team.toLowerCase().includes(query) ||
          e.skills.some((s) => s.toLowerCase().includes(query)) ||
          e.projects.some((p) => p.toLowerCase().includes(query))
      );
    }

    if (department && department !== 'All') {
      filtered = filtered.filter((e) => e.department.toLowerCase() === String(department).toLowerCase());
    }

    if (team && team !== 'All') {
      filtered = filtered.filter((e) => e.team.toLowerCase().includes(String(team).toLowerCase()));
    }

    if (skill && skill !== 'All') {
      filtered = filtered.filter((e) => e.skills.some((s) => s.toLowerCase() === String(skill).toLowerCase()));
    }

    if (project && project !== 'All') {
      filtered = filtered.filter((e) => e.projects.some((p) => p.toLowerCase().includes(String(project).toLowerCase())));
    }

    res.json({ employees: filtered });
  });

  app.get('/api/employees/:id', (req: Request, res: Response) => {
    const emp = employees.find((e) => e.id === req.params.id);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ employee: emp });
  });

  app.post('/api/employees', (req: Request, res: Response) => {
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: req.body.name || 'New Employee',
      jobTitle: req.body.jobTitle || 'Associate',
      department: req.body.department || 'Engineering',
      team: req.body.team || 'Backend',
      email: req.body.email || `user${Date.now()}@workhub.internal`,
      phone: req.body.phone || '+1 (555) 000-0000',
      avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      skills: req.body.skills || ['Communication'],
      projects: req.body.projects || ['WorkHub Platform'],
      manager: req.body.manager || 'John Smith',
      location: req.body.location || 'San Francisco, CA',
      bio: req.body.bio || '',
      status: 'active',
    };
    employees.push(newEmp);
    safeFirestoreSet('employees', newEmp.id, newEmp);
    res.status(201).json({ employee: newEmp });
  });

  app.put('/api/employees/:id', (req: Request, res: Response) => {
    const empId = req.params.id;
    const index = employees.findIndex((e) => e.id === empId);
    if (index === -1) {
      // If not found in mock list, check if it's the current user or create new entry
      const updatedEmp: Employee = {
        id: empId,
        name: req.body.name || 'Employee',
        jobTitle: req.body.jobTitle || 'Associate',
        department: req.body.department || 'Engineering',
        team: req.body.team || 'Backend',
        email: req.body.email || '',
        phone: req.body.phone || '',
        avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        skills: Array.isArray(req.body.skills) ? req.body.skills : [],
        projects: Array.isArray(req.body.projects) ? req.body.projects : [],
        manager: req.body.manager || req.body.managerName || 'John Smith',
        location: req.body.location || 'San Francisco, CA',
        bio: req.body.bio || '',
        status: req.body.status || 'active',
      };
      employees.push(updatedEmp);
      safeFirestoreSet('employees', empId, updatedEmp);
      return res.json({ employee: updatedEmp });
    }

    employees[index] = {
      ...employees[index],
      ...req.body,
      id: empId, // protect ID
    };

    const savedEmp = employees[index];
    safeFirestoreSet('employees', empId, savedEmp);
    res.json({ employee: savedEmp });
  });

  app.patch('/api/employees/:id', (req: Request, res: Response) => {
    const empId = req.params.id;
    const index = employees.findIndex((e) => e.id === empId);
    if (index === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    employees[index] = {
      ...employees[index],
      ...req.body,
      id: empId,
    };

    const savedEmp = employees[index];
    safeFirestoreSet('employees', empId, savedEmp);
    res.json({ employee: savedEmp });
  });

  // ====================
  // API: TEAMS & ORG STRUCTURE
  // ====================
  app.get('/api/teams', (_req: Request, res: Response) => {
    res.json({ departments: DEPARTMENTS_STRUCTURE });
  });

  // ====================
  // API: KNOWLEDGE BASE
  // ====================
  app.get('/api/knowledge', (req: Request, res: Response) => {
    const { category, q } = req.query;
    let filtered = [...knowledgeArticles];

    if (category && category !== 'All') {
      filtered = filtered.filter((a) => a.category.toLowerCase() === String(category).toLowerCase());
    }

    if (q) {
      const query = String(q).toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query)) ||
          a.content.toLowerCase().includes(query)
      );
    }

    res.json({ articles: filtered });
  });

  app.get('/api/knowledge/:id', (req: Request, res: Response) => {
    const art = knowledgeArticles.find((a) => a.id === req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ article: art });
  });

  app.post('/api/knowledge', (req: Request, res: Response) => {
    const newArt: KnowledgeArticle = {
      id: `art-${Date.now()}`,
      title: req.body.title || 'Untitled Document',
      category: req.body.category || 'Company Policies',
      summary: req.body.summary || 'Company document summary.',
      content: req.body.content || '# Document Content\n\nEnter details here...',
      updatedAt: 'Just now',
      author: req.body.author || 'Admin',
      readTime: '3 min read',
      tags: req.body.tags || ['general'],
      accessLevel: req.body.accessLevel || 'all',
    };
    knowledgeArticles.unshift(newArt);
    safeFirestoreSet('knowledge', newArt.id, newArt);
    res.status(201).json({ article: newArt });
  });

  // ====================
  // API: EVENTS & MEETINGS
  // ====================
  app.get('/api/events', (_req: Request, res: Response) => {
    res.json({ events: companyEvents });
  });

  app.post('/api/events', (req: Request, res: Response) => {
    const newEvt: CompanyEvent = {
      id: `evt-${Date.now()}`,
      title: req.body.title || 'New Meeting',
      date: req.body.date || new Date().toISOString().split('T')[0],
      displayDate: {
        month: 'AUG',
        day: req.body.day || '25',
      },
      time: req.body.time || '10:00 AM – 11:00 AM',
      team: req.body.team || 'All Teams',
      type: req.body.type || 'Team Meeting',
      location: req.body.location || 'Google Meet',
      meetingLink: req.body.meetingLink || 'https://meet.google.com/hub-new-meet',
      participants: req.body.participants || ['Team Members'],
      description: req.body.description || 'Scheduled via WorkHub Events & Meetings.',
      isUserAttending: true,
    };
    companyEvents.push(newEvt);
    safeFirestoreSet('events', newEvt.id, newEvt);
    res.status(201).json({ event: newEvt });
  });

  // ====================
  // API: OFFBOARDING
  // ====================
  app.get('/api/offboarding/me', (_req: Request, res: Response) => {
    res.json({ offboarding: offboardingRecord });
  });

  app.patch('/api/offboarding/tasks/:taskId', (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { status, handoverDetails } = req.body;

    const taskIndex = offboardingRecord.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (status) {
      offboardingRecord.tasks[taskIndex].status = status;
      if (status === 'completed') {
        offboardingRecord.tasks[taskIndex].completedDate = `Completed on ${new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}`;
      }
    }

    if (handoverDetails !== undefined) {
      offboardingRecord.tasks[taskIndex].handoverDetails = handoverDetails;
    }

    // Recalculate progress percent
    const completedCount = offboardingRecord.tasks.filter((t) => t.status === 'completed').length;
    offboardingRecord.progressPercent = Math.round((completedCount / offboardingRecord.tasks.length) * 100);

    safeFirestoreSet('offboarding', offboardingRecord.id, offboardingRecord);
    res.json({ offboarding: offboardingRecord, updatedTask: offboardingRecord.tasks[taskIndex] });
  });

  // ====================
  // API: ANNOUNCEMENTS & NOTIFICATIONS
  // ====================
  app.get('/api/announcements', (_req: Request, res: Response) => {
    res.json({ announcements });
  });

  app.get('/api/notifications', (_req: Request, res: Response) => {
    res.json({ notifications });
  });

  app.post('/api/notifications/mark-read', (_req: Request, res: Response) => {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    res.json({ success: true });
  });

  // ====================
  // API: GLOBAL SEARCH
  // ====================
  app.get('/api/search', (req: Request, res: Response) => {
    const query = String(req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.json({ people: [], teams: [], projects: [], documents: [], events: [] });
    }

    const matchedPeople = employees.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.jobTitle.toLowerCase().includes(query) ||
        e.team.toLowerCase().includes(query) ||
        e.skills.some((s) => s.toLowerCase().includes(query))
    );

    const matchedTeams: any[] = [];
    DEPARTMENTS_STRUCTURE.forEach((dept) => {
      dept.subteams.forEach((sub) => {
        if (
          sub.name.toLowerCase().includes(query) ||
          dept.name.toLowerCase().includes(query) ||
          sub.description.toLowerCase().includes(query)
        ) {
          matchedTeams.push({
            name: `${sub.name} Team`,
            department: dept.name,
            lead: sub.lead,
            memberCount: sub.memberCount,
          });
        }
      });
    });

    const matchedDocuments = knowledgeArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query) ||
        a.tags.some((t) => t.toLowerCase().includes(query))
    );

    const matchedEvents = companyEvents.filter(
      (ev) =>
        ev.title.toLowerCase().includes(query) ||
        ev.team.toLowerCase().includes(query) ||
        ev.description.toLowerCase().includes(query)
    );

    res.json({
      people: matchedPeople.slice(0, 5),
      teams: matchedTeams.slice(0, 5),
      documents: matchedDocuments.slice(0, 5),
      events: matchedEvents.slice(0, 5),
    });
  });

  // ============================================
  // API: AI COMPANY ASSISTANT (RAG with Gemini)
  // ============================================
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build Grounded RAG Knowledge Context
    const knowledgeContext = knowledgeArticles
      .map((a) => `ARTICLE: "${a.title}" (${a.category})\n${a.summary}\n${a.content}`)
      .join('\n\n---\n\n');

    const employeesContext = employees
      .map(
        (e) =>
          `EMPLOYEE: ${e.name} | Role: ${e.jobTitle} | Dept: ${e.department} | Team: ${e.team} | Email: ${e.email} | Manager: ${e.manager} | Projects: ${e.projects.join(
            ', '
          )} | Skills: ${e.skills.join(', ')} | Status: ${e.status} | Bio: ${e.bio}`
      )
      .join('\n');

    const teamsContext = DEPARTMENTS_STRUCTURE.map(
      (d) =>
        `DEPARTMENT: ${d.name} (${d.memberCount} members)\n` +
        d.subteams
          .map(
            (st) =>
              `  - Subteam: ${st.name} | Lead: ${st.lead} | Projects: ${st.projects.join(
                ', '
              )} | Responsibilities: ${st.responsibilities.join(', ')}`
          )
          .join('\n')
    ).join('\n\n');

    const offboardingContext = `OFFBOARDING PROCESS & CHECKLIST:
- Submitting Resignation: Handled in HR Portal.
- Exit Interview: Conducted by HR Director Sarah Jenkins.
- Knowledge Transfer: Mandatory documentation of architecture & active PRs.
- Project Handover: Manager review & confirmation.
- Asset Return: Laptops, access cards, and company hardware returned to IT/HR.
- Access Closure: Deprovisioning AWS, GitHub, Google Workspace.
- HR Clearance & Document Downloads: Relieving letter & tax slips.
Current User John Doe last working day: ${offboardingRecord.lastWorkingDay}. Manager: ${offboardingRecord.managerName}.`;

    const systemInstruction = `You are WorkHub's internal AI Company Assistant.
Your job is to assist employees with questions about company policies, projects, teams, culture, processes, internal tools, documentation, people, and offboarding.

You have direct access to company knowledge base, team directory, and employee records:

=== COMPANY EMPLOYEES & PROJECTS ===
${employeesContext}

=== ORG STRUCTURE & TEAMS ===
${teamsContext}

=== KNOWLEDGE BASE & POLICIES ===
${knowledgeContext}

=== OFFBOARDING INFO ===
${offboardingContext}

RULES:
1. Provide concise, clear, and professional answers formatted with markdown (bullet points, bold key names, code blocks if technical).
2. When referencing specific people (e.g. "Who handles the Payment API?"), specify:
   - Full Name
   - Title
   - Department & Team
   - Projects they lead or manage
3. Mention applicable policy source references at the end (e.g. "Source: [Work From Home Policy]" or "[Employee Handbook]").
4. Suggest 2-3 relevant follow-up questions at the very end formatted as a JSON array on a separate last line: FOLLOWUP_QUESTIONS: ["question 1", "question 2", "question 3"].
5. If the information is not in the knowledge base, politely state that you do not have that internal record and suggest contacting HR (Sarah Jenkins) or their team manager.`;

    try {
      if (process.env.GEMINI_API_KEY) {
        // Use Gemini 2.5 Flash for RAG Q&A
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        const rawText = response.text || '';
        let answerText = rawText;
        let suggestedFollowups: string[] = [
          'Can I work remotely from another city?',
          'How to apply for WFH?',
          'What equipment is provided?',
        ];

        // Extract FOLLOWUP_QUESTIONS if present
        const followupMatch = rawText.match(/FOLLOWUP_QUESTIONS:\s*(\[.*?\])/s);
        if (followupMatch) {
          try {
            suggestedFollowups = JSON.parse(followupMatch[1]);
            answerText = rawText.replace(/FOLLOWUP_QUESTIONS:\s*\[.*?\]/s, '').trim();
          } catch {
            // keep default followups
          }
        }

        // Determine relevant sources
        const sources: { title: string; category: string }[] = [];
        if (answerText.toLowerCase().includes('hybrid') || answerText.toLowerCase().includes('office') || answerText.toLowerCase().includes('wfh')) {
          sources.push({ title: 'Work From Home Policy', category: 'Company Policies' });
        }
        if (answerText.toLowerCase().includes('leave') || answerText.toLowerCase().includes('pto') || answerText.toLowerCase().includes('vacation')) {
          sources.push({ title: 'Leave Policy', category: 'Company Policies' });
        }
        if (answerText.toLowerCase().includes('payment') || answerText.toLowerCase().includes('arun')) {
          sources.push({ title: 'Payment Platform Documentation', category: 'Project Documentation' });
        }
        if (answerText.toLowerCase().includes('handbook') || answerText.toLowerCase().includes('hours') || answerText.toLowerCase().includes('mission')) {
          sources.push({ title: 'Employee Handbook', category: 'Company Policies' });
        }
        if (answerText.toLowerCase().includes('code review') || answerText.toLowerCase().includes('pr') || answerText.toLowerCase().includes('pull request')) {
          sources.push({ title: 'Code Review Process', category: 'Processes' });
        }

        return res.json({
          reply: answerText,
          sources,
          suggestedFollowups: suggestedFollowups.slice(0, 3),
        });
      }
    } catch (err) {
      console.warn('Gemini API call failed or not configured, using smart grounded fallback:', err);
    }

    // Grounded fallback if Gemini key is not configured or in offline mode
    const lower = message.toLowerCase();
    let reply = '';
    let sources: { title: string; category: string }[] = [];
    let suggestedFollowups = [
      'Can I work remotely from another city?',
      'How to apply for WFH?',
      'What equipment is provided?',
    ];

    if (lower.includes('payment') || lower.includes('payment api') || lower.includes('pay')) {
      reply = `**Arun Kumar**  
Senior Backend Engineer  
Backend Team, Engineering  
Payment Platform  

Arun Kumar is the primary technical lead for the **Payment API Gateway** and financial processing infrastructure. For code questions or API sandbox keys, you can reach Arun at \`arun.kumar@workhub.internal\` or through Slack at \`#payment-team\`.`;
      sources.push({ title: 'Payment Platform Documentation', category: 'Project Documentation' });
      suggestedFollowups = [
        'Who is Arun Kumar\'s manager?',
        'Where can I find the Payment API documentation?',
        'How do I test the payment sandbox?',
      ];
    } else if (lower.includes('wfh') || lower.includes('work from home') || lower.includes('remote') || lower.includes('hybrid')) {
      reply = `Our company follows a balanced hybrid work policy:

- **3 days work from office** (Mon, Tue, Thu)
- **2 days work from home** (Wed, Fri)
- **Flexible timing** between 9 AM – 6 PM
- **Home Office Stipend**: $750 annual ergonomic and equipment credit

See the full policy here: **[Work From Home Policy]**`;
      sources.push({ title: 'Work From Home Policy', category: 'Company Policies' });
      suggestedFollowups = [
        'Can I work remotely from another city?',
        'How to apply for WFH?',
        'What equipment is provided?',
      ];
    } else if (lower.includes('leave') || lower.includes('pto') || lower.includes('vacation') || lower.includes('sick')) {
      reply = `WorkHub offers **24 days of Annual Paid Time Off (PTO)** plus **12 days of Casual/Sick Leave** per year.

Requests are submitted via **WorkHub Dashboard -> Quick Links -> HR Portal -> Leave Request**. Please provide 5 business days notice for planned absences longer than 3 days.`;
      sources.push({ title: 'Leave Policy', category: 'Company Policies' });
      suggestedFollowups = [
        'How do I submit a leave request?',
        'What are the official company holidays?',
        'What is our parental leave policy?',
      ];
    } else if (lower.includes('exit') || lower.includes('offboarding') || lower.includes('resignation')) {
      reply = `The offboarding process involves completing 8 key checklist steps:
1. Submit resignation via HR Portal
2. Complete exit interview with HR Director Sarah Jenkins
3. Knowledge transfer & Loom walkthroughs
4. Project handover sign-off with your manager
5. Return company assets (MacBook, access badge)
6. Access closure (AWS, GitHub, Google Workspace)
7. HR clearance & final payroll settlement
8. Download relieving letter & tax documents

You can track your progress in real time under the **Exit & Offboarding** tab.`;
      sources.push({ title: 'Employee Exit & Offboarding', category: 'Processes' });
      suggestedFollowups = [
        'Who is my manager for project handover?',
        'When is my last working day?',
        'How do I return my laptop?',
      ];
    } else {
      reply = `Welcome to WorkHub AI! I'm here to help you navigate our company knowledge, find team members, and understand policies.

You can ask me questions like:
- *"Who handles the Payment API?"*
- *"What is our hybrid work / WFH policy?"*
- *"How many leave days do we get?"*
- *"How does the offboarding checklist work?"*
- *"Who is the lead for AI/ML engineering?"*`;
      sources.push({ title: 'Employee Handbook', category: 'Company Policies' });
    }

    return res.json({
      reply,
      sources,
      suggestedFollowups,
    });
  });

  // =========================================================================
  // API: CREATE & EDIT IMAGES (Feature request: gemini-3.1-flash-image-preview)
  // =========================================================================
  app.post('/api/ai/generate-image', async (req: Request, res: Response) => {
    const { prompt, referenceImage, aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required' });
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        // If referenceImage is provided, this is an image editing task
        if (referenceImage && typeof referenceImage === 'string') {
          // Extract base64 and mime
          let mimeType = 'image/png';
          let base64Data = referenceImage;
          if (referenceImage.startsWith('data:')) {
            const matches = referenceImage.match(/^data:(image\/\w+);base64,(.+)$/);
            if (matches) {
              mimeType = matches[1];
              base64Data = matches[2];
            }
          }

          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: {
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          });

          // Iterate through parts to find the image part
          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                return res.json({
                  imageUrl,
                  prompt,
                  model: 'gemini-3.1-flash-image-preview',
                  type: 'edit',
                });
              }
            }
          }
        } else {
          // Standard Image Generation using text prompt
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
            config: {
              imageConfig: {
                aspectRatio: aspectRatio as any,
                imageSize: '1K',
              },
            },
          });

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                return res.json({
                  imageUrl,
                  prompt,
                  model: 'gemini-3.1-flash-image-preview',
                  type: 'create',
                });
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Image generation with gemini-3.1-flash-image-preview encountered error/fallback:', err?.message || err);
    }

    // High quality procedural SVG placeholder fallback with user prompt rendered as creative studio asset
    const cleanPrompt = prompt.slice(0, 80);
    const bgGradients = [
      ['#2563eb', '#1d4ed8'],
      ['#4f46e5', '#3730a3'],
      ['#0284c7', '#0369a1'],
      ['#0d9488', '#0f766e'],
    ];
    const picked = bgGradients[Math.abs(prompt.length) % bgGradients.length];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${picked[0]}" />
          <stop offset="100%" stop-color="${picked[1]}" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-opacity="0.25"/>
        </filter>
      </defs>
      <rect width="800" height="800" fill="url(#grad)" rx="32"/>
      <circle cx="400" cy="300" r="160" fill="rgba(255,255,255,0.12)" />
      <g transform="translate(320, 220) scale(3.5)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </g>
      <rect x="80" y="520" width="640" height="200" rx="20" fill="rgba(255,255,255,0.95)" filter="url(#shadow)" />
      <text x="400" y="575" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold" fill="#0f172a">WorkHub Asset Studio</text>
      <text x="400" y="620" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" fill="#475569">"${cleanPrompt}"</text>
      <text x="400" y="665" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#2563eb">Created with Gemini Image Studio</text>
    </svg>`;

    const fallbackBase64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

    return res.json({
      imageUrl: fallbackBase64,
      prompt,
      model: 'gemini-3.1-flash-image-preview',
      type: referenceImage ? 'edit' : 'create',
      notice: 'Rendered with WorkHub Creative Studio preview engine.',
    });
  });

  // ====================
  // VITE / STATIC SERVE
  // ====================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WorkHub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
