# Semiconductor CVD Process & Yield Analysis

A Python-based semiconductor manufacturing data analysis project focused on CVD process parameters, abnormal batch detection, and yield performance.

## Project Overview

This project demonstrates an end-to-end semiconductor manufacturing data analysis workflow using Python.

The objective is to analyze relationships between CVD process parameters and production yield, compare normal and abnormal batches, and visualize process trends.

## Analysis Objectives

- Analyze semiconductor CVD batch data
- Compare Normal vs Abnormal batches
- Investigate process parameters related to Yield
- Perform statistical and correlation analysis
- Analyze batch process trends
- Visualize manufacturing data

## Process Parameters

The dataset includes:

- Temperature
- Pressure
- Gas Flow
- Film Thickness
- Defect Count
- Process Time
- Yield
- Batch Status

## Tools & Technologies

- Python
- Pandas
- NumPy
- Matplotlib
- SciPy
- Exploratory Data Analysis (EDA)
- Statistical Analysis
- Data Visualization

## Analysis Workflow
```text
Raw Manufacturing Data
        ↓
Data Loading & Validation
        ↓
Exploratory Data Analysis
        ↓
Normal vs Abnormal Comparison
        ↓
Statistical Analysis
        ↓
Batch Trend Analysis
        ↓
Data Visualization
        ↓
Process Insight
```markdown
## Project Structure

```text
Semiconductor_Project/

├── README.md
├── analysis.py
├── requirements.txt
├── data/
│   └── semiconductor_process_simulation_500.csv
│
└── images/
    ├── portfolio/
    ├── batch_trends/
    ├── boxplots/
    ├── exploratory/
    └── normal_vs_abnormal.png