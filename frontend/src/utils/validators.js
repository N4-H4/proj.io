/**
 * Validate email format.
 */
export function validateEmail(email) {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
}

/**
 * Validate password.
 */
export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

/**
 * Validate name.
 */
export function validateName(name) {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length > 100) return 'Name must be at most 100 characters';
  return null;
}

/**
 * Validate required field.
 */
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}
