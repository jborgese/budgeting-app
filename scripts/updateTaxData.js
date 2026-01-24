#!/usr/bin/env node

/**
 * Tax Data Update Script
 * 
 * This script helps update tax bracket data in the budgeting app.
 * It can fetch data from public sources or guide manual entry.
 * 
 * Usage: node scripts/updateTaxData.js
 */

const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt user
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Fetch data from a URL
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Attempt to scrape IRS data (basic approach)
async function tryFetchIRSData(year) {
  console.log(`\n📡 Attempting to fetch ${year} IRS data from public sources...`);
  
  try {
    // Tax Foundation is more reliable for structured data
    const url = `https://taxfoundation.org/data/all/federal/federal-tax-rates-and-tax-brackets/`;
    console.log(`Checking: ${url}`);
    
    const html = await fetchURL(url);
    
    // Check if we got valid HTML
    if (html.includes('tax brackets') || html.includes('tax rates')) {
      console.log('✅ Found tax data page!');
      console.log('\n⚠️  Note: Automatic parsing is complex. Please manually extract data from:');
      console.log(`   ${url}`);
      console.log('\n   The script will guide you through manual entry.\n');
      return null;
    } else {
      console.log('❌ Could not parse tax data automatically.');
      return null;
    }
  } catch (error) {
    console.log(`❌ Error fetching data: ${error.message}`);
    return null;
  }
}

// Check if a year already exists in taxBrackets.js
function checkYearExists(year) {
  const filePath = path.join(__dirname, '..', 'public', 'taxBrackets.js');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for the year as a key in the years object
    const yearPattern = new RegExp(`^\\s*${year}:\\s*\\{`, 'm');
    return yearPattern.test(content);
  } catch (error) {
    console.error(`Error checking for existing year: ${error.message}`);
    return false;
  }
}

// Get list of existing years
function getExistingYears() {
  const filePath = path.join(__dirname, '..', 'public', 'taxBrackets.js');
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find all year entries in the years object
    const yearMatches = content.match(/^\s*(\d{4}):\s*\{/gm);
    if (!yearMatches) return [];
    
    const years = yearMatches.map(match => {
      const yearMatch = match.match(/(\d{4})/);
      return yearMatch ? parseInt(yearMatch[1]) : null;
    }).filter(y => y !== null);
    
    return years.sort((a, b) => b - a); // Sort descending
  } catch (error) {
    console.error(`Error reading existing years: ${error.message}`);
    return [];
  }
}

// Guide user through manual data entry
async function collectManualData(year) {
  console.log(`\n📝 Manual Data Entry for ${year}`);
  console.log('═'.repeat(60));
  console.log('\n📌 Please have the following ready:');
  console.log('   • Federal tax brackets for all filing statuses');
  console.log('   • Standard deduction amounts');
  console.log('   • Social Security wage limit');
  console.log('   • Medicare thresholds (if changed)\n');
  
  const shouldContinue = await prompt('Ready to continue? (yes/no): ');
  if (shouldContinue.toLowerCase() !== 'yes' && shouldContinue.toLowerCase() !== 'y') {
    console.log('Exiting...');
    return null;
  }

  const data = {
    year: year,
    federalBrackets: {},
    standardDeduction: {},
    fica: {
      socialSecurity: {},
      medicare: {}
    }
  };

  // Collect data for each filing status
  const filingStatuses = [
    { key: 'single', name: 'Single' },
    { key: 'marriedJoint', name: 'Married Filing Jointly' },
    { key: 'marriedSeparate', name: 'Married Filing Separately' },
    { key: 'headOfHousehold', name: 'Head of Household' }
  ];

  for (const status of filingStatuses) {
    console.log(`\n\n📊 ${status.name} Filing Status`);
    console.log('─'.repeat(60));
    
    // Standard deduction
    const deduction = await prompt(`Standard deduction for ${status.name}: $`);
    data.standardDeduction[status.key] = parseFloat(deduction);

    // Tax brackets
    console.log('\nEnter tax brackets (rate, threshold). Type "done" when finished.');
    console.log('Example: 10% bracket starts at $11,600 → enter rate: 0.10, threshold: 11600');
    console.log('Note: Last bracket should have threshold "Infinity"\n');
    
    const brackets = [];
    let bracketNum = 1;
    
    while (true) {
      const rate = await prompt(`  Bracket ${bracketNum} - Rate (0.10 for 10%) or "done": `);
      if (rate.toLowerCase() === 'done') break;
      
      const threshold = await prompt(`  Bracket ${bracketNum} - Threshold ($) or "Infinity": `);
      
      brackets.push({
        rate: parseFloat(rate),
        threshold: threshold.toLowerCase() === 'infinity' ? Infinity : parseFloat(threshold)
      });
      
      bracketNum++;
    }
    
    data.federalBrackets[status.key] = brackets;
  }

  // FICA data
  console.log('\n\n💰 FICA Tax Information');
  console.log('─'.repeat(60));
  
  const ssRate = await prompt('Social Security rate (default 0.062): ') || '0.062';
  data.fica.socialSecurity.rate = parseFloat(ssRate);
  
  const ssLimit = await prompt('Social Security wage limit: $');
  data.fica.socialSecurity.wageLimit = parseFloat(ssLimit);
  
  const medicareRate = await prompt('Medicare rate (default 0.0145): ') || '0.0145';
  data.fica.medicare.rate = parseFloat(medicareRate);
  
  const medicareAddRate = await prompt('Additional Medicare rate (default 0.009): ') || '0.009';
  data.fica.medicare.additionalRate = parseFloat(medicareAddRate);
  
  const medicareThreshold = await prompt('Additional Medicare threshold (default 200000): $') || '200000';
  data.fica.medicare.additionalThreshold = parseFloat(medicareThreshold);

  return data;
}

