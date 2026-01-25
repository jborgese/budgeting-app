# API Documentation

This document describes the internal JavaScript APIs and functions used in the Budgeting App.

## Table of Contents

- [Core Functions](#core-functions)
- [Tax Calculation Functions](#tax-calculation-functions)
- [Data Management](#data-management)
- [Validation Functions](#validation-functions)
- [UI Functions](#ui-functions)
- [Error Handling](#error-handling)
- [Data Structures](#data-structures)

## Core Functions

### `calculateTakeHomeSalary()`

Main calculation function that computes take-home pay after taxes and expenses.

**Location:** `public/app.js`

**Parameters:** None (reads from DOM)

**Returns:** void (updates DOM with results)

**Process:**
1. Validates all input fields
2. Calculates taxable income
3. Computes federal tax
4. Computes state tax
5. Calculates FICA (Social Security + Medicare)
6. Sums total expenses
7. Displays results in UI

**Example Usage:**
```javascript
// Called when user clicks "Calculate" button
document.getElementById('calculate-btn').addEventListener('click', calculateTakeHomeSalary);
```

**Error Handling:**
- Shows toast notifications for validation errors
- Returns early if validation fails
- Catches and displays calculation errors

---

### `calculateTax(income, brackets)`

Progressive tax calculation using marginal tax brackets.

**Location:** `public/app.js`

**Parameters:**
- `income` (number): Taxable income
- `brackets` (array): Array of tax bracket objects

**Returns:** number - Total tax amount

**Algorithm:**
```javascript
// Calculates tax using marginal bracket system
// Example: $50,000 income with brackets [10%, 12%, 22%]
// $0-$11,000 @ 10% = $1,100
// $11,000-$44,725 @ 12% = $4,047
// $44,725-$50,000 @ 22% = $1,160.50
// Total: $6,307.50
```

**Example:**
```javascript
const federalBrackets = taxData.years[2026].federalBrackets.single;
const federalTax = calculateTax(75000, federalBrackets);
console.log(federalTax); // 12,748
```

---

### `calculateFICA(annualSalary, year)`

Calculates FICA taxes (Social Security and Medicare).

**Location:** `public/app.js`

**Parameters:**
- `annualSalary` (number): Annual salary before deductions
- `year` (number): Tax year (e.g., 2026)

**Returns:** object
```javascript
{
  socialSecurity: number,  // Social Security tax
  medicare: number,        // Medicare tax + Additional Medicare
  total: number           // Combined FICA
}
```

**Details:**
- **Social Security**: 6.2% up to wage limit ($168,600 in 2024)
- **Medicare**: 1.45% on all wages
- **Additional Medicare**: 0.9% on wages over $200,000

**Example:**
```javascript
const fica = calculateFICA(150000, 2026);
// {
//   socialSecurity: 9300,
//   medicare: 2175,
//   total: 11475
// }
```

---

## Tax Calculation Functions

### `getTaxBrackets(year, filingStatus)`

Retrieves federal tax brackets for a specific year and filing status.

**Location:** `public/taxBrackets.js` (data structure)

**Parameters:**
- `year` (number): Tax year
- `filingStatus` (string): 'single', 'marriedJoint', 'marriedSeparate', or 'headOfHousehold'

**Returns:** array of bracket objects

**Example:**
```javascript
const brackets = taxData.years[2026].federalBrackets.single;
// [
//   { rate: 0.10, threshold: 11600 },
//   { rate: 0.12, threshold: 47150 },
//   ...
// ]
```

---

### `getStandardDeduction(year, filingStatus)`

Gets standard deduction amount.

**Location:** `public/taxBrackets.js`

**Parameters:**
- `year` (number): Tax year
- `filingStatus` (string): Filing status

**Returns:** number - Standard deduction amount

**Example:**
```javascript
const deduction = taxData.years[2026].standardDeduction.single;
// 14600
```

---

### `getStateTaxRate(state, income)`

Calculates state tax based on state brackets.

**Location:** `public/app.js`

**Parameters:**
- `state` (string): Two-letter state code
- `income` (number): Taxable income

**Returns:** number - State tax amount

**Example:**
```javascript
const stateTax = calculateTax(income, taxData.years[year].stateBrackets[state]);
```

---

## Data Management

### `saveData()`

Saves user input to browser localStorage.

**Location:** `public/app.js`

**Parameters:** None

**Returns:** boolean - Success status

**Saved Data:**
- Annual salary
- Pre-tax deductions
- State residence
- All expense fields
- Tax year and filing status
- Custom expenses

**Example:**
```javascript
if (saveData()) {
  console.log('Data saved successfully');
}
```

**Storage Key:** `'financialData'`

---

### `loadData()`

Loads saved data from localStorage and populates form.

**Location:** `public/app.js`

**Parameters:** None

**Returns:** boolean - Whether data was loaded

**Example:**
```javascript
// Called on page load
window.addEventListener('DOMContentLoaded', () => {
  loadData();
});
```

---

### `clearData()`

Clears all form inputs and removes saved data.

**Location:** `public/app.js`

**Parameters:** None

**Returns:** void

**Example:**
```javascript
document.getElementById('clear-btn').addEventListener('click', clearData);
```

---

## Validation Functions

### `validateFinancialInput(value, fieldName, options)`

Enhanced input validation with configurable options.

**Location:** `public/app.js`

**Parameters:**
- `value` (string|number): Input value to validate
- `fieldName` (string): Human-readable field name for error messages
- `options` (object): Validation options

**Options Object:**
```javascript
{
  min: number,           // Minimum value (default: 0)
  max: number,           // Maximum value (default: 100000000)
  required: boolean,     // Is field required (default: true)
  allowZero: boolean,    // Allow zero value (default: true)
  allowNegative: boolean // Allow negative values (default: false)
}
```

**Returns:** object
```javascript
{
  valid: boolean,
  value: number,
  errorCode: string,
  message: string
}
```

**Example:**
```javascript
const result = validateFinancialInput(
  document.getElementById('salary').value,
  'Annual Salary',
  { min: 1, max: 10000000, required: true, allowZero: false }
);

if (!result.valid) {
  showErrorToast(result.errorCode, result.message);
  return;
}

const salary = result.value;
```

---

### `isLocalStorageAvailable()`

Checks if localStorage is available and working.

**Location:** `public/app.js`

**Parameters:** None

**Returns:** boolean

**Example:**
```javascript
if (isLocalStorageAvailable()) {
  saveData();
} else {
  console.warn('localStorage not available');
}
```

---

## UI Functions

### `addExpense(name, value)`

Adds a custom expense input row.

**Location:** `public/app.js`

**Parameters:**
- `name` (string, optional): Expense name
- `value` (number, optional): Expense amount

**Returns:** void

**Example:**
```javascript
// User clicks "Add Expense" button
addExpense(); // Empty row

// Programmatically add expense
addExpense('Car Payment', 350);
```

**Generated HTML:**
```html
<div class="expense-input-group">
  <input type="text" placeholder="Expense Name" class="form-control">
  <input type="number" placeholder="Amount" class="form-control">
  <button class="btn btn-danger">Remove</button>
</div>
```

---

### `removeExpense(button)`

Removes a custom expense row.

**Location:** `public/app.js`

**Parameters:**
- `button` (HTMLElement): The remove button clicked

**Returns:** void

**Example:**
```javascript
// Automatically attached to remove buttons
button.addEventListener('click', function() {
  removeExpense(this);
});
```

---

### `exportToExcel()`

Exports financial data to Excel file using ExcelJS.

**Location:** `public/app.js`

**Parameters:** None

**Returns:** void (triggers file download)

**Generated File:**
- Filename: `Financial_Statement_[date].xlsx`
- Sheets: Income, Taxes, Expenses, Summary
- Formatted with headers and formulas

**Example:**
```javascript
document.getElementById('export-btn').addEventListener('click', exportToExcel);
```

---

## Error Handling

### Error Code System

**Location:** `public/errorHandler.js`

**Error Codes:**
```javascript
const ErrorCodes = {
  // Validation Errors
  INVALID_SALARY: 'E001',
  INVALID_DEDUCTION: 'E002',
  INVALID_EXPENSE: 'E003',
  VALUE_TOO_LOW: 'E004',
  VALUE_TOO_HIGH: 'E005',
  
  // Calculation Errors
  CALCULATION_FAILED: 'E101',
  TAX_DATA_MISSING: 'E102',
  
  // Storage Errors
  LOCALSTORAGE_NOT_AVAILABLE: 'E201',
  LOCALSTORAGE_SAVE_FAILED: 'E202',
  LOCALSTORAGE_LOAD_FAILED: 'E203',
  
  // Export Errors
  EXPORT_FAILED: 'E301'
};
```

---

### `showErrorToast(errorCode, customMessage)`

Displays error message to user.

**Location:** `public/errorHandler.js`

**Parameters:**
- `errorCode` (string): Error code from ErrorCodes
- `customMessage` (string, optional): Override default message

**Returns:** void

**Example:**
```javascript
showErrorToast(ErrorCodes.INVALID_SALARY, 'Salary must be a positive number');
```

**Toast Appearance:**
- Red background
- Auto-dismiss after 5 seconds
- Positioned top-right corner

---

### `showSuccessToast(message)`

Displays success message to user.

**Location:** `public/errorHandler.js`

**Parameters:**
- `message` (string): Success message

**Returns:** void

**Example:**
```javascript
showSuccessToast('Data saved successfully!');
```

---

## Data Structures

### Tax Data Object

**Location:** `public/taxBrackets.js`

**Structure:**
```javascript
const taxData = {
  lastUpdated: 'YYYY-MM-DD',
  years: {
    2026: {
      federalBrackets: {
        single: [...],
        marriedJoint: [...],
        marriedSeparate: [...],
        headOfHousehold: [...]
      },
      standardDeduction: {
        single: number,
        marriedJoint: number,
        marriedSeparate: number,
        headOfHousehold: number
      },
      fica: {
        socialSecurity: {
          rate: number,
          wageLimit: number
        },
        medicare: {
          rate: number,
          additionalRate: number,
          additionalThreshold: number
        }
      },
      stateBrackets: {
        AL: [...],
        AK: [...],
        // ... all states
      }
    }
  }
};
```

---

### Tax Bracket Object

```javascript
{
  rate: number,      // Tax rate as decimal (0.10 = 10%)
  threshold: number  // Income level where this rate begins
}
```

**Example:**
```javascript
{ rate: 0.22, threshold: 95375 }
// 22% tax rate starts at $95,375
```

---

### Financial Data Object (localStorage)

```javascript
{
  annualSalary: string,
  preTaxDeductions: string,
  stateResidence: string,
  rent: string,
  utilities: string,
  groceries: string,
  transport: string,
  otherExpenses: string,
  taxYear: string,
  filingStatus: string,
  additionalExpenses: [
    { name: string, value: string }
  ]
}
```

---

## Event Listeners

### Main Event Bindings

**Location:** `public/app.js`

```javascript
// Calculate button
document.getElementById('calculate-btn').addEventListener('click', calculateTakeHomeSalary);

// Clear button
document.getElementById('clear-btn').addEventListener('click', clearData);

// Export button
document.getElementById('export-btn').addEventListener('click', exportToExcel);

// Add expense button
document.getElementById('add-expense-btn').addEventListener('click', () => addExpense());

// Auto-save on input change
const inputs = document.querySelectorAll('input, select');
inputs.forEach(input => {
  input.addEventListener('change', saveData);
});

// Load data on page load
window.addEventListener('DOMContentLoaded', loadData);
```

---

## Constants

### Tax-Related Constants

```javascript
// Filing Status Options
const FILING_STATUSES = {
  SINGLE: 'single',
  MARRIED_JOINT: 'marriedJoint',
  MARRIED_SEPARATE: 'marriedSeparate',
  HEAD_OF_HOUSEHOLD: 'headOfHousehold'
};

// FICA Constants (2024 values)
const SOCIAL_SECURITY_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLD = 200000;
```

---

## Best Practices

### Using the API

1. **Always validate inputs** before calculations
2. **Handle errors gracefully** with user-friendly messages
3. **Save data frequently** to prevent data loss
4. **Use error codes** for consistent error handling
5. **Test edge cases** (zero income, high income, etc.)

### Adding New Features

1. Follow existing code style and patterns
2. Add validation for new inputs
3. Update data structures if needed
4. Test with multiple scenarios
5. Update this documentation

### Performance Tips

1. Minimize DOM manipulation
2. Cache frequently accessed elements
3. Use event delegation for dynamic elements
4. Debounce auto-save if needed

---

## Testing

### Manual Testing Functions

```javascript
// Test tax calculation
function testTaxCalculation() {
  const brackets = taxData.years[2026].federalBrackets.single;
  const tax = calculateTax(75000, brackets);
  console.log('Tax on $75,000:', tax);
  // Expected: ~$10,000-$12,000
}

// Test FICA
function testFICA() {
  const fica = calculateFICA(150000, 2026);
  console.log('FICA on $150,000:', fica);
  // Expected: SS ~$9,300, Medicare ~$2,175
}

// Test validation
function testValidation() {
  const result = validateFinancialInput('-5000', 'Salary', {
    allowNegative: false
  });
  console.log('Validation result:', result);
  // Expected: valid = false
}
```

### Browser Console Testing

```javascript
// Access tax data
console.log(taxData.years[2026]);

// Test localStorage
saveData();
loadData();

// Simulate calculation
calculateTakeHomeSalary();
```

---

## Version History

- **v1.0.0** (January 2026): Initial API documentation
- Tax years supported: 2024, 2025, 2026
- All 50 states supported

---

**Need more information?** Check the source code comments in `public/app.js` and `public/taxBrackets.js`.
