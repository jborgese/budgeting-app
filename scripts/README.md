# Tax Data Update Scripts

This directory contains scripts to help maintain and update tax bracket data for the budgeting application.

## updateTaxData.js

An interactive Node.js script that helps add new tax year data to the application.

### Features
- Attempts to check public sources for tax data availability
- Guides you through manual entry of tax brackets
- Validates input data
- Automatically updates `public/taxBrackets.js`
- Automatically updates `public/index.html` to add the new year to the dropdown
- Updates the `lastUpdated` metadata field

### Prerequisites
- Node.js installed (version 12 or higher)
- Access to official tax data sources (IRS.gov, Tax Foundation, SSA.gov)

### Usage

```bash
node scripts/updateTaxData.js
```

### Data You'll Need

Before running the script, gather the following information from official sources:

#### 1. Federal Tax Brackets
Visit: https://www.irs.gov/filing/federal-income-tax-rates-and-brackets

For **each filing status** (Single, Married Joint, Married Separate, Head of Household):
- Tax rates (10%, 12%, 22%, 24%, 32%, 35%, 37%)
- Income thresholds where each rate begins

#### 2. Standard Deductions
Visit: https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments

For **each filing status**:
- Standard deduction amount

#### 3. FICA Limits
Visit: https://www.ssa.gov/oact/cola/cbb.html

- Social Security wage base limit
- Medicare rate (usually 1.45%)
- Additional Medicare rate (usually 0.9% over $200k)

### Example Session

```
Enter the tax year to add (default 2027): 2027

Ready to continue? (yes/no): yes

📊 Single Filing Status
Standard deduction for Single: $15000

Enter tax brackets (rate, threshold). Type "done" when finished.

Bracket 1 - Rate (0.10 for 10%) or "done": 0.10
Bracket 1 - Threshold ($) or "Infinity": 12000
Bracket 2 - Rate (0.10 for 10%) or "done": 0.12
Bracket 2 - Threshold ($) or "Infinity": 48000
...
Bracket 7 - Rate (0.10 for 10%) or "done": 0.37
Bracket 7 - Threshold ($) or "Infinity": Infinity
Bracket 8 - Rate (0.10 for 10%) or "done": done
```

### What the Script Does

1. **Collects Data**: Prompts you for all required tax information
2. **Generates Code**: Creates properly formatted JavaScript code
3. **Updates Files**: 
   - Adds new year data to `taxBrackets.js`
   - Updates `lastUpdated` field
   - Adds year option to HTML dropdown
4. **Creates Backup**: Optionally saves generated code to a text file

### Output

After successful completion:
- ✅ `public/taxBrackets.js` contains the new year's data
- ✅ `public/index.html` dropdown includes the new year (set as default)
- ✅ `lastUpdated` field is updated to current date

### Validation

After running the script:

1. **Review the changes**:
   ```bash
   git diff public/taxBrackets.js
   git diff public/index.html
   ```

2. **Test the application**:
   - Start the app
   - Select the new tax year
   - Test with various filing statuses and income levels
   - Verify calculations match IRS calculators

3. **Cross-check data**:
   - https://www.irs.gov/help/ita/
   - https://www.nerdwallet.com/taxes/tax-calculator
   - https://smartasset.com/taxes/income-taxes

### Troubleshooting

**Script fails to update files**:
- Check file permissions
- Ensure you're running from the project root
- Review error messages for specific issues

**Generated code looks wrong**:
- Answer "no" when asked to update files
- Generated code is saved to `scripts/tax-data-YEAR.txt`
- Manually review and add to `taxBrackets.js`

**Need to undo changes**:
```bash
git checkout public/taxBrackets.js public/index.html
```

### Future Enhancements

Potential improvements for future versions:
- Web scraping with Cheerio/Puppeteer
- Integration with tax data APIs
- Automated testing of calculations
- State tax bracket updates
- CSV import functionality

## Other Scripts (Future)

Additional scripts that could be added:
- `validateTaxData.js` - Validates tax calculations
- `compareTaxYears.js` - Compares tax data between years
- `exportTaxData.js` - Exports data to CSV/JSON
- `importStateTaxes.js` - Updates state tax brackets

---

**Last Updated**: January 24, 2026
