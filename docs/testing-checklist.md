# Testing Checklist for Ethogram Form

## Pre-Testing Setup

- [ ] Test on desktop (Chrome/Firefox/Safari)
- [ ] Test on mobile (iOS Safari and/or Android Chrome)
- [ ] Enable responsive design mode in devtools for desktop mobile testing
- [ ] Clear localStorage before testing to start fresh

---

## 1. Basic Input Validation

### Metadata Section

- [ ] Observer name: Leave blank → submit → error shows
- [ ] Observer name: Fill in → error clears immediately
- [ ] Date: Leave blank → submit → error shows
- [ ] Date: Select date → error clears immediately
- [ ] Press Enter in observer name field → validates field, doesn't submit form

### Time Range Validation

- [ ] Both times blank → submit → errors show
- [ ] Start time only → submit → error shows
- [ ] End time only → submit → error shows
- [ ] Start time = 10:00, End time = 9:00 (invalid) → both fields show error immediately
- [ ] Fix end time to 10:30 → errors clear immediately on both fields
- [ ] Start time = 10:00, End time = 11:30 (>60 min) → error shows
- [ ] Start time = 10:00, End time = 10:30 (valid) → no errors
- [ ] Time inputs round to nearest 5 minutes automatically

---

## 2. Observation Slots - Basic Behavior

### Behavior Selection

- [ ] Leave behavior as "Select a behavior..." → submit → error shows
- [ ] Select any behavior → error clears immediately
- [ ] Change behavior → previous conditional fields clear (location, object, etc.)

### Location Field (Conditional)

- [ ] Select "Eating - Elsewhere" → location field appears
- [ ] Leave location blank → error shows immediately
- [ ] Type invalid location "99" → error shows
- [ ] Type valid location "5" → error clears immediately
- [ ] Use React Select dropdown → select "Perch 5" → error clears
- [ ] Clear selection (X button) → error shows immediately
- [ ] Change to "Sleeping" behavior → location field disappears, no stale errors

### Mobile-Specific Location Testing

- [ ] Select behavior requiring location on mobile
- [ ] Tap location dropdown
- [ ] Select "Ground"
- [ ] Verify NO validation error appears (mobile timing bug should be fixed)
- [ ] Tap location again and change selection
- [ ] Verify validation works correctly

---

## 3. Conditional Field Visibility

### Object Interaction

- [ ] Select "Interaction with object" → object select appears
- [ ] Leave object blank → submit → error shows
- [ ] Select object → error clears immediately
- [ ] Select object = "other" → objectOther text field appears
- [ ] Leave objectOther blank → error shows after ~200ms (debounced)
- [ ] Type in objectOther → error clears after ~200ms
- [ ] Change object back to non-"other" → objectOther field disappears, no stale errors

### Animal Interaction

- [ ] Select behavior requiring animal interaction → animal select appears
- [ ] Leave animal blank → submit → error shows
- [ ] Select animal → error clears immediately
- [ ] Select animal = "other" → animalOther text field appears
- [ ] Leave animalOther blank → error shows after ~200ms (debounced)
- [ ] Type in animalOther → error clears after ~200ms
- [ ] Change animal back to non-"other" → animalOther field disappears, no stale errors

### Interaction Type

- [ ] When animal interaction selected → interactionType select appears
- [ ] Leave interactionType blank → submit → error shows
- [ ] Select interactionType → error clears immediately
- [ ] Select interactionType = "other" → interactionTypeOther text field appears
- [ ] Leave interactionTypeOther blank → error shows after ~200ms (debounced)
- [ ] Type in interactionTypeOther → error clears after ~200ms
- [ ] Change interactionType back to non-"other" → interactionTypeOther field disappears, no stale errors

### Description Field

- [ ] Select "Aggression or Defensive Posturing" → description field appears
- [ ] Leave description blank → error shows after ~200ms (debounced)
- [ ] Type in description → error clears after ~200ms
- [ ] Type rapidly → no flickering validation errors
- [ ] Change to behavior not requiring description → description field disappears, no stale errors

---

## 4. Text Field Debouncing

Test with any debounced text field (objectOther, animalOther, interactionTypeOther, description):

- [ ] Type one character → wait → validation appears after ~200ms
- [ ] Type rapidly without pausing → no validation errors appear while typing
- [ ] Stop typing → wait 200ms → validation appears
- [ ] Continue typing → validation updates after 200ms of no typing
- [ ] No flickering or jumping validation messages

---

## 5. Enter Key Behavior

Test with any text input (observerName, objectOther, animalOther, interactionTypeOther, description, notes):

