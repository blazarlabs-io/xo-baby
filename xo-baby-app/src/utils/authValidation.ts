/**
 * Authentication validation utilities
 */

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength
 */
export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  // Optional: Add more password strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }

  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }

  // if (!/\d/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates name (first and last name)
 */
export const validateName = (
  name: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    errors.push("Name is required");
  }

  if (trimmedName.length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (trimmedName.length > 50) {
    errors.push("Name must be less than 50 characters");
  }

  // Check if name contains at least one space (first and last name)
  if (!trimmedName.includes(" ")) {
    errors.push("Please enter both first and last name");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Formats name into first and last name
 */
export const formatName = (
  fullName: string
): { firstName: string; lastName: string } => {
  const trimmedName = fullName.trim();
  const nameParts = trimmedName.split(" ");

  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      lastName: "",
    };
  }

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  return { firstName, lastName };
};

/**
 * Sanitizes user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Validates password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};

/**
 * Generates a random password (for testing purposes)
 */
export const generateTestPassword = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Checks if user is eligible for signup (age verification placeholder)
 */
export const isEligibleForSignup = (): boolean => {
  // Placeholder for age verification logic
  // In a real app, you might check if user is 18+ or has parental consent
  return true;
};

/**
 * Validates phone number format (optional)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  formatName,
  sanitizeInput,
  validatePasswordConfirmation,
  generateTestPassword,
  isEligibleForSignup,
  validatePhoneNumber,
};
