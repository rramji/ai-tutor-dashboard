#!/bin/bash
# Setup script to configure the data directory

# Change to the repository root directory
cd "$(dirname "$0")/.." || exit 1

# Make the Python script executable
chmod +x scripts/copy_student_data.py

# Create the data directory structure
mkdir -p data/chapters

# Run the data copy script
echo "Copying student data from parent directory..."
python scripts/copy_student_data.py

echo "Setup complete!"