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
- [ ] Use dropdown → select "Perch 5" → error clears
- [ ] Clear selection (X button) → error shows immediately
- [ ] Change to "Not Visible" behavior → location field disappears, no stale errors

### Mobile-Specific Location Testing

- [ ] Select behavior requiring location on mobile
- [ ] Tap location dropdown
- [ ] Select "Ground"
- [ ] Verify NO validation error appears
- [ ] Tap location again and change selection
- [ ] Verify validation works correctly

---

## 3. Conditional Field Visibility

### Object Interaction

- [ ] Select "Interacting with Inanimate Object" → object dropdown appears
- [ ] Leave object blank → submit → error shows
- [ ] Select object → error clears immediately
- [ ] Select object = "other" → text field appears for description
- [ ] Leave text field blank → error shows after brief pause
- [ ] Type in text field → error clears after brief pause
- [ ] Change object back to non-"other" → text field disappears, no stale errors

### Animal Interaction

- [ ] Select "Interacting with Other Animal" → animal dropdown appears
- [ ] Leave animal blank → submit → error shows
- [ ] Select animal → error clears immediately
- [ ] Select animal = "other" → text field appears
- [ ] Leave text field blank → error shows after brief pause
- [ ] Type in text field → error clears after brief pause
- [ ] Change animal back to non-"other" → text field disappears, no stale errors

### Interaction Type

- [ ] When animal interaction selected → interaction type dropdown appears
- [ ] Leave interaction type blank → submit → error shows
- [ ] Select interaction type → error clears immediately
- [ ] Select interaction type = "other" → text field appears
- [ ] Leave text field blank → error shows after brief pause
- [ ] Type in text field → error clears after brief pause
- [ ] Change interaction type back to non-"other" → text field disappears, no stale errors

### Description Field

- [ ] Select "Aggression or Defensive Posturing" → description field appears
- [ ] Leave description blank → error shows after brief pause
- [ ] Type in description → error clears after brief pause
- [ ] Type rapidly → no flickering validation errors
- [ ] Change to behavior not requiring description → field disappears, no stale errors

---

## 4. Enter Key Behavior

Test with any validated text input (observer name, "other" text fields, description):

- [ ] Type invalid value and press Enter → validation error shows for that field only
- [ ] Type valid value and press Enter → no error shows for that field
- [ ] Press Enter does NOT submit the form
- [ ] Form only submits via "Submit Observation" button

---

## 5. Copy to Next Slot

- [ ] Fill out first time slot completely (all required fields valid)
- [ ] Click "Copy to next" button
- [ ] Verify all fields copy to next slot exactly
- [ ] Verify no unexpected validation errors on copied slot
- [ ] Modify copied slot → verify changes are independent
- [ ] Copy from middle slot → verify copies to next slot correctly
- [ ] On last slot → "Copy to next" button should not appear

### Copy with Invalid Data

- [ ] Fill out slot with missing required field
- [ ] Click "Copy to next" → should show error and NOT copy
- [ ] Fix the error → click "Copy to next" → should work

---

## 6. Perch Diagram Modal

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

## 7. Form Reset

- [ ] Fill out form with multiple time slots
- [ ] Add some valid data, some invalid data
- [ ] Click "Reset Form" button
- [ ] Verify all fields clear to defaults
- [ ] Verify all validation errors clear
- [ ] Verify time range is cleared (no time slots shown)
- [ ] Verify no stale data persists in any field

---

## 8. Form Submission & Backend

### Validation Before Submit

- [ ] Leave entire form blank → click submit → all required field errors appear (form does NOT submit)
- [ ] Fill some fields, leave others blank → submit → only blank required fields show errors
- [ ] Fix errors one by one → verify errors clear as fields become valid

### Successful Submission

- [ ] All fields valid → click "Submit Observation"
- [ ] Loading modal appears with "Submitting observation..." message
- [ ] Cannot close modal while submitting (X button hidden, clicking outside does nothing)
- [ ] After brief wait, success screen appears with checkmark
- [ ] Success message confirms observation was saved and sent to WBS
- [ ] "Download Excel" button is visible
- [ ] "Share via Email" section is visible
- [ ] "Done" button is visible at bottom

### After Successful Submission

- [ ] Click "Done" → modal closes, form resets to blank state
- [ ] Draft is cleared from localStorage (no restore prompt on refresh)

---

## 9. Download Feature

