# Design Document: Interaction Sub-fields

> **Status**: ✅ **IMPLEMENTED**
> **Design Date**: November 20, 2025
> **Implementation**: November 20-21, 2025 (commits `ed02608`, `32f1ae5`, `ae7701d`, `a56393a`)
> **Context**: WBS team feedback requesting structured data for animal/object interactions

---

**📌 Implementation Note**: This feature has been fully implemented and is in production. This document serves as a design reference and historical record of the decision-making process. All specifications below were implemented as designed with zero deviations.

---

## Problem Statement

Currently, when observers record "Interacting with Inanimate Object" or "Interacting with Other Animal" behaviors, they only have a free-text notes field to describe what object or which animal. This leads to:

- **Inconsistent data**: "ball" vs "Ball" vs "plastic ball" vs "rope ball"
- **Difficult analysis**: Cannot aggregate by object/animal type
- **Lost information**: Interaction details buried in notes field

---

## Solution: Conditional Sub-fields

Add structured dropdown menus that appear **only when specific behaviors are selected**:

### Behavior: "Interacting with Inanimate Object"

→ Shows: **Object** dropdown (required)

### Behavior: "Interacting with Other Animal"

→ Shows: **Animal** dropdown (required) + **Interaction Type** dropdown (required)

---

## Data Structure

### Option Chosen: **Flat Structure**

```javascript
observations: {
  "15:00": {
    behavior: "interacting_object",
    location: "5",
    notes: "",

    // New fields for object interaction
    object: "rope ball",           // Required when behavior === "interacting_object"
    objectOther: ""                // Required when object === "other"
  },
  "15:05": {
    behavior: "interacting_animal",
    location: "",
    notes: "",

    // New fields for animal interaction
    animal: "adult aviary occupant",      // Required when behavior === "interacting_animal"
    animalOther: "",                      // Required when animal === "other"
    interactionType: "watching",          // Required when behavior === "interacting_animal"
    interactionTypeOther: ""              // Required when interactionType === "other"
  }
}
```

**Why flat instead of nested?**

- Simpler Excel export (each field becomes a column)
- Easier validation (flat error keys)
- Consistent with existing `location` field pattern
- Simpler to work with in React state

---

## Dropdown Options

### Inanimate Objects

Based on WBS team feedback (from RogueRedTail/Kira):

```javascript
export const INANIMATE_OBJECTS = [
  { value: '', label: 'Select object...' },
  { value: 'newspaper', label: 'Newspaper' },
  { value: 'rope_ball', label: 'Rope Ball' },
  { value: 'plastic_ball', label: 'Plastic Ball' },
  { value: 'rubber_duck', label: 'Rubber Duck' },
  { value: 'wooden_blocks', label: 'Wooden Blocks' },
  { value: 'camera', label: 'Camera' },
  { value: 'plant', label: 'Plant' },
  { value: 'stump', label: 'Stump' },
  { value: 'perch', label: 'Perch' },
  { value: 'other', label: 'Other (specify below)' },
];
```

### Animal Types

```javascript
export const ANIMAL_TYPES = [
  { value: '', label: 'Select animal...' },
  { value: 'adult_aviary_occupant', label: 'Adult Aviary Occupant' },
  { value: 'juvenile_aviary_occupant', label: 'Juvenile Aviary Occupant' },
  { value: 'insect_within_aviary', label: 'Insect within Aviary' },
  {
    value: 'potential_prey_animal',
    label: 'Potential Prey Animal within Aviary',
  },
  {
    value: 'potential_prey_outside',
    label: 'Potential Prey Item Outside Aviary',
  },
  { value: 'same_species_outside', label: 'Same Species Outside Aviary' },
  {
    value: 'potential_predator_outside',
    label: 'Potential Predator Outside Aviary',
  },
  { value: 'other', label: 'Other (specify below)' },
];
```

### Interaction Types

```javascript
export const INTERACTION_TYPES = [
  { value: '', label: 'Select interaction...' },
  { value: 'watching', label: 'Watching' },
  { value: 'preening_grooming', label: 'Preening/Grooming' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'playing', label: 'Playing' },
  { value: 'non_aggressive_biting', label: 'Non-Aggressive Biting' },
  {
    value: 'non_aggressive_foot_grabbing',
    label: 'Non-Aggressive Foot Grabbing',
  },
  { value: 'other', label: 'Other (specify below)' },
];
```

