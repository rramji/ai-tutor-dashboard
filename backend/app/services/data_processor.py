import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from collections import defaultdict

import pandas as pd
import numpy as np

class DataProcessor:
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.chapters = ["Chapter3", "Chapter4", "Chapter10"]
        self.activities = ["Reading", "Problem"]
        
    def load_student_data(self, chapter: str, activity: str) -> List[Dict[str, Any]]:
        """Load all student data for a specific chapter and activity."""
        path = self.data_dir / f"{chapter}_{activity}/anon_students"
        data = []
        for file in path.glob("*.json"):
            with open(file) as f:
                student_data = json.load(f)
                data.append(student_data)
        return data

    def calculate_engagement_metrics(self, interactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate engagement metrics from interactions."""
        metrics = {
            'total_messages': len(interactions),
            'user_messages': len([msg for msg in interactions if msg['role'] == 'user']),
            'avg_response_length': 0,
            'total_active_time': 0,
            'timestamps': []
        }
        
        user_msg_lengths = []
        timestamps = []
        
        for msg in interactions:
            if msg['role'] == 'user':
                user_msg_lengths.append(len(msg['content']))
                timestamps.append(datetime.fromisoformat(msg['timestamp']))
        
        if user_msg_lengths:
            metrics['avg_response_length'] = sum(user_msg_lengths) / len(user_msg_lengths)
        
        if len(timestamps) > 1:
            timestamps.sort()
            time_diffs = []
            for i in range(len(timestamps)-1):
                diff = (timestamps[i+1] - timestamps[i]).total_seconds()
                if diff < 3600:  # Consider gaps less than 1 hour
                    time_diffs.append(diff)
            metrics['total_active_time'] = sum(time_diffs)
            
        metrics['timestamps'] = timestamps
        return metrics

    def get_chapter_summary(self, chapter: str) -> Dict[str, Any]:
        """Get summary statistics for a specific chapter."""
        summary = {
            'total_students': 0,
            'reading_metrics': {},
            'problem_metrics': {},
            'overall_engagement': {}
        }
        
        for activity in self.activities:
            data = self.load_student_data(chapter, activity)
            activity_metrics = defaultdict(list)
            
            for student_data in data:
                metrics = self.calculate_engagement_metrics(student_data['interactions'])
                for key, value in metrics.items():
                    if key != 'timestamps':
                        activity_metrics[key].append(value)
            
            # Calculate averages
            summary[f'{activity.lower()}_metrics'] = {
                key: np.mean(values) if values else 0
                for key, values in activity_metrics.items()
                if key != 'timestamps'
            }
            
            summary['total_students'] = max(
                summary['total_students'],
                len(data)
            )
        
        return summary

    def get_student_history(self, student_id: str) -> Dict[str, Any]:
        """Get complete history for a specific student across all chapters."""
        history = {
            'chapters': {},
            'overall_metrics': {
                'total_interactions': 0,
                'total_active_time': 0,
                'avg_response_length': []
            }
        }
        
        for chapter in self.chapters:
            chapter_data: Dict[str, Optional[Dict[str, Any]]] = {activity: None for activity in self.activities}
            for activity in self.activities:
                path = self.data_dir / f"{chapter}_{activity}/anon_students/{student_id}.json"
                if path.exists():
                    with open(path) as f:
                        data = json.load(f)
                        metrics = self.calculate_engagement_metrics(data['interactions'])
                        chapter_data[activity] = metrics
                        history['overall_metrics']['total_interactions'] += metrics['total_messages']
                        history['overall_metrics']['total_active_time'] += metrics['total_active_time']
                        if metrics['avg_response_length'] > 0:
                            history['overall_metrics']['avg_response_length'].append(
                                metrics['avg_response_length']
                            )
            
            if any(chapter_data.values()):
                history['chapters'][chapter] = chapter_data
        
        # Calculate overall averages
        if history['overall_metrics']['avg_response_length']:
            history['overall_metrics']['avg_response_length'] = np.mean(
                history['overall_metrics']['avg_response_length']
            )
        else:
            history['overall_metrics']['avg_response_length'] = 0
            
        return history

    def get_all_students(self) -> List[str]:
        """Get list of all unique student IDs."""
        students = set()
        for chapter in self.chapters:
            for activity in self.activities:
                path = self.data_dir / f"{chapter}_{activity}/anon_students"
                students.update(f.stem for f in path.glob("*.json"))
        return sorted(list(students))

    def get_overall_statistics(self) -> Dict[str, Any]:
        """Calculate overall statistics across all chapters and activities."""
        stats = {
            'total_unique_students': 0,
            'total_interactions': 0,
            'avg_active_time': [],
            'avg_response_length': [],
            'chapter_comparisons': {},
            'activity_distributions': {
                'Reading': {'total_students': 0, 'avg_messages': 0},
                'Problem': {'total_students': 0, 'avg_messages': 0}
            }
        }
        
        all_students = self.get_all_students()
        stats['total_unique_students'] = len(all_students)
        
        for chapter in self.chapters:
            chapter_stats = self.get_chapter_summary(chapter)
            stats['chapter_comparisons'][chapter] = chapter_stats
            
            for activity in self.activities:
                data = self.load_student_data(chapter, activity)
                activity_key = activity.lower() + '_metrics'
                if chapter_stats[activity_key]:
                    stats['total_interactions'] += sum(
                        len(d['interactions']) for d in data
                    )
                    stats['avg_active_time'].append(
                        chapter_stats[activity_key]['total_active_time']
                    )
                    stats['avg_response_length'].append(
                        chapter_stats[activity_key]['avg_response_length']
                    )
                    
                    stats['activity_distributions'][activity]['total_students'] += len(data)
                    stats['activity_distributions'][activity]['avg_messages'] += sum(
                        len(d['interactions']) for d in data
                    )
        
        # Calculate final averages
        for activity in self.activities:
            if stats['activity_distributions'][activity]['total_students'] > 0:
                stats['activity_distributions'][activity]['avg_messages'] /= \
                    stats['activity_distributions'][activity]['total_students']
        
        if stats['avg_active_time']:
            stats['avg_active_time'] = np.mean(stats['avg_active_time'])
        if stats['avg_response_length']:
            stats['avg_response_length'] = np.mean(stats['avg_response_length'])
            
        return stats