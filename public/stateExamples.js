/**
 * State Management Usage Examples
 * 
 * This file contains practical examples of using the state management system
 * in the budgeting app. These examples can be run in the browser console
 * for testing and debugging.
 */

// ========== BASIC STATE OPERATIONS ==========

// Example 1: Reading state
function exampleReadState() {
  // Get entire state
  const fullState = stateManager.getState();
  console.log('Full state:', fullState);
  
  // Get specific value
  const salary = stateManager.getState('inputs.annualSalary');
  console.log('Annual salary:', salary);
  
  // Get nested object
  const allInputs = stateManager.getState('inputs');
  console.log('All inputs:', allInputs);
}

// Example 2: Updating state
function exampleUpdateState() {
  // Update single value
  stateManager.setState('inputs.annualSalary', 85000);
  
  // Update without notifying observers (silent update)
  stateManager.setState('ui.isCalculating', true, false);
  
  // Batch update multiple values
  stateManager.batchUpdate({
    'inputs.rent': 1800,
    'inputs.utilities': 250,
    'inputs.groceries': 600
  });
}

// Example 3: Subscribing to changes
function exampleSubscribe() {
  // Subscribe to specific path
  const unsubscribeSalary = stateManager.subscribe('inputs.annualSalary', (newValue, oldValue) => {
    console.log(`Salary changed from $${oldValue} to $${newValue}`);
  });
  
  // Subscribe to all changes (wildcard)
  const unsubscribeAll = stateManager.subscribe('*', (state, oldState, changedPath) => {
    console.log(`State changed at ${changedPath}`);
  });
  
  // Remember to unsubscribe when done
  // unsubscribeSalary();
  // unsubscribeAll();
  
  return { unsubscribeSalary, unsubscribeAll };
}

// ========== PRACTICAL EXAMPLES ==========

// Example 4: Validate state before calculation
function validateStateBeforeCalculation() {
  const inputs = stateManager.getState('inputs');
  
  const validations = {
    hasSalary: inputs.annualSalary > 0,
    hasState: inputs.stateResidence !== null,
    hasTaxYear: inputs.taxYear > 0,
    hasFilingStatus: inputs.filingStatus !== null
  };
  
  const isValid = Object.values(validations).every(v => v);
  
  if (!isValid) {
    console.error('Invalid state for calculation:', validations);
    return false;
  }
  
  return true;
}

// Example 5: Calculate summary statistics from state
function getStateSummary() {
  const inputs = stateManager.getState('inputs');
  const calculations = stateManager.getState('calculations');
  
  const summary = {
    hasInputs: inputs.annualSalary > 0,
    hasCalculations: calculations.takeHomeSalary !== null,
    hasBudget: calculations.budgetBreakdown !== null,
    totalMonthlyExpenses: (inputs.rent + inputs.utilities + inputs.groceries + 
                          inputs.transport + inputs.otherExpenses),
    additionalExpensesCount: inputs.additionalExpenses.length
  };
  
  console.table(summary);
  return summary;
}

// Example 6: Export state for backup
function exportStateToJSON() {
  const state = stateManager.getState();
  const json = JSON.stringify(state, null, 2);
  
  // Create downloadable file
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget-state-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('State exported successfully');
}

// Example 7: Import state from backup
function importStateFromJSON(jsonString) {
  try {
    const importedState = JSON.parse(jsonString);
    
    // Validate structure (basic check)
    if (!importedState.inputs || !importedState.calculations) {
      throw new Error('Invalid state structure');
    }
    
    // Import inputs
    Object.entries(importedState.inputs).forEach(([key, value]) => {
      stateManager.setState(`inputs.${key}`, value, false);
    });
    
    // Notify observers after all imports
    stateManager.notifyObservers('*');
    
    console.log('State imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import state:', error);
    return false;
  }
}

// Example 8: Reset application state
function resetApplication() {
  if (confirm('Are you sure you want to reset all data?')) {
    stateManager.reset();
    localStorage.removeItem('financialData');
    
    // Clear UI
    document.getElementById('takeHomeSalaryResult').innerHTML = '';
    document.getElementById('remainingIncomeResult').innerHTML = '';
    document.getElementById('additional-expenses').innerHTML = '';
    
    // Reload page to ensure clean state
    window.location.reload();
  }
}

// Example 9: Debug state history
function debugStateHistory() {
  const snapshot = stateManager.getSnapshot();
  
  console.group('State Debug Information');
  console.log('Current State:', snapshot.state);
  console.log('Active Observers:', snapshot.observers);
  console.log('Recent Changes:');
  console.table(snapshot.history);
  console.groupEnd();
  
  return snapshot;
}