- [ ] Type invalid value and press Enter → validation error shows for that field only
- [ ] Type valid value and press Enter → no error shows for that field
- [ ] Press Enter does NOT submit the form
- [ ] Form only submits via "Validate & Preview" button

---

## 6. Copy to Next Slot

- [ ] Fill out first time slot completely (all required fields valid)
- [ ] Click "Copy to next" button
- [ ] Verify all fields copy to next slot exactly
- [ ] Verify no unexpected validation errors on copied slot
- [ ] Modify copied slot → verify changes are independent
- [ ] Copy from middle slot → verify copies to next slot correctly
- [ ] On last slot → "Copy to next" button should not appear

---

## 7. Perch Diagram Modal

### Opening/Closing

- [ ] Click "Map" button → modal opens
- [ ] Modal shows NE Half tab by default
- [ ] Click SW Half tab → image switches
- [ ] Click NE Half tab → switches back
- [ ] Click X button → modal closes
- [ ] Click backdrop (outside modal) → modal closes
- [ ] Press Escape key → modal closes

### Tab Switching

- [ ] Switch between NE/SW tabs → no form validation errors appear
- [ ] Switch tabs multiple times → modal works smoothly, no errors

### Mobile Perch Modal

- [ ] Open modal on mobile device
- [ ] Modal is responsive and readable
- [ ] Tabs work correctly on touch
- [ ] Closing modal works via touch
- [ ] No form submission or validation issues when interacting with modal

---

## 8. Form Reset

- [ ] Fill out form with multiple time slots
- [ ] Add some valid data, some invalid data
- [ ] Click "Reset Form" button
- [ ] Verify all fields clear to defaults
- [ ] Verify all validation errors clear
- [ ] Verify time slots reset to original range
- [ ] Verify no stale data persists in any field

---

## 9. Form Submission

### Validation on Submit

- [ ] Leave entire form blank → click submit → all required field errors appear
- [ ] Fill some fields, leave others blank → submit → only blank required fields show errors
- [ ] Fix errors one by one → verify errors clear as fields become valid
- [ ] All fields valid → submit → no errors, output preview appears

### Output Preview

- [ ] Submit valid form → JSON output appears
- [ ] Verify all metadata fields present in output
- [ ] Verify all observation slots present in output
- [ ] Verify time conversions correct (if applicable)
- [ ] Output is properly formatted and readable

---

## 10. Edge Cases & Stress Testing

### Multiple Time Slots

- [ ] Create form with max time range (60 minutes = 12 slots)
- [ ] Fill out all slots with different behaviors
- [ ] Verify validation works independently for each slot
- [ ] Verify copy to next works across multiple slots
- [ ] Verify form submission includes all slots

### Browser Back/Forward

- [ ] Fill out form
- [ ] Navigate away (if possible in SPA context)
- [ ] Use browser back button
- [ ] Verify localStorage restores form data
- [ ] Verify no validation errors appear on restore

### Rapid Interaction

- [ ] Rapidly switch between behaviors
- [ ] Rapidly type and delete in text fields
- [ ] Rapidly open/close perch modal
- [ ] Verify no crashes or UI glitches
- [ ] Verify validation eventually catches up correctly

### Mobile-Specific Edge Cases

- [ ] Rotate device while form is open
- [ ] Open modal while keyboard is visible
- [ ] Switch apps and return
- [ ] Fill form while zoomed in/out
- [ ] Verify scrolling works properly with keyboard open

---

## 11. Accessibility (Quick Check)

- [ ] Tab through form with keyboard only
- [ ] Verify focus indicators visible
- [ ] Verify Enter key in select dropdowns works
- [ ] Verify Escape closes modal
- [ ] Verify error messages are announced (if using screen reader)

---

## 12. Performance

- [ ] Form loads quickly (< 1 second)
- [ ] No lag when typing in fields
- [ ] Validation doesn't cause noticeable delays
- [ ] Modal opens/closes smoothly
- [ ] No memory leaks (check DevTools if available)

---

## Known Issues

_(Document any known issues or limitations here)_

- None currently documented

---

## Notes for Testers

- **Debounced validation**: Text fields (objectOther, animalOther, interactionTypeOther, description) have a 200ms delay before validation appears. This is intentional to avoid flickering while typing.
- **onChange validation**: Most fields now validate immediately on change, not on blur. This is intentional to fix mobile timing issues and provide better UX.
- **Enter key**: Pressing Enter in text inputs validates that field but does NOT submit the form. This is intentional to prevent accidental submissions on mobile.

---

## Test Sign-off

| Tester | Date | Device/Browser | Pass/Fail | Notes |
| ------ | ---- | -------------- | --------- | ----- |
|        |      |                |           |       |
|        |      |                |           |       |
|        |      |                |           |       |
