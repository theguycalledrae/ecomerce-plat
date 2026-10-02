const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Validates a date-of-birth value (ISO string, Date, or null/undefined).
 * Rejects: future dates, dates older than 150 years, dates less than 13 years ago.
 */
function validateDateOfBirth(value) {
  if (value === undefined || value === null || value === "") return true;
  const date = new Date(value);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  if (date > now) return false;
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - 150);
  if (date < minDate) return false;
  const minAgeDate = new Date();
  minAgeDate.setFullYear(now.getFullYear() - 13);
  if (date > minAgeDate) return false;
  return true;
}

export function validateRegister({ name = "", email = "", password = "" } = {}) {
  const errors = [];

  if (typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    errors.push({ field: "email", message: "A valid email is required" });
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters" });
  }

  return errors;
}

export function validateLogin({ email = "", password = "" } = {}) {
  const errors = [];

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    errors.push({ field: "email", message: "A valid email is required" });
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters" });
  }

  return errors;
}

export function validateUpdateProfile({ name = "", email = "", dateOfBirth = "", image = "" } = {}) {
  const errors = [];

  if (typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    errors.push({ field: "email", message: "A valid email is required" });
  }

  if (!validateDateOfBirth(dateOfBirth)) {
    errors.push({
      field: "dateOfBirth",
      message:
        "Date of birth must be a valid past date, at least 13 years ago, and not older than 150 years.",
    });
  }

  return errors;
}
