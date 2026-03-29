/**
 * Format number with commas for thousands
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format date to readable format
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (completed, total) => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

/**
 * Get color based on rating
 */
export const getColorByRating = (rating) => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4) return 'text-blue-600';
  if (rating >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * Get background color based on rating
 */
export const getBgColorByRating = (rating) => {
  if (rating >= 4.5) return 'bg-green-50';
  if (rating >= 4) return 'bg-blue-50';
  if (rating >= 3) return 'bg-yellow-50';
  return 'bg-red-50';
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, length) => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  return emailRegex.test(email);
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format rating to stars
 */
export const formatRatingToStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '⭐'.repeat(fullStars) + (hasHalfStar ? '✨' : '') + '☆'.repeat(emptyStars);
};

/**
 * Get time ago string
 */
export const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(date);
};

/**
 * Slugify string
 */
export const slugify = (string) => {
  return string
    .toLowerCase()
    .trim()
    .replace(/[^w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
};