// Generate JavaScript code for the new year
function generateYearCode(data) {
  const indent = '      ';
  const indent2 = '        ';
  const indent3 = '          ';
  
  let code = `    ${data.year}: {\n`;
  code += `${indent}// ${data.year} federal brackets\n`;
  code += `${indent}federalBrackets: {\n`;
  
  // Generate brackets for each filing status
  for (const [status, brackets] of Object.entries(data.federalBrackets)) {
    code += `${indent2}${status}: [\n`;
    brackets.forEach(bracket => {
      const threshold = bracket.threshold === Infinity ? 'Infinity' : bracket.threshold;
      code += `${indent3}{ rate: ${bracket.rate}, threshold: ${threshold} },\n`;
    });
    code += `${indent2}],\n`;
  }
  
  code += `${indent}},\n`;
  
  // Standard deductions
  code += `${indent}standardDeduction: {\n`;
  for (const [status, amount] of Object.entries(data.standardDeduction)) {
    code += `${indent2}${status}: ${amount},\n`;
  }
  code += `${indent}},\n`;
  
  // FICA
  code += `${indent}fica: {\n`;
  code += `${indent2}socialSecurity: {\n`;
  code += `${indent3}rate: ${data.fica.socialSecurity.rate},\n`;
  code += `${indent3}wageLimit: ${data.fica.socialSecurity.wageLimit}\n`;
  code += `${indent2}},\n`;
  code += `${indent2}medicare: {\n`;
  code += `${indent3}rate: ${data.fica.medicare.rate},\n`;
  code += `${indent3}additionalRate: ${data.fica.medicare.additionalRate},\n`;
  code += `${indent3}additionalThreshold: ${data.fica.medicare.additionalThreshold}\n`;
  code += `${indent2}}\n`;
  code += `${indent}},\n`;
  
  // State brackets (reuse from previous year)
  code += `${indent}stateBrackets: taxData.years[${data.year - 1}].stateBrackets // Reuse state data, update if changed\n`;
  code += `    }`;
  
  return code;
}

// Update the taxBrackets.js file
function updateTaxBracketsFile(year, yearCode, overwrite = false) {
  const filePath = path.join(__dirname, '..', 'public', 'taxBrackets.js');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update lastUpdated
    const today = new Date().toISOString().split('T')[0];
    content = content.replace(
      /lastUpdated:\s*'[^']*'/,
      `lastUpdated: '${today}'`
    );
    
    if (overwrite) {
      // Remove the existing year entry
      const yearPattern = new RegExp(`\\s*${year}:\\s*\\{[^}]*(?:\\{[^}]*\\}[^}]*)*\\},?\\s*`, 's');
      content = content.replace(yearPattern, '');
    }
    
    // Find where to insert the new year (after "years: {")
    const yearsIndex = content.indexOf('years: {');
    if (yearsIndex === -1) {
      throw new Error('Could not find "years: {" in taxBrackets.js');
    }
    
    const insertIndex = content.indexOf('\n', yearsIndex) + 1;
    
    // Insert the new year code
    const updatedContent = content.slice(0, insertIndex) + yearCode + ',\n' + content.slice(insertIndex);
    
    // Write back to file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`\n✅ Successfully updated taxBrackets.js with ${year} data!`);
    return true;
  } catch (error) {
    console.error(`\n❌ Error updating file: ${error.message}`);
    return false;
  }
}

