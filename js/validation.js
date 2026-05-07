/**
 * validation.js
 * Custom Form Validation Engine — Cooking & Recipe Website
 * Author: Marwan Alaa
 * COM209 – Internet Technology | AY 2025/2026
 * يا ولى النعم 
 * IMPORTANT: All forms must have the `novalidate` attribute.
 * This engine replaces all HTML5 default browser popups with
 * styled inline error messages.
 */

"use strict";

/* =========================================================
   UTILITY: Show / Clear inline errors
   ========================================================= */

/**
 * Finds the .error-msg <span> next to an input and displays a message.
 * Also adds the CSS class "input-error" to the input element itself.
 * @param {HTMLElement} inputElement
 * @param {string} message
 */
function showError(inputElement, message) {
  if (!inputElement) return;

  inputElement.classList.add("error");
  inputElement.setAttribute("aria-invalid", "true");

  // Look for a sibling .error-msg element
  let errorSpan =
    inputElement.parentElement.querySelector(".error-msg") ||
    inputElement.closest(".field-group")?.querySelector(".error-msg");

  if (!errorSpan) {
    // Create one on the fly if the HTML doesn't already have one
    errorSpan = document.createElement("span");
    errorSpan.classList.add("error-msg");
    inputElement.insertAdjacentElement("afterend", errorSpan);
  }

  errorSpan.textContent = message;
  errorSpan.style.display = "block";
}

/**
 * Removes the error state from an input and hides its error message.
 * @param {HTMLElement} inputElement
 */
function clearError(inputElement) {
  if (!inputElement) return;

  inputElement.classList.remove("error");
  inputElement.setAttribute("aria-invalid", "false");

  const errorSpan =
    inputElement.parentElement.querySelector(".error-msg") ||
    inputElement.closest(".field-group")?.querySelector(".error-msg");

  if (errorSpan) {
    errorSpan.textContent = "";
    errorSpan.style.display = "none";
  }
}

/* =========================================================
   FORMAT CHECKERS
   ========================================================= */

/**
 * Validates an email address using a standard regex pattern.
 * @param {string} value
 * @returns {boolean}
 */
function isValidEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
}

/**
 * Validates a password:
 *   - At least 8 characters
 *   - At least one uppercase letter (A-Z)
 *   - At least one digit (0-9)
 * @param {string} value
 * @returns {boolean}
 */
