/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Employee, DepartmentNode, KnowledgeArticle, CompanyEvent, OffboardingRecord, Announcement, NotificationItem } from './types/workhub';
import {
  INITIAL_CURRENT_USER,
  DEMO_USERS,
  EMPLOYEES,
  DEPARTMENTS_STRUCTURE,
  KNOWLEDGE_ARTICLES,
  UPCOMING_EVENTS,
  INITIAL_OFFBOARDING,
  ANNOUNCEMENTS,
  NOTIFICATIONS
} from './data/mockData';

// Layout & Core Views
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { PeopleFinderView } from './components/people/PeopleFinderView';
import { TeamDirectoryView } from './components/teams/TeamDirectoryView';
import { KnowledgeBaseView } from './components/knowledge/KnowledgeBaseView';
import { EventsView } from './components/events/EventsView';
import { OffboardingView } from './components/offboarding/OffboardingView';
import { ImageStudioView } from './components/tools/ImageStudioView';

// Modals
import { LogoutModal } from './components/modals/LogoutModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { DirectMessageModal } from './components/modals/DirectMessageModal';
import { MeetingRoomModal } from './components/modals/MeetingRoomModal';
import { EditProfileModal } from './components/modals/EditProfileModal';

// Firebase Auth & Firestore client
import { auth, firebaseSignOut, validateFirestoreConnection, syncEmployeeToClientFirestore } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_CURRENT_USER);
  const [authLoading, setAuthLoading] = useState(true);

  // Tab routing
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Application Data
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [departments, setDepartments] = useState<DepartmentNode[]>(DEPARTMENTS_STRUCTURE);
  const [articles, setArticles] = useState<KnowledgeArticle[]>(KNOWLEDGE_ARTICLES);
  const [events, setEvents] = useState<CompanyEvent[]>(UPCOMING_EVENTS);
  const [offboarding, setOffboarding] = useState<OffboardingRecord>(INITIAL_OFFBOARDING);
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS);

  // Modal states
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Auto-collapse sidebar on tablet screens (< 1200px)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1200;
    }
    return false;
  });
  const [activeMessageRecipient, setActiveMessageRecipient] = useState<Employee | null>(null);
  const [activeMeetingRoom, setActiveMeetingRoom] = useState<CompanyEvent | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Fetch initial data from server-side APIs
  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then((data) => {
        if (data.employees) setEmployees(data.employees);
      })
      .catch((err) => console.warn('Using initial employees:', err));

    fetch('/api/teams')
      .then((res) => res.json())
      .then((data) => {
        if (data.departments) setDepartments(data.departments);
      })
      .catch((err) => console.warn('Using initial departments:', err));

    fetch('/api/knowledge')
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) setArticles(data.articles);
      })
      .catch((err) => console.warn('Using initial articles:', err));

    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
      })
      .catch((err) => console.warn('Using initial events:', err));

    fetch('/api/offboarding/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.offboarding) setOffboarding(data.offboarding);
      })
      .catch((err) => console.warn('Using initial offboarding:', err));
  }, []);

  // Initialize Firebase Auth listener and validate Firestore connection
  useEffect(() => {
    validateFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const matched =
          employees.find((e) => e.email.toLowerCase() === firebaseUser.email?.toLowerCase()) ||
          DEMO_USERS.find((u) => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());

        let baseUser: User;
        if (matched) {
          baseUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || matched.name,
            avatar: firebaseUser.photoURL || matched.avatar,
            email: firebaseUser.email || matched.email,
            role: (matched as any).role || 'employee',
            jobTitle: matched.jobTitle,
            department: matched.department,
            team: matched.team,
            phone: matched.phone,
            location: matched.location,
            managerName: (matched as any).managerName || (matched as any).manager,
            managerEmail: (matched as any).managerEmail,
            joinDate: (matched as any).joinDate || '15 Jan 2024',
          };
        } else {
          baseUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'WorkHub Employee',
            email: firebaseUser.email || '',
            avatar:
              firebaseUser.photoURL ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            role: 'employee',
            jobTitle: 'Software Engineer',
            department: 'Engineering',
            team: 'Backend',
            managerName: 'John Smith',
            managerEmail: 'john.smith@workhub.internal',
            phone: firebaseUser.phoneNumber || '+1 (555) 234-5678',
            location: 'San Francisco, CA (HQ)',
            joinDate: new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          };
        }

        // Check for locally saved profile customization
        try {
          const cached = localStorage.getItem(`workhub_user_profile_${firebaseUser.uid}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            baseUser = { ...baseUser, ...parsed };
          }
        } catch {}

        setCurrentUser(baseUser);
        setIsAuthenticated(true);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [employees]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleLoginSuccess = (user: User) => {
    let finalUser = { ...user };
    try {
      const cached = localStorage.getItem(`workhub_user_profile_${user.id}`);
      if (cached) {
        finalUser = { ...finalUser, ...JSON.parse(cached) };
      }
    } catch {}

    setCurrentUser(finalUser);
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
  };

  const handleLogoutConfirm = async () => {
    setIsLogoutOpen(false);
    try {
      await firebaseSignOut();
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
    setIsAuthenticated(false);
  };

  const handleSwitchRole = (newUser: User) => {
    let finalUser = { ...newUser };
    try {
      const cached = localStorage.getItem(`workhub_user_profile_${newUser.id}`);
      if (cached) {
        finalUser = { ...finalUser, ...JSON.parse(cached) };
      }
    } catch {}
    setCurrentUser(finalUser);
  };

  const handleSaveProfile = async (updatedProfile: Partial<User>) => {
    // 1. Update current authenticated user in local React state
    const mergedUser: User = {
      ...currentUser,
      ...updatedProfile,
    };
    setCurrentUser(mergedUser);

    // Save to localStorage for instant local persistence
    try {
      localStorage.setItem(`workhub_user_profile_${currentUser.id}`, JSON.stringify(mergedUser));
    } catch {}

    // 2. Synchronize employee record in company directory list
    setEmployees((prev) =>
      prev.map((emp) => {
        if (
          emp.id === currentUser.id ||
          emp.email.toLowerCase() === (currentUser.email || '').toLowerCase()
        ) {
          return {
            ...emp,
            name: updatedProfile.name ?? emp.name,
            avatar: updatedProfile.avatar ?? emp.avatar,
            jobTitle: updatedProfile.jobTitle ?? emp.jobTitle,
            department: updatedProfile.department ?? emp.department,
            team: updatedProfile.team ?? emp.team,
            email: updatedProfile.email ?? emp.email,
            phone: updatedProfile.phone ?? emp.phone,
            location: updatedProfile.location ?? emp.location,
            bio: updatedProfile.bio ?? emp.bio,
            skills: updatedProfile.skills ?? emp.skills,
            projects: updatedProfile.projects ?? emp.projects,
            manager: updatedProfile.managerName ?? emp.manager,
          };
        }
        return emp;
      })
    );

    // 3. Persist to Express API and Firebase Firestore
    try {
      const payload = {
        id: currentUser.id,
        name: mergedUser.name,
        jobTitle: mergedUser.jobTitle,
        department: mergedUser.department,
        team: mergedUser.team,
        email: mergedUser.email,
        phone: mergedUser.phone,
        location: mergedUser.location,
        bio: mergedUser.bio,
        avatar: mergedUser.avatar,
        skills: mergedUser.skills,
        projects: mergedUser.projects,
        manager: mergedUser.managerName,
      };

      // Direct client-side Firestore sync (governed by firestore.rules)
      syncEmployeeToClientFirestore(payload);

      // Backend API sync
      await fetch(`/api/employees/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Backend profile update note:', err);
    }
  };

  const handleAddArticle = async (newArt: Partial<KnowledgeArticle>) => {
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArt),
      });
      const data = await res.json();
      if (data.article) {
        setArticles((prev) => [data.article, ...prev]);
      }
    } catch (err) {
      const fallback: KnowledgeArticle = {
        id: `art-${Date.now()}`,
        title: newArt.title || 'Untitled',
        category: (newArt.category as any) || 'Company Policies',
        summary: newArt.summary || '',
        content: newArt.content || '',
        updatedAt: 'Just now',
        author: newArt.author || currentUser.name,
        readTime: '3 min read',
        tags: newArt.tags || ['general'],
        accessLevel: 'all',
      };
      setArticles((prev) => [fallback, ...prev]);
    }
  };

  const handleAddEvent = async (newEvent: Partial<CompanyEvent>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      const data = await res.json();
      if (data.event) {
        setEvents((prev) => [...prev, data.event]);
      }
    } catch {
      const fallback: CompanyEvent = {
        id: `evt-${Date.now()}`,
        title: newEvent.title || 'New Event',
        date: '2026-08-25',
        displayDate: { month: 'AUG', day: '25' },
        time: newEvent.time || '10:00 AM',
        team: newEvent.team || 'All Teams',
        type: (newEvent.type as any) || 'Team Meeting',
        location: 'Google Meet',
        meetingLink: newEvent.meetingLink || 'https://meet.google.com/hub-sync',
        participants: newEvent.participants || [currentUser.name],
        description: 'Scheduled meeting',
      };
      setEvents((prev) => [...prev, fallback]);
    }
  };

  const handleUpdateOffboardingTask = async (
    taskId: string,
    status: 'completed' | 'pending' | 'in_progress',
    handoverDetails?: string
  ) => {
    try {
      const res = await fetch(`/api/offboarding/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, handoverDetails }),
      });
      const data = await res.json();
      if (data.offboarding) {
        setOffboarding(data.offboarding);
        return;
      }
    } catch {
      // client-side fallback
    }

    setOffboarding((prev) => {
      const updatedTasks = prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              handoverDetails: handoverDetails !== undefined ? handoverDetails : t.handoverDetails,
              completedDate:
                status === 'completed'
                  ? `Completed on ${new Date().toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}`
                  : undefined,
            }
          : t
      );
      const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
      return {
        ...prev,
        tasks: updatedTasks,
        progressPercent: Math.round((completedCount / updatedTasks.length) * 100),
      };
    });
  };

  const handleNavigateFromSearch = (tab: string, metadata?: any) => {
    setCurrentTab(tab);
    if (metadata?.articleId) {
      setSelectedArticleId(metadata.articleId);
    }
  };

  const handleOpenArticleByTitle = (title: string) => {
    const art = articles.find((a) => a.title.toLowerCase().includes(title.toLowerCase()));
    if (art) {
      setSelectedArticleId(art.id);
      setCurrentTab('knowledge');
    }
  };

  // Show quick connecting screen while Firebase checks credentials
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 animate-pulse">
          W
        </div>
        <p className="text-xs font-semibold text-slate-600">Connecting to WorkHub...</p>
      </div>
    );
  }

  // If user is not authenticated, render Login Page WITHOUT application sidebar (PRD Requirement 3 & 14)
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/70 text-slate-800">
      {/* Authenticated Persistent Sidebar (Collapsible on Tablet & Desktop) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenLogout={() => setIsLogoutOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenLogout={() => setIsLogoutOpen(true)}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onSwitchRole={handleSwitchRole}
          demoUsers={DEMO_USERS}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          notifications={notifications}
          onNotificationClick={(notif) => {
            if (notif.type === 'meeting') setCurrentTab('events');
            else if (notif.type === 'offboarding') setCurrentTab('offboarding');
            else setCurrentTab('dashboard');
          }}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
              events={events}
              announcements={announcements}
              onJoinMeeting={(meeting) => setActiveMeetingRoom(meeting)}
              onOpenArticle={(artId) => {
                setSelectedArticleId(artId);
                setCurrentTab('knowledge');
              }}
            />
          )}

          {currentTab === 'ai-assistant' && (
            <AIAssistantView onOpenArticleByTitle={handleOpenArticleByTitle} />
          )}

          {currentTab === 'people' && (
            <PeopleFinderView
              employees={employees}
              currentUser={currentUser}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
              onOpenMessageModal={(emp) => setActiveMessageRecipient(emp)}
            />
          )}

          {currentTab === 'teams' && (
            <TeamDirectoryView
              departments={departments}
              onNavigateToDocs={() => setCurrentTab('knowledge')}
            />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeBaseView
              articles={articles}
              currentUser={currentUser}
              onAddArticle={handleAddArticle}
              selectedArticleId={selectedArticleId}
              onClearSelectedArticle={() => setSelectedArticleId(null)}
            />
          )}

          {currentTab === 'events' && (
            <EventsView
              events={events}
              currentUser={currentUser}
              onAddEvent={handleAddEvent}
              onJoinMeeting={(evt) => setActiveMeetingRoom(evt)}
            />
          )}

          {currentTab === 'offboarding' && (
            <OffboardingView
              offboarding={offboarding}
              currentUser={currentUser}
              onUpdateTask={handleUpdateOffboardingTask}
              onOpenArticleByTitle={handleOpenArticleByTitle}
            />
          )}

          {currentTab === 'image-studio' && (
            <ImageStudioView
              currentUser={currentUser}
              onUpdateAvatar={(newAvatar) => {
                handleSaveProfile({ avatar: newAvatar });
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigateFromSearch}
      />

      <DirectMessageModal
        recipient={activeMessageRecipient}
        onClose={() => setActiveMessageRecipient(null)}
      />

      <MeetingRoomModal
        meeting={activeMeetingRoom}
        onClose={() => setActiveMeetingRoom(null)}
      />

      {/* Edit Profile & Photo Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
      />

      {/* Mobile/Compact Tablet Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenDrawer={() => setIsMobileOpen(true)}
      />
    </div>
  );
}
