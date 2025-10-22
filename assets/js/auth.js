(function (global) {
  const USERS_KEY = 'demo_users';
  const SESSION_KEY = 'current_user';

  const defaultUsers = [
    { user: 'janis.berzins', pass: '1234', name: 'Jānis Bērziņš', avatar: 'assets/img/avatar-placeholder.svg' },
    { user: 'evita.liepina', pass: '1234', name: 'Evita Liepiņa', avatar: 'assets/img/avatar-placeholder.svg' }
  ];

  function initDemoUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
  }

  function getUsers() {
    initDemoUsers();
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      console.warn('Failed to parse users, resetting demo users');
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
  }

  function login(username, password) {
    const users = getUsers();
    const match = users.find((u) => u.user === username && u.pass === password);
    if (!match) {
      throw new Error('AUTH_FAILED');
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: match.user, name: match.name, avatar: match.avatar }));
    return match;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getCurrentUser() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function isAuthenticated() {
    return !!getCurrentUser();
  }

  initDemoUsers();

  global.Auth = {
    login,
    logout,
    getCurrentUser,
    isAuthenticated
  };
})(window);