### Download After Submission

- [ ] Submit form successfully → success screen appears
- [ ] Click "Download Excel" button
- [ ] Excel file downloads to your device
- [ ] Open downloaded file → verify data matches what you entered
- [ ] Filename format: `ethogram-observation-{id}.xlsx`

### Download on Error (Offline Fallback)

- [ ] Disconnect from internet (airplane mode or disable wifi)
- [ ] Submit form → error screen appears
- [ ] Error message mentions unable to reach server
- [ ] "Download Anyway" button is visible
- [ ] Click "Download Anyway" → Excel file downloads locally
- [ ] Filename starts with "offline-" to indicate it wasn't sent to server

---

## 10. Share via Email

### Email Input Validation

- [ ] On success screen, email input is initially empty
- [ ] Type invalid email (e.g., "abc") → error shows
- [ ] Type valid email → error clears, Share button enables
- [ ] Share button is disabled when email field is empty

### Sending Email

- [ ] Enter valid email address
- [ ] Click "Share" button
- [ ] Success message appears: "Successfully shared with {email}"
- [ ] Success message disappears after a few seconds
- [ ] Email field clears after successful share
- [ ] Can send to another email address after first succeeds

### Email Errors

- [ ] Enter valid email, but with backend unavailable
- [ ] Click "Share" → error message should appear
- [ ] Can still use "Download Excel" as fallback

---

## 11. Error Handling

### Temporary Errors (Retryable)

- [ ] If submission fails with temporary error (server busy, timeout)
- [ ] Error screen shows "Temporary Issue" title
- [ ] "Try Again" button is visible
- [ ] "Download Anyway" button is visible
- [ ] Click "Try Again" → returns to loading state, retries submission

### Permanent Errors

- [ ] If submission fails with permanent error (validation, server error)
- [ ] Error screen shows "Submission Failed" title
- [ ] "Download Anyway" button is visible (can still get your data)
- [ ] "Close" button is visible (no retry option)

---

## 12. Draft Recovery (Autosave)

- [ ] Fill out form partially
- [ ] Close browser tab or refresh page
- [ ] Reopen form → "Restore draft?" prompt appears
- [ ] Click "Restore" → previous data is restored
- [ ] Click "Discard" → form stays blank, draft is deleted

### Draft Not Restored After Submission

- [ ] Submit form successfully
- [ ] Refresh page
- [ ] No restore prompt appears (draft was cleared on successful submit)

---

## 13. Edge Cases & Stress Testing

### Multiple Time Slots

- [ ] Create form with max time range (60 minutes = 12 slots)
- [ ] Fill out all slots with different behaviors
- [ ] Verify validation works independently for each slot
- [ ] Verify copy to next works across multiple slots
- [ ] Verify form submission includes all slots

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

## 14. Accessibility (Quick Check)

- [ ] Tab through form with keyboard only
- [ ] Verify focus indicators visible
- [ ] Verify Enter key in select dropdowns works
- [ ] Verify Escape closes modals
- [ ] Loading spinner has proper accessibility label

---

## 15. Performance

- [ ] Form loads quickly (< 1 second)
- [ ] No lag when typing in fields
- [ ] Validation doesn't cause noticeable delays
- [ ] Modals open/close smoothly
- [ ] Submission modal appears immediately when clicking submit

---

## Known Issues & Limitations

- **Offline mode**: If you submit while offline, you can download a local Excel file, but it won't be saved to the WBS database. The filename will start with "offline-" to indicate it wasn't sent to server.
- **Email sharing**: Requires successful backend submission first. If submission failed, email sharing won't be available.

---

## Notes for Testers

- **Delayed validation**: Only these text fields have a brief delay (~200ms) before showing errors: "Other" description fields (when you select "other" for object, animal, or interaction type) and the Description field (for behaviors like aggression). This prevents flickering while you type.
- **Immediate validation**: All dropdowns and other fields validate immediately when changed.
- **Enter key safety**: Pressing Enter in text inputs validates that field but does NOT submit the form. This prevents accidental submissions on mobile.
- **Modal blocking**: You cannot close the submission modal while it's actively submitting. This prevents data loss.

---

## Test Sign-off

| Tester | Date | Device/Browser | Pass/Fail | Notes |
| ------ | ---- | -------------- | --------- | ----- |
|        |      |                |           |       |
|        |      |                |           |       |
|        |      |                |           |       |
