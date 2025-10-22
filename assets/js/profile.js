(function (global) {
  const PROFILE_PREFIX = 'profile_';
  const HISTORY_PREFIX = 'history_';

  function ensureProfile(user) {
    const key = PROFILE_PREFIX + user;
    if (!localStorage.getItem(key)) {
      const demoProfile = {
        wallet: 17.42,
        avatar: 'assets/img/avatar-placeholder.svg',
        tagline: '"Valsts pakalpojumi ar humora pieskaņu."'
      };
      localStorage.setItem(key, JSON.stringify(demoProfile));
    }
  }

  function getProfile(user) {
    ensureProfile(user);
    return JSON.parse(localStorage.getItem(PROFILE_PREFIX + user));
  }

  function updateProfile(user, data) {
    const current = getProfile(user);
    const next = Object.assign({}, current, data);
    localStorage.setItem(PROFILE_PREFIX + user, JSON.stringify(next));
    return next;
  }

  function getWallet(user) {
    return getProfile(user).wallet || 0;
  }

  function setWallet(user, value) {
    const rounded = Math.round(value * 100) / 100;
    updateProfile(user, { wallet: rounded });
    return rounded;
  }

  function adjustWallet(user, delta) {
    const profile = getProfile(user);
    const next = (profile.wallet || 0) + delta;
    return setWallet(user, next);
  }

  function pushHistory(user, message) {
    const key = HISTORY_PREFIX + user;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const entry = { message, timestamp: new Date().toISOString() };
    list.unshift(entry);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
    return entry;
  }

  function getHistory(user) {
    const key = HISTORY_PREFIX + user;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  function clearProfileData(user) {
    localStorage.removeItem(PROFILE_PREFIX + user);
    localStorage.removeItem(HISTORY_PREFIX + user);
    localStorage.removeItem('convictions_' + user);
    localStorage.removeItem('payments_' + user);
    localStorage.removeItem('appeals_' + user);
  }

  global.Profile = {
    ensureProfile,
    getProfile,
    updateProfile,
    getWallet,
    setWallet,
    adjustWallet,
    pushHistory,
    getHistory,
    clearProfileData
  };
})(window);
