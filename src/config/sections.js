import {
  Home, Target, Layers, ListChecks, Network, Brain, GraduationCap,
  AppWindow, Database, Workflow, Users, HelpCircle, BookOpen,
  CalendarRange,
  LayoutDashboard, FileText, Calendar, Inbox, GitPullRequest,
  MessageSquare, Radio, Newspaper, Megaphone, FolderOpen, Eye,
  ClipboardList,
} from 'lucide-react';

const ALL_SECTIONS = {
  'home':              { label: 'Übersicht',          icon: Home,            path: '/' },
  'strategie':         { label: 'Strategie',          icon: Target,          path: '/strategie' },
  'handlungsfelder':   { label: 'Handlungsfelder',    icon: Layers,          path: '/handlungsfelder' },
  'massnahmen':        { label: 'Massnahmen',         icon: ListChecks,      path: '/massnahmen' },
  'sprints':           { label: 'Sprints',            icon: CalendarRange,   path: '/sprints' },
  'systemlandschaft':  { label: 'Software & Co',      icon: Network,         path: '/systemlandschaft' },
  'ki-hub':            { label: 'KI',                 icon: Brain,           path: '/ki-hub' },
  'schulungen':        { label: 'Schulungen',         icon: GraduationCap,   path: '/schulungen' },
  'software-antraege': { label: 'Software-Anträge',   icon: AppWindow,       path: '/software-antraege' },
  'prozesse':          { label: 'Prozesse',           icon: Workflow,        path: '/prozesse' },
  'team':              { label: 'Team',               icon: Users,           path: '/team' },
  'faqs':              { label: 'FAQs',               icon: HelpCircle,      path: '/faqs' },
  'glossar':           { label: 'Glossar',            icon: BookOpen,        path: '/glossar' },

  'cp-dashboard':      { label: 'Dashboard',          icon: LayoutDashboard, path: '/cp' },
  'cp-live-infos':     { label: 'Live Infos',         icon: Radio,           path: '/cp/live-infos' },
  'cp-news':           { label: 'News',               icon: Newspaper,       path: '/cp/news' },
  'cp-nachrichten':    { label: 'Nachrichten',        icon: Megaphone,       path: '/cp/nachrichten' },
  'cp-content':        { label: 'Content',            icon: FileText,        path: '/cp/content' },
  'cp-events':         { label: 'Events',             icon: Calendar,        path: '/cp/events' },
  'cp-antraege':       { label: 'Anträge',            icon: Inbox,           path: '/cp/antraege' },
  'cp-users':          { label: 'Users',              icon: Users,           path: '/cp/users' },
  'cp-changes':        { label: 'Changes',            icon: GitPullRequest,  path: '/cp/changes' },
  'cp-massnahmen':     { label: 'Massnahmen',         icon: ListChecks,      path: '/cp/massnahmen' },
  'cp-sprints':        { label: 'Sprints',            icon: CalendarRange,   path: '/cp/sprints' },
  'cp-themen':         { label: 'Themen',             icon: MessageSquare,   path: '/cp/themen' },
  'cp-scnat-db':       { label: 'SCNAT DB',           icon: Database,        path: '/cp/scnat-db' },
  'cp-sichtbarkeit':   { label: 'Sichtbarkeit',       icon: Eye,             path: '/cp/sichtbarkeit' },
  'cp-admin-stuff':    { label: 'Admin Stuff',        icon: FolderOpen,      path: '/cp/admin-stuff' },
  'cp-admin-details':  { label: 'Admin Details',      icon: ClipboardList,   path: '/cp/admin-details' },
};

export const CP_BADGE_KEYS = {
  'cp-events': 'events',
  'cp-antraege': 'antraege',
  'cp-changes': 'changes',
  'cp-themen': 'themen',
};

export function getSectionMeta(key) {
  return ALL_SECTIONS[key] || null;
}

export default ALL_SECTIONS;
