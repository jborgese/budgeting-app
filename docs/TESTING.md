# Tax Calculations Unit Tests

The `tests/` directory contains comprehensive unit tests for the tax calculation functions in the budgeting application.

## Test Location

All test files are located in the `tests/` directory:
- `tests/taxCalculations.test.js` - Unit tests for tax calculations (35 tests)
- `tests/stateManager.test.js` - Unit tests for state management (42 tests)
- `tests/errorHandler.test.js` - Unit tests for validation and error handling (53 tests)
- `tests/jest.config.js` - Jest configuration file

## Test Coverage Summary

**Total: 130 tests across 3 test suites**

### Coverage by File:
- **stateManager.js**: 86.51% coverage (89.47% functions)
- **errorHandler.js**: 43.63% coverage (45.45% functions)
- **app.js**: Partially tested via imported functions
- **taxBrackets.js**: Data file (no tests needed)
- **stateExamples.js**: Documentation file (no tests needed)

## Test Coverage

The test suite covers the following modules and functions:

### Tax Calculations (`taxCalculations.test.js` - 35 tests)

#### `calculateTax(income, brackets)`
Tests for progressive income tax calculations:
- **Edge Cases**: Zero income, negative income, empty brackets
- **Single Tax Brackets**: Income in 10% and 12% brackets
- **Multiple Tax Brackets**: Income across 22%, 24%, 32%, 35%, and 37% brackets
- **Exact Threshold Values**: Income at exact bracket thresholds and $1 above
- **Real-World Scenarios**: Median US income (~$75k) and high income ($500k)

#### `calculateFICA(annualSalary, year)`
Tests for FICA (Social Security and Medicare) tax calculations:
- **Social Security Tax**: Below wage limit, at wage limit, above wage limit
- **Medicare Tax**: Below additional threshold, at threshold, above threshold
- **Total FICA Tax**: Various income levels from $50k to $5M
- **Edge Cases**: Zero income, minimum wage, very high income
- **Year Comparisons**: 2025 vs 2026 calculations with different wage limits

#### Integration Tests
Tests combining both federal income tax and FICA calculations:
- Total tax burden for typical income levels
- Effective tax rate validations
- Combined calculations for high earners

### State Management (`stateManager.test.js` - 42 tests)

#### StateManager Class
Comprehensive tests for the centralized state management system:
- **Initialization**: Default state structure, initial values, observers
- **getState**: Reading entire state, nested paths, deep copies
- **setState**: Updating values, creating nested paths, handling various data types
- **State History**: Recording changes, limiting history size
- **batchUpdate**: Multiple simultaneous updates
- **subscribe/notify**: Observer pattern, callbacks, unsubscribe functionality
- **localStorage Integration**: Save/load state, error handling
- **reset**: Resetting to initial state
- **clearCalculations**: Clearing calculated values
- **getSnapshot**: Debug snapshots
- **Edge Cases**: Empty paths, undefined values, rapid updates

### Error Handling & Validation (`errorHandler.test.js` - 53 tests)

#### ErrorCodes & ErrorMessages
- Validates all error codes are defined and unique
- Ensures user-friendly error messages exist for all codes
- Verifies error code format (ERR-XXXX)

#### ValidationRules
- **isValidNumber**: Validates numeric values, rejects NaN/null/undefined
- **isPositive**: Validates non-negative numbers
- **isInRange**: Validates values within min/max bounds
- **isNotEmpty**: Validates non-empty values

#### validateFinancialInput
Comprehensive validation testing:
- **Required Fields**: Validates required vs optional fields
- **Number Validation**: Accepts valid numbers, rejects invalid input
- **Positive Values**: Handles zero, positive, and negative values
- **Range Validation**: Min/max boundaries, edge cases
- **Custom Scenarios**: Salary, deductions, expenses with real-world constraints
- **Error Messages**: Field names, range formatting, localization
- **Edge Cases**: Very small/large numbers, Infinity, spaces in strings
- **Return Structure**: Validation result format

## Running the Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Statistics

- **Total Tests**: 130
- **Test Suites**: 3
- **Overall Coverage**: 
  - stateManager.js: 86.51% statements, 89.47% functions
  - errorHandler.js: 43.63% statements, 45.45% functions
  - Tax calculation functions fully tested

## Test Structure

Tests are organized using Jest's `describe` and `test` blocks:

```javascript
describe('calculateTax', () => {
  describe('Edge Cases', () => {
    test('should return 0 tax for income at or below lowest threshold', () => {
      // Test implementation
    });
  });
});
```

## Key Test Scenarios

1. **Progressive Tax Calculation**: Validates that income is taxed correctly across multiple brackets
2. **FICA Caps**: Ensures Social Security tax is capped at the wage limit
3. **Additional Medicare Tax**: Confirms additional 0.9% Medicare tax for high earners
4. **Year-over-Year Changes**: Tests that different tax years use correct brackets and limits
5. **State Management**: Validates observer pattern, state persistence, and history tracking
6. **Input Validation**: Comprehensive validation of financial inputs with proper error handling
7. **Edge Cases**: Handles zero, negative, undefined, and extreme values appropriately

## Files Not Requiring Tests

Based on code review, the following files were determined not to need unit tests:

- **taxBrackets.js**: Pure data file containing tax bracket definitions. Testing data structures provides no value; tests should focus on functions that use this data.
- **stateExamples.js**: Documentation and example code file for developers. Contains usage examples rather than production code.
- **app.js**: DOM manipulation and UI logic. Requires DOM environment. Core calculation functions are already tested via extracted modules.

## Dependencies

- **Jest**: ^29.7.0 (Testing framework)

## Configuration

Test configuration is defined in `tests/jest.config.js`:
- Test environment: Node
- Root directory: Project root
- Test pattern: `**/tests/**/*.test.js`
- Coverage directory: `coverage/`
- Coverage reports: text, lcov, and HTML formats

## Future Enhancements

Potential additions to the test suite:
- Integration tests for calculateTakeHomeSalary function
- State tax calculation tests for different states
- Standard deduction calculation tests
- Multiple filing status integration tests
- DOM manipulation tests using jsdom or similar
- End-to-end tests for complete user workflows
- Performance tests for large state updates
- Pre-tax deduction calculations
- Take-home salary integration tests
