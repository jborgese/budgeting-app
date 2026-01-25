/**
 * Unit Tests for StateManager
 * Tests the centralized state management system
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;
global.isLocalStorageAvailable = () => true;

// Import StateManager
const { StateManager } = require('../public/stateManager.js');

describe('StateManager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
    localStorageMock.clear();
  });

  describe('Initialization', () => {
    test('should initialize with default state structure', () => {
      const state = stateManager.getState();
      expect(state).toHaveProperty('inputs');
      expect(state).toHaveProperty('calculations');
      expect(state).toHaveProperty('ui');
      expect(state).toHaveProperty('metadata');
    });

    test('should initialize with correct default values', () => {
      const state = stateManager.getState();
      expect(state.inputs.annualSalary).toBe(0);
      expect(state.inputs.stateResidence).toBe('AL');
      expect(state.inputs.filingStatus).toBe('single');
      expect(state.ui.isCalculating).toBe(false);
    });

    test('should initialize empty history', () => {
      expect(stateManager.history).toEqual([]);
    });

    test('should initialize observers map', () => {
      expect(stateManager.observers).toBeInstanceOf(Map);
      expect(stateManager.observers.size).toBe(0);
    });
  });

  describe('getState', () => {
    test('should return entire state when no path provided', () => {
      const state = stateManager.getState();
      expect(state).toHaveProperty('inputs');
      expect(state).toHaveProperty('calculations');
    });

    test('should return deep copy of state (not reference)', () => {
      const state1 = stateManager.getState();
      const state2 = stateManager.getState();
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    test('should get value at specific path', () => {
      stateManager.setState('inputs.annualSalary', 75000, false);
      const salary = stateManager.getState('inputs.annualSalary');
      expect(salary).toBe(75000);
    });

    test('should get nested object at path', () => {
      const inputs = stateManager.getState('inputs');
      expect(inputs).toHaveProperty('annualSalary');
      expect(inputs).toHaveProperty('stateResidence');
    });

    test('should return undefined for invalid path', () => {
      const result = stateManager.getState('invalid.path.here');
      expect(result).toBeUndefined();
    });

    test('should return undefined for partially valid path', () => {
      const result = stateManager.getState('inputs.nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('setState', () => {
    test('should update state value at path', () => {
      stateManager.setState('inputs.annualSalary', 100000, false);
      expect(stateManager.getState('inputs.annualSalary')).toBe(100000);
    });

    test('should create nested path if it does not exist', () => {
      stateManager.setState('new.nested.value', 'test', false);
      expect(stateManager.getState('new.nested.value')).toBe('test');
    });

    test('should update deep nested values', () => {
      stateManager.setState('inputs.rent', 1500, false);
      stateManager.setState('inputs.utilities', 200, false);
      expect(stateManager.getState('inputs.rent')).toBe(1500);
      expect(stateManager.getState('inputs.utilities')).toBe(200);
    });

    test('should handle string values', () => {
      stateManager.setState('inputs.stateResidence', 'CA', false);
      expect(stateManager.getState('inputs.stateResidence')).toBe('CA');
    });

    test('should handle null values', () => {
      stateManager.setState('calculations.taxBreakdown', null, false);
      expect(stateManager.getState('calculations.taxBreakdown')).toBeNull();
    });

    test('should handle object values', () => {
      const breakdown = { federal: 15000, state: 5000 };
      stateManager.setState('calculations.taxBreakdown', breakdown, false);
      expect(stateManager.getState('calculations.taxBreakdown')).toEqual(breakdown);
    });

    test('should handle array values', () => {
      const expenses = [{ name: 'Netflix', amount: 15 }];
      stateManager.setState('inputs.additionalExpenses', expenses, false);
      expect(stateManager.getState('inputs.additionalExpenses')).toEqual(expenses);
    });
  });

  describe('State History', () => {
    test('should add to history when state changes', () => {
      stateManager.setState('inputs.annualSalary', 50000, false);
      stateManager.setState('inputs.annualSalary', 60000, false);
      expect(stateManager.history.length).toBeGreaterThan(0);
    });

    test('should limit history size', () => {
      for (let i = 0; i < 15; i++) {
        stateManager.setState('inputs.annualSalary', i * 1000, false);
      }
      expect(stateManager.history.length).toBeLessThanOrEqual(stateManager.maxHistorySize);
    });

    test('should store correct history entry format', () => {
      stateManager.setState('inputs.annualSalary', 50000, false);
      const lastEntry = stateManager.history[stateManager.history.length - 1];
      expect(lastEntry).toHaveProperty('path');
      expect(lastEntry).toHaveProperty('oldValue');
      expect(lastEntry).toHaveProperty('newValue');
      expect(lastEntry).toHaveProperty('timestamp');
    });
  });

  describe('batchUpdate', () => {
    test('should update multiple values at once', () => {
      stateManager.batchUpdate({
        'inputs.rent': 1800,
        'inputs.utilities': 250,
        'inputs.groceries': 600
      });
      
      expect(stateManager.getState('inputs.rent')).toBe(1800);
      expect(stateManager.getState('inputs.utilities')).toBe(250);
      expect(stateManager.getState('inputs.groceries')).toBe(600);
    });

    test('should batch update different nested paths', () => {
      stateManager.batchUpdate({
        'inputs.annualSalary': 85000,
        'ui.isCalculating': true,
        'metadata.version': '2.0.0'
      });
      
      expect(stateManager.getState('inputs.annualSalary')).toBe(85000);
      expect(stateManager.getState('ui.isCalculating')).toBe(true);
      expect(stateManager.getState('metadata.version')).toBe('2.0.0');
    });
  });

  describe('subscribe and notify', () => {
    test('should subscribe to state changes', () => {
      const callback = jest.fn();
      stateManager.subscribe('inputs.annualSalary', callback);
      stateManager.setState('inputs.annualSalary', 75000);
      
      expect(callback).toHaveBeenCalled();
    });

    test('should pass new and old values to callback', () => {
      const callback = jest.fn();
      stateManager.setState('inputs.annualSalary', 50000, false);
      stateManager.subscribe('inputs.annualSalary', callback);
      stateManager.setState('inputs.annualSalary', 75000);
      
      // Callback receives: newValue, oldValue, path
      expect(callback).toHaveBeenCalledWith(75000, 50000, 'inputs.annualSalary');
    });

    test('should support multiple subscribers on same path', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      stateManager.subscribe('inputs.annualSalary', callback1);
      stateManager.subscribe('inputs.annualSalary', callback2);
      stateManager.setState('inputs.annualSalary', 75000);
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    test('should subscribe to wildcard for all changes', () => {
      const callback = jest.fn();
      stateManager.subscribe('*', callback);
      
      stateManager.setState('inputs.annualSalary', 75000);
      expect(callback).toHaveBeenCalled();
      
      stateManager.setState('inputs.rent', 1500);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    test('should not notify when notify=false', () => {
      const callback = jest.fn();
      stateManager.subscribe('inputs.annualSalary', callback);
      stateManager.setState('inputs.annualSalary', 75000, false);
      
      expect(callback).not.toHaveBeenCalled();
    });

    test('unsubscribe function should remove listener', () => {
      const callback = jest.fn();
      const unsubscribe = stateManager.subscribe('inputs.annualSalary', callback);
      
      stateManager.setState('inputs.annualSalary', 75000);
      expect(callback).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      stateManager.setState('inputs.annualSalary', 85000);
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe('localStorage integration', () => {
    test('should save state to localStorage', () => {
      stateManager.setState('inputs.annualSalary', 75000, false);
      stateManager.setState('inputs.stateResidence', 'NY', false);
      
      const success = stateManager.saveToStorage();
      expect(success).toBe(true);
      
      const saved = JSON.parse(localStorage.getItem('financialData'));
      expect(saved.annualSalary).toBe(75000);
      expect(saved.stateResidence).toBe('NY');
    });

    test('should load state from localStorage', () => {
      const testData = {
        annualSalary: 90000,
        stateResidence: 'TX',
        taxYear: 2025,
        filingStatus: 'marriedJoint',
        rent: 2000,
        utilities: 300,
        groceries: 800,
        transport: 400,
        otherExpenses: 500
      };
      
      localStorage.setItem('financialData', JSON.stringify(testData));
      
      const newManager = new StateManager();
      const success = newManager.loadFromStorage();
      
      expect(success).toBe(true);
      expect(newManager.getState('inputs.annualSalary')).toBe(90000);
      expect(newManager.getState('inputs.stateResidence')).toBe('TX');
      expect(newManager.getState('inputs.rent')).toBe(2000);
    });

    test('should handle missing localStorage data gracefully', () => {
      localStorage.clear();
      const newManager = new StateManager();
      const success = newManager.loadFromStorage();
      
      expect(success).toBe(false);
      // Should still have default state
      expect(newManager.getState('inputs.annualSalary')).toBe(0);
    });

    test('should handle corrupted localStorage data', () => {
      localStorage.setItem('financialData', 'invalid json {{{');
      const newManager = new StateManager();
      const success = newManager.loadFromStorage();
      
      expect(success).toBe(false);
    });
  });

  describe('reset', () => {
    test('should reset state to initial values', () => {
      stateManager.setState('inputs.annualSalary', 100000, false);
      stateManager.setState('inputs.rent', 2000, false);
      
      stateManager.reset();
      
      expect(stateManager.getState('inputs.annualSalary')).toBe(0);
      expect(stateManager.getState('inputs.rent')).toBe(0);
    });

    test('should clear history on reset', () => {
      stateManager.setState('inputs.annualSalary', 50000, false);
      stateManager.setState('inputs.annualSalary', 60000, false);
      
      stateManager.reset();
      expect(stateManager.history).toEqual([]);
    });

    test('should notify wildcard observers on reset', () => {
      const callback = jest.fn();
      stateManager.subscribe('*', callback);
      stateManager.reset();
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('clearCalculations', () => {
    test('should clear all calculation results', () => {
      stateManager.setState('calculations.taxBreakdown', { federal: 10000 }, false);
      stateManager.setState('calculations.takeHomeSalary', 60000, false);
      stateManager.setState('ui.showExportButton', true, false);
      
      stateManager.clearCalculations();
      
      expect(stateManager.getState('calculations.taxBreakdown')).toBeNull();
      expect(stateManager.getState('calculations.takeHomeSalary')).toBeNull();
      expect(stateManager.getState('ui.showExportButton')).toBe(false);
    });

    test('should not affect input values', () => {
      stateManager.setState('inputs.annualSalary', 75000, false);
      stateManager.setState('calculations.taxBreakdown', { federal: 10000 }, false);
      
      stateManager.clearCalculations();
      
      expect(stateManager.getState('inputs.annualSalary')).toBe(75000);
    });
  });

  describe('getSnapshot', () => {
    test('should return snapshot with state, history, and observers', () => {
      stateManager.setState('inputs.annualSalary', 75000, false);
      stateManager.subscribe('inputs.annualSalary', jest.fn());
      
      const snapshot = stateManager.getSnapshot();
      
      expect(snapshot).toHaveProperty('state');
      expect(snapshot).toHaveProperty('history');
      expect(snapshot).toHaveProperty('observers');
    });

    test('should include all observer paths in snapshot', () => {
      stateManager.subscribe('inputs.annualSalary', jest.fn());
      stateManager.subscribe('inputs.rent', jest.fn());
      stateManager.subscribe('*', jest.fn());
      
      const snapshot = stateManager.getSnapshot();
      
      expect(snapshot.observers).toContain('inputs.annualSalary');
      expect(snapshot.observers).toContain('inputs.rent');
      expect(snapshot.observers).toContain('*');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string path', () => {
      const state = stateManager.getState('');
      expect(state).toBeDefined();
    });

    test('should handle setting to undefined', () => {
      stateManager.setState('inputs.annualSalary', undefined, false);
      // Note: JSON.stringify converts undefined to null, so we check for null
      const value = stateManager.state.inputs.annualSalary;
      expect(value).toBeUndefined();
    });

    test('should handle rapid successive updates', () => {
      for (let i = 0; i < 100; i++) {
        stateManager.setState('inputs.annualSalary', i * 1000, false);
      }
      expect(stateManager.getState('inputs.annualSalary')).toBe(99000);
    });

    test('should handle boolean values', () => {
      stateManager.setState('ui.isCalculating', true, false);
      expect(stateManager.getState('ui.isCalculating')).toBe(true);
      
      stateManager.setState('ui.isCalculating', false, false);
      expect(stateManager.getState('ui.isCalculating')).toBe(false);
    });
  });
});
