/**
 * Unit Tests for Error Handler and Validation Utilities
 * Tests validation functions and error code mappings
 */

const {
  ErrorCodes,
  ErrorMessages,
  validateFinancialInput,
  ValidationRules
} = require('../public/errorHandler.js');

describe('ErrorCodes', () => {
  test('should have all required error codes defined', () => {
    expect(ErrorCodes.INVALID_SALARY).toBeDefined();
    expect(ErrorCodes.INVALID_DEDUCTIONS).toBeDefined();
    expect(ErrorCodes.INVALID_EXPENSE).toBeDefined();
    expect(ErrorCodes.MISSING_STATE).toBeDefined();
    expect(ErrorCodes.NEGATIVE_VALUE).toBeDefined();
    expect(ErrorCodes.CALCULATION_FAILED).toBeDefined();
    expect(ErrorCodes.LOCALSTORAGE_SAVE_FAILED).toBeDefined();
  });

  test('should have unique error codes', () => {
    const codes = Object.values(ErrorCodes);
    const uniqueCodes = new Set(codes);
    expect(codes.length).toBe(uniqueCodes.size);
  });

  test('should follow ERR-XXXX format', () => {
    Object.values(ErrorCodes).forEach(code => {
      expect(code).toMatch(/^ERR-\d{4}$/);
    });
  });
});

describe('ErrorMessages', () => {
  test('should have messages for all error codes', () => {
    Object.values(ErrorCodes).forEach(code => {
      expect(ErrorMessages[code]).toBeDefined();
      expect(typeof ErrorMessages[code]).toBe('string');
      expect(ErrorMessages[code].length).toBeGreaterThan(0);
    });
  });

  test('should have user-friendly messages', () => {
    expect(ErrorMessages[ErrorCodes.INVALID_SALARY]).toContain('salary');
    expect(ErrorMessages[ErrorCodes.MISSING_STATE]).toContain('state');
    expect(ErrorMessages[ErrorCodes.NEGATIVE_VALUE]).toContain('negative');
  });
});

