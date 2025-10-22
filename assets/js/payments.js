(function (global) {
  const PAYMENTS_PREFIX = 'payments_';

  function getPaymentKey(user) {
    return PAYMENTS_PREFIX + user;
  }

  function getPayments(user) {
    return JSON.parse(localStorage.getItem(getPaymentKey(user)) || '[]');
  }

  function addPayment(user, amount) {
    const list = getPayments(user);
    const entry = {
      id: `${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      amount,
      messageLv: `Pievienots ${amount.toFixed(2)} € iedomātajam maciņam`,
      messageEn: `Added €${amount.toFixed(2)} to the imaginary wallet`,
      timestamp: new Date().toISOString()
    };
    list.unshift(entry);
    localStorage.setItem(getPaymentKey(user), JSON.stringify(list.slice(0, 50)));
    Profile.adjustWallet(user, amount);
    Profile.pushHistory(user, `Maksājuma simulācija: +${amount.toFixed(2)} €`);
    return entry;
  }

  function reset(user) {
    localStorage.removeItem(getPaymentKey(user));
  }

  global.Payments = {
    getPayments,
    addPayment,
    reset
  };
})(window);