---

## Validation Rules

### Extended BEHAVIORS configuration:

```javascript
{
  value: 'interacting_object',
  label: 'Interacting with Inanimate Object',
  requiresLocation: false,
  requiresObject: true        // NEW: triggers object validation
}
{
  value: 'interacting_animal',
  label: 'Interacting with Other Animal',
  requiresLocation: false,
  requiresAnimal: true,       // NEW: triggers animal validation
  requiresInteraction: true   // NEW: triggers interaction type validation
}
```

### Validation Logic:

1. **When `behavior === "interacting_object"`:**
   - `object` field is **required** (cannot be empty)
   - If `object === "other"`, then `objectOther` is **required**

2. **When `behavior === "interacting_animal"`:**
   - `animal` field is **required** (cannot be empty)
   - `interactionType` field is **required** (cannot be empty)
   - If `animal === "other"`, then `animalOther` is **required**
   - If `interactionType === "other"`, then `interactionTypeOther` is **required**

3. **Error keys follow existing pattern:**
   - `${time}_object` - "Object is required"
   - `${time}_objectOther` - "Please specify the object"
   - `${time}_animal` - "Animal is required"
   - `${time}_animalOther` - "Please specify the animal"
   - `${time}_interactionType` - "Interaction type is required"
   - `${time}_interactionTypeOther` - "Please specify the interaction"

---

## UI/UX Behavior

### Conditional Rendering

Sub-fields only appear when relevant behavior is selected:

```
┌─────────────────────────────────────────┐
│ Behavior *                              │
│ [Perching ▼]                           │
│                                         │
│ Location *                              │
│ [Perch 5 ▼]                            │
│                                         │
│ Notes (optional)                        │
│ [________________________________]      │
└─────────────────────────────────────────┘

User changes behavior to "Interacting with Other Animal"
↓

┌─────────────────────────────────────────┐
│ Behavior *                              │
│ [Interacting with Other Animal ▼]      │
│                                         │
│ Animal *                                │
│ [adult aviary occupant ▼]              │
│                                         │
│ Interaction Type *                      │
│ [watching ▼]                           │
│                                         │
│ Notes (optional)                        │
│ [________________________________]      │
└─────────────────────────────────────────┘
```

### "Other" Text Input Pattern

When user selects "other" from dropdown, show text input below:

```
┌─────────────────────────────────────────┐
│ Animal *                                │
│ [other ▼]                              │
│                                         │
│ Specify animal: *                       │
│ [wild cardinal visiting_________]      │
└─────────────────────────────────────────┘
```

---

## Edge Cases & Data Integrity

### 1. Behavior Change

**Scenario**: User fills object fields, then changes behavior to "Flying"

**Solution**: Clear all conditional fields when behavior changes:

```javascript
// When behavior changes
if (field === 'behavior') {
  newObservations[time] = {
    ...prev[time],
    behavior: value,
    // Clear all conditional fields
    object: '',
    objectOther: '',
    animal: '',
    animalOther: '',
    interactionType: '',
    interactionTypeOther: '',
  };
}
```

### 2. Dropdown Change (from "other" to specific)

**Scenario**: User selects "other" and types text, then switches to specific option

**Solution**: Clear "other" text when dropdown changes away from "other":

```javascript
if (field === 'object' && value !== 'other') {
  newObservations[time].objectOther = '';
}
```

### 3. localStorage Persistence

**Impact**: ✅ No changes needed - autosave serializes entire `observations` object

### 4. Timezone Conversion

**Impact**: ✅ No changes needed - only touches timestamp keys, not observation content

### 5. Excel Export

**Implementation**: Added new fields to cell content formatting (see `excelGenerator.js:75-104`):

- `object` (blank for non-object behaviors)
- `objectOther` (blank unless object === "other")
- `animal` (blank for non-animal behaviors)
- `animalOther` (blank unless animal === "other")
- `interactionType` (blank for non-animal behaviors)
- `interactionTypeOther` (blank unless interactionType === "other")

