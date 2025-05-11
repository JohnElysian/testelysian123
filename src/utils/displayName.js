export const getDisplayName = (user = {}) => {
  if (user.nickname) return user.nickname;
  if (user.uniqueId) return user.uniqueId;
  if (user.userId) {
    const idStr = String(user.userId);
    return idStr.length > 6 ? `u${idStr.slice(-6)}` : idStr;
  }
  return 'Unknown';
}; 