// Update the HTML file to add the new year to the dropdown
function updateHTMLFile(year, overwrite = false) {
  const filePath = path.join(__dirname, '..', 'public', 'index.html');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the tax year select element
    const selectIndex = content.indexOf('<select id="taxYear"');
    if (selectIndex === -1) {
      console.log('⚠️  Could not find tax year selector in index.html');
      return false;
    }
    
    // Check if year already exists in dropdown
    const yearOptionPattern = new RegExp(`<option value="${year}"`, 'i');
    const yearExists = yearOptionPattern.test(content);
    
    if (yearExists && !overwrite) {
      console.log(`ℹ️  Year ${year} already exists in HTML dropdown, skipping update.`);
      return true;
    }
    
    if (yearExists && overwrite) {
      // Remove existing option
      const removePattern = new RegExp(`\\s*<option value="${year}"[^>]*>${year}</option>\\s*`, 'g');
      content = content.replace(removePattern, '\n');
    }
    
    // Find the first option after the select
    const firstOptionIndex = content.indexOf('<option', selectIndex);
    const insertIndex = content.indexOf('\n', firstOptionIndex);
    
    // Remove "selected" from old options
    content = content.replace(/(<option value="\d+" )selected/g, '$1');
    
    // Insert new option
    const newOption = `          <option value="${year}" selected>${year}</option>`;
    const updatedContent = content.slice(0, insertIndex + 1) + newOption + '\n' + content.slice(insertIndex + 1);
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`✅ Successfully updated index.html with ${year} option!`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating HTML: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Tax Data Update Script for Budgeting App          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Show existing years
  const existingYears = getExistingYears();
  if (existingYears.length > 0) {
    console.log('📅 Existing tax years in database:');
    console.log('   ' + existingYears.join(', '));
    console.log('');
  }
  
  // Get the year
  const currentYear = new Date().getFullYear();
  const yearInput = await prompt(`Enter the tax year to add (default ${currentYear + 1}): `);
  const year = parseInt(yearInput) || (currentYear + 1);
  
  console.log(`\nℹ️  Adding tax data for year: ${year}`);
  
  // Check if year already exists
  const yearExists = checkYearExists(year);
  let overwrite = false;
  
  if (yearExists) {
    console.log(`\n⚠️  WARNING: Tax data for ${year} already exists!`);
    const overwriteResponse = await prompt('Do you want to overwrite it? (yes/no): ');
    
    if (overwriteResponse.toLowerCase() !== 'yes' && overwriteResponse.toLowerCase() !== 'y') {
      console.log('\n❌ Operation cancelled. Year already exists.');
      rl.close();
      return;
    }
    
    overwrite = true;
    console.log(`\n✓ Will overwrite existing ${year} data.`);
  }
  
  // Try to fetch data automatically (will likely fail, but worth a try)
  await tryFetchIRSData(year);
  
  // Collect data manually
  const data = await collectManualData(year);
  
  if (!data) {
    console.log('\n❌ Data collection cancelled.');
    rl.close();
    return;
  }
  
  // Generate code
  console.log('\n\n🔨 Generating code...');
  const yearCode = generateYearCode(data);
  
  // Preview
  console.log('\n📋 Preview of generated code:');
  console.log('─'.repeat(60));
  console.log(yearCode.substring(0, 500) + '...\n');
  
  const confirmMsg = overwrite 
    ? `Replace existing ${year} data in taxBrackets.js? (yes/no): `
    : 'Add this data to taxBrackets.js? (yes/no): ';
  const confirm = await prompt(confirmMsg);
  
  if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
    // Update files
    const taxSuccess = updateTaxBracketsFile(year, yearCode, overwrite);
    const htmlSuccess = updateHTMLFile(year, overwrite);
    
    if (taxSuccess && htmlSuccess) {
      const action = overwrite ? 'updated' : 'added';
      console.log(`\n\n🎉 Success! Tax data has been ${action}.`);
      console.log('\n📝 Next steps:');
      console.log('   1. Review the changes in public/taxBrackets.js');
      console.log('   2. Test the application with the new tax year');
      console.log('   3. Verify calculations against IRS tax calculators');
      console.log('   4. Commit the changes to version control\n');
    } else {
      console.log('\n⚠️  Partial success. Please review the files manually.');
    }
  } else {
    // Save to file for manual addition
    const outputPath = path.join(__dirname, `tax-data-${year}.txt`);
    fs.writeFileSync(outputPath, yearCode, 'utf8');
    console.log(`\n💾 Code saved to: ${outputPath}`);
    console.log('   You can manually add this to taxBrackets.js\n');
  }
  
  rl.close();
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
