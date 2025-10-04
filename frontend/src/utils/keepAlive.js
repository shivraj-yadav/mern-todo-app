// Keep server alive utility
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const startKeepAlive = () => {
  // Ping server every 10 minutes to prevent cold start
  const keepAlive = setInterval(() => {
    // Only ping if user is active (tab is visible)
    if (document.visibilityState === 'visible') {
      fetch(`${API_URL}/api/health`)
        .catch(() => {}); // Silent ping, ignore errors
    }
  }, 10 * 60 * 1000); // 10 minutes

  return keepAlive;
};

export const stopKeepAlive = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};
