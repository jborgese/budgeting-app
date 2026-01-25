# Contributing to Budgeting App

Thank you for your interest in contributing to the Budgeting App! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Updating Tax Data](#updating-tax-data)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/budgeting-app.git
   cd budgeting-app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Reporting Bugs

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce the bug
- Expected behavior vs. actual behavior
- Your environment (OS, browser, Node.js version)
- Screenshots if applicable
- Any error messages from the console

**Template:**
```markdown
**Bug Description:**
[Clear description]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- OS: [e.g., Windows 11, macOS 14]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., v16.14.0]

**Screenshots:**
[If applicable]

**Console Errors:**
[Any error messages]
```

### Suggesting Features

Feature suggestions are welcome! Please include:
- Clear description of the feature
- Use case or problem it solves
- Proposed implementation (if you have ideas)
- Any relevant examples or mockups

### Improving Documentation

Documentation improvements are always appreciated:
- Fix typos or clarify confusing sections
- Add examples or usage scenarios
- Update outdated information
- Improve code comments
- Create tutorials or guides

## Development Workflow

### Setting Up Development Environment

1. **Start the development server:**
   ```bash
   npm start
   ```
   The app runs at `http://localhost:3000`

2. **Or run as Electron app:**
   ```bash
   npm run electron
   ```

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/descriptive-name
   ```
   Or for bug fixes:
   ```bash
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following the coding standards below

3. **Test your changes** thoroughly

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Clear, descriptive commit message"
   ```

### Branch Naming

- Features: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Documentation: `docs/what-you-updated`
- Tax data updates: `tax-data/year-xxxx`

## Coding Standards

### JavaScript Style Guide

- Use **ES6+ syntax** where appropriate
- Use **const** for constants, **let** for variables (avoid **var**)
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Use **descriptive names** for variables and functions
- Add **comments** for complex logic
- Keep functions **small and focused** (single responsibility)
- Avoid **deeply nested code** (max 3 levels)

**Example:**
```javascript
// Good
function calculateFederalTax(income, filingStatus, taxYear) {
  const brackets = getTaxBrackets(taxYear, filingStatus);
  return calculateTax(income, brackets);
}

// Avoid
function calc(i, s, y) {
  // unclear variable names
}
```

### HTML/CSS Guidelines

- Use **semantic HTML5** elements
- Keep **inline styles** to a minimum
- Use **Bootstrap classes** for consistency
- Maintain **responsive design** principles
- Add **accessibility attributes** (alt text, ARIA labels)

### File Organization

- Keep related code together
- Separate concerns (logic, UI, data)
- Use consistent file naming
- Document complex modules

## Testing Guidelines

### Manual Testing Checklist

Before submitting changes, test:

#### Basic Functionality
- [ ] All input fields accept valid values
- [ ] Invalid inputs show appropriate error messages
- [ ] Calculate button performs calculations correctly
- [ ] Results display properly

#### Tax Calculations
- [ ] Federal tax calculations are accurate for all filing statuses
- [ ] State tax calculations are correct for multiple states
- [ ] FICA calculations respect wage limits
- [ ] Different tax years work correctly

#### Edge Cases
- [ ] Zero income
- [ ] Very high income (over FICA limits)
- [ ] No expenses entered
- [ ] All expenses at zero
- [ ] Invalid/negative numbers rejected

#### Data Persistence
- [ ] Data saves when page reloads
- [ ] Data loads correctly on startup
- [ ] Custom expenses persist
- [ ] Clear data works properly

#### UI/UX
- [ ] Responsive on mobile devices
- [ ] All buttons work
- [ ] Error messages are clear
- [ ] Toast notifications appear correctly
- [ ] Excel export works

#### Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

### Testing New Features

When adding features:
1. Test happy path (expected usage)
2. Test error cases (invalid inputs, edge cases)
3. Test interaction with existing features
4. Test across different browsers
5. Test on different screen sizes

## Submitting Changes

### Creating a Pull Request

1. **Push your branch to GitHub:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference to related issues (if any)
   - Screenshots for UI changes
   - Testing performed

**PR Template:**
```markdown
## Description
[Clear description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Tax data update
- [ ] Performance improvement

## Related Issues
Closes #[issue number]

## Changes Made
- [List key changes]
- [Be specific]

## Testing Performed
- [Describe testing]
- [Include test cases]

## Screenshots
[If applicable]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Changes tested thoroughly
- [ ] No console errors
```

### Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged
- Keep PR focused on single feature/fix

## Updating Tax Data

Tax data updates are critical contributions! See [UPDATE_TAX_DATA.md](UPDATE_TAX_DATA.md) for detailed instructions.

### Annual Tax Data Updates

When IRS releases new tax brackets (usually December):

1. **Use the update script:**
   ```bash
   npm run update-tax-data
   ```

2. **Or manually update** `public/taxBrackets.js`:
   - Add new year object
   - Update federal brackets for all filing statuses
   - Update standard deductions
   - Update FICA limits
   - Update state brackets (if changed)
   - Update `lastUpdated` field

3. **Update UI** in `public/index.html`:
   - Add new year to dropdown
   - Set as default selected

4. **Create PR** with branch name: `tax-data/year-YYYY`

### Testing Tax Data Updates

- Verify all filing statuses work
- Test multiple states
- Compare calculations with official IRS calculators
- Check FICA limits are correct
- Ensure standard deductions are accurate

## Questions?

If you have questions about contributing:
- Open a GitHub issue with the "question" label
- Review existing documentation
- Check closed issues for similar questions

## Thank You!

Your contributions help make financial planning more accessible for everyone. We appreciate your time and effort! 🙏
