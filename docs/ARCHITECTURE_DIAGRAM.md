# State Management Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BUDGETING WEB APP                             │
│                     State Management System                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │  Inputs   │  │  Results  │  │  Charts   │  │  Buttons  │       │
│  │  (Forms)  │  │  (Display)│  │  (Visual) │  │ (Actions) │       │
│  └─────┬─────┘  └─────▲─────┘  └─────▲─────┘  └─────┬─────┘       │
│        │              │              │              │               │
└────────┼──────────────┼──────────────┼──────────────┼───────────────┘
         │              │              │              │
         │ input        │ subscribe    │ subscribe    │ action
         │              │              │              │
         ▼              │              │              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STATE BINDINGS (app.js)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  syncInputToState()  │  syncStateToInput()  │  subscribe()  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│         │                      ▲                        ▲           │
│         │ setState()           │ notify()               │           │
│         ▼                      │                        │           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               STATE MANAGER (stateManager.js)                 │  │
│  │                                                                │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │                    STATE STORE                          │ │  │
│  │  │                                                         │ │  │
│  │  │  inputs: {                                             │ │  │
│  │  │    annualSalary, preTaxDeductions, stateResidence,    │ │  │
│  │  │    taxYear, filingStatus, rent, utilities, ...        │ │  │
│  │  │  }                                                     │ │  │
│  │  │                                                         │ │  │
│  │  │  calculations: {                                       │ │  │
│  │  │    taxBreakdown, takeHomeSalary,                      │ │  │
│  │  │    budgetBreakdown, remainingIncome                   │ │  │
│  │  │  }                                                     │ │  │
│  │  │                                                         │ │  │
│  │  │  ui: {                                                 │ │  │
│  │  │    isCalculating, lastError, showExportButton         │ │  │
│  │  │  }                                                     │ │  │
│  │  │                                                         │ │  │
│  │  │  metadata: {                                           │ │  │
│  │  │    lastSaved, lastCalculated, version                 │ │  │
│  │  │  }                                                     │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                           │                                   │  │
│  │  ┌────────────────────────┼────────────────────────────────┐ │  │
│  │  │        OBSERVER PATTERN │                              │ │  │
│  │  │                         ▼                              │ │  │
│  │  │  ┌──────────────────────────────────────────────┐     │ │  │
│  │  │  │  Observers Map:                              │     │ │  │
│  │  │  │    'inputs.annualSalary' → [callback1, ...]  │     │ │  │
│  │  │  │    'ui.showExportButton' → [callback2, ...]  │     │ │  │
│  │  │  │    '*' (wildcard)       → [callback3, ...]  │     │ │  │
│  │  │  └──────────────────────────────────────────────┘     │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                           │                                   │  │
│  │  ┌────────────────────────┼────────────────────────────────┐ │  │
│  │  │        STATE HISTORY    │                              │ │  │
│  │  │                         ▼                              │ │  │
│  │  │  [                                                     │ │  │
│  │  │    { path, oldValue, newValue, timestamp },           │ │  │
│  │  │    { path, oldValue, newValue, timestamp },           │ │  │
│  │  │    ...last 10 changes...                              │ │  │
│  │  │  ]                                                     │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│         │                      ▲                                    │
└─────────┼──────────────────────┼────────────────────────────────────┘
          │ save                 │ load
          ▼                      │
┌─────────────────────────────────────────────────────────────────────┐
│                       LOCALSTORAGE                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  financialData: {                                            │  │
│  │    annualSalary, preTaxDeductions, stateResidence,          │  │
│  │    taxYear, filingStatus, rent, utilities, groceries,       │  │
│  │    transport, otherExpenses, additionalExpenses, lastSaved  │  │
│  │  }                                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘


DATA FLOW EXAMPLES:
═══════════════════

1. USER INPUTS SALARY:
   User types "85000" → Input field → syncInputToState() 
   → stateManager.setState('inputs.annualSalary', 85000) 
   → State updated → Observers notified 
   → Auto-save triggered (debounced) → localStorage

2. CALCULATE TAKE-HOME:
   User clicks button → calculateTakeHomeSalary()
   → Read: stateManager.getState('inputs')
   → Perform calculations
   → Write: stateManager.batchUpdate({ calculations.* })
   → Update display → Save to localStorage

3. PAGE LOAD:
   DOMContentLoaded → initializeStateBindings()
   → stateManager.loadFromStorage() → Populate inputs
   → Subscribe to state changes → UI ready

4. REACTIVE UI UPDATE:
   State changes → Observers triggered
   → Callbacks execute → UI updates automatically
   → No manual DOM manipulation needed


KEY METHODS:
═══════════

setState(path, value)      → Update single state value
getState(path)            → Read state value
batchUpdate(updates)      → Update multiple values
subscribe(path, callback) → React to changes
saveToStorage()           → Persist to localStorage
loadFromStorage()         → Restore from localStorage
reset()                   → Clear all state
getSnapshot()             → Debug information


BENEFITS:
════════

✓ Single Source of Truth   → All data in one place
✓ Predictable Updates       → Explicit state changes
✓ Reactive UI              → Auto-update on changes
✓ Debugging                → State history & snapshots
✓ Testability              → Logic separate from DOM
✓ Maintainability          → Clear data flow
✓ Extensibility            → Easy to add features
```
