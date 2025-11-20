# WBS Ethogram Data Entry Form

A web-based data entry form for World Bird Sanctuary's ethogram observations. This tool replaces manual Excel spreadsheets with a validated web form to reduce data entry errors and streamline the observation process.

## Features

- **Dynamic Time Range Selection**: Flexible observation periods
  - Select any start and end time within a 1-hour window
  - Automatically generates 5-minute intervals for your chosen time range
  - Supports observations from 5 minutes to 1 hour
  - Times displayed in friendly 12-hour format (e.g., "3:05 PM")

- **Real-Time Validation**: Validates fields as you fill them out
  - On-blur validation (errors appear when you tab away)
  - Inline error messages directly under each field
  - Errors clear automatically as you type
  - Auto-scrolls to first error on submit

- **Smart Location Selection**: Autocomplete dropdown for perch locations
  - Type to filter options (e.g., type "2" to see all perches with 2)
  - Click dropdown arrow to browse all options
  - Organized by category (Perches, Baby Boxes, Food Platforms, etc.)
  - Prevents typos and invalid entries

- **Conditional Fields**: Location input only appears when the selected behavior requires it

- **Clean UX**: Works on any device (desktop, tablet, mobile)

- **Modular Architecture**: Clean, maintainable codebase with separated concerns

## What This Is (POC/MVP)

This is a Proof of Concept for ethogram observations with flexible time ranges (5 minutes to 1 hour in 5-minute intervals). It demonstrates:
- Dynamic time slot generation based on user-selected time range
- Modular React component structure
- Real-time field validation with 12-hour time display
- Autocomplete perch selection
- Data output in JSON format with precise timestamps

**Not Yet Implemented:**
- Discord OAuth authentication
- Excel file generation
- Email integration
- Full 24-hour support

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Select** - Autocomplete dropdown component
- **Custom CSS** - Styling

## Project Structure

```
src/
├── components/
│   ├── MetadataSection.jsx       # Observer info section with time range picker
│   ├── TimeSlotObservation.jsx   # Individual time slot component
│   └── OutputPreview.jsx         # JSON output display
├── hooks/
│   └── useFormValidation.js      # Centralized validation logic
├── utils/
│   └── timeUtils.js              # Time formatting and calculation utilities
├── App.jsx                       # Main orchestrator with dynamic slot generation
├── constants.js                  # Behaviors and perch definitions
└── index.css                     # Global styles
```

## Local Development

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

## Live Demo

**Current deployment:** [https://wbs-ethogram-form.vercel.app/](https://wbs-ethogram-form.vercel.app/)

## Deployment

This app is deployed on Vercel and auto-deploys when changes are pushed to the main branch.

### Vercel (Current)

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Vercel auto-detects Vite and configures build settings
4. Deploy!

### Netlify

1. Push code to GitHub
2. Import repository in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy!

## Data Structure

The form outputs JSON in this format:

```json
{
  "metadata": {
    "observerName": "string",
    "date": "YYYY-MM-DD",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "aviary": "Sayyida's Cove",
    "patient": "Sayyida"
  },
  "observations": {
    "15:05": {
      "behavior": "string",
      "location": "string (optional)",
      "notes": "string (optional)"
    },
    "15:10": {
      "behavior": "string",
      "location": "string (optional)",
      "notes": "string (optional)"
    }
    ...
  },
  "submittedAt": "ISO timestamp"
}
```

## Version History

**Current: v6**
- ✅ Dynamic time range selection (5 minutes to 1 hour)
- ✅ 12-hour time format display
- ✅ Automatic time slot generation based on selected range
- ✅ Modular component architecture
- ✅ On-blur field validation
- ✅ React Select autocomplete for perch locations
- ✅ Inline error messages
- ✅ Auto-scroll to errors

## Next Steps / Roadmap

**Validation from WBS:**
- [ ] Confirm perch categories and labels are correct
- [ ] Get feedback on current time range implementation

**Feature Additions:**
- [ ] Add Discord OAuth authentication
- [ ] Implement Excel file generation (using `xlsx` or `exceljs`)
- [ ] Add email integration to send submissions to WBS
- [ ] Extend to support full 24-hour observation periods (remove 1-hour maximum)
- [ ] Add perch diagram image references
- [ ] Implement data aggregation tool for combining multiple submissions
- [ ] Add inter-rater reliability calculations

## Contributing

This is an open-source project for World Bird Sanctuary. Contributions welcome!

## License

MIT License - Feel free to use and modify for your organization's needs.
