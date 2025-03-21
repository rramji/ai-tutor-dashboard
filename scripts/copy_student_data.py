#!/usr/bin/env python3
"""
Copy student data from the parent directory into the repository's data directory.
This script should be run from the root of the ai-tutor-dashboard repository.
"""

import os
import shutil
from pathlib import Path
import json

def copy_student_data():
    # Define source and destination paths
    repo_root = Path(os.getcwd())
    
    # Check if we're in the right directory
    if not (repo_root / "frontend").exists() or not (repo_root / "backend").exists():
        print("Error: This script must be run from the ai-tutor-dashboard repository root")
        return False
    
    # Parent directory containing the chapter data
    source_root = repo_root.parent
    
    # Destination directory in the repository
    dest_root = repo_root / "data" / "chapters"
    os.makedirs(dest_root, exist_ok=True)
    
    # List of chapters to copy
    chapters = [
        "Chapter2", "Chapter3", "Chapter4", "Chapter5", 
        "Chapter6", "Chapter8", "Chapter9", "Chapter10", 
        "Chapter11", "Chapter12", "Chapter13", "Chapter14"
    ]
    
    activities = ["Reading", "Problem"]
    
    # Track stats for reporting
    stats = {
        "chapters_copied": 0,
        "files_copied": 0,
        "errors": 0
    }
    
    # Copy each chapter directory
    for chapter in chapters:
        for activity in activities:
            chapter_activity = f"{chapter}_{activity}"
            source_dir = source_root / chapter_activity / "anon_students"
            dest_dir = dest_root / chapter_activity / "anon_students"
            
            # Skip if source directory doesn't exist
            if not source_dir.exists():
                print(f"Warning: Source directory not found: {source_dir}")
                continue
            
            # Create destination directory
            os.makedirs(dest_dir, exist_ok=True)
            
            # Copy all JSON files
            try:
                for json_file in source_dir.glob("*.json"):
                    # Validate JSON before copying
                    try:
                        with open(json_file) as f:
                            json.load(f)
                        
                        # Copy the file
                        shutil.copy2(json_file, dest_dir / json_file.name)
                        stats["files_copied"] += 1
                    except json.JSONDecodeError:
                        print(f"Warning: Invalid JSON file: {json_file}")
                        stats["errors"] += 1
                
                stats["chapters_copied"] += 1
                print(f"Copied {chapter_activity}")
            except Exception as e:
                print(f"Error copying {chapter_activity}: {str(e)}")
                stats["errors"] += 1
    
    # Print summary
    print("\nCopy complete!")
    print(f"Chapters processed: {stats['chapters_copied']}")
    print(f"Files copied: {stats['files_copied']}")
    print(f"Errors encountered: {stats['errors']}")
    
    return True

if __name__ == "__main__":
    copy_student_data()