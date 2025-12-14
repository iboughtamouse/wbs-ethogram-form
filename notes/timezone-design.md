# Timezone Handling Design Decision

> Created: November 20, 2025
> Status: Approved for Implementation

## 🎯 Problem Statement

Multiple observers watching the same Twitch stream from different timezones could submit observations with different timestamps for the same event:
- Observer in EST enters `15:05` (3:05 PM their time)
- Observer in CST enters `14:05` (2:05 PM their time)
- Both saw the same behavior at the same moment

This breaks:
- Inter-observer reliability measurement
- Duplicate detection
- Time-based analysis (peak activity hours, etc.)

## ✅ Solution: Mode-Based Silent Conversion

### Two Observation Modes

**1. Live Stream Mode (Default)**
- Observer enters times from their local clock
- System silently converts to WBS timezone (America/Chicago - CST)
- User sees: "Select the time range for your observation"
- No mention of timezones in UI

**2. VOD Review Mode**
- Observer enters timestamp shown on video overlay
- No conversion needed (already in WBS timezone)
- User sees: "Enter the timestamp shown in the top-left corner of the video"

### Why This Works

**Live observers think in "my time now"**
- Natural mental model: "I started watching at 3:00 PM"
- Don't need to think about stream timestamp
- System handles complexity behind the scenes

**VOD reviewers think in "video timestamp"**
- Natural mental model: "Analyzing the 15:00-16:00 segment"
- Timestamp on video is source of truth
- No conversion needed

### UX Principles

1. **Don't expose implementation details**: Users don't need to know about timezone conversion
2. **Optimize for common case**: Live streaming is primary use case (80%+)
3. **Clear mode selection**: Prominent choice at top of form
4. **Mode-specific instructions**: Different help text based on selection

## 🔧 Technical Implementation

### Frontend (Client-Side Only)

```javascript
// 1. Detect user timezone (browser built-in)
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// 2. WBS timezone constant
const WBS_TIMEZONE = 'America/Chicago'; // St. Louis, Missouri

// 3. Conversion function (only for live mode)
function convertToWBSTime(dateString, timeString) {
  // Create Date object from user's local time input
  const localDateTime = new Date(`${dateString}T${timeString}:00`);
  
  // Format in WBS timezone using Intl API
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: WBS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(localDateTime);
  const wbsTime = parts.find(p => p.type === 'hour').value + ':' + 
                  parts.find(p => p.type === 'minute').value;
  
  return wbsTime;
}

// 4. Apply on form submission
if (mode === 'live') {
  metadata.startTime = convertToWBSTime(metadata.date, metadata.startTime);
  metadata.endTime = convertToWBSTime(metadata.date, metadata.endTime);
}
// VOD mode: no conversion, pass through as-is
```

### Data Output

**Live Mode Output:**
```json
{
  "metadata": {
    "observerName": "JohnDoe",
    "date": "2025-11-20",
    "startTime": "14:05",  // Converted to WBS CST
    "endTime": "15:05",    // Converted to WBS CST
    "mode": "live",
    "observerTimezone": "America/New_York"  // For debugging/audit
  },
  "observations": {
    "14:05": { ... },  // All times in WBS timezone
    "14:10": { ... }
  }
}
```

**VOD Mode Output:**
```json
{
  "metadata": {
    "observerName": "JaneDoe",
    "date": "2025-11-19",
    "startTime": "14:05",  // From video timestamp (already WBS time)
    "endTime": "15:05",
    "mode": "vod"
  },
  "observations": {
    "14:05": { ... }
  }
}
```

## 🎨 UX Flow

### Step 1: Mode Selection (First Thing User Sees)
```
┌─────────────────────────────────────┐
│ What are you observing?             │
│                                     │
│ ○ 🔴 Live Stream                    │
│   Currently watching on Twitch      │
│                                     │
│ ○ 📼 Recorded Video (VOD)           │
│   Reviewing past stream             │
└─────────────────────────────────────┘
```

### Step 2: Time Input (Mode-Specific Instructions)

**Live Mode:**
```
Time Range
┌──────────┐    ┌──────────┐
│ 15:05    │ to │ 16:05    │
└──────────┘    └──────────┘
Select the time range for your observation.
```

**VOD Mode:**
```
VOD Time Range
┌──────────┐    ┌──────────┐
│ 14:05    │ to │ 15:05    │
└──────────┘    └──────────┘
Enter the timestamp shown in the top-left corner of the video.
```

## ⚙️ Technical Details

### Browser APIs Used
- `Intl.DateTimeFormat().resolvedOptions().timeZone` - Get user's timezone
- `Intl.DateTimeFormat` with `timeZone` option - Convert between timezones
- No external libraries needed (Intl is built into all modern browsers)

### Optional: Luxon Library
If `Intl` API feels too verbose, can use Luxon (18KB):
```javascript
import { DateTime } from 'luxon';

function convertToWBSTime(dateString, timeString) {
  return DateTime.fromISO(`${dateString}T${timeString}`, { zone: 'local' })
    .setZone('America/Chicago')
    .toFormat('HH:mm');
}
```

### Edge Cases Handled

1. **DST Transitions**: `Intl` handles automatically
2. **Invalid Timezones**: Browser falls back to UTC
3. **User's Wrong Clock**: Unsolvable (garbage in, garbage out)
4. **Stream Delay (5-20 sec)**: Acceptable variance for 5-minute sampling

## 📊 Benefits

### For Users
- ✅ Simple, intuitive UX
- ✅ No timezone confusion
- ✅ Natural mental model
- ✅ Clear instructions

### For Researchers
- ✅ Consistent timestamps across observers
- ✅ Accurate inter-observer reliability
- ✅ Easy duplicate detection
- ✅ Reliable time-based analysis

### For Development
- ✅ Client-side only (no backend needed)
- ✅ No external libraries required
- ✅ Built-in browser APIs
- ✅ Easy to test

## 🚫 What We're NOT Doing

1. **Not showing timezone warnings** - Implementation detail, users don't care
2. **Not using backend conversion** - Can do it all client-side
3. **Not asking users to calculate offsets** - System does it silently
4. **Not supporting manual timezone override** - Trust browser detection

## 🧪 Testing Checklist

- [ ] EST user in live mode → times convert to CST
- [ ] CST user in live mode → times stay CST (no conversion)
- [ ] PST user in live mode → times convert to CST
- [ ] Any user in VOD mode → times pass through unchanged
- [ ] DST transition dates handled correctly
- [ ] Mode toggle changes instructions text
- [ ] Generated time slots respect converted times
- [ ] Excel export shows WBS times

## 📝 Future Considerations

### If Issues Arise
- Add "Debug Info" section in output showing original timezone
- Add validation: warn if live time is >1 hour from "now"
- Add mode auto-detection based on time proximity to current time

### If VOD Usage Grows
- Add date picker for VOD (can review old dates)
- Add "pause detection" to suggest time ranges
- Add Twitch VOD URL input to auto-populate date

### If Inter-Observer Reliability Becomes Priority
- Show "other observers active now" count
- Add post-submission comparison tool
- Add training mode with known-correct data

---

## ✅ Decision

**Approved**: Implement mode-based silent conversion with live stream as default.

**Next Steps**:
1. Add mode selection UI to MetadataSection
2. Add timezone conversion utility function
3. Update form submission to apply conversion
4. Add observer timezone to metadata output
5. Update tests for timezone conversion
6. Update copilot-instructions.md with this pattern

---

*This design prioritizes user experience over exposing technical complexity. The best timezone handling is the one users never think about.*
