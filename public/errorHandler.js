// Error Handler with User-Friendly Messages and Error Codes
// This module provides centralized error handling for the budgeting app

const ErrorCodes = {
  // Input Validation Errors (1000-1999)
  INVALID_SALARY: 'ERR-1001',
  INVALID_DEDUCTIONS: 'ERR-1002',
  INVALID_EXPENSE: 'ERR-1003',
  MISSING_STATE: 'ERR-1004',
  MISSING_TAX_YEAR: 'ERR-1005',
  MISSING_FILING_STATUS: 'ERR-1006',
  NEGATIVE_VALUE: 'ERR-1007',
  SALARY_TOO_HIGH: 'ERR-1008',
  EXPENSE_TOO_HIGH: 'ERR-1009',
  MISSING_REQUIRED_FIELD: 'ERR-1010',
  
  // Calculation Errors (2000-2999)
  CALCULATION_FAILED: 'ERR-2001',
  TAX_DATA_MISSING: 'ERR-2002',
  TAKEHOME_NOT_CALCULATED: 'ERR-2003',
  INVALID_TAX_BRACKET: 'ERR-2004',
  
  // Storage Errors (3000-3999)
  LOCALSTORAGE_SAVE_FAILED: 'ERR-3001',
  LOCALSTORAGE_LOAD_FAILED: 'ERR-3002',
  LOCALSTORAGE_NOT_AVAILABLE: 'ERR-3003',
  
  // Export Errors (4000-4999)
  PDF_EXPORT_FAILED: 'ERR-4001',
  CHART_GENERATION_FAILED: 'ERR-4002',
  
  // General Errors (5000-5999)
  UNKNOWN_ERROR: 'ERR-5000',
  NETWORK_ERROR: 'ERR-5001'
};

const ErrorMessages = {
  [ErrorCodes.INVALID_SALARY]: 'Please enter a valid annual salary between $1 and $10,000,000.',
  [ErrorCodes.INVALID_DEDUCTIONS]: 'Pre-tax deductions must be a valid number and cannot exceed your salary.',
  [ErrorCodes.INVALID_EXPENSE]: 'Please enter a valid amount for expenses (must be a positive number).',
  [ErrorCodes.MISSING_STATE]: 'Please select your state of residence.',
  [ErrorCodes.MISSING_TAX_YEAR]: 'Please select a tax year.',
  [ErrorCodes.MISSING_FILING_STATUS]: 'Please select your filing status.',
  [ErrorCodes.NEGATIVE_VALUE]: 'Values cannot be negative. Please enter a positive number.',
  [ErrorCodes.SALARY_TOO_HIGH]: 'The salary amount seems unusually high. Please verify your input.',
  [ErrorCodes.EXPENSE_TOO_HIGH]: 'One or more expenses exceed your monthly take-home income. Please review your budget.',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields before continuing.',
  
  [ErrorCodes.CALCULATION_FAILED]: 'Unable to complete the calculation. Please check your inputs and try again.',
  [ErrorCodes.TAX_DATA_MISSING]: 'Tax information is not available for the selected year or state.',
  [ErrorCodes.TAKEHOME_NOT_CALCULATED]: 'Please calculate your take-home salary first before calculating remaining income.',
  [ErrorCodes.INVALID_TAX_BRACKET]: 'Unable to find tax bracket information for your selection.',
  
  [ErrorCodes.LOCALSTORAGE_SAVE_FAILED]: 'Unable to save your data. Your browser may have storage disabled.',
  [ErrorCodes.LOCALSTORAGE_LOAD_FAILED]: 'Unable to load previously saved data.',
  [ErrorCodes.LOCALSTORAGE_NOT_AVAILABLE]: 'Browser storage is not available. Your data will not be saved.',
  
  [ErrorCodes.PDF_EXPORT_FAILED]: 'Unable to export PDF. Please try again or use your browser\'s print function.',
  [ErrorCodes.CHART_GENERATION_FAILED]: 'Unable to generate the budget chart. Please refresh and try again.',
  
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please refresh the page and try again.',
  [ErrorCodes.NETWORK_ERROR]: 'Network connection issue. Please check your connection and try again.'
};

// Toast notification system using Bootstrap
function showErrorToast(errorCode, customMessage = null) {
  const message = customMessage || ErrorMessages[errorCode] || ErrorMessages[ErrorCodes.UNKNOWN_ERROR];
  const toastContainer = document.getElementById('toast-container');
  
  // Create toast element
  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <strong>${errorCode}</strong><br>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  // Initialize and show toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 5000
  });
  
  toast.show();
  
  // Remove toast element after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

function showSuccessToast(message) {
  const toastContainer = document.getElementById('toast-container');
  
  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 3000
  });
  
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

function showWarningToast(warningCode, customMessage = null) {
  const message = customMessage || ErrorMessages[warningCode] || 'Warning: Please review your input.';
  const toastContainer = document.getElementById('toast-container');
  
  // Create toast element with warning styling
  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-dark bg-warning border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <strong>${warningCode}</strong><br>
          ${message}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  // Initialize and show toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 5000
  });
  
  toast.show();
  
  // Remove toast element after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

// Validation utilities
const ValidationRules = {
  isValidNumber: (value) => {
    return !isNaN(value) && value !== null && value !== undefined && value !== '';
  },
  
  isPositive: (value) => {
    return value >= 0;
  },
  
  isInRange: (value, min, max) => {
    return value >= min && value <= max;
  },
  
  isNotEmpty: (value) => {
    return value !== null && value !== undefined && value !== '';
  }
};

// Input validator with specific error codes
function validateFinancialInput(inputValue, fieldName, options = {}) {
  const {
    min = 0,
    max = Infinity,
    required = true,
    allowZero = true
  } = options;
  
  // Check if required field is empty
  if (required && !ValidationRules.isNotEmpty(inputValue)) {
    return {
      valid: false,
      errorCode: ErrorCodes.MISSING_REQUIRED_FIELD,
      message: `${fieldName} is required.`
    };
  }
  
  // Skip validation if optional and empty
  if (!required && !ValidationRules.isNotEmpty(inputValue)) {
    return { valid: true };
  }
  
  const numValue = parseFloat(inputValue);
  
  // Check if it's a valid number
  if (!ValidationRules.isValidNumber(numValue)) {
    return {
      valid: false,
      errorCode: ErrorCodes.INVALID_EXPENSE,
      message: `${fieldName} must be a valid number.`
    };
  }
  
  // Check if positive (or zero if allowed)
  if (!allowZero && numValue === 0) {
    return {
      valid: false,
      errorCode: ErrorCodes.INVALID_EXPENSE,
      message: `${fieldName} must be greater than zero.`
    };
  }
  
  if (!ValidationRules.isPositive(numValue)) {
    return {
      valid: false,
      errorCode: ErrorCodes.NEGATIVE_VALUE,
      message: `${fieldName} cannot be negative.`
    };
  }
  
  // Check range
  if (!ValidationRules.isInRange(numValue, min, max)) {
    return {
      valid: false,
      errorCode: ErrorCodes.INVALID_EXPENSE,
      message: `${fieldName} must be between $${min.toLocaleString()} and $${max.toLocaleString()}.`
    };
  }
  
  return { valid: true, value: numValue };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorCodes, ErrorMessages, showErrorToast, showSuccessToast, showWarningToast, validateFinancialInput, ValidationRules };
}
