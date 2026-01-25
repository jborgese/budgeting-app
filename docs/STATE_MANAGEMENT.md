# State Management Implementation

## Overview

This document describes the centralized state management system implemented for the budgeting web application. The state management system provides a single source of truth for application data, reactive UI updates, and proper separation of concerns.

## Architecture

### State Manager (`stateManager.js`)

The state management system is built using the **Observer Pattern** with a centralized state store.

#### Key Features

1. **Centralized State Store**: All application data is stored in a single state object
2. **Observer Pattern**: Components can subscribe to state changes and react automatically
3. **Batch Updates**: Multiple state changes can be batched to trigger single notifications
4. **State History**: Tracks recent state changes for debugging and undo functionality
5. **Automatic Persistence**: State changes are automatically saved to localStorage
6. **Path-based Access**: State can be accessed and modified using dot notation paths

### State Structure

```javascript
{
  inputs: {
    annualSalary: 0,
    preTaxDeductions: 0,
    stateResidence: 'AL',
    taxYear: 2026,
    filingStatus: 'single',
    rent: 0,
    utilities: 0,
    groceries: 0,
    transport: 0,
    otherExpenses: 0,
    additionalExpenses: []
  },
  
  calculations: {
    taxBreakdown: null,
    takeHomeSalary: null,
    budgetBreakdown: null,
    remainingIncome: null
  },
  
  ui: {
    isCalculating: false,
    lastError: null,
    lastSuccess: null,
    showExportButton: false
  },
  
  metadata: {
    lastSaved: null,
    lastCalculated: null,
    version: '1.0.0'
  }
}
```

## API Reference

### StateManager Class

#### Methods

##### `getState(path)`
Get the current state or a specific path within the state.

**Parameters:**
- `path` (string, optional): Dot notation path (e.g., 'inputs.annualSalary')

**Returns:** State value or entire state if no path provided

**Example:**
```javascript
const salary = stateManager.getState('inputs.annualSalary');
const allInputs = stateManager.getState('inputs');
const fullState = stateManager.getState();
```

##### `setState(path, value, notify)`
Update a specific state value.

**Parameters:**
- `path` (string): Dot notation path to update
- `value` (any): New value to set
- `notify` (boolean, default: true): Whether to notify observers

**Example:**
```javascript
stateManager.setState('inputs.annualSalary', 75000);
stateManager.setState('ui.isCalculating', true, false); // Don't notify
```

##### `batchUpdate(updates)`
Update multiple state values in a single operation.

**Parameters:**
- `updates` (object): Object with path-value pairs

**Example:**
```javascript
stateManager.batchUpdate({
  'inputs.rent': 1500,
  'inputs.utilities': 200,
  'ui.showExportButton': true
});
```

##### `subscribe(path, callback)`
Subscribe to state changes at a specific path.

**Parameters:**
- `path` (string): Path to observe ('*' for all changes)
- `callback` (function): Function called when state changes

**Returns:** Unsubscribe function

**Example:**
```javascript
const unsubscribe = stateManager.subscribe('inputs.annualSalary', (newValue, oldValue) => {
  console.log(`Salary changed from ${oldValue} to ${newValue}`);
});

// Later: unsubscribe();
```

##### `loadFromStorage()`
Load state from localStorage.

**Returns:** Boolean indicating success

##### `saveToStorage()`
Save current state to localStorage.

**Returns:** Boolean indicating success

##### `reset()`
Reset state to initial values and clear all observers.

##### `clearCalculations()`
Clear all calculated values (useful when inputs change).

##### `getSnapshot()`
Get complete state snapshot for debugging.

**Returns:** Object with state, history, and observer information

## Integration with app.js

### State Binding Functions

#### `syncInputToState(inputId, statePath)`
Connects a DOM input element to the state, automatically updating state when input changes.

**Example:**
```javascript
syncInputToState('annualSalary', 'inputs.annualSalary');
```

#### `syncStateToInput(inputId, statePath)`
Subscribes to state changes and updates the DOM input automatically.

**Example:**
```javascript
syncStateToInput('annualSalary', 'inputs.annualSalary');
```

#### `initializeStateBindings()`
Initializes all state-DOM bindings for the application. Called on page load.

## Usage Examples

### Reading State in Calculations

Before:
```javascript
const salary = parseFormattedNumber(document.getElementById('annualSalary').value);
```

After:
```javascript
const inputs = stateManager.getState('inputs');
const salary = inputs.annualSalary;
```

### Storing Calculation Results

```javascript
stateManager.batchUpdate({
  'calculations.takeHomeSalary': {
    annual: takeHomeSalary,
    monthly: takeHomeSalary / 12,
    biWeekly: takeHomeSalary / 26
  },
  'metadata.lastCalculated': Date.now()
});
```

### Reacting to State Changes

```javascript
stateManager.subscribe('ui.showExportButton', (show) => {
  const button = document.getElementById('exportPDFButton');
  button.style.display = show ? 'block' : 'none';
});
```

### Debugging State

```javascript
// In browser console:
console.log(stateManager.getSnapshot());
```

## Benefits

1. **Single Source of Truth**: All data lives in one place
2. **Predictable State Updates**: State changes are explicit and traceable
3. **Automatic UI Sync**: UI updates automatically when state changes
4. **Better Testability**: State logic is separate from DOM manipulation
5. **Debugging**: State history and snapshots make debugging easier
6. **Persistence**: Automatic localStorage integration
7. **Maintainability**: Clear separation of concerns

## Migration Notes

### What Changed

1. **Data Access**: Instead of reading directly from DOM, we read from state
2. **Data Storage**: Calculation results are stored in state
3. **UI Updates**: UI can react to state changes automatically
4. **Persistence**: Automatic saving with debouncing

### Backward Compatibility

The implementation maintains backward compatibility:
- Existing functions still work
- DOM is still the primary UI interface
- localStorage format is compatible with old data

## Best Practices

1. **Always use state for data**: Read from and write to state, not DOM
2. **Batch related updates**: Use `batchUpdate()` for multiple changes
3. **Subscribe judiciously**: Only subscribe to paths you need
4. **Clean up subscriptions**: Call unsubscribe when no longer needed
5. **Use descriptive paths**: Make state paths clear and consistent

## Future Enhancements

Potential improvements:
1. State validation middleware
2. Time-travel debugging (undo/redo)
3. State persistence to backend API
4. State change logging for analytics
5. Computed properties (derived state)
6. State snapshots for version comparison

## Troubleshooting

### State not updating
- Check if `notify` parameter is set to `false`
- Verify the path is correct
- Check browser console for errors

### UI not reflecting state
- Ensure subscriptions are set up in `DOMContentLoaded`
- Verify observer callback is not throwing errors
- Check if state binding was initialized

### localStorage issues
- Check browser storage quota
- Verify `isLocalStorageAvailable()` returns true
- Check browser privacy settings

## Testing

Test state management in browser console:

```javascript
// Get current state
stateManager.getState();

// Update a value
stateManager.setState('inputs.annualSalary', 100000);

// Subscribe to changes
const unsub = stateManager.subscribe('*', (state) => console.log('State changed:', state));

// View history
stateManager.getSnapshot().history;

// Clean up
unsub();
```
