# Cognitive Skills & Student Performance Dashboard

A comprehensive Next.js dashboard for analyzing student cognitive data and performance metrics, featuring machine learning insights and interactive visualizations.

---

## Features

### Data Management
- CSV Upload: Drag-and-drop interface for student data
- Automatic Validation: Ensures required columns and correct data ranges
- Real-time Processing: Client-side CSV parsing with Papa Parse

### Analytics Dashboard
- Overview Statistics: Key performance metrics and cognitive skill averages
- Correlation Analysis: Relationships between cognitive skills and assessment scores
- Class Distribution: Visual breakdown of student distribution across classes

### Student Management
- Interactive Table: Searchable and sortable student data
- Advanced Filtering: Filter by class, search by name/ID
- Performance Indicators: Color-coded skill levels and assessment scores

### Data Visualization
- Bar Charts: Compare cognitive skills and assessment performance
- Scatter Plots: Attention vs assessment score relationships
- Radar Charts: Individual student cognitive profiles
- Class Performance: Comparative analysis across classes

### Machine Learning Insights
- Linear Regression: Predicts assessment scores from cognitive skills
- K-means Clustering: Identifies learning personas
- Performance Predictions: Actual vs predicted score analysis
- AI-Generated Insights: Automated recommendations

---

## Required CSV Format

| Column            | Type    | Description                       |
|-------------------|---------|-----------------------------------|
| `student_id`      | Integer | Student identifier                |
| `name`            | String  | Student name                      |
| `class`           | String  | Class/grade level                 |
| `comprehension`   | Float   | Comprehension skill level         |
| `attention`       | Float   | Attention skill level             |
| `focus`           | Float   | Focus skill level                 |
| `retention`       | Float   | Retention skill level             |
| `assessment_score`| Float   | Assessment score percentage       |
| `engagement_time` | Float   | Time spent engaged (minutes)      |

---

## Technology Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS v4
- Charts: Recharts
- CSV Processing: Papa Parse
- File Upload: React Dropzone
- UI Components: shadcn/ui

---

## Machine Learning Features

### Linear Regression Model
- Predicts assessment scores based on cognitive skills
- Provides R-squared and mean squared error metrics
- Shows feature importance for each cognitive skill

### Student Clustering
- Groups students into learning personas using K-means
- Identifies patterns in cognitive and performance data
- Provides actionable insights for educators

### Learning Personas
- High Achiever: Strong across all cognitive skills
- Balanced Learner: Moderate, consistent performance
- Developing Student: Areas for improvement identified

---

## Deployment

Optimized for Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

---

## Summary of Findings

This dashboard empowers educators with:
- Data-driven insights into student cognitive patterns
- Predictive analytics for early intervention
- Visual representations of complex educational data
- Personalized learning recommendations through clustering
- Performance tracking across multiple dimensions

Use this tool to make informed decisions about student support, curriculum adjustments, and personalized learning strategies.

---