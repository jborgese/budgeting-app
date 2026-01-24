// Enhanced validation function - kept for backward compatibility
function validateInput(...inputs) {
  for (const input of inputs) {
    if (isNaN(input) || input === null || input === undefined || input === '') {
      return false;
    }
  }
  return true;
}

// Check if localStorage is available
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function saveData() {
  try {
    if (!isLocalStorageAvailable()) {
      showErrorToast(ErrorCodes.LOCALSTORAGE_NOT_AVAILABLE);
      return false;
    }
    const data = {
      annualSalary: document.getElementById('annualSalary').value,
      preTaxDeductions: document.getElementById('preTaxDeductions').value,
      stateResidence: document.getElementById('stateResidence').value,
      rent: document.getElementById('rent').value,
      utilities: document.getElementById('utilities').value,
      groceries: document.getElementById('groceries').value,
      transport: document.getElementById('transport').value,
      otherExpenses: document.getElementById('otherExpenses').value,
      taxYear: document.getElementById('taxYear').value,
      filingStatus: document.getElementById('filingStatus').value,
      additionalExpenses: Array.from(document.querySelectorAll('#additional-expenses .expense-input-group')).map(group => ({
        name: group.querySelector('input[type="text"]').value,
        value: group.querySelector('input[type="number"]').value
      }))
    };
    localStorage.setItem('financialData', JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error saving data:', e);
    showErrorToast(ErrorCodes.LOCALSTORAGE_SAVE_FAILED);
    return false;
  }
}

function loadData() {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available');
      return false;
    }
    
    const storedData = localStorage.getItem('financialData');
    if (!storedData) {
      return false; // No data to load
    }
    
    const data = JSON.parse(storedData);
    if (data) {
      document.getElementById('annualSalary').value = data.annualSalary || '';
      document.getElementById('preTaxDeductions').value = data.preTaxDeductions || '';
      document.getElementById('stateResidence').value = data.stateResidence || 'AL';
      document.getElementById('rent').value = data.rent || '';
      document.getElementById('utilities').value = data.utilities || '';
      document.getElementById('groceries').value = data.groceries || '';
      document.getElementById('transport').value = data.transport || '';
      document.getElementById('otherExpenses').value = data.otherExpenses || '';
      
      if (data.taxYear) document.getElementById('taxYear').value = data.taxYear;
      if (data.filingStatus) document.getElementById('filingStatus').value = data.filingStatus;
      
      if (data.additionalExpenses && Array.isArray(data.additionalExpenses)) {
        data.additionalExpenses.forEach(expense => addExpense(expense.name, expense.value));
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error loading data:', e);
    showErrorToast(ErrorCodes.LOCALSTORAGE_LOAD_FAILED);
    return false;
  }
}

function calculateTax(income, brackets) {
  let tax = 0;
  for (let i = brackets.length - 1; i >= 0; i--) {
    const { rate, threshold } = brackets[i];
    if (income > threshold) {
      tax += (income - threshold) * rate;
      income = threshold;
    }
  }
  return tax;
}

function calculateFICA(annualSalary, year) {
  const yearData = taxData.years[year];
  const fica = yearData.fica;
  
  // Social Security Tax (capped)
  const socialSecurityWages = Math.min(annualSalary, fica.socialSecurity.wageLimit);
  const socialSecurityTax = socialSecurityWages * fica.socialSecurity.rate;
  
  // Medicare Tax (no cap, with additional tax for high earners)
  const medicareTax = annualSalary * fica.medicare.rate;
  const additionalMedicareTax = annualSalary > fica.medicare.additionalThreshold 
    ? (annualSalary - fica.medicare.additionalThreshold) * fica.medicare.additionalRate 
    : 0;
  
  return {
    socialSecurity: socialSecurityTax,
    medicare: medicareTax + additionalMedicareTax,
    total: socialSecurityTax + medicareTax + additionalMedicareTax
  };
}

function calculateTakeHomeSalary() {
  try {
    // Get input values
    const annualSalaryInput = document.getElementById('annualSalary').value;
    const preTaxDeductionsInput = document.getElementById('preTaxDeductions').value || '0';
    const stateResidence = document.getElementById('stateResidence').value;
    const taxYear = parseInt(document.getElementById('taxYear').value);
    const filingStatus = document.getElementById('filingStatus').value;

    // Validate annual salary
    const salaryValidation = validateFinancialInput(annualSalaryInput, 'Annual Salary', {
      min: 1,
      max: 10000000,
      required: true,
      allowZero: false
    });
    
    if (!salaryValidation.valid) {
      showErrorToast(salaryValidation.errorCode, salaryValidation.message);
      return;
    }
    
    const annualSalary = salaryValidation.value;

    // Validate pre-tax deductions
    const deductionsValidation = validateFinancialInput(preTaxDeductionsInput, 'Pre-Tax Deductions', {
      min: 0,
      max: annualSalary,
      required: false,
      allowZero: true
    });
    
    if (!deductionsValidation.valid) {
      showErrorToast(deductionsValidation.errorCode, deductionsValidation.message);
      return;
    }
    
    const preTaxDeductions = deductionsValidation.value;
    
    // Validate state
    if (!stateResidence) {
      showErrorToast(ErrorCodes.MISSING_STATE);
      return;
    }
    
    // Validate tax year
    if (!taxYear) {
      showErrorToast(ErrorCodes.MISSING_TAX_YEAR);
      return;
    }
    
    // Validate filing status
    if (!filingStatus) {
      showErrorToast(ErrorCodes.MISSING_FILING_STATUS);
      return;
    }

    // Get tax data for selected year
    const yearData = taxData.years[taxYear];
    if (!yearData) {
      showErrorToast(ErrorCodes.TAX_DATA_MISSING, `Tax data not available for year ${taxYear}.`);
      return;
    }
    
    const federalBrackets = yearData.federalBrackets[filingStatus];
    if (!federalBrackets) {
      showErrorToast(ErrorCodes.INVALID_TAX_BRACKET, `Federal tax brackets not found for filing status: ${filingStatus}.`);
      return;
    }
    
    const stateBrackets = yearData.stateBrackets[stateResidence];
    if (!stateBrackets) {
      showErrorToast(ErrorCodes.TAX_DATA_MISSING, `State tax data not available for ${stateResidence}.`);
      return;
    }
    
    const standardDeduction = yearData.standardDeduction[filingStatus];
    if (standardDeduction === undefined) {
      showErrorToast(ErrorCodes.TAX_DATA_MISSING, `Standard deduction not found for filing status: ${filingStatus}.`);
      return;
    }

    // Calculate FICA (Social Security + Medicare)
    const fica = calculateFICA(annualSalary, taxYear);

    // Calculate taxable income after pre-tax deductions and standard deduction
    const adjustedGrossIncome = annualSalary - preTaxDeductions;
    const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction);

    // Calculate federal and state taxes
    const federalTax = calculateTax(taxableIncome, federalBrackets);
    const stateTax = calculateTax(taxableIncome, stateBrackets);

    // Calculate take-home salary
    const totalTaxes = federalTax + stateTax + fica.total;
    const takeHomeSalary = annualSalary - preTaxDeductions - totalTaxes;

    // Display detailed breakdown
    document.getElementById('takeHomeSalaryResult').innerHTML = `
    <h5>Tax Breakdown (${taxYear})</h5>
    <p><strong>Gross Salary:</strong> $${annualSalary.toFixed(2)}</p>
    <p><strong>Pre-Tax Deductions:</strong> -$${preTaxDeductions.toFixed(2)}</p>
    <p><strong>Adjusted Gross Income:</strong> $${adjustedGrossIncome.toFixed(2)}</p>
    <p><strong>Standard Deduction:</strong> -$${standardDeduction.toFixed(2)}</p>
    <p><strong>Taxable Income:</strong> $${taxableIncome.toFixed(2)}</p>
    <hr>
    <p><strong>Federal Income Tax:</strong> -$${federalTax.toFixed(2)}</p>
    <p><strong>State Income Tax:</strong> -$${stateTax.toFixed(2)}</p>
    <p><strong>Social Security Tax:</strong> -$${fica.socialSecurity.toFixed(2)}</p>
    <p><strong>Medicare Tax:</strong> -$${fica.medicare.toFixed(2)}</p>
    <p><strong>Total Taxes & Deductions:</strong> -$${(preTaxDeductions + totalTaxes).toFixed(2)}</p>
    <hr>
    <p><strong>Annual Take-Home Salary:</strong> $${takeHomeSalary.toFixed(2)}</p>
    <p><strong>Monthly Take-Home:</strong> $${(takeHomeSalary / 12).toFixed(2)}</p>
    <p><strong>Bi-Weekly Take-Home:</strong> $${(takeHomeSalary / 26).toFixed(2)}</p>
  `;
    
    // Save data after successful calculation
    saveData();
    showSuccessToast('Take-home salary calculated successfully!');
    
  } catch (error) {
    console.error('Error calculating take-home salary:', error);
    showErrorToast(ErrorCodes.CALCULATION_FAILED, 'An error occurred while calculating your take-home salary.');
  }
}