// Example 10: Monitor state changes in real-time
function startStateMonitoring() {
  console.log('Starting state monitoring... (Press Ctrl+C to stop)');
  
  const unsubscribe = stateManager.subscribe('*', (state, oldState, path) => {
    console.log(`[${new Date().toLocaleTimeString()}] State change at: ${path}`);
    console.log('New value:', stateManager.getState(path));
  });
  
  // Store unsubscribe function globally for easy access
  window.stopStateMonitoring = unsubscribe;
  
  console.log('State monitoring started. Call stopStateMonitoring() to stop.');
}

// Example 11: Compare current state with initial state
function compareWithInitialState() {
  const currentState = stateManager.getState();
  const initialState = new StateManager().getInitialState();
  
  function deepCompare(obj1, obj2, path = '') {
    const changes = [];
    
    Object.keys(obj1).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      
      if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
        changes.push(...deepCompare(obj1[key], obj2[key], newPath));
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        changes.push({
          path: newPath,
          current: obj1[key],
          initial: obj2[key]
        });
      }
    });
    
    return changes;
  }
  
  const changes = deepCompare(currentState, initialState);
  
  console.group('State Changes from Initial');
  console.table(changes);
  console.groupEnd();
  
  return changes;
}

// Example 12: Create state middleware for logging
function createLoggingMiddleware() {
  const originalSetState = stateManager.setState.bind(stateManager);
  
  stateManager.setState = function(path, value, notify = true) {
    console.log(`[State Change] ${path}:`, value);
    return originalSetState(path, value, notify);
  };
  
  console.log('Logging middleware installed');
}

// ========== UTILITY FUNCTIONS ==========

// Example 13: Calculate percentage of budget used
function getBudgetUtilization() {
  const takeHome = stateManager.getState('calculations.takeHomeSalary');
  const budget = stateManager.getState('calculations.budgetBreakdown');
  
  if (!takeHome || !budget) {
    console.warn('Budget not calculated yet');
    return null;
  }
  
  const utilization = {
    totalIncome: takeHome.monthly,
    totalExpenses: budget.expenses.total,
    remaining: budget.monthlyIncome - budget.expenses.total,
    utilizationPercent: ((budget.expenses.total / takeHome.monthly) * 100).toFixed(2),
    byCategory: {
      rent: ((budget.expenses.rent / takeHome.monthly) * 100).toFixed(2),
      utilities: ((budget.expenses.utilities / takeHome.monthly) * 100).toFixed(2),
      groceries: ((budget.expenses.groceries / takeHome.monthly) * 100).toFixed(2),
      transport: ((budget.expenses.transport / takeHome.monthly) * 100).toFixed(2),
      other: ((budget.expenses.otherExpenses / takeHome.monthly) * 100).toFixed(2)
    }
  };
  
  console.table(utilization.byCategory);
  console.log(`Overall Budget Utilization: ${utilization.utilizationPercent}%`);
  
  return utilization;
}

// Example 14: Validate state consistency
function validateStateConsistency() {
  const state = stateManager.getState();
  const issues = [];
  
  // Check if calculations exist when they should
  if (state.inputs.annualSalary > 0 && !state.calculations.takeHomeSalary) {
    issues.push('Salary entered but not calculated');
  }
  
  // Check for negative values
  Object.entries(state.inputs).forEach(([key, value]) => {
    if (typeof value === 'number' && value < 0) {
      issues.push(`Negative value in inputs.${key}: ${value}`);
    }
  });
  
  // Check metadata consistency
  if (state.metadata.lastCalculated && state.metadata.lastSaved) {
    if (state.metadata.lastCalculated > state.metadata.lastSaved) {
      issues.push('Calculations newer than last save');
    }
  }
  
  if (issues.length === 0) {
    console.log('✅ State is consistent');
  } else {
    console.warn('⚠️ State consistency issues found:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
  }
  
  return issues;
}

// ========== QUICK ACCESS FUNCTIONS ==========

// Make examples available globally for console use
if (typeof window !== 'undefined') {
  window.stateExamples = {
    readState: exampleReadState,
    updateState: exampleUpdateState,
    subscribe: exampleSubscribe,
    validate: validateStateBeforeCalculation,
    summary: getStateSummary,
    export: exportStateToJSON,
    import: importStateFromJSON,
    reset: resetApplication,
    debug: debugStateHistory,
    monitor: startStateMonitoring,
    compare: compareWithInitialState,
    logging: createLoggingMiddleware,
    utilization: getBudgetUtilization,
    consistency: validateStateConsistency
  };
  
  console.log('💡 State examples loaded! Try: stateExamples.summary()');
}