describe('ValidationRules', () => {
  describe('isValidNumber', () => {
    test('should validate valid numbers', () => {
      expect(ValidationRules.isValidNumber(0)).toBe(true);
      expect(ValidationRules.isValidNumber(100)).toBe(true);
      expect(ValidationRules.isValidNumber(75000.50)).toBe(true);
      expect(ValidationRules.isValidNumber(-50)).toBe(true);
    });

    test('should reject invalid numbers', () => {
      expect(ValidationRules.isValidNumber(NaN)).toBe(false);
      expect(ValidationRules.isValidNumber(null)).toBe(false);
      expect(ValidationRules.isValidNumber(undefined)).toBe(false);
      expect(ValidationRules.isValidNumber('')).toBe(false);
      expect(ValidationRules.isValidNumber('abc')).toBe(false);
    });

    test('should handle string numbers', () => {
      expect(ValidationRules.isValidNumber('123')).toBe(true);
      expect(ValidationRules.isValidNumber('45.67')).toBe(true);
    });
  });

  describe('isPositive', () => {
    test('should validate positive numbers', () => {
      expect(ValidationRules.isPositive(0)).toBe(true);
      expect(ValidationRules.isPositive(1)).toBe(true);
      expect(ValidationRules.isPositive(1000000)).toBe(true);
      expect(ValidationRules.isPositive(0.01)).toBe(true);
    });

    test('should reject negative numbers', () => {
      expect(ValidationRules.isPositive(-1)).toBe(false);
      expect(ValidationRules.isPositive(-0.01)).toBe(false);
      expect(ValidationRules.isPositive(-1000)).toBe(false);
    });
  });

  describe('isInRange', () => {
    test('should validate numbers within range', () => {
      expect(ValidationRules.isInRange(50, 0, 100)).toBe(true);
      expect(ValidationRules.isInRange(0, 0, 100)).toBe(true);
      expect(ValidationRules.isInRange(100, 0, 100)).toBe(true);
      expect(ValidationRules.isInRange(75000, 1, 10000000)).toBe(true);
    });

    test('should reject numbers outside range', () => {
      expect(ValidationRules.isInRange(-1, 0, 100)).toBe(false);
      expect(ValidationRules.isInRange(101, 0, 100)).toBe(false);
      expect(ValidationRules.isInRange(0, 1, 100)).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    test('should validate non-empty values', () => {
      expect(ValidationRules.isNotEmpty(0)).toBe(true);
      expect(ValidationRules.isNotEmpty(100)).toBe(true);
      expect(ValidationRules.isNotEmpty('test')).toBe(true);
      expect(ValidationRules.isNotEmpty(false)).toBe(true);
    });

    test('should reject empty values', () => {
      expect(ValidationRules.isNotEmpty(null)).toBe(false);
      expect(ValidationRules.isNotEmpty(undefined)).toBe(false);
      expect(ValidationRules.isNotEmpty('')).toBe(false);
    });
  });
});

describe('validateFinancialInput', () => {
  describe('Required Field Validation', () => {
    test('should validate required fields with valid values', () => {
      const result = validateFinancialInput(75000, 'Annual Salary', { required: true });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(75000);
    });

    test('should reject empty required fields', () => {
      const result = validateFinancialInput('', 'Annual Salary', { required: true });
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCodes.MISSING_REQUIRED_FIELD);
      expect(result.message).toContain('required');
    });

    test('should reject null required fields', () => {
      const result = validateFinancialInput(null, 'Annual Salary', { required: true });
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCodes.MISSING_REQUIRED_FIELD);
    });

    test('should reject undefined required fields', () => {
      const result = validateFinancialInput(undefined, 'Annual Salary', { required: true });
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCodes.MISSING_REQUIRED_FIELD);
    });
  });

  describe('Optional Field Validation', () => {
    test('should allow empty optional fields', () => {
      const result = validateFinancialInput('', 'Deductions', { required: false });
      expect(result.valid).toBe(true);
      expect(result.value).toBeUndefined();
    });

    test('should validate optional fields when provided', () => {
      const result = validateFinancialInput(5000, 'Deductions', { required: false });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(5000);
    });

    test('should reject invalid optional fields when provided', () => {
      const result = validateFinancialInput('abc', 'Deductions', { required: false, min: 0 });
      expect(result.valid).toBe(false);
    });
  });

  describe('Number Validation', () => {
    test('should accept valid numbers', () => {
      const result = validateFinancialInput(75000, 'Salary');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(75000);
    });

    test('should accept string numbers', () => {
      const result = validateFinancialInput('75000', 'Salary');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(75000);
    });

    test('should accept decimal numbers', () => {
      const result = validateFinancialInput(75000.50, 'Salary');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(75000.50);
    });

    test('should reject non-numeric strings', () => {
      const result = validateFinancialInput('abc', 'Salary');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCodes.INVALID_EXPENSE);
      expect(result.message).toContain('valid number');
    });

    test('should reject NaN', () => {
      const result = validateFinancialInput(NaN, 'Salary');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCodes.INVALID_EXPENSE);
    });
  });

  describe('Positive Value Validation', () => {
    test('should accept positive values', () => {
      const result = validateFinancialInput(1000, 'Expense');
      expect(result.valid).toBe(true);
    });

    test('should accept zero by default', () => {
      const result = validateFinancialInput(0, 'Expense');
      expect(result.valid).toBe(true);
    });

    test('should reject zero when allowZero is false', () => {
      const result = validateFinancialInput(0, 'Salary', { allowZero: false });
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCodes.INVALID_EXPENSE);
      expect(result.message).toContain('greater than zero');
    });

    test('should reject negative values', () => {
      const result = validateFinancialInput(-1000, 'Expense');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCodes.NEGATIVE_VALUE);
      expect(result.message).toContain('cannot be negative');
    });
  });

  describe('Range Validation', () => {
    test('should accept values within range', () => {
      const result = validateFinancialInput(50000, 'Salary', { min: 1, max: 10000000 });
      expect(result.valid).toBe(true);
    });

    test('should accept minimum boundary value', () => {
      const result = validateFinancialInput(1, 'Salary', { min: 1, max: 10000000 });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(1);
    });

    test('should accept maximum boundary value', () => {
      const result = validateFinancialInput(10000000, 'Salary', { min: 1, max: 10000000 });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(10000000);
    });

    test('should reject values below minimum', () => {
      const result = validateFinancialInput(0, 'Salary', { min: 1, max: 10000000 });
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCodes.INVALID_EXPENSE);
      expect(result.message).toContain('between');
    });

    test('should reject values above maximum', () => {
      const result = validateFinancialInput(10000001, 'Salary', { min: 1, max: 10000000 });
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCodes.INVALID_EXPENSE);
      expect(result.message).toContain('between');
    });
  });

  describe('Custom Validation Scenarios', () => {
    test('should validate salary with typical constraints', () => {
      const result = validateFinancialInput(75000, 'Annual Salary', {
        min: 1,
        max: 10000000,
        required: true,
        allowZero: false
      });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(75000);
    });

    test('should validate deductions not exceeding salary', () => {
      const salary = 75000;
      const deductions = 80000;
      const result = validateFinancialInput(deductions, 'Pre-Tax Deductions', {
        min: 0,
        max: salary,
        required: false
      });
      expect(result.valid).toBe(false);
    });

    test('should validate reasonable expense values', () => {
      const result = validateFinancialInput(1500, 'Rent', {
        min: 0,
        max: 50000,
        required: false
      });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(1500);
    });

    test('should handle minimum wage annual salary', () => {
      const result = validateFinancialInput(15080, 'Annual Salary', {
        min: 1,
        max: 10000000,
        required: true
      });
      expect(result.valid).toBe(true);
    });

    test('should handle high income values', () => {
      const result = validateFinancialInput(500000, 'Annual Salary', {
        min: 1,
        max: 10000000,
        required: true
      });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(500000);
    });

    test('should validate monthly expenses', () => {
      const expenses = [
        { name: 'Rent', value: 1800 },
        { name: 'Utilities', value: 250 },
        { name: 'Groceries', value: 600 },
        { name: 'Transport', value: 300 },
        { name: 'Other', value: 500 }
      ];

      expenses.forEach(expense => {
        const result = validateFinancialInput(expense.value, expense.name, {
          min: 0,
          max: 100000,
          required: false
        });
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Error Message Customization', () => {
    test('should include field name in error message', () => {
      const result = validateFinancialInput(-100, 'Monthly Rent');
      expect(result.message).toContain('Monthly Rent');
    });

    test('should include range in error message', () => {
      const result = validateFinancialInput(500, 'Salary', { min: 1000, max: 5000 });
      expect(result.message).toContain('1,000');
      expect(result.message).toContain('5,000');
    });

    test('should format large numbers with commas in message', () => {
      const result = validateFinancialInput(15000000, 'Salary', { min: 1, max: 10000000 });
      expect(result.message).toContain('10,000,000');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small positive numbers', () => {
      const result = validateFinancialInput(0.01, 'Amount', { min: 0 });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(0.01);
    });

    test('should handle very large numbers', () => {
      const result = validateFinancialInput(9999999, 'Amount', { max: 10000000 });
      expect(result.valid).toBe(true);
    });

    test('should handle Infinity max value', () => {
      const result = validateFinancialInput(1000000000, 'Amount', { max: Infinity });
      expect(result.valid).toBe(true);
    });

    test('should handle zero with allowZero true explicitly', () => {
      const result = validateFinancialInput(0, 'Deductions', { allowZero: true });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(0);
    });

    test('should handle spaces in string numbers', () => {
      const result = validateFinancialInput('  75000  ', 'Salary');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(75000);
    });
  });

  describe('Return Value Structure', () => {
    test('should return valid: true and value for valid input', () => {
      const result = validateFinancialInput(75000, 'Salary');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('value');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(75000);
    });

    test('should return valid: false, errorCode, and message for invalid input', () => {
      const result = validateFinancialInput(-100, 'Salary');
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errorCode');
      expect(result).toHaveProperty('message');
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBeDefined();
      expect(result.message).toBeDefined();
    });

    test('should not include value in invalid result', () => {
      const result = validateFinancialInput('abc', 'Salary');
      expect(result.valid).toBe(false);
      expect(result.value).toBeUndefined();
    });
  });
});
