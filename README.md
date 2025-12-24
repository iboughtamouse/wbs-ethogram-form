# WBS Ethogram Data Entry Form

[![CI](https://github.com/iboughtamouse/wbs-ethogram-form/actions/workflows/ci.yml/badge.svg)](https://github.com/iboughtamouse/wbs-ethogram-form/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/iboughtamouse/wbs-ethogram-form/branch/main/graph/badge.svg)](https://codecov.io/gh/iboughtamouse/wbs-ethogram-form)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![npm](https://img.shields.io/badge/npm-%3E%3D9.0.0-brightgreen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A web-based data entry form for World Bird Sanctuary's ethogram observations. This tool helps citizen scientists record Sayyida's behaviors during live Twitch streams or when reviewing recorded videos (VODs).

## 🌐 Live Demo

**Current deployment:** [https://wbs-ethogram-form.vercel.app/](https://wbs-ethogram-form.vercel.app/)

## ✨ Features

### For Observers

- **Live Stream & VOD Support**: Choose your observation mode
  - 🔴 **Live Stream**: Watch the live Twitch stream and record observations in real-time
  - 📼 **Recorded Video (VOD)**: Watch recorded videos and fill in any missing time slots

**Time Entry**: Always use the timestamp displayed in the top-left corner of the video, regardless of mode. The video shows WBS time (America/Chicago, Central Time).

- **Flexible Time Ranges**: Observe for any duration from 5 minutes to 1 hour
  - Select any start and end time
  - Automatically generates 5-minute interval slots
  - Times displayed in friendly 12-hour format (e.g., "3:05 PM")

- **Autosave Protection**: Your work is automatically saved
  - Form data saved to your browser as you type
  - Draft recovery if you accidentally close the tab
  - Clear draft button when you're done

- **Smart Validation**: Catches errors before you submit
  - Inline error messages appear as you fill out the form
  - Auto-scrolls to first error on submit
  - Required fields clearly marked
  - Observer name validation supports Discord/Twitch usernames and full names
  - Copy-to-next validates before copying to prevent bad data

- **Structured Data Entry**: Standardized options reduce errors
  - Autocomplete perch location dropdown (type to filter)
  - Interactive perch diagram map (click Map button to view)
  - Behavior-specific interaction dropdowns
  - "Other" text fields when you need them
  - Notes field for additional context
  - Copy-to-next button to duplicate observations across time slots

- **Easy Submission**: Multiple ways to get your data to WBS
  - **Automatic**: Click submit and your observation is sent directly to WBS
  - **Share via email**: Send a copy to yourself or others after submission
  - **Download Excel**: Download a local copy for your records
  - **Status tracking**: Real-time feedback (submitting, success, or error)
  - **Error recovery**: Retry button for temporary failures, local download fallback

### Interaction Sub-fields

When certain behaviors are selected, additional structured fields appear:

- **Interacting with Inanimate Object**: Select object type from dropdown (newspaper, rope ball, plastic ball, rubber duck, wooden blocks, camera, plant, stump, perch, or other). If you select "other", a text field appears where you can type what the object is.

- **Interacting with Other Animal**: Two dropdowns appear:
  - **Animal type**: Adult/juvenile aviary occupant, insect within aviary, potential prey animal within aviary, potential prey item outside aviary, same species outside aviary, potential predator outside aviary, or other
  - **Interaction type**: Watching, preening/grooming, feeding, playing, non-aggressive biting, non-aggressive foot grabbing, or other

  For both fields, selecting "other" reveals a text field where you can specify the custom value.

## 📝 How to Use This Form

1. **Choose your observation mode**: Are you watching the live stream or reviewing a recorded video?

2. **Enter your information**:
   - Observer name (your Discord/Twitch username or full name)
   - Date of observation
   - Start and end times for your observation session

3. **Record behaviors**: For each 5-minute time slot:
   - Select the behavior you observed
   - Add location if required (perch number or "Ground")
   - For object/animal interactions, select from the dropdown options
   - Add notes if needed
   - Use "Copy to next" to quickly duplicate observations across time slots

4. **Submit**: Click the "Submit Observation" button
   - The form validates all required fields
   - Your observation is automatically sent to WBS

5. **After submission**:
   - **Success**: Download a copy or share via email to yourself/others
   - **Error**: Retry the submission or download locally as a fallback

Your work is automatically saved as you type, so don't worry if you need to take a break!

## 🔒 Privacy & Data

- **Before submission**: Data is saved to your browser's localStorage as you type (autosave)
- **On submission**: Observations are sent to the WBS backend API and stored securely
- **What's stored**: Observer name, date, times, behaviors, locations, and notes
- **No account required**: Anonymous submissions are supported
- **No tracking or analytics**: We don't track your browsing behavior

## 📊 Data Output Example

The form outputs structured JSON data:

```json
{
  "metadata": {
    "observerName": "YourDiscordName",
    "date": "2025-11-20",
    "startTime": "15:00",
    "endTime": "15:30",
    "aviary": "Sayyida's Cove",
    "patient": "Sayyida",
    "mode": "live"
  },
  "observations": {
    "15:00": {
      "behavior": "perching",
      "location": "12",
      "notes": "",
      "object": "",
      "objectOther": "",
      "animal": "",
      "animalOther": "",
      "interactionType": "",
      "interactionTypeOther": ""
    },
    "15:05": {
      "behavior": "interacting_object",
      "location": "",
      "notes": "Playing with newspaper",
      "object": "newspaper",
      "objectOther": "",
      "animal": "",
      "animalOther": "",
      "interactionType": "",
      "interactionTypeOther": ""
    }
  },
  "submittedAt": "2025-11-20T15:32:00.000Z"
}
```

## 🛠️ For Developers

### Quick Start

```bash
# Clone the repository
git clone https://github.com/iboughtamouse/wbs-ethogram-form.git
cd wbs-ethogram-form

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and set VITE_WBS_EMAIL to your test email

# Start development server
npm run dev

# Run tests
npm test
```

### Environment Variables

The application requires the following environment variables:

- `VITE_WBS_EMAIL` - Email address to receive observation submissions
  - Development: Set to your test email address
  - Production: Configure in Vercel with the WBS research email

- `VITE_API_BASE_URL` - Backend API URL
  - Development: Point to local or deployed backend (e.g., `http://localhost:3000` or `https://your-app.up.railway.app`)
  - Production: Configure in Vercel with the production API URL

### Documentation

Interested in contributing or learning more? Check out:

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture, component structure, and data flow
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Technical setup, development workflow, and testing
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to this project

## 🗺️ Roadmap

**Recently Completed:**

- [x] Backend API integration ✅ (November 2025)
- [x] Email submission (auto-sends Excel to WBS) ✅ (November 2025)
- [x] Share observation via email ✅ (November 2025)
- [x] Copy-to-next validation ✅ (November 2025)
- [x] Excel file export ✅ (November 2025)
- [x] Accessible loading indicators ✅ (November 2025)

**Upcoming Features:**

- [ ] Discord OAuth authentication
- [ ] Extended observation periods (24+ hours)
- [ ] Data aggregation & analysis tools
- [ ] Inter-rater reliability calculations

## 📄 License

MIT License - Feel free to use and modify for your organization's needs.

## 🙏 Acknowledgments

Built for the World Bird Sanctuary community and the amazing citizen scientists who observe Sayyida!
