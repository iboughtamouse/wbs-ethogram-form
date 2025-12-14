# Potential Improvements for WBS Ethogram Form

> Last updated: November 20, 2025
> Status: POC/MVP → Production Roadmap

## 🎯 Overview

This document tracks potential improvements to make the ethogram form production-ready for World Bird Sanctuary's citizen science project observing Sayyida the owl.

---

## 🎥 Twitch Streaming Context (NEW)

**Critical Discovery**: Observers watch Sayyida via Twitch live stream at https://www.twitch.tv/theworldbirdsanctuary

This changes several priorities and adds new requirements:

### Twitch-Specific Improvements

**T1. Dual-Screen Optimization** 🔴 Critical
- **Problem**: Users have stream on one screen, form on another (or switching on mobile)
- **Solution**: 
  - Minimize form width to allow side-by-side on single screen
  - Sticky metadata header (don't lose context while scrolling)
  - Consider embedding Twitch player as optional PiP view
- **Effort**: 2-3 hours
- **Priority**: 🔴 Critical

**T2. Speed is Essential** 🔴 Critical
- **Problem**: 5-minute intervals = ~30 seconds to record before next observation point
- **Solution**: 
  - "Copy previous" button (keyboard shortcut: Ctrl+C on slot)
  - Auto-advance to next slot after save
  - Predictive location (suggest last-used perch)
  - Remove any animations/delays
- **Effort**: 2-3 hours
- **Priority**: 🔴 Critical

**T3. Stream Delay Accommodation** 🟡 High
- **Problem**: Twitch has 5-20 second delay
- **Solution**: 
  - "Lag compensation" setting (adjust time by X seconds)
  - Or: Let user manually adjust start time after session
- **Effort**: 1 hour
- **Priority**: 🟡 High

**T4. Lightweight Performance** 🟠 Medium
- **Problem**: Can't compete with stream for CPU/bandwidth
- **Solution**:
  - Lazy load perch diagrams
  - Optimize all images (WebP format)
  - Minimize JS bundle size
  - No heavy animations
- **Effort**: 2 hours
- **Priority**: 🟠 Medium

**T5. Twitch API Integration** 🟢 Low (Future)
- **Feature**: Show stream status in form
  - "🔴 Live" indicator
  - Auto-disable form when stream offline
  - Show current viewer count (community engagement)
- **Effort**: 3-4 hours
- **Priority**: 🟢 Low

**T6. VOD Review Mode** 🟢 Low (Future)
- **Feature**: Allow observers to practice with past VODs
- **Benefit**: Training, reliability testing
- **Requires**: Ability to input custom timestamps
- **Effort**: 4-5 hours
- **Priority**: 🟢 Low (ask WBS if this is desired)

---

## 🚨 Critical Issues (Block Production Launch)

### 1. No Visual Perch Reference
**Problem**: Observers must constantly switch to external images to identify perch numbers  
**Impact**: High friction, slow data entry, potential errors  
**Solution**: Embed perch diagram images directly in UI with modal/lightbox toggle  
**Effort**: 1-2 hours  
**Priority**: 🔴 Critical

### 2. No Data Persistence
**Problem**: Browser refresh or accidental close loses all work  
**Impact**: Frustration, lost effort, observers may give up  
**Solution**: Add `localStorage` autosave with "Resume session?" on load  
**Effort**: 30 minutes  
**Priority**: 🔴 Critical

### 3. Accessibility Gaps
**Problem**: No ARIA labels, screen reader support incomplete  
**Impact**: Excludes disabled observers from participating  
**Solution**: Add ARIA attributes, test with screen readers  
**Effort**: 2-3 hours  
**Priority**: 🔴 Critical

### 4. Mobile Experience Poor
**Problem**: Difficult to reference perch diagrams while entering data on mobile  
**Impact**: ~50% of users may be on mobile devices  
**Solution**: Picture-in-picture view, PWA for offline support  
**Effort**: 4-6 hours  
**Priority**: 🔴 Critical

---

## 💡 High-Value Improvements (Significantly Enhance UX)

### 5. Visual Perch Selector
**Problem**: Dropdown requires memorizing perch numbers  
**Benefit**: Click on diagram → auto-fills location (faster, more accurate)  
**Implementation**: SVG overlay on perch photos with clickable regions  
**Effort**: 4-6 hours  
**Priority**: 🟡 High

**Tech approach**:
```jsx
<PerchDiagramSelector 
  imageUrl="/images/perches-ne.jpg"
  perchCoordinates={PERCH_COORDINATES}
  onSelectPerch={(perchId) => handleLocationChange(perchId)}
  selectedPerch={observation.location}
/>
```

### 6. Bulk Operations
**Problem**: Sayyida often stays in same location for multiple intervals  
**Benefit**: "Copy to next slot" saves massive time  
**Features**:
- Copy behavior + location to next interval button
- "Fill remaining slots" option
- "Repeat last observation" keyboard shortcut  
**Effort**: 1-2 hours  
**Priority**: 🟡 High

### 7. Enhanced Validation Feedback
**Current**: Validation only on blur, errors only  
**Improvement**:
- Green checkmark when field valid
- Progress indicator: "5 of 12 time slots completed"
- Color-code required vs optional fields
- Real-time validation as user types  
**Effort**: 2 hours  
**Priority**: 🟡 High

### 8. Time Slot Navigation
**Problem**: No easy way to jump between 12 time slots  
**Features**:
- Jump-to-time dropdown
- Previous/Next slot buttons
- Auto-focus next field after completing slot
- Keyboard shortcuts (Ctrl+↑/↓ for slot navigation)  
**Effort**: 2-3 hours  
**Priority**: 🟡 High

---

## 🔧 Technical Improvements

### 9. Excel Export
**Current**: JSON output only  
**Need**: WBS researchers need CSV/Excel for analysis  
**Features**:
- Multi-sheet workbook (Metadata, Observations, Summary)
- Formatted headers and data types
- Auto-calculated behavior frequency percentages
- Date formatting compatible with R/Python analysis tools  
**Libraries**: `xlsx` or `exceljs`  
**Effort**: 2-3 hours  
**Priority**: 🟠 Medium

### 10. Granular Timestamps
**Current**: Only `submittedAt` for entire form  
**Improvement**: Add `recordedAt` timestamp for each time slot  
**Benefit**: Data quality analysis (how long did observer spend on each slot?)  
**Effort**: 30 minutes  
**Priority**: 🟠 Medium

### 11. "Not Visible" Edge Case
**Issue**: "Not Visible" behavior currently requires location selection  
**Fix**: When "Not Visible" selected, automatically disable location field  
**Effort**: 15 minutes  
**Priority**: 🟠 Medium

### 12. Error Boundaries
**Problem**: No error handling for React component crashes  
**Solution**: Add error boundaries with user-friendly messages  
**Effort**: 1 hour  
**Priority**: 🟠 Medium

---

## 📊 Data Quality Features

### 13. Observation Confidence Indicators
**Purpose**: Help researchers assess data reliability  
**Fields**:
- Confidence level: Low/Medium/High (optional)
- Visibility quality: Clear/Partial/Obscured
- Environmental notes: Auto-suggest weather based on date/time  
**Effort**: 2 hours  
**Priority**: 🟢 Low

### 14. Behavior Transition Alerts
**Purpose**: Catch data entry errors  
**Feature**: Alert if same behavior selected for 6+ consecutive intervals  
- "You've selected 'Resting' for 8 intervals. Confirm this is correct?"
- Helps catch accidental "copy all" mistakes  
**Effort**: 1 hour  
**Priority**: 🟢 Low

### 15. Inter-observer Reliability Tracking
**Purpose**: Measure observer agreement for training  
**Fields**:
- Observer ID (separate from Discord username)
- Training status: New/In Training/Certified
- Observer notes/questions field  
**Benefit**: Identify observers who need more training  
**Effort**: 2 hours  
**Priority**: 🟢 Low

---

## 🎨 UX Polish

### 16. Perch Descriptions in Tooltips
**Current**: Only numbers in dropdown (e.g., "Perch 5")  
**Improvement**: Add descriptive names from diagrams  
- Perch 5 → "5 - S Branch Perch on E Wall"
- Makes learning curve easier for new observers  
**Effort**: 1 hour  
**Priority**: 🟠 Medium

### 17. Enhanced Search in Location Selector
**Current**: Search only works with exact perch numbers  
**Improvement**: Make react-select searchable by description  
- Type "high SE" → finds "1 - High SE Turfed Perch"
- Type "baby box" → finds BB1, BB2  
**Effort**: 30 minutes  
**Priority**: 🟠 Medium

### 18. Consistent Time Display
**Issue**: Metadata uses 24-hour input, slots show 12-hour  
**Solution**: Make all time inputs use 12-hour with AM/PM selector  
**Effort**: 1 hour  
**Priority**: 🟢 Low

---

## 🔐 Future-Proofing

### 19. Multi-Subject Support
**Current**: Hardcoded to "Sayyida" at "Sayyida's Cove"  
**Future**: WBS may expand to other birds/aviaries  
**Changes**:
- Subject selection dropdown
- Load perch diagrams per aviary
- Behavior set per species (raptor vs waterfowl)  
**Effort**: 3-4 hours  
**Priority**: 🟢 Low (wait for confirmed need)

### 20. Historical Data View
**Feature**: Show observer their past observations  
**Benefits**:
- "Last session: Mostly resting on Perch 5"
- Behavior frequency charts
- Pattern recognition (helps improve data quality)  
**Requires**: Backend database  
**Effort**: 6-8 hours  
**Priority**: ⚪ Future

### 21. Offline Support (PWA)
**Purpose**: Observers in areas with poor connectivity  
**Features**:
- Service worker for offline functionality
- Queue submissions when offline
- Background sync when connection returns  
**Effort**: 8-10 hours  
**Priority**: ⚪ Future (assess need after launch)

---

## 🎓 Training & Documentation

### 22. In-App Tutorial
**Feature**: Interactive overlay tour on first visit  
**Sections**:
1. How to read the perch diagram
2. How to select behaviors
3. Practice mode with example data
4. Tips for accurate observation  
**Effort**: 4-5 hours  
**Priority**: 🟠 Medium

### 23. Inline Behavior Definitions
**Feature**: (?) icon next to each behavior showing definition  
**Source**: Pull from WBS Behavior Descriptions PDF  
**Benefit**: Reduces misidentification errors  
**Effort**: 2 hours  
**Priority**: 🟡 High

---

## 📦 Quick Wins (High Impact / Low Effort)

Ranked by ROI:

1. **localStorage autosave** → 30 min, huge impact ⭐⭐⭐⭐⭐
2. **Embed perch diagrams** → 1 hour, critical usability ⭐⭐⭐⭐⭐
3. **"Copy to next slot" button** → 1 hour, speeds entry ⭐⭐⭐⭐
4. **Perch description tooltips** → 30 min, reduces errors ⭐⭐⭐⭐
5. **Progress indicator** → 30 min, motivating ⭐⭐⭐
6. **Excel export** → 2 hours, needed for analysis ⭐⭐⭐⭐
7. **Enhanced search in selector** → 30 min, nice QoL ⭐⭐⭐

---

## 🏆 Recommended Phased Approach

### Phase 1: MVP → Production (Week 1)
**Goal**: Make it safe and usable for citizen scientists

- [ ] Add localStorage autosave with session recovery
- [ ] Embed perch diagrams with lightbox viewer
- [ ] Implement Excel export with proper formatting
- [ ] Add "copy to next slot" functionality
- [ ] Add progress indicator
- [ ] Fix "Not Visible" location requirement

**Outcome**: Safe to deploy to small test group

### Phase 2: Usability Enhancements (Week 2)
**Goal**: Reduce friction and errors

- [ ] Build visual perch selector (clickable diagram)
- [ ] Add inline behavior definitions
- [ ] Implement enhanced search in location selector
- [ ] Add perch description tooltips
- [ ] Mobile UX improvements
- [ ] Accessibility audit and fixes

**Outcome**: Ready for broader citizen scientist rollout

### Phase 3: Integration & Scale (Week 3-4)
**Goal**: Connect to backend, support workflows

- [ ] Discord OAuth integration
- [ ] Backend API for data submission
- [ ] Email notifications for submitted observations
- [ ] Admin dashboard for data review
- [ ] Inter-observer reliability tracking
- [ ] Bulk export tools for researchers

**Outcome**: Full production deployment

### Phase 4: Advanced Features (Future)
**Goal**: Long-term improvements based on usage data

- [ ] Historical data view for observers
- [ ] PWA with offline support
- [ ] In-app tutorial and training mode
- [ ] Multi-subject support (if WBS expands)
- [ ] Mobile app (React Native if needed)

---

## 📝 Notes & Considerations

### Design Decisions to Document
- Why 5-minute intervals? (Standard ethogram practice)
- Why 1-hour max? (Observer attention span, data quality)
- Why end-exclusive time slots? (Prevents double-counting)

### Questions for WBS
- [ ] Do they need real-time data or batch upload is fine?
- [ ] What analysis tools do they use? (R, Python, Excel, SPSS?)
- [ ] How many concurrent observers? (Affects backend scaling)
- [ ] What's the onboarding process for new observers?
- [ ] Any specific accessibility requirements?

### Technical Debt to Address
- No TypeScript (consider migration for better DX)
- No CI/CD pipeline (add GitHub Actions)
- No E2E tests (add Playwright/Cypress)
- Bundle size optimization (code splitting)

---

## 📚 Resources & References

### Perch Diagrams
- NE Half: Perches 1-18, BB1, BB2, F1, F2, G, W
- SW Half: Perches 19-31, Additional viewing angles

### Behavior Categories
- Eating (2 types)
- Locomotion (4 types)
- Resting (3 types)
- Maintenance (preening, bathing)
- Social interactions
- Other/Not visible

### External Documentation
- WBS Behavior Descriptions PDF
- WBS Ethogram Instructions PDF
- Perch diagram images (attached)

---

## ✅ Completed Improvements
- [x] Unit tests for time utils (49 tests)
- [x] Unit tests for form validation
- [x] Jest configuration with React Testing Library
- [x] Copilot instructions for AI agents
- [x] Conventional commit workflow

---

*This document is a living roadmap. Update as priorities shift or new requirements emerge.*
