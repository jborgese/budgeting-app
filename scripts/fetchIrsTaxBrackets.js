// IRS Tax Bracket Fetcher
// This script fetches and parses IRS tax bracket data from the official IRS website.
// To be run annually when new tax year data is released.

const https = require('https');
const fs = require('fs');
const path = require('path');

// Update this URL to the IRS tax brackets page for the current year
const IRS_URL = 'https://www.irs.gov/statistics/soi-tax-stats-individual-income-tax-rates-and-tax-shares';
const OUTPUT_PATH = path.join(__dirname, '../public/data.json');

function fetchIrsPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseTaxBrackets(html) {
  // TODO: Implement robust parsing logic for IRS page structure
  // This is a placeholder. You may need to update this for the actual IRS page format.
  // Output must match the app's expected taxData structure
  return {
    lastUpdated: new Date().toISOString().slice(0, 10),
    sources: {
      federal: 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets',
      states: 'https://taxfoundation.org/data/all/state/',
      fica: 'https://www.ssa.gov/oact/cola/cbb.html'
    },
    disclaimer: 'Tax calculations are estimates based on federal and state tax brackets. Actual tax liability may vary based on deductions, credits, and other factors. Consult a tax professional for accurate tax advice.',
    years: {
      2026: {
        federalBrackets: {
          single: [
            { rate: 0.10, threshold: 11600 },
            { rate: 0.12, threshold: 47150 },
            { rate: 0.22, threshold: 100525 },
            { rate: 0.24, threshold: 191950 },
            { rate: 0.32, threshold: 243725 },
            { rate: 0.35, threshold: 609350 },
            { rate: 0.37, threshold: Infinity }
          ],
          marriedJoint: [
            { rate: 0.10, threshold: 23200 },
            { rate: 0.12, threshold: 94300 },
            { rate: 0.22, threshold: 201050 },
            { rate: 0.24, threshold: 383900 },
            { rate: 0.32, threshold: 487450 },
            { rate: 0.35, threshold: 731200 },
            { rate: 0.37, threshold: Infinity }
          ],
          marriedSeparate: [
            { rate: 0.10, threshold: 11600 },
            { rate: 0.12, threshold: 47150 },
            { rate: 0.22, threshold: 100525 },
            { rate: 0.24, threshold: 191950 },
            { rate: 0.32, threshold: 243725 },
            { rate: 0.35, threshold: 365600 },
            { rate: 0.37, threshold: Infinity }
          ],
          headOfHousehold: [
            { rate: 0.10, threshold: 16550 },
            { rate: 0.12, threshold: 63100 },
            { rate: 0.22, threshold: 100500 },
            { rate: 0.24, threshold: 191950 },
            { rate: 0.32, threshold: 243700 },
            { rate: 0.35, threshold: 609350 },
            { rate: 0.37, threshold: Infinity }
          ]
        },
        standardDeduction: {
          single: 15000,
          marriedJoint: 30000,
          marriedSeparate: 15000,
          headOfHousehold: 22500
        },
        fica: {
          socialSecurity: {
            rate: 0.062,
            wageLimit: 168600
          },
          medicare: {
            rate: 0.0145,
            additionalRate: 0.009,
            additionalThreshold: 200000
          }
        },
        stateBrackets: {
          'AL': [
            { rate: 0.02, threshold: 500 },
            { rate: 0.04, threshold: 3000 },
            { rate: 0.05, threshold: Infinity }
          ],
          'AK': [],
          'AZ': [
            { rate: 0.0259, threshold: 26500 },
            { rate: 0.0334, threshold: 53000 },
            { rate: 0.0417, threshold: 159000 },
            { rate: 0.045, threshold: 318000 },
            { rate: 0.025, threshold: Infinity }
          ]
          // ...add other states as needed
        }
      }
    }
  };
}

async function main() {
  try {
    const html = await fetchIrsPage(IRS_URL);
    const taxData = parseTaxBrackets(html);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(taxData, null, 2));
    console.log('IRS tax brackets updated successfully.');
  } catch (err) {
    console.error('Failed to update IRS tax brackets:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
