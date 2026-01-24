# Tax Data Update Guide

This guide helps you update the tax brackets annually to keep the budgeting app current.

## When to Update
Update tax data when:
- IRS announces new federal tax brackets (usually late November/December)
- State tax rates change (check January-February each year)
- FICA/Medicare limits are adjusted (announced in October/November)

## Data Sources

### Federal Tax Data
1. **Federal Tax Brackets**: https://www.irs.gov/filing/federal-income-tax-rates-and-brackets
2. **Standard Deductions**: https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments
3. **FICA Limits**: https://www.ssa.gov/oact/cola/cbb.html
4. **Alternative Source**: https://taxfoundation.org/data/all/federal/federal-tax-rates-and-tax-brackets/

### State Tax Data
1. **Tax Foundation State Database**: https://taxfoundation.org/data/all/state/
2. **Federation of Tax Administrators**: https://www.taxadmin.org/state-tax-rates
3. **Individual State Revenue Departments** (most authoritative)

## Update Process

### Step 1: Gather New Data
1. Visit the IRS website in December/January for the upcoming tax year
2. Note federal brackets for all filing statuses:
   - Single
   - Married Filing Jointly
   - Married Filing Separately
   - Head of Household
3. Get standard deduction amounts for each filing status
4. Check FICA limits (Social Security wage base, Medicare thresholds)
5. Check state tax changes (usually minimal year-to-year)

### Step 2: Update taxBrackets.js

Open `public/taxBrackets.js` and add a new year entry:

```javascript
// Add new year at the top of the years object
2027: {
  federalBrackets: {
    single: [
      { rate: 0.10, threshold: YOUR_VALUE },
      { rate: 0.12, threshold: YOUR_VALUE },
      // ... continue for all brackets
      { rate: 0.37, threshold: Infinity }
    ],
    marriedJoint: [
      // ... same structure
    ],
    marriedSeparate: [
      // ... same structure
    ],
    headOfHousehold: [
      // ... same structure
    ]
  },
  standardDeduction: {
    single: YOUR_VALUE,
    marriedJoint: YOUR_VALUE,
    marriedSeparate: YOUR_VALUE,
    headOfHousehold: YOUR_VALUE
  },
  fica: {
    socialSecurity: {
      rate: 0.062, // Usually stays the same
      wageLimit: YOUR_VALUE // Check SSA website
    },
    medicare: {
      rate: 0.0145, // Usually stays the same
      additionalRate: 0.009, // Usually stays the same
      additionalThreshold: 200000 // Usually stays the same
    }
  },
  stateBrackets: {
    // Copy from previous year and update any changed states
    // Most states don't change annually
  }
}
```

### Step 3: Update Metadata
Update the `lastUpdated` field at the top of taxBrackets.js:
```javascript
lastUpdated: '2027-01-15', // Use today's date
```

### Step 4: Update UI
In `public/index.html`, add the new year to the tax year selector:

```html
<select id="taxYear" class="form-select">
  <option value="2027" selected>2027</option> <!-- Add this -->
  <option value="2026">2026</option>
  <option value="2025">2025</option>
  <option value="2024">2024</option>
</select>
```

### Step 5: Test
1. Run the application
2. Select the new tax year
3. Test with various filing statuses and income levels
4. Verify calculations against IRS tax calculators:
   - https://www.irs.gov/help/ita/
   - https://www.nerdwallet.com/taxes/tax-calculator

## Example: Federal Tax Brackets Structure

Federal brackets are cumulative/progressive. For example, 2024 Single filer:
- 10% on income up to $11,000
- 12% on income between $11,001 and $44,725
- 22% on income between $44,726 and $95,375
- etc.

In our format:
```javascript
single: [
  { rate: 0.10, threshold: 11000 },   // 10% starts at $11,000
  { rate: 0.12, threshold: 44725 },   // 12% starts at $44,725
  { rate: 0.22, threshold: 95375 },   // 22% starts at $95,375
  // ...
  { rate: 0.37, threshold: Infinity } // Highest bracket
]
```

## Validation Checklist

Before deploying updates:
- [ ] All four filing statuses updated for federal taxes
- [ ] Standard deductions updated for all filing statuses
- [ ] FICA Social Security wage limit updated
- [ ] FICA Medicare threshold verified (rarely changes)
- [ ] State tax changes reviewed (if any)
- [ ] `lastUpdated` field updated
- [ ] New year added to HTML selector (marked as default)
- [ ] Test calculations performed
- [ ] Disclaimer still accurate

## State Tax Notes

### States with No Income Tax
These states have empty arrays:
- Alaska (AK)
- Florida (FL)
- Nevada (NV)
- New Hampshire (NH)
- South Dakota (SD)
- Tennessee (TN)
- Texas (TX)
- Washington (WA)
- Wyoming (WY)

### Flat Tax States
Some states have a single rate (threshold: 0):
- Colorado (CO)
- Illinois (IL)
- Indiana (IN)
- Kentucky (KY)
- Massachusetts (MA)
- Michigan (MI)
- North Carolina (NC)
- Pennsylvania (PA)
- Utah (UT)

### Common State Changes
- Most state tax brackets adjust for inflation annually
- Some states phase in tax cuts over multiple years
- Check Tax Foundation's state tax comparison tools

## Automation Ideas (Future)

To automate this process in the future:
1. **Web Scraping**: Build a script to scrape IRS.gov and Tax Foundation
2. **API Integration**: Use a paid tax data API service (TaxJar, Avalara)
3. **JSON Import**: Create a JSON schema and import tool
4. **GitHub Actions**: Set up annual reminders to update data

## Questions?

If you encounter issues or need clarification:
1. Check the IRS Tax Withholding Estimator: https://www.irs.gov/individuals/tax-withholding-estimator
2. Review Tax Foundation resources: https://taxfoundation.org
3. Consult a tax professional for complex scenarios

---

**Last Updated**: January 24, 2026
**Next Update Due**: January 2027
