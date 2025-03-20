#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Deactivate virtual environment
deactivate

echo "Setup complete! To start the server, run:"
echo "source venv/bin/activate && python -m uvicorn app.main:app --reload"