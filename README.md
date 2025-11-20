# WBS Ethogram Data Entry Form

A web-based data entry form for World Bird Sanctuary's ethogram observations. This tool replaces manual Excel spreadsheets with a validated web form to reduce data entry errors and streamline the observation process.

## Features

- **Validated Input**: Prevents common data entry errors
  - Ensures all required fields are filled
  - Validates perch numbers against known locations
  - Conditional fields (location only shows when behavior requires it)

- **User-Friendly**: Works on any device (desktop, tablet, mobile)

- **Data Export**: Generates structured JSON output (Excel export coming in future version)

## What This Is (POC/MVP)

This is a Proof of Concept for the first hour of observation (0:00 to 0:55). It demonstrates:
- Basic form structure
- Behavior validation
- Location validation
- Data output format

**Not Yet Implemented:**
- Discord OAuth authentication
- Excel file generation
- Email integration
- Full 24-hour support

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Vanilla CSS** - Styling (no framework dependencies)

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

## Deployment

This app is designed to be deployed on Vercel or Netlify (free tier):

### Vercel

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
    "timeWindow": "string",
    "aviary": "Sayyida's Cove",
    "patient": "Sayyida"
  },
  "observations": {
    "0:00": {
      "behavior": "string",
      "location": "string (optional)",
      "notes": "string (optional)"
    },
    ...
  },
  "submittedAt": "ISO timestamp"
}
```

## Next Steps / Roadmap

- [ ] Add Discord OAuth authentication
- [ ] Implement Excel file generation (using `xlsx` or `exceljs`)
- [ ] Add email integration to send submissions to WBS
- [ ] Extend to support full 24-hour observation periods
- [ ] Add image references for perch diagrams
- [ ] Implement data aggregation tool for combining multiple submissions
- [ ] Add inter-rater reliability calculations

## Contributing

This is an open-source project for World Bird Sanctuary. Contributions welcome!

## License

MIT License - Feel free to use and modify for your organization's needs.
