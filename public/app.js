// ========== STATE MANAGEMENT INTEGRATION ==========

/**
 * Sync DOM input to state
 */
function syncInputToState(inputId, statePath) {
  const element = document.getElementById(inputId);
  if (!element) return;
  
  element.addEventListener('input', () => {
    let value = element.value;
    
    // Parse formatted numbers for numeric inputs
    if (element.getAttribute('inputmode') === 'numeric' || ['annualSalary', 'preTaxDeductions', 'rent', 'utilities', 'groceries', 'transport', 'otherExpenses'].includes(inputId)) {
      value = parseFormattedNumber(value);
    }
    
    stateManager.setState(statePath, value);
  });
}

/**
 * Sync state to DOM display
 */
function syncStateToInput(inputId, statePath) {
  stateManager.subscribe(statePath, (newValue) => {
    const element = document.getElementById(inputId);
    if (!element) return;
    
    // Format numeric values
    if (typeof newValue === 'number' && element.getAttribute('inputmode') === 'numeric') {
      element.value = newValue > 0 ? formatNumberWithCommas(newValue) : '';
    } else {
      element.value = newValue || '';
    }
  });
}

/**
 * Initialize state-DOM bindings
 */
function initializeStateBindings() {
  // Income inputs
  syncInputToState('annualSalary', 'inputs.annualSalary');
  syncInputToState('preTaxDeductions', 'inputs.preTaxDeductions');
  syncInputToState('stateResidence', 'inputs.stateResidence');
  syncInputToState('taxYear', 'inputs.taxYear');
  syncInputToState('filingStatus', 'inputs.filingStatus');
  
  // Budget inputs
  syncInputToState('rent', 'inputs.rent');
  syncInputToState('utilities', 'inputs.utilities');
  syncInputToState('groceries', 'inputs.groceries');
  syncInputToState('transport', 'inputs.transport');
  syncInputToState('otherExpenses', 'inputs.otherExpenses');
}

// ========== VALIDATION FUNCTIONS ==========

// Enhanced validation function - kept for backward compatibility
function validateInput(...inputs) {
  for (const input of inputs) {
    if (isNaN(input) || input === null || input === undefined || input === '') {
      return false;
    }
  }
  return true;
}

// Format number with commas for display
function formatNumberWithCommas(value) {
  // Remove non-numeric characters except decimal point
  const numericValue = value.toString().replace(/[^0-9.]/g, '');
  
  // Split into integer and decimal parts
  const parts = numericValue.split('.');
  
  // Add commas to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Return formatted value (limit to 2 decimal places if decimal exists)
  return parts.length > 1 ? parts[0] + '.' + parts[1].slice(0, 2) : parts[0];
}

// Parse formatted number (remove commas) for calculations
function parseFormattedNumber(value) {
  if (!value) return 0;
  return parseFloat(value.toString().replace(/,/g, '')) || 0;
}

// Add formatting to currency input field
function addCurrencyFormatting(inputElement) {
  inputElement.addEventListener('input', function(e) {
    // Save cursor position
    let cursorPosition = this.selectionStart;
    const oldValue = this.value;
    const oldLength = oldValue.length;
    
    // Remove non-numeric characters except decimal point
    let numericValue = oldValue.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const decimalCount = (numericValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = numericValue.split('.');
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Format with commas
    const formatted = formatNumberWithCommas(numericValue);
    
    // Update value
    this.value = formatted;
    
    // Calculate new cursor position
    const newLength = formatted.length;
    const charsAddedBeforeCursor = (oldValue.substring(0, cursorPosition).match(/,/g) || []).length;
    const charsInFormattedBeforeCursor = (formatted.substring(0, cursorPosition).match(/,/g) || []).length;
    
    // Adjust cursor position based on comma differences
    const diff = charsInFormattedBeforeCursor - charsAddedBeforeCursor;
    cursorPosition += diff;
    
    // Set cursor position safely
    try {
      this.setSelectionRange(cursorPosition, cursorPosition);
    } catch (e) {
      // Fallback - place cursor at end if setSelectionRange fails
      this.setSelectionRange(newLength, newLength);
    }
  });
  
  // Format on blur to ensure proper formatting
  inputElement.addEventListener('blur', function() {
    if (this.value) {
      const numValue = parseFormattedNumber(this.value);
      if (!isNaN(numValue) && numValue >= 0) {
        this.value = formatNumberWithCommas(numValue.toFixed(2));
      }
    }
  });
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
    
    // Collect additional expenses from DOM
    const additionalExpenses = Array.from(document.querySelectorAll('#additional-expenses .expense-input-group')).map(group => ({
      name: group.querySelector('input[type="text"]').value,
      value: parseFormattedNumber(group.querySelectorAll('input[type="text"]')[1].value)
    }));
    
    // Update state
    stateManager.setState('inputs.additionalExpenses', additionalExpenses, false);
    
    // Save to localStorage
    return stateManager.saveToStorage();
  } catch (e) {
    console.error('Error saving data:', e);
    showErrorToast(ErrorCodes.LOCALSTORAGE_SAVE_FAILED);
    return false;
  }
}

function loadData() {
  try {
    // Load from state manager
    const loaded = stateManager.loadFromStorage();
    
    if (loaded) {
      // Sync state to DOM
      const inputs = stateManager.getState('inputs');
      
      document.getElementById('annualSalary').value = inputs.annualSalary ? formatNumberWithCommas(inputs.annualSalary) : '';
      document.getElementById('preTaxDeductions').value = inputs.preTaxDeductions ? formatNumberWithCommas(inputs.preTaxDeductions) : '';
      document.getElementById('stateResidence').value = inputs.stateResidence || 'AL';
      document.getElementById('rent').value = inputs.rent ? formatNumberWithCommas(inputs.rent) : '';
      document.getElementById('utilities').value = inputs.utilities ? formatNumberWithCommas(inputs.utilities) : '';
      document.getElementById('groceries').value = inputs.groceries ? formatNumberWithCommas(inputs.groceries) : '';
      document.getElementById('transport').value = inputs.transport ? formatNumberWithCommas(inputs.transport) : '';
      document.getElementById('otherExpenses').value = inputs.otherExpenses ? formatNumberWithCommas(inputs.otherExpenses) : '';
      
      if (inputs.taxYear) document.getElementById('taxYear').value = inputs.taxYear;
      if (inputs.filingStatus) document.getElementById('filingStatus').value = inputs.filingStatus;
      
      if (inputs.additionalExpenses && Array.isArray(inputs.additionalExpenses)) {
        inputs.additionalExpenses.forEach(expense => addExpense(expense.name, expense.value));
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
    // Set calculating state
    stateManager.setState('ui.isCalculating', true, false);
    
    // Get input values from state
    const inputs = stateManager.getState('inputs');
    const annualSalaryInput = inputs.annualSalary || parseFormattedNumber(document.getElementById('annualSalary').value);
    const preTaxDeductionsInput = inputs.preTaxDeductions || parseFormattedNumber(document.getElementById('preTaxDeductions').value) || 0;
    const stateResidence = inputs.stateResidence || document.getElementById('stateResidence').value;
    const taxYear = parseInt(inputs.taxYear || document.getElementById('taxYear').value);
    const filingStatus = inputs.filingStatus || document.getElementById('filingStatus').value;

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

    // Calculate percentages
    const preTaxDeductionsPercent = (preTaxDeductions / annualSalary * 100).toFixed(1);
    const federalTaxPercent = (federalTax / annualSalary * 100).toFixed(1);
    const stateTaxPercent = (stateTax / annualSalary * 100).toFixed(1);
    const socialSecurityPercent = (fica.socialSecurity / annualSalary * 100).toFixed(1);
    const medicarePercent = (fica.medicare / annualSalary * 100).toFixed(1);
    const totalTaxesPercent = ((preTaxDeductions + totalTaxes) / annualSalary * 100).toFixed(1);
    const takeHomePercent = (takeHomeSalary / annualSalary * 100).toFixed(1);
    const effectiveTaxRate = (totalTaxes / annualSalary * 100).toFixed(1);

    // Store calculation results in state
    stateManager.batchUpdate({
      'calculations.taxBreakdown': {
        grossSalary: annualSalary,
        preTaxDeductions,
        adjustedGrossIncome,
        standardDeduction,
        taxableIncome,
        federalTax,
        stateTax,
        fica,
        totalTaxes,
        effectiveTaxRate: parseFloat(effectiveTaxRate)
      },
      'calculations.takeHomeSalary': {
        annual: takeHomeSalary,
        monthly: takeHomeSalary / 12,
        biWeekly: takeHomeSalary / 26
      },
      'metadata.lastCalculated': Date.now(),
      'ui.isCalculating': false
    });
    
    // Display detailed breakdown
    document.getElementById('takeHomeSalaryResult').innerHTML = `
    <h5>Tax Breakdown (${taxYear})</h5>
    <p><strong>Gross Salary:</strong> $${annualSalary.toFixed(2)} <span class="muted">(100.0%)</span></p>
    <p><strong>Pre-Tax Deductions:</strong> -$${preTaxDeductions.toFixed(2)} <span class="muted">(${preTaxDeductionsPercent}%)</span></p>
    <p><strong>Adjusted Gross Income:</strong> $${adjustedGrossIncome.toFixed(2)} <span class="muted">(${(adjustedGrossIncome / annualSalary * 100).toFixed(1)}%)</span></p>
    <p><strong>Standard Deduction:</strong> -$${standardDeduction.toFixed(2)} <span class="muted">(${(standardDeduction / annualSalary * 100).toFixed(1)}%)</span></p>
    <p><strong>Taxable Income:</strong> $${taxableIncome.toFixed(2)} <span class="muted">(${(taxableIncome / annualSalary * 100).toFixed(1)}%)</span></p>
    <hr>
    <p><strong>Federal Income Tax:</strong> -$${federalTax.toFixed(2)} <span class="muted">(${federalTaxPercent}%)</span></p>
    <p><strong>State Income Tax:</strong> -$${stateTax.toFixed(2)} <span class="muted">(${stateTaxPercent}%)</span></p>
    <p><strong>Social Security Tax:</strong> -$${fica.socialSecurity.toFixed(2)} <span class="muted">(${socialSecurityPercent}%)</span></p>
    <p><strong>Medicare Tax:</strong> -$${fica.medicare.toFixed(2)} <span class="muted">(${medicarePercent}%)</span></p>
    <p><strong>Total Taxes & Deductions:</strong> -$${(preTaxDeductions + totalTaxes).toFixed(2)} <span class="negative">(${totalTaxesPercent}%)</span></p>
    <p class="positive"><strong>Effective Tax Rate:</strong> ${effectiveTaxRate}%</p>
    <hr>
    <p style="font-size: 1.1em;"><strong>Annual Take-Home Salary:</strong> $${takeHomeSalary.toFixed(2)} <span class="positive">(${takeHomePercent}%)</span></p>
    <p><strong>Monthly Take-Home:</strong> $${(takeHomeSalary / 12).toFixed(2)}</p>
    <p><strong>Bi-Weekly Take-Home:</strong> $${(takeHomeSalary / 26).toFixed(2)}</p>
  `;
    
    // Save data after successful calculation
    saveData();
    showSuccessToast('Take-home salary calculated successfully!');
    
  } catch (error) {
    console.error('Error calculating take-home salary:', error);
    stateManager.setState('ui.isCalculating', false, false);
    stateManager.setState('ui.lastError', error.message, false);
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
  expenseValueInput.type = 'text';
  expenseValueInput.setAttribute('inputmode', 'numeric');
  expenseValueInput.classList.add('form-control');
  expenseValueInput.placeholder = 'Expense Value';
  expenseValueInput.value = value ? formatNumberWithCommas(value) : '';
  
  // Add currency formatting to the new expense input
  addCurrencyFormatting(expenseValueInput);

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
    const takeHomeSalary = stateManager.getState('calculations.takeHomeSalary');
    
    if (!takeHomeSalary || !takeHomeSalary.annual) {
      showErrorToast(ErrorCodes.TAKEHOME_NOT_CALCULATED);
      return;
    }
    
    const annualTakeHome = takeHomeSalary.annual;
    
    // Get expense inputs from state
    const inputs = stateManager.getState('inputs');
    const rentInput = inputs.rent || parseFormattedNumber(document.getElementById('rent').value) || 0;
    const utilitiesInput = inputs.utilities || parseFormattedNumber(document.getElementById('utilities').value) || 0;
    const groceriesInput = inputs.groceries || parseFormattedNumber(document.getElementById('groceries').value) || 0;
    const transportInput = inputs.transport || parseFormattedNumber(document.getElementById('transport').value) || 0;
    const otherExpensesInput = inputs.otherExpenses || parseFormattedNumber(document.getElementById('otherExpenses').value) || 0;
    
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
      const expenseValueInput = additionalExpenseInputs[i].querySelectorAll('input[type="text"]')[1];
      const expenseValue = expenseValueInput ? parseFormattedNumber(expenseValueInput.value) : 0;
      const expenseValidation = validateFinancialInput(expenseValue, 'Additional Expense', { required: false, min: 0 });
      
      if (!expenseValidation.valid) {
        showErrorToast(expenseValidation.errorCode, expenseValidation.message);
        return;
      }
      additionalExpenses += expenseValidation.value;
    }

    const totalMonthlyIncome = annualTakeHome / 12;
    const totalMonthlyExpenses = rent + utilities + groceries + transport + otherExpenses + additionalExpenses;
    const remainingMonthlyIncome = totalMonthlyIncome - totalMonthlyExpenses;
    const totalAnnualExpenses = totalMonthlyExpenses * 12;
    const remainingIncome = annualTakeHome - totalAnnualExpenses;
    
    // Store budget breakdown in state
    stateManager.batchUpdate({
      'calculations.budgetBreakdown': {
        monthlyIncome: totalMonthlyIncome,
        expenses: {
          rent,
          utilities,
          groceries,
          transport,
          otherExpenses,
          additional: additionalExpenses,
          total: totalMonthlyExpenses
        },
        annualExpenses: totalAnnualExpenses
      },
      'calculations.remainingIncome': {
        annual: remainingIncome,
        monthly: remainingMonthlyIncome,
        biWeekly: remainingMonthlyIncome / 2
      },
      'ui.showExportButton': true
    });
    
    // Calculate expense percentages
    const rentPercent = (rent / totalMonthlyIncome * 100).toFixed(1);
    const utilitiesPercent = (utilities / totalMonthlyIncome * 100).toFixed(1);
    const groceriesPercent = (groceries / totalMonthlyIncome * 100).toFixed(1);
    const transportPercent = (transport / totalMonthlyIncome * 100).toFixed(1);
    const otherExpensesPercent = (otherExpenses / totalMonthlyIncome * 100).toFixed(1);
    const additionalExpensesPercent = (additionalExpenses / totalMonthlyIncome * 100).toFixed(1);
    const totalExpensesPercent = (totalMonthlyExpenses / totalMonthlyIncome * 100).toFixed(1);
    const remainingPercent = (remainingMonthlyIncome / totalMonthlyIncome * 100).toFixed(1);
    
    // Warn if expenses exceed income
    if (totalMonthlyExpenses > totalMonthlyIncome) {
      showWarningToast(ErrorCodes.EXPENSE_TOO_HIGH, 'Warning: Your monthly expenses exceed your monthly income!');
    }

    // Build expense breakdown HTML
    let expenseBreakdown = `<h6 style="margin-top: 15px;" class="muted">Monthly Expense Breakdown:</h6>`;
    if (rent > 0) expenseBreakdown += `<p style="margin: 5px 0;">🏠 Rent: $${rent.toFixed(2)} <span class="muted">(${rentPercent}%)</span></p>`;
    if (utilities > 0) expenseBreakdown += `<p style="margin: 5px 0;">⚡ Utilities: $${utilities.toFixed(2)} <span class="muted">(${utilitiesPercent}%)</span></p>`;
    if (groceries > 0) expenseBreakdown += `<p style="margin: 5px 0;">🛒 Groceries: $${groceries.toFixed(2)} <span class="muted">(${groceriesPercent}%)</span></p>`;
    if (transport > 0) expenseBreakdown += `<p style="margin: 5px 0;">🚗 Transport: $${transport.toFixed(2)} <span class="muted">(${transportPercent}%)</span></p>`;
    if (otherExpenses > 0) expenseBreakdown += `<p style="margin: 5px 0;">💳 Other Expenses: $${otherExpenses.toFixed(2)} <span class="muted">(${otherExpensesPercent}%)</span></p>`;
    if (additionalExpenses > 0) expenseBreakdown += `<p style="margin: 5px 0;">📊 Additional Expenses: $${additionalExpenses.toFixed(2)} <span class="muted">(${additionalExpensesPercent}%)</span></p>`;
    expenseBreakdown += `<hr style="margin: 10px 0;">`;
    expenseBreakdown += `<p><strong>Total Monthly Expenses:</strong> $${totalMonthlyExpenses.toFixed(2)} <span class="negative">(${totalExpensesPercent}%)</span></p>`;

    document.getElementById('remainingIncomeResult').innerHTML = `
      ${expenseBreakdown}
      <p style="font-size: 1.1em; margin-top: 15px;"><strong>Remaining Annual Income:</strong> $${remainingIncome.toFixed(2)} <span class="${remainingPercent >= 0 ? 'positive' : 'negative'}">(${remainingPercent}%)</span></p>
      <p><strong>Remaining Monthly Income:</strong> $${remainingMonthlyIncome.toFixed(2)} <span class="${remainingPercent >= 0 ? 'positive' : 'negative'}">(${remainingPercent}%)</span></p>
      <p><strong>Remaining Bi-Weekly Income:</strong> $${(remainingMonthlyIncome / 2).toFixed(2)}</p>
    `;

    // Generate the chart
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.incomeChartInstance) {
      window.incomeChartInstance.destroy();
    }
    
    // Build chart colors from CSS variables so the chart matches the current theme
    const style = getComputedStyle(document.documentElement);
    function cssVarRgb(varName) {
      // Returns "r,g,b" string from CSS variable
      return (style.getPropertyValue(varName) || '0,0,0').trim();
    }
    function rgbVarRgba(varName, alpha) {
      return `rgba(${cssVarRgb(varName)},${alpha})`;
    }

    const accentBg = rgbVarRgba('--accent-rgb', 0.2);
    const negativeBg = rgbVarRgba('--negative-rgb', 0.2);
    const mutedBg = rgbVarRgba('--muted-rgb', 0.15);
    const accentBorder = rgbVarRgba('--accent-rgb', 1);
    const negativeBorder = rgbVarRgba('--negative-rgb', 1);
    const mutedBorder = rgbVarRgba('--muted-rgb', 1);

    const textColor = (style.getPropertyValue('--results-text') || style.getPropertyValue('--text') || '#e6eef3').trim();
    const gridColor = rgbVarRgba('--muted-rgb', 0.12);

    window.incomeChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Monthly Income', 'Total Monthly Expenses', 'Remaining Monthly Income'],
        datasets: [{
          label: 'Amount in USD',
          data: [totalMonthlyIncome, totalMonthlyExpenses, remainingMonthlyIncome],
          backgroundColor: [accentBg, negativeBg, mutedBg],
          borderColor: [accentBorder, negativeBorder, mutedBorder],
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { labels: { color: textColor } }
        },
        scales: {
          x: {
            ticks: { color: textColor },
            grid: { color: gridColor }
          },
          y: {
            beginAtZero: true,
            ticks: { color: textColor },
            grid: { color: gridColor }
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
  // Initialize theme (defaults to device/browser setting, persisted if user chooses)
  (function() {
    const THEME_KEY = 'theme-preference';

    function applyTheme(theme) {
      const toggle = document.getElementById('themeToggle');
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (toggle) toggle.textContent = '☀️';
      } else {
        // Force light theme explicitly so it overrides OS dark preference
        document.documentElement.setAttribute('data-theme', 'light');
        if (toggle) toggle.textContent = '🌙';
      }
    }

    function getPreferredTheme() {
      try {
        const stored = isLocalStorageAvailable() ? localStorage.getItem(THEME_KEY) : null;
        if (stored === 'dark' || stored === 'light') return stored;
      } catch (e) {
        // ignore
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply initial theme
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    // Toggle handler
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try {
          if (isLocalStorageAvailable()) localStorage.setItem(THEME_KEY, next);
        } catch (e) {
          // ignore
        }
      });
    }

    // If user hasn't set a preference, respond to OS-level changes
    try {
      if (isLocalStorageAvailable() && !localStorage.getItem(THEME_KEY) && window.matchMedia) {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e) => applyTheme(e.matches ? 'dark' : 'light');
        if (mql.addEventListener) mql.addEventListener('change', listener);
        else if (mql.addListener) mql.addListener(listener);
      }
    } catch (e) {
      // ignore
    }
  })();

  // Initialize state bindings
  initializeStateBindings();
  
  // Subscribe to UI state changes
  stateManager.subscribe('ui.showExportButton', (show) => {
    const exportButton = document.getElementById('exportPDFButton');
    if (exportButton) {
      exportButton.style.display = show ? 'block' : 'none';
    }
  });
  
  // Initialize Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Add currency formatting to all numeric input fields
  const currencyFields = [
    'annualSalary',
    'preTaxDeductions',
    'rent',
    'utilities',
    'groceries',
    'transport',
    'otherExpenses'
  ];
  
  currencyFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      addCurrencyFormatting(field);
    }
  });
  
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
