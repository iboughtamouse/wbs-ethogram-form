# WBS Ethogram Project Context

> Project for World Bird Sanctuary's citizen science ethogram observation program

## 📋 Project Overview

### Purpose
Develop a web-based data entry form to replace manual Excel spreadsheets for recording behavioral observations of Sayyida, a rehabilitation raptor (owl) at World Bird Sanctuary.

### Subject
- **Bird**: Sayyida (species: likely Barred Owl or Great Horned Owl - confirm with WBS)
- **Location**: Sayyida's Cove aviary
- **Status**: Rehabilitation raptor (non-releasable)

### Observation Method
- **Interval**: 5-minute instantaneous sampling
- **Duration**: 5-60 minutes per session (1 hour maximum currently)
- **Observers**: Citizen scientists (volunteers with varying experience levels)
- **Access**: Remote observation via **Twitch live stream**
  - **Stream URL**: https://www.twitch.tv/theworldbirdsanctuary
  - **Implication**: All observations done online, real-time
  - **Submission**: Online form submission (no in-person data entry)

---

## 🏛️ About World Bird Sanctuary

World Bird Sanctuary is a conservation organization focused on:
- Raptor rehabilitation
- Public education
- Conservation research
- Breeding programs for endangered species

### Ethogram Research Goals
Likely studying:
- Activity budgets (time spent in different behaviors)
- Habitat use patterns (perch preferences)
- Welfare indicators (stereotypic behaviors, stress behaviors)
- Effects of environmental enrichment
- Seasonal/daily behavior patterns

---

## 🗺️ Aviary Layout

### Sayyida's Cove Structure
Based on perch diagrams:

**NE Half Perches (1-18)**:
- Turfed perches: 1, 11
- Branch perches on various support posts and walls
- Multiple height levels (high, middle, low)
- Baby boxes: BB1 (North), BB2 (South)
- Food platforms: F1, F2

**SW Half Perches (19-31)**:
- Numbered perches 19-31
- Similar vertical structure (high, middle, low branches)
- Wall-mounted platforms

**Special Locations**:
- **G** - Ground
- **W** - Water bowl
- **BB1, BB2** - Baby boxes (shelter/roosting)
- **F1, F2** - Food platforms

### Spatial Complexity
The aviary appears to be a large outdoor or semi-outdoor flight enclosure with:
- Natural branches as perches
- Multiple vertical levels
- Shelter boxes
- Ground access
- Water features

This complexity explains why the perch numbering system is essential for precise location tracking.

---

## 🦉 Behavior Categories

Based on the ethogram structure in the app:

### 1. Feeding Behaviors
- Eating - On Food Platform
- Eating - Elsewhere

### 2. Locomotion
- Walking on Ground
- Walking on Perch
- Flying
- Jumping
- Repetitive Locomotion (stereotypy indicator)

### 3. Resting
- Alert (vigilant)
- Not Alert (relaxed)
- Status Unknown

### 4. Maintenance
- Preening/Grooming
- Repetitive Preening/Feather Damage (welfare concern)
- Bathing
- Drinking

### 5. Social/Environmental
- Vocalizing
- Interacting with Inanimate Object
- Interacting with Other Animal
- Aggression or Defensive Posturing

### 6. Other
- Nesting
- Not Visible
- Other

---

## 👥 Observer Workflow

### Current Manual Process (Excel-based)
1. Observer signs up for time slot via Discord
2. Watches Sayyida via live stream(?)
3. Records behavior every 5 minutes
4. Manually enters data into Excel spreadsheet
5. Submits spreadsheet to researchers

### Problems with Current System
- Error-prone manual entry
- No real-time validation
- Inconsistent formatting
- Difficult to aggregate data
- Hard to track observer reliability
- No perch diagram reference in spreadsheet

### Proposed Digital Workflow
1. Observer logs in via Discord OAuth
2. Selects observation session time range
3. Form generates time slots automatically
4. Observer enters behaviors with visual perch reference
5. Real-time validation catches errors
6. Submits validated data
7. Auto-generates Excel file for researchers
8. Sends confirmation email

---

## 📊 Data Collection Goals

### Research Questions (Hypothetical)
Based on typical ethogram studies:

1. **Activity Budget**: How does Sayyida allocate time across behaviors?
2. **Perch Preference**: Which perches are used most frequently?
3. **Daily Patterns**: Are there temporal patterns in behavior?
4. **Welfare Assessment**: Are there signs of stress or stereotypy?
5. **Enrichment Effectiveness**: Do environmental changes affect behavior?
6. **Seasonal Variation**: Does behavior change across seasons?

### Data Quality Requirements
- **Accuracy**: Correct behavior identification
- **Precision**: Exact perch location when relevant
- **Consistency**: Agreement between observers
- **Completeness**: All time slots filled
- **Timeliness**: Data submitted promptly

---

## 🔬 Technical Considerations

### Why 5-Minute Intervals?
- Standard ethogram practice (balance between detail and observer fatigue)
- Captures behavior changes without excessive data volume
- Manageable for volunteer observers
- Sufficient resolution for most behavior patterns

### Why 1-Hour Maximum?
- Prevents observer fatigue (maintains data quality)
- Allows multiple observers per day
- Easier to schedule volunteers
- Natural break point for behavior sessions

### Why End-Exclusive Time Slots?
- Prevents double-counting behaviors
- Clear boundaries between observation periods
- Standard practice in interval sampling

---

## 🎯 Success Metrics

### For Observers (Citizen Scientists)
- Easy to learn and use
- Low error rate
- Enjoyable experience (retention)
- Clear feedback on data quality

