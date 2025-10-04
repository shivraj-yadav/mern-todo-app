// Optimized bcrypt configuration for performance
const getBcryptRounds = () => {
  // Balance security with performance
  if (process.env.NODE_ENV === 'production') {
    return 10; // Good security, reasonable speed (~100ms)
  } else if (process.env.NODE_ENV === 'development') {
    return 8;  // Faster for development (~25ms)
  }
  return 10; // Default safe value
};

module.exports = {
  saltRounds: getBcryptRounds(),
  
  // Performance info for different rounds:
  // 8 rounds: ~25ms (development)
  // 10 rounds: ~100ms (production recommended)
  // 12 rounds: ~2-3 seconds (too slow for UX)
};