All interaction data is included in the formatted cell content with proper "other" value resolution.

---

## Implementation Phases

**Status**: ✅ All phases completed November 20-21, 2025 | **Actual time**: ~2 hours (matched estimate)

### Phase 1: Data Structure ✅ (~30 min)

- ✅ Created `constants/interactions.js` with INANIMATE_OBJECTS, ANIMAL_TYPES, INTERACTION_TYPES
- ✅ Added `requiresObject`, `requiresAnimal`, `requiresInteraction` flags to BEHAVIORS
- ✅ Updated default observation initialization in `formStateManager.js`
- **Commit**: `ed02608` - feat: add structured dropdowns for object/animal interactions

### Phase 2: UI Components ✅ (~45 min)

- ✅ Created `ObjectSelect.jsx` component with "other" text input
- ✅ Created `AnimalSelect.jsx` component with "other" text input
- ✅ Created `InteractionTypeSelect.jsx` component with "other" text input
- ✅ Updated `TimeSlotObservation.jsx` with conditional rendering using helper functions
- ✅ Implemented field clearing logic in `formStateManager.js:75-96`
- **Commits**: `32f1ae5`, `ae7701d` - Component extraction and refactoring

### Phase 3: Validation ✅ (~30 min)

- ✅ Updated `useFormValidation.js` with object/animal/interaction validation rules (lines 68-103)
- ✅ Added error messages for all new fields (object, objectOther, animal, animalOther, interactionType, interactionTypeOther)
- ✅ Tested validation error display for all scenarios
- **Commit**: `a56393a` - refactor: split validation and organize constants into modular structure

### Phase 4: Testing & Polish ✅ (~30 min)

- ✅ Manual testing of all behavior transitions and field clearing
- ✅ Verified localStorage persistence (autosave handles all new fields automatically)
- ✅ Verified JSON output structure includes all interaction fields
- ✅ Added comprehensive test coverage (353 tests passing)
- **Tests**: `TimeSlotObservation.test.jsx`, `FormComponents.test.jsx`, integration tests

---

## Future Considerations

### Potential Additional Sub-fields

If this pattern works well, consider adding for:

1. **"Aggression or Defensive Posturing"**
   - Towards: [adult aviary occupant, juvenile, visitor, keeper, other]

2. **"Other" behavior**
   - Specify behavior: [free text]

### Pattern Reusability

This conditional sub-field pattern can be reused for future behaviors that need structured data:

```javascript
{
  value: 'new_behavior',
  label: 'New Behavior',
  requiresLocation: false,
  requiresCustomField: true  // Add new flag
}
```

---

## Design Decisions Rationale

| Decision                        | Rationale                                                                 |
| ------------------------------- | ------------------------------------------------------------------------- |
| Flat data structure             | Simpler Excel export, easier validation, consistent with `location` field |
| Required sub-fields             | Ensures data completeness when behavior is selected                       |
| "Other" dropdown option         | Balances standardization with flexibility for edge cases                  |
| Clear fields on behavior change | Prevents orphaned data from previous behavior selection                   |
| Conditional rendering           | Reduces visual clutter, shows only relevant fields                        |
| Follow existing patterns        | Reuse React-Select styling, error display, validation keys                |

---

## Success Metrics

**Achievement Status**: ✅ All success criteria met

1. ✅ **Consistent object/animal naming** - Dropdowns enforce standardized values across all observations
2. ✅ **Aggregation capability** - Structured data enables filtering/grouping by object, animal, and interaction type
3. ✅ **No performance regression** - Form remains responsive; dropdowns provide faster input than freeform text
4. ✅ **Clear validation feedback** - All sub-fields show inline error messages with specific guidance
5. ✅ **Seamless autosave** - All interaction fields persist automatically to localStorage without code changes

---

## References

- **Original feedback**: Discord discussion with jjbagels, Starnerf, devin, RogueRedTail(Kira)
- **Related improvements**: See `notes/improvements.md` (Quick Win #6: Bulk Operations)
- **Existing patterns**: `location` field with `requiresLocation` flag in BEHAVIORS
