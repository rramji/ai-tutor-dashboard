# AI Tutor Dashboard Data

This directory contains the structured data used by the AI Tutor Dashboard application.

## Structure

- `chapters/` - Contains student interaction data organized by chapter and activity
  - `Chapter{X}_{Activity}/` - Folders for each chapter and activity type (Reading/Problem)
    - `anon_students/` - Contains anonymized student data files
      - `{student_id}.json` - Individual student interaction data

## Data Format

Each student JSON file contains:
- Student identifier (anonymized)
- Interactions array with timestamps
- Messages exchanged with the AI Tutor

## Setup

To populate this directory with data:

1. Make sure you have the source data available in the parent directory
2. Run the setup script:

```bash
./scripts/setup_data.sh
```

This will copy all relevant student data into this directory structure.

## Notes

- All data is anonymized to protect student privacy
- Data is included in the repository for deployment purposes