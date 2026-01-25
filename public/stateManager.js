/**
 * State Manager - Centralized state management for the budgeting app
 * Implements the Observer pattern for reactive UI updates
 */

class StateManager {
  constructor() {
    this.state = this.getInitialState();
    this.observers = new Map();
    this.history = [];
    this.maxHistorySize = 10;
  }

  /**
   * Get the initial state structure
   */
  getInitialState() {
    return {
      // Input data
      inputs: {
        annualSalary: 0,
        preTaxDeductions: 0,
        stateResidence: 'AL',
        taxYear: new Date().getFullYear(),
        filingStatus: 'single',
        rent: 0,
        utilities: 0,
        groceries: 0,
        transport: 0,
        otherExpenses: 0,
        additionalExpenses: []
      },
      
      // Calculated data
      calculations: {
        taxBreakdown: null,
        takeHomeSalary: null,
        budgetBreakdown: null,
        remainingIncome: null
      },
      
      // UI state
      ui: {
        isCalculating: false,
        lastError: null,
        lastSuccess: null,
        showExportButton: false
      },
      
      // Metadata
      metadata: {
        lastSaved: null,
        lastCalculated: null,
        version: '1.0.0'
      }
    };
  }

  /**
   * Get the current state or a specific path
   * @param {string} path - Dot notation path (e.g., 'inputs.annualSalary')
   */
  getState(path = null) {
    if (!path) {
      return JSON.parse(JSON.stringify(this.state));
    }
    
    const keys = path.split('.');
    let value = this.state;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return JSON.parse(JSON.stringify(value));
  }

  /**
   * Update state with new data
   * @param {string} path - Dot notation path
   * @param {*} value - New value
   * @param {boolean} notify - Whether to notify observers
   */
  setState(path, value, notify = true) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    // Navigate to the parent object
    let target = this.state;
    for (const key of keys) {
      if (!(key in target)) {
        target[key] = {};
      }
      target = target[key];
    }
    
    // Store old value for history
    const oldValue = target[lastKey];
    
    // Set new value
    target[lastKey] = value;
    
    // Add to history
    this.addToHistory(path, oldValue, value);
    
    // Notify observers
    if (notify) {
      this.notifyObservers(path, value, oldValue);
    }
  }

  /**
   * Batch update multiple state values
   * @param {Object} updates - Object with path-value pairs
   */
  batchUpdate(updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.setState(path, value, false);
    });
    
    // Notify all observers once after batch update
    this.notifyObservers('*');
  }

  /**
   * Subscribe to state changes
   * @param {string} path - Path to observe ('*' for all changes)
   * @param {Function} callback - Function to call on state change
   * @returns {Function} Unsubscribe function
   */
  subscribe(path, callback) {
    if (!this.observers.has(path)) {
      this.observers.set(path, []);
    }
    
    this.observers.get(path).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.observers.get(path);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify observers of state changes
   * @param {string} path - Path that changed
   * @param {*} newValue - New value
   * @param {*} oldValue - Previous value
   */
  notifyObservers(path, newValue = null, oldValue = null) {
    // Notify specific path observers
    if (this.observers.has(path)) {
      this.observers.get(path).forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (error) {
          console.error(`Error in observer for ${path}:`, error);
        }
      });
    }
    
    // Notify wildcard observers
    if (path !== '*' && this.observers.has('*')) {
      this.observers.get('*').forEach(callback => {
        try {
          callback(this.getState(), null, path);
        } catch (error) {
          console.error('Error in wildcard observer:', error);
        }
      });
    }
  }

  /**
   * Add state change to history
   */
  addToHistory(path, oldValue, newValue) {
    this.history.push({
      path,
      oldValue,
      newValue,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Load state from localStorage
   */
  loadFromStorage() {
    try {
      if (!isLocalStorageAvailable()) {
        console.warn('localStorage not available');
        return false;
      }
      
      const storedData = localStorage.getItem('financialData');
      if (!storedData) {
        return false;
      }
      
      const data = JSON.parse(storedData);
      
      // Map old format to new state structure
      if (data) {
        this.batchUpdate({
          'inputs.annualSalary': data.annualSalary || 0,
          'inputs.preTaxDeductions': data.preTaxDeductions || 0,
          'inputs.stateResidence': data.stateResidence || 'AL',
          'inputs.taxYear': data.taxYear || new Date().getFullYear(),
          'inputs.filingStatus': data.filingStatus || 'single',
          'inputs.rent': data.rent || 0,
          'inputs.utilities': data.utilities || 0,
          'inputs.groceries': data.groceries || 0,
          'inputs.transport': data.transport || 0,
          'inputs.otherExpenses': data.otherExpenses || 0,
          'inputs.additionalExpenses': data.additionalExpenses || []
        });
        
        this.setState('metadata.lastSaved', data.lastSaved || Date.now());
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading state from storage:', error);
      return false;
    }
  }

  /**
   * Save state to localStorage
   */
  saveToStorage() {
    try {
      if (!isLocalStorageAvailable()) {
        console.warn('localStorage not available');
        return false;
      }
      
      const inputs = this.getState('inputs');
      const data = {
        ...inputs,
        lastSaved: Date.now()
      };
      
      localStorage.setItem('financialData', JSON.stringify(data));
      this.setState('metadata.lastSaved', Date.now(), false);
      
      return true;
    } catch (error) {
      console.error('Error saving state to storage:', error);
      return false;
    }
  }

  /**
   * Reset state to initial values
   */
  reset() {
    this.state = this.getInitialState();
    this.history = [];
    this.notifyObservers('*');
  }

  /**
   * Clear all calculations
   */
  clearCalculations() {
    this.batchUpdate({
      'calculations.taxBreakdown': null,
      'calculations.takeHomeSalary': null,
      'calculations.budgetBreakdown': null,
      'calculations.remainingIncome': null,
      'ui.showExportButton': false
    });
  }

  /**
   * Get state snapshot for debugging
   */
  getSnapshot() {
    return {
      state: this.getState(),
      history: [...this.history],
      observers: Array.from(this.observers.keys())
    };
  }
}

// Create global state manager instance
const stateManager = new StateManager();

// Auto-save on input changes (with debouncing)
let saveTimeout = null;
stateManager.subscribe('inputs', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    stateManager.saveToStorage();
  }, 1000); // Save 1 second after last input change
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StateManager, stateManager };
}