### For Researchers (WBS Staff)
- High data quality
- Easy to aggregate and analyze
- Good inter-observer reliability
- Efficient data collection

### For the Project
- Sustainable volunteer engagement
- Valuable research outputs
- Scalable to other subjects/aviaries

---

## 📚 Reference Materials

### Documents Provided
1. **Behavior Descriptions PDF** - Detailed definitions of each behavior
2. **Ethogram Instructions PDF** - Observer training manual
3. **Perch Diagram Photos** - Visual reference for location codes

### Additional Resources Needed
- [ ] Observer training video/materials
- [ ] Discord community guidelines
- [ ] Data usage policy
- [ ] Observer certification process
- [ ] Example completed ethogram

---

## ❓ Open Questions for WBS

### Technical
- [ ] What is the observation method? (Live stream, in-person, recorded video?)
- [ ] How many concurrent observers typically?
- [ ] What data analysis tools does WBS use?
- [ ] Is real-time submission needed or batch OK?
- [ ] Any existing database/backend systems?

### Workflow
- [ ] How are observers recruited and trained?
- [ ] What's the certification process?
- [ ] How is scheduling managed?
- [ ] Who reviews submitted data?
- [ ] What happens if data quality is poor?

### Content
- [ ] Are behavior definitions stable or evolving?
- [ ] Will other subjects be added later?
- [ ] Are there seasonal observation priorities?
- [ ] What's the target sample size?
- [ ] How long will the study run?

### Accessibility
- [ ] Any specific accessibility requirements?
- [ ] What devices will observers use? (Desktop, tablet, phone?)
- [ ] Any bandwidth/connectivity concerns?
- [ ] International observers? (Time zones, languages?)

---

## 🎓 Ethogram Best Practices

### From Scientific Literature

**Observer Training**:
- Practice sessions with video
- Inter-observer reliability testing (>80% agreement)
- Regular calibration sessions
- Clear behavior definitions

**Data Collection**:
- Blind to research hypotheses when possible
- Consistent observation conditions
- Standardized recording protocols
- Regular breaks to maintain focus

**Data Quality**:
- Random reliability checks
- Double-coding subset of observations
- Track observer drift over time
- Document environmental conditions

---

## 🔮 Future Vision

### Phase 1: Single Subject (Current)
- Sayyida at Sayyida's Cove
- Manual data review
- Basic export functionality

### Phase 2: Expanded Program
- Multiple birds/aviaries
- Automated data pipelines
- Real-time dashboards for researchers
- Observer leaderboards/gamification

### Phase 3: Research Platform
- Public data visualization
- Educational components
- Integration with other WBS systems
- Mobile app for in-person observations

---

## 🎥 Twitch Streaming Context

### Technical Implications

**Real-time Observation Environment**:
- Observers watch live stream at https://www.twitch.tv/theworldbirdsanctuary
- Data entry happens simultaneously with observation
- No ability to pause/rewind (unless VOD review is allowed?)
- Time synchronization is critical (observer clock vs stream clock)

**UX Design Considerations**:
1. **Dual-screen setup**: Most observers will have stream on one screen, form on another
   - Mobile users: Need to switch between Twitch app and form (friction!)
   - Tablet users: May use picture-in-picture or split-screen
   
2. **Form must be lightweight**: Can't compete with stream for bandwidth/CPU
   - Minimize animations
   - Optimize images (perch diagrams)
   - Consider lazy loading

3. **Quick data entry is essential**: Stream doesn't wait
   - 5-minute intervals = only ~30 seconds to record before next observation
   - Bulk copy features become critical
   - Keyboard shortcuts essential
   - Auto-save to prevent loss if stream distracts

4. **Perch reference must be accessible**: 
   - Can't rely on external images (too slow to switch)
   - Must be in-app or in stream overlay
   - Consider requesting WBS add perch numbers to stream overlay?

**Community Features**:
- Twitch chat coordination: Observers might discuss behaviors in chat
- Could integrate Discord bot for submission notifications
- Leaderboard for most observations submitted
- Live observer count display

**Stream-Specific Features to Consider**:
- Embed Twitch player in form? (PiP mode)
- Sync form time range with stream time (auto-populate based on when observer loads form)
- "Stream delay" setting (account for 5-20 second Twitch delay)
- VOD review mode (for training or data validation)

**Potential Issues**:
- Stream goes down mid-observation → Need to save partial data
- Stream quality varies → May affect behavior identification
- Time zone differences → Observer's time vs stream time vs Sayyida's local time

---

## 📝 Notes & Updates

### November 29, 2025
- **Backend API started** — See `ethogram-api` repo
- `POST /api/observations/submit` endpoint implemented
- Frontend needs to call API instead of local-only export
- Schema alignment work tracked in `ethogram-api/notes/frontend-alignment-todos.md`

### November 20, 2025
- Created comprehensive improvements roadmap
- Added unit tests (49 tests passing)
- Documented project context
- Identified critical UX issues (perch diagrams, autosave)
- **Confirmed observation method: Twitch live stream at https://www.twitch.tv/theworldbirdsanctuary**
- Added Twitch-specific design considerations

### Next Actions
- **Connect to backend API** — Update submission to call `/api/observations/submit`
- Test form usability alongside Twitch stream (simulate dual-screen)
- Consider Twitch API integration for stream status
- Ask WBS: Is VOD review allowed for training?
- Ask WBS: Can they add perch number overlay to stream?
- Measure realistic time to enter observation during live stream
- Test mobile UX with Twitch app + form switching

---

*This document captures project context and will be updated as we learn more about WBS's needs and workflows.*
