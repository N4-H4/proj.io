// Frontend route constants
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  DEADLINES: '/deadlines',
  SETTINGS: '/settings',
};

// Status labels
export const PROJECT_STATUS_LABELS = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const TASK_STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const TASK_PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const WORKFLOW_STATUS_LABELS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

// Badge CSS class mapping
export const STATUS_BADGE_CLASS = {
  TODO: 'badge-todo',
  IN_PROGRESS: 'badge-progress',
  DONE: 'badge-done',
  PLANNED: 'badge-planned',
  COMPLETED: 'badge-done',
};

export const PRIORITY_BADGE_CLASS = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
};

// Domain options for project creation
export const DOMAIN_OPTIONS = [
  'Web Development',
  'App Development',
  'Backend',
  'Full Stack',
  'AI / ML',
  'Data Science',
  'Other',
];

// API endpoints
export const API = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    ME: '/users/me',
    THEME: '/users/me/theme',
    WELCOME: '/users/me/welcome',
  },
  PROJECTS: '/projects',
  TASKS: '/tasks',
  BRAIN_DUMP: '/brain-dump',
  DASHBOARD: '/dashboard/stats',
  DEADLINES: '/deadlines',
};
