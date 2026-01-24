function validateInput(...inputs) {
  for (const input of inputs) {
    if (isNaN(input) || input === null || input === undefined) {
      return false;
    }
  }
  return true;
}

function saveData() {
  const data = {
    annualSalary: document.getElementById('annualSalary').value,
    preTaxDeductions: document.getElementById('preTaxDeductions').value,
    stateResidence: document.getElementById('stateResidence').value,
    rent: document.getElementById('rent').value,
    utilities: document.getElementById('utilities').value,
    groceries: document.getElementById('groceries').value,
    transport: document.getElementById('transport').value,
    otherExpenses: document.getElementById('otherExpenses').value,
    additionalExpenses: Array.from(document.querySelectorAll('#additional-expenses .expense-input-group')).map(group => ({
      name: group.querySelector('input[type="text"]').value,
      value: group.querySelector('input[type="number"]').value
    }))
  };
  localStorage.setItem('financialData', JSON.stringify(data));
}

function loadData() {
  const data = JSON.parse(localStorage.getItem('financialData'));
  if (data) {
    document.getElementById('annualSalary').value = data.annualSalary;
    document.getElementById('preTaxDeductions').value = data.preTaxDeductions;
    document.getElementById('stateResidence').value = data.stateResidence;
    document.getElementById('rent').value = data.rent;
    document.getElementById('utilities').value = data.utilities;
    document.getElementById('groceries').value = data.groceries;
    document.getElementById('transport').value = data.transport;
    document.getElementById('otherExpenses').value = data.otherExpenses;
    data.additionalExpenses.forEach(expense => addExpense(expense.name, expense.value));
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

function calculateTakeHomeSalary() {
  const annualSalary = parseFloat(document.getElementById('annualSalary').value);
  const preTaxDeductions = parseFloat(document.getElementById('preTaxDeductions').value);
  const stateResidence = document.getElementById('stateResidence').value;

  if (!validateInput(annualSalary, preTaxDeductions) || !stateResidence) {
    alert("Please enter valid numbers for salary, pre-tax deductions, and state of residence.");
    return;
  }

  const taxRates = stateTaxBrackets[stateResidence];

  const taxableIncome = annualSalary - preTaxDeductions;
  const federalTax = calculateTax(taxableIncome, federalTaxBrackets);
  const stateTax = calculateTax(taxableIncome, taxRates);
  const takeHomeSalary = annualSalary - preTaxDeductions - federalTax - stateTax;

  document.getElementById('takeHomeSalaryResult').innerHTML = `
    <p>Annual Take-Home Salary: $${takeHomeSalary.toFixed(2)}</p>
    <p>Monthly Take-Home Salary: $${(takeHomeSalary / 12).toFixed(2)}</p>
    <p>Bi-Weekly Take-Home Salary: $${(takeHomeSalary / 26).toFixed(2)}</p>
  `;
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
  const takeHomeSalary = parseFloat(document.getElementById('takeHomeSalaryResult').innerText.split('$')[1]);
  const rent = parseFloat(document.getElementById('rent').value);
  const utilities = parseFloat(document.getElementById('utilities').value);
  const groceries = parseFloat(document.getElementById('groceries').value);
  const transport = parseFloat(document.getElementById('transport').value);
  const otherExpenses = parseFloat(document.getElementById('otherExpenses').value);

  const additionalExpensesDiv = document.getElementById('additional-expenses');
  const additionalExpenseInputs = additionalExpensesDiv.getElementsByClassName('expense-input-group');
  let additionalExpenses = 0;

  for (let i = 0; i < additionalExpenseInputs.length; i++) {
    const expenseValueInput = additionalExpenseInputs[i].querySelector('input[type="number"]');
    additionalExpenses += parseFloat(expenseValueInput.value) || 0;
  }

  if (!validateInput(takeHomeSalary, rent, utilities, groceries, transport, otherExpenses)) {
    alert("Please enter valid numbers for all fields.");
    return;
  }

  const totalMonthlyIncome = takeHomeSalary / 12;
  const totalMonthlyExpenses = rent + utilities + groceries + transport + otherExpenses + additionalExpenses;
  const remainingMonthlyIncome = totalMonthlyIncome - totalMonthlyExpenses;
  const totalAnnualExpenses = totalMonthlyExpenses * 12;
  const remainingIncome = takeHomeSalary - totalAnnualExpenses;

  document.getElementById('remainingIncomeResult').innerHTML = `
    <p>Remaining Annual Income: $${remainingIncome.toFixed(2)}</p>
    <p>Remaining Monthly Income: $${remainingMonthlyIncome.toFixed(2)}</p>
    <p>Remaining Bi-Weekly Income: $${(remainingMonthlyIncome / 2).toFixed(2)}</p>
  `;

  // Generate the chart
  const ctx = document.getElementById('incomeChart').getContext('2d');
  new Chart(ctx, {
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
}

async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const app = document.querySelector('.container');
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
}

// Event listener for dynamic expense input resizing
document.addEventListener('DOMContentLoaded', function() {
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
