import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
from collections import defaultdict

import pandas as pd
import numpy as np

class DataProcessor:
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.chapters = ["Chapter2","Chapter3", "Chapter4", "Chapter10", "Chapter8", "Chapter9", "Chapter6", "Chapter5", "Chapter11", "Chapter12", "Chapter13", "Chapter14"]
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
            metrics['avg_response_length'] = round(sum(user_msg_lengths) / len(user_msg_lengths), 1)
        
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
                key: round(np.mean(values)) if key in ['total_messages', 'user_messages']
                     else round(np.mean(values), 1) if values else 0
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
            history['overall_metrics']['avg_response_length'] = round(
                np.mean(history['overall_metrics']['avg_response_length']), 1
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
                'Reading': {'total_students': set(), 'total_messages': 0},
                'Problem': {'total_students': set(), 'total_messages': 0}
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
                    
                    # Add student IDs to the set for this activity
                    stats['activity_distributions'][activity]['total_students'].update(
                        f.stem for f in (self.data_dir / f"{chapter}_{activity}/anon_students").glob("*.json")
                    )
                    # Add total messages for this activity
                    stats['activity_distributions'][activity]['total_messages'] += sum(
                        len(d['interactions']) for d in data
                    )
        
        # Calculate final averages and convert sets to counts
        for activity in self.activities:
            unique_student_count = len(stats['activity_distributions'][activity]['total_students'])
            total_messages = stats['activity_distributions'][activity]['total_messages']
            
            # Convert the set to count and calculate average
            stats['activity_distributions'][activity] = {
                'total_students': unique_student_count,
                'avg_messages': round(total_messages / unique_student_count) if unique_student_count > 0 else 0
            }
        
        if stats['avg_active_time']:
            stats['avg_active_time'] = round(np.mean(stats['avg_active_time']), 1)
        if stats['avg_response_length']:
            stats['avg_response_length'] = round(np.mean(stats['avg_response_length']), 1)
            
        return stats
    
    def get_weekly_statistics(self) -> Dict[str, Any]:
        """Group interaction statistics by week across all chapters and activities."""
        # Collect all student interactions
        all_interactions = []
        
        for chapter in self.chapters:
            for activity in self.activities:
                path = self.data_dir / f"{chapter}_{activity}/anon_students"
                if not path.exists():
                    continue
                    
                for file in path.glob("*.json"):
                    with open(file) as f:
                        student_data = json.load(f)
                        student_id = file.stem
                        
                        for interaction in student_data['interactions']:
                            if 'timestamp' not in interaction:
                                continue
                                
                            timestamp = datetime.fromisoformat(interaction['timestamp'])
                            all_interactions.append({
                                'student_id': student_id,
                                'chapter': chapter,
                                'activity': activity,
                                'timestamp': timestamp,
                                'role': interaction['role'],
                                'content_length': len(interaction['content']),
                            })
        
        if not all_interactions:
            return {'weeks': []}
            
        # Convert to DataFrame for easier manipulation
        df = pd.DataFrame(all_interactions)
        
        # Add week information
        df['week'] = df['timestamp'].apply(
            lambda x: f"Week {(x.isocalendar()[1])}"
        )
        df['year'] = df['timestamp'].dt.year
        df['year_week'] = df['timestamp'].apply(
            lambda x: f"{x.year}-W{x.isocalendar()[1]:02d}"
        )
        
        # Sort by year and week
        unique_year_weeks = sorted(df['year_week'].unique())
        
        # Calculate weekly stats
        weekly_stats = []
        for year_week in unique_year_weeks:
            year, week_num = year_week.split('-')
            week_df = df[df['year_week'] == year_week]
            
            # Skip weeks with very few interactions
            if len(week_df) < 10:
                continue
                
            # Get user messages only
            user_msgs = week_df[week_df['role'] == 'user']
            
            stats = {
                'week': week_num,
                'year': year,
                'display_week': f"{year} {week_num.replace('W', 'Week ')}",
                'total_interactions': len(week_df),
                'user_messages': len(user_msgs),
                'unique_students': week_df['student_id'].nunique(),
                'reading_interactions': len(week_df[week_df['activity'] == 'Reading']),
                'problem_interactions': len(week_df[week_df['activity'] == 'Problem']),
                'avg_message_length': round(user_msgs['content_length'].mean(), 1) if len(user_msgs) > 0 else 0,
            }
            
            # Include chapter breakdown
            stats['chapter_breakdown'] = {}
            for chapter in week_df['chapter'].unique():
                chapter_df = week_df[week_df['chapter'] == chapter]
                stats['chapter_breakdown'][chapter] = {
                    'total': len(chapter_df),
                    'reading': len(chapter_df[chapter_df['activity'] == 'Reading']),
                    'problem': len(chapter_df[chapter_df['activity'] == 'Problem']),
                }
            
            weekly_stats.append(stats)
        
        return {'weeks': weekly_stats}