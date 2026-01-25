# Tax Calculations Unit Tests

The `tests/` directory contains comprehensive unit tests for the tax calculation functions in the budgeting application.

## Test Location

All test files are located in the `tests/` directory:
- `tests/taxCalculations.test.js` - Unit tests for tax calculations
- `tests/jest.config.js` - Jest configuration file

## Test Coverage

The test suite covers the following functions:

### `calculateTax(income, brackets)`
Tests for progressive income tax calculations:
- **Edge Cases**: Zero income, negative income, empty brackets
- **Single Tax Brackets**: Income in 10% and 12% brackets
- **Multiple Tax Brackets**: Income across 22%, 24%, 32%, 35%, and 37% brackets
- **Exact Threshold Values**: Income at exact bracket thresholds and $1 above
- **Real-World Scenarios**: Median US income (~$75k) and high income ($500k)

### `calculateFICA(annualSalary, year)`
Tests for FICA (Social Security and Medicare) tax calculations:
- **Social Security Tax**: Below wage limit, at wage limit, above wage limit
- **Medicare Tax**: Below additional threshold, at threshold, above threshold
- **Total FICA Tax**: Various income levels from $50k to $5M
- **Edge Cases**: Zero income, minimum wage, very high income
- **Year Comparisons**: 2025 vs 2026 calculations with different wage limits

### Integration Tests
Tests combining both federal income tax and FICA calculations:
- Total tax burden for typical income levels
- Effective tax rate validations
- Combined calculations for high earners

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

- **Total Tests**: 35
- **Test Suites**: 1
- **Coverage**: Comprehensive coverage of calculateTax and calculateFICA functions

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
5. **Edge Cases**: Handles zero, negative, and extreme values appropriately

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
- State tax calculation tests
- Standard deduction tests
- Multiple filing status tests
- Pre-tax deduction calculations
- Take-home salary integration tests