function addExpense(name = '', value = '') {
  const additionalExpensesDiv = document.getElementById('additional-expenses');
  const expenseGroup = document.createElement('div');
  expenseGroup.classList.add('input-group', 'mb-3', 'expense-input-group');

  const expenseNameInput = document.createElement('input');
  expenseNameInput.type = 'text';
  expenseNameInput.classList.add('form-control', 'gray-bg', 'auto-resize-input');
  expenseNameInput.placeholder = 'Expense Name';
  expenseNameInput.style.width = '150px'; // Set initial width
  expenseNameInput.value = name;

  expenseNameInput.addEventListener('input', function() {
    if (this.value.length === 0) {
      this.style.width = '150px'; // Reset to initial width when empty
    } else {
      this.style.width = ((this.value.length + 1) * 0.75) + 'ch'; // Adjust width dynamically
    }
  });

  const expenseValueInput = document.createElement('input');
  expenseValueInput.type = 'number';
  expenseValueInput.classList.add('form-control');
  expenseValueInput.placeholder = 'Expense Value';
  expenseValueInput.value = value;

  const removeButton = document.createElement('button');
  removeButton.classList.add('btn', 'btn-danger');
  removeButton.textContent = '-';
  removeButton.onclick = () => expenseGroup.remove();

  expenseGroup.appendChild(expenseNameInput);
  expenseGroup.appendChild(expenseValueInput);
  expenseGroup.appendChild(removeButton);

  additionalExpensesDiv.appendChild(expenseGroup);
}

