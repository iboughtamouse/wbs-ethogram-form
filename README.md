# WBS Ethogram Data Entry Form

A web-based data entry form for World Bird Sanctuary's ethogram observations. This tool helps citizen scientists record Sayyida's behaviors during live Twitch streams or when reviewing recorded videos (VODs).

## 🌐 Live Demo

**Current deployment:** [https://wbs-ethogram-form.vercel.app/](https://wbs-ethogram-form.vercel.app/)

## ✨ Features

### For Observers

- **Live Stream & VOD Support**: Choose your observation mode
  - 🔴 **Live Stream**: Records in your local time, converts to WBS timezone automatically
  - 📼 **Recorded Video (VOD)**: Enter timestamps directly from the video

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

- **Structured Data Entry**: Standardized options reduce errors
  - Autocomplete perch location dropdown (type to filter)
  - Interactive perch diagram map (click Map button to view)
  - Behavior-specific interaction dropdowns
  - "Other" text fields when you need them
  - Notes field for additional context

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
   - Discord username (so WBS knows who submitted the data)
   - Date of observation
   - Start and end times for your observation session

3. **Record behaviors**: For each 5-minute time slot:
   - Select the behavior you observed
   - Add location if required (perch number or "Ground")
   - For object/animal interactions, select from the dropdown options
   - Add notes if needed

4. **Validate & Preview**: Click the "Validate & Preview" button
   - The form will check for any errors
   - If valid, your data will appear in JSON format below the form
   - You can also download as an Excel file

5. **Export & Submit**:
   - **Excel Download**: Click "Download Excel" to save a formatted .xlsx file
   - **JSON Copy**: Copy the JSON output and share it with WBS via Discord

Your work is automatically saved as you type, so don't worry if you need to take a break!

## 🔒 Privacy & Data

- All data stays in your browser until you choose to copy and submit it
- Autosave uses browser localStorage (no server storage)
- No account or login required
- No tracking or analytics

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

Interested in contributing or setting up your own instance? Check out:

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture, component structure, and data flow
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Technical setup, development workflow, and testing
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to this project

## 🗺️ Roadmap

**Recently Completed:**

- [x] Excel file export ✅ (Phase 6, November 2025)

**Upcoming Features:**

- [ ] Discord OAuth authentication
- [ ] Email submission integration
- [ ] Extended observation periods (24+ hours)
- [ ] Data aggregation & analysis tools
- [ ] Inter-rater reliability calculations

## 📄 License

MIT License - Feel free to use and modify for your organization's needs.

## 🙏 Acknowledgments

Built for the World Bird Sanctuary community and the amazing citizen scientists who observe Sayyida!