function isValidPassword(value) {
  if (value.length < 8) return false;
  if (!/[A-Z]/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  return true;
}

/**
 * Checks that two password strings are identical.
 * @param {string} pass1
 * @param {string} pass2
 * @returns {boolean}
 */
function passwordsMatch(pass1, pass2) {
  return pass1 === pass2;
}

/* =========================================================
   PASSWORD STRENGTH METER
   ========================================================= */

/**
 * Scores a password from 0 (empty) to 4 (very strong).
 * Criteria:
 *   +1  length >= 8
 *   +1  length >= 12
 *   +1  contains uppercase AND lowercase
 *   +1  contains digit
 *   +1  contains special character
 * Max returned value is capped at 4.
 * @param {string} passwordValue
 * @returns {number} 0–4
 */
function passwordStrengthMeter(passwordValue) {
  if (!passwordValue) return 0;

  let score = 0;
  if (passwordValue.length >= 8) score++;
  if (passwordValue.length >= 12) score++;
  if (/[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue)) score++;
  if (/[0-9]/.test(passwordValue)) score++;
  if (/[^A-Za-z0-9]/.test(passwordValue)) score++;

  return Math.min(score, 4);
}

/**
 * Updates the visual password-strength bar in the DOM.
 * Expects:
 *   #strength-bar   — the <div class="strength-bar-fill"> element
 *   #strength-label — the <span> that shows text
 * @param {string} passwordValue
 */
function updateStrengthBar(passwordValue) {
  const bar = document.getElementById("strength-bar");
  const label = document.getElementById("strength-label");
  if (!bar || !label) return;

  const score = passwordStrengthMeter(passwordValue);
  const levels = [
    { text: "", width: "0%", color: "transparent" },
    { text: "Weak", width: "25%", color: "var(--color-danger)" },
    { text: "Fair", width: "50%", color: "var(--color-warning)" },
    { text: "Strong", width: "75%", color: "var(--color-primary-light)" },
    { text: "Very Strong", width: "100%", color: "var(--color-success)" },
  ];

  const level = levels[score];
  bar.style.width = level.width;
  bar.style.backgroundColor = level.color;
  label.textContent = level.text;
  label.style.color = level.color;
}

/* =========================================================
   FORM-SPECIFIC VALIDATORS
   ========================================================= */

/**
 * Validates the Login form.
 * Checks: email format, password not empty.
 * @returns {boolean} true if all fields pass
 */
function validateLoginForm() {
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  let isValid = true;

  // Email
  if (!emailInput) {
    isValid = false;
  } else if (emailInput.value.trim() === "") {
    showError(emailInput, "Email address is required.");
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    showError(emailInput, "Please enter a valid email address (e.g. user@example.com).");
    isValid = false;
  } else {
    clearError(emailInput);
  }

  // Password
  if (!passwordInput) {
    isValid = false;
  } else if (passwordInput.value.trim() === "") {
    showError(passwordInput, "Password is required.");
    isValid = false;
  } else {
    clearError(passwordInput);
  }

  return isValid;
}

/**
 * Validates the Register form.
 * Checks: full name, email, password strength, password match, T&C checkbox.
 * @returns {boolean} true if all fields pass
 */
function validateRegisterForm() {
  const nameInput = document.getElementById("reg-name");
  const emailInput = document.getElementById("reg-email");
  const passwordInput = document.getElementById("reg-password");
  const confirmInput = document.getElementById("reg-confirm");
  const termsInput = document.getElementById("reg-terms");
  let isValid = true;

  // Full Name
  if (!nameInput || nameInput.value.trim() === "") {
    showError(nameInput, "Full name is required.");
    isValid = false;
  } else if (nameInput.value.trim().length < 2) {
    showError(nameInput, "Name must be at least 2 characters.");
    isValid = false;
  } else {
    clearError(nameInput);
  }

  // Email
  if (!emailInput || emailInput.value.trim() === "") {
    showError(emailInput, "Email address is required.");
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    showError(emailInput, "Please enter a valid email address.");
    isValid = false;
  } else {
    clearError(emailInput);
  }

  // Password strength
  if (!passwordInput || passwordInput.value.trim() === "") {
    showError(passwordInput, "Password is required.");
    isValid = false;
  } else if (!isValidPassword(passwordInput.value)) {
    showError(
      passwordInput,
      "Password must be at least 8 characters, include one uppercase letter and one number."
    );
    isValid = false;
  } else {
    clearError(passwordInput);
  }

  // Confirm password
  if (!confirmInput || confirmInput.value.trim() === "") {
    showError(confirmInput, "Please confirm your password.");
    isValid = false;
  } else if (!passwordsMatch(passwordInput?.value || "", confirmInput.value)) {
    showError(confirmInput, "Passwords do not match.");
    isValid = false;
  } else {
    clearError(confirmInput);
  }

  // Terms & Conditions
  if (termsInput && !termsInput.checked) {
    showError(termsInput, "You must accept the Terms & Conditions to register.");
    isValid = false;
  } else if (termsInput) {
    clearError(termsInput);
  }

  return isValid;
}

/**
 * Validates the Submit Recipe form.
 * Checks: title not empty, at least 2 ingredient rows, at least 1 step, image uploaded.
 * @returns {boolean} true if all fields pass
 */
function validateSubmitRecipeForm() {
  let isValid = true;

  // Recipe Title
  const titleInput = document.getElementById("recipe-title");
  if (!titleInput || titleInput.value.trim() === "") {
    showError(titleInput, "Recipe title is required.");
    isValid = false;
  } else {
    clearError(titleInput);
  }

  // Ingredients — at least 2 rows
  const ingredientRows = document.querySelectorAll(".ingredient-row");
  const ingredientError = document.getElementById("ingredients-error");
  if (ingredientRows.length < 2) {
    if (ingredientError) {
      ingredientError.textContent = "Please add at least 2 ingredients.";
      ingredientError.style.display = "block";
    }
    isValid = false;
  } else {
    if (ingredientError) {
      ingredientError.textContent = "";
      ingredientError.style.display = "none";
    }

    // Validate each ingredient row's name field
    ingredientRows.forEach((row, index) => {
      const nameField = row.querySelector(".ing-name");
      if (nameField && nameField.value.trim() === "") {
        showError(nameField, `Ingredient #${index + 1} name is required.`);
        isValid = false;
      } else if (nameField) {
        clearError(nameField);
      }
    });
  }

  // Steps — at least 1
  const stepRows = document.querySelectorAll(".step-row");
  const stepsError = document.getElementById("steps-error");
  if (stepRows.length < 1) {
    if (stepsError) {
      stepsError.textContent = "Please add at least one instruction step.";
      stepsError.style.display = "block";
    }
    isValid = false;
  } else {
    if (stepsError) {
      stepsError.textContent = "";
      stepsError.style.display = "none";
    }

    stepRows.forEach((row, index) => {
      const textarea = row.querySelector(".step-textarea");
      if (textarea && textarea.value.trim() === "") {
        showError(textarea, `Step ${index + 1} cannot be empty.`);
        isValid = false;
      } else if (textarea) {
        clearError(textarea);
      }
    });
  }

  // Image upload — required
  const imageInput = document.getElementById("recipe-image");
  if (!imageInput) {
    isValid = false;
  } else if (!imageInput.files || imageInput.files.length === 0) {
    showError(imageInput, "A cover image is required.");
    isValid = false;
  } else {
    clearError(imageInput);
  }

  return isValid;
}

/**
 * Validates the Contact form.
 * Checks: name, email format, message minimum length (20 chars).
 * @returns {boolean} true if all fields pass
 */
function validateContactForm() {
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const messageInput = document.getElementById("contact-message");
  let isValid = true;

  // Name
  if (!nameInput || nameInput.value.trim() === "") {
    showError(nameInput, "Your name is required.");
    isValid = false;
  } else {
    clearError(nameInput);
  }

  // Email
  if (!emailInput || emailInput.value.trim() === "") {
    showError(emailInput, "Email address is required.");
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    showError(emailInput, "Please enter a valid email address.");
    isValid = false;
  } else {
    clearError(emailInput);
  }

  // Message — minimum 20 characters
  if (!messageInput || messageInput.value.trim() === "") {
    showError(messageInput, "Message is required.");
    isValid = false;
  } else if (messageInput.value.trim().length < 20) {
    showError(messageInput, "Message must be at least 20 characters long.");
    isValid = false;
  } else {
    clearError(messageInput);
  }

  return isValid;
}

/* =========================================================
   REAL-TIME BLUR VALIDATION (attach on page load)
   ========================================================= */

/**
 * Attaches on-blur event listeners to all known form fields
 * so that errors appear as soon as the user leaves a field,
 * rather than waiting until they hit Submit.
 *
 * Called automatically on DOMContentLoaded.
 */
function attachBlurListeners() {
  // ── Login form
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");

  loginEmail?.addEventListener("blur", () => {
    if (!loginEmail.value.trim()) {
      showError(loginEmail, "Email address is required.");
    } else if (!isValidEmail(loginEmail.value)) {
      showError(loginEmail, "Please enter a valid email address.");
    } else {
      clearError(loginEmail);
    }
  });

  loginPassword?.addEventListener("blur", () => {
    if (!loginPassword.value.trim()) {
      showError(loginPassword, "Password is required.");
    } else {
      clearError(loginPassword);
    }
  });

  // ── Register form
  const regName = document.getElementById("reg-name");
  const regEmail = document.getElementById("reg-email");
  const regPassword = document.getElementById("reg-password");
  const regConfirm = document.getElementById("reg-confirm");

  regName?.addEventListener("blur", () => {
    if (!regName.value.trim()) {
      showError(regName, "Full name is required.");
    } else if (regName.value.trim().length < 2) {
      showError(regName, "Name must be at least 2 characters.");
    } else {
      clearError(regName);
    }
  });

  regEmail?.addEventListener("blur", () => {
    if (!regEmail.value.trim()) {
      showError(regEmail, "Email address is required.");
    } else if (!isValidEmail(regEmail.value)) {
      showError(regEmail, "Please enter a valid email address.");
    } else {
      clearError(regEmail);
    }
  });

  regPassword?.addEventListener("blur", () => {
    if (!regPassword.value.trim()) {
      showError(regPassword, "Password is required.");
    } else if (!isValidPassword(regPassword.value)) {
      showError(
        regPassword,
        "Password must be at least 8 characters, include one uppercase letter and one number."
      );
    } else {
      clearError(regPassword);
    }
  });

  // Live strength bar update while typing
  regPassword?.addEventListener("input", () => {
    updateStrengthBar(regPassword.value);
  });

  regConfirm?.addEventListener("blur", () => {
    if (!regConfirm.value.trim()) {
      showError(regConfirm, "Please confirm your password.");
    } else if (!passwordsMatch(regPassword?.value || "", regConfirm.value)) {
      showError(regConfirm, "Passwords do not match.");
    } else {
      clearError(regConfirm);
    }
  });

  // ── Submit Recipe form
  const recipeTitle = document.getElementById("recipe-title");
  recipeTitle?.addEventListener("blur", () => {
    if (!recipeTitle.value.trim()) {
      showError(recipeTitle, "Recipe title is required.");
    } else {
      clearError(recipeTitle);
    }
  });

  // Character counter for short description
  const descTextarea = document.getElementById("recipe-description");
  const charCounter = document.getElementById("desc-char-count");
  if (descTextarea && charCounter) {
    descTextarea.addEventListener("input", () => {
      charCounter.textContent = descTextarea.value.length;
    });
  }

  // ── Contact form blur listeners
  const contactName = document.getElementById("contact-name");
  const contactEmail = document.getElementById("contact-email");
  const contactMessage = document.getElementById("contact-message");

  contactName?.addEventListener("blur", () => {
    if (!contactName.value.trim()) {
      showError(contactName, "Your name is required.");
    } else {
      clearError(contactName);
    }
  });

  contactEmail?.addEventListener("blur", () => {
    if (!contactEmail.value.trim()) {
      showError(contactEmail, "Email address is required.");
    } else if (!isValidEmail(contactEmail.value)) {
      showError(contactEmail, "Please enter a valid email address.");
    } else {
      clearError(contactEmail);
    }
  });

  contactMessage?.addEventListener("blur", () => {
    if (!contactMessage.value.trim()) {
      showError(contactMessage, "Message is required.");
    } else if (contactMessage.value.trim().length < 20) {
      showError(contactMessage, "Message must be at least 20 characters long.");
    } else {
      clearError(contactMessage);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      if (!validateLoginForm()) {
        e.preventDefault(); 
      }
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      if (!validateRegisterForm()) {
        e.preventDefault(); 
      }
    });
  }
});

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", attachBlurListeners);

/* =========================================================
   EXPORTS (for use by other files via module or global scope)
   ========================================================= */
// If the project later adopts ES modules, swap to:
// export { showError, clearError, isValidEmail, ... };
// For now, all functions live on the global scope (window).