function calculateRemainingIncome() {
  try {
    // Check if take-home salary has been calculated
    const takeHomeSalaryText = document.getElementById('takeHomeSalaryResult').innerText;
    if (!takeHomeSalaryText || !takeHomeSalaryText.includes('Annual Take-Home Salary')) {
      showErrorToast(ErrorCodes.TAKEHOME_NOT_CALCULATED);
      return;
    }
    
    // Extract take-home salary
    const takeHomeSalaryMatch = takeHomeSalaryText.match(/Annual Take-Home Salary:\s*\$([\d,]+\.\d{2})/);
    if (!takeHomeSalaryMatch) {
      showErrorToast(ErrorCodes.TAKEHOME_NOT_CALCULATED);
      return;
    }
    
    const takeHomeSalary = parseFloat(takeHomeSalaryMatch[1].replace(/,/g, ''));
    
    // Validate expenses
    const rentInput = document.getElementById('rent').value || '0';
    const utilitiesInput = document.getElementById('utilities').value || '0';
    const groceriesInput = document.getElementById('groceries').value || '0';
    const transportInput = document.getElementById('transport').value || '0';
    const otherExpensesInput = document.getElementById('otherExpenses').value || '0';
    
    // Validate each expense field
    const rentValidation = validateFinancialInput(rentInput, 'Rent', { required: false, min: 0 });
    if (!rentValidation.valid) {
      showErrorToast(rentValidation.errorCode, rentValidation.message);
      return;
    }
    const rent = rentValidation.value;
    
    const utilitiesValidation = validateFinancialInput(utilitiesInput, 'Utilities', { required: false, min: 0 });
    if (!utilitiesValidation.valid) {
      showErrorToast(utilitiesValidation.errorCode, utilitiesValidation.message);
      return;
    }
    const utilities = utilitiesValidation.value;
    
    const groceriesValidation = validateFinancialInput(groceriesInput, 'Groceries', { required: false, min: 0 });
    if (!groceriesValidation.valid) {
      showErrorToast(groceriesValidation.errorCode, groceriesValidation.message);
      return;
    }
    const groceries = groceriesValidation.value;
    
    const transportValidation = validateFinancialInput(transportInput, 'Transport', { required: false, min: 0 });
    if (!transportValidation.valid) {
      showErrorToast(transportValidation.errorCode, transportValidation.message);
      return;
    }
    const transport = transportValidation.value;
    
    const otherExpensesValidation = validateFinancialInput(otherExpensesInput, 'Other Expenses', { required: false, min: 0 });
    if (!otherExpensesValidation.valid) {
      showErrorToast(otherExpensesValidation.errorCode, otherExpensesValidation.message);
      return;
    }
    const otherExpenses = otherExpensesValidation.value;

    // Validate and sum additional expenses
    const additionalExpensesDiv = document.getElementById('additional-expenses');
    const additionalExpenseInputs = additionalExpensesDiv.getElementsByClassName('expense-input-group');
    let additionalExpenses = 0;

    for (let i = 0; i < additionalExpenseInputs.length; i++) {
      const expenseValueInput = additionalExpenseInputs[i].querySelector('input[type="number"]');
      const expenseValue = expenseValueInput.value || '0';
      const expenseValidation = validateFinancialInput(expenseValue, 'Additional Expense', { required: false, min: 0 });
      
      if (!expenseValidation.valid) {
        showErrorToast(expenseValidation.errorCode, expenseValidation.message);
        return;
      }
      additionalExpenses += expenseValidation.value;
    }

    const totalMonthlyIncome = takeHomeSalary / 12;
    const totalMonthlyExpenses = rent + utilities + groceries + transport + otherExpenses + additionalExpenses;
    const remainingMonthlyIncome = totalMonthlyIncome - totalMonthlyExpenses;
    const totalAnnualExpenses = totalMonthlyExpenses * 12;
    const remainingIncome = takeHomeSalary - totalAnnualExpenses;
    
    // Warn if expenses exceed income
    if (totalMonthlyExpenses > totalMonthlyIncome) {
      showErrorToast(ErrorCodes.EXPENSE_TOO_HIGH, 'Warning: Your monthly expenses exceed your monthly income!');
    }

    document.getElementById('remainingIncomeResult').innerHTML = `
      <p>Remaining Annual Income: $${remainingIncome.toFixed(2)}</p>
      <p>Remaining Monthly Income: $${remainingMonthlyIncome.toFixed(2)}</p>
      <p>Remaining Bi-Weekly Income: $${(remainingMonthlyIncome / 2).toFixed(2)}</p>
    `;

    // Generate the chart
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.incomeChartInstance) {
      window.incomeChartInstance.destroy();
    }
    
    window.incomeChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Monthly Income', 'Total Monthly Expenses', 'Remaining Monthly Income'],
      datasets: [{
        label: 'Amount in USD',
        data: [totalMonthlyIncome, totalMonthlyExpenses, remainingMonthlyIncome],
        backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

    // Save data to local storage
    saveData();

    // Show the Export to PDF button
    document.getElementById('exportPDFButton').style.display = 'block';
    
    showSuccessToast('Budget calculated successfully!');
    
  } catch (error) {
    console.error('Error calculating remaining income:', error);
    if (error.message && error.message.includes('Chart')) {
      showErrorToast(ErrorCodes.CHART_GENERATION_FAILED);
    } else {
      showErrorToast(ErrorCodes.CALCULATION_FAILED, 'An error occurred while calculating your remaining income.');
    }
  }
}

async function exportPDF() {
  try {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      showErrorToast(ErrorCodes.PDF_EXPORT_FAILED, 'PDF library not loaded. Please refresh the page.');
      return;
    }
    
    const doc = new jsPDF();
    const app = document.querySelector('.container');
    
    if (!app) {
      showErrorToast(ErrorCodes.PDF_EXPORT_FAILED, 'Unable to find content to export.');
      return;
    }
    
    const canvas = await html2canvas(app);

  // Convert the canvas to an image and add it to the PDF
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 180; // Width in mm (for A4 size)
  const pageHeight = 295; // Height in mm (for A4 size)
  const imgHeight = canvas.height * imgWidth / canvas.width;
  let heightLeft = imgHeight;

  let position = 0;

  doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add new pages if necessary
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    doc.addPage();
    doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

    doc.save('financial_statement.pdf');
    showSuccessToast('PDF exported successfully!');
    
  } catch (error) {
    console.error('Error exporting PDF:', error);
    showErrorToast(ErrorCodes.PDF_EXPORT_FAILED);
  }
}

// Event listener for dynamic expense input resizing
document.addEventListener('DOMContentLoaded', function() {
  // Load saved data on page load
  loadData();
  
  document.getElementById('additional-expenses').addEventListener('input', function(event) {
    if (event.target.classList.contains('auto-resize-input')) {
      if (event.target.value.length === 0) {
        event.target.style.width = '150px'; // Reset to initial width when empty
      } else {
        event.target.style.width = ((event.target.value.length + 1) * 0.75) + 'ch'; // Adjust width dynamically
      }
    }
  });
});
