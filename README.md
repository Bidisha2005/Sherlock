# PBL Program Intelligence & Grant Reporting Assistant

A full-stack web application for education program managers to monitor Project-Based Learning (PBL) implementation across schools and generate data-driven grant reports.

## 🎯 Overview

This application helps education program teams transform raw school-level implementation data into actionable insights for monthly reviews and grant reporting. It provides:

- **Program Intelligence Dashboard**: Real-time monitoring of school participation, attendance, evidence submission, and performance across districts and blocks
- **Deterministic Risk Engine**: Automatic classification of performance using traffic-light thresholds (On Track, Behind, At Risk, Critical)
- **Grant Reporting Assistant**: Generate comprehensive, traceable reports with financial data, milestone tracking, and evidence assets
- **Data Traceability**: Every metric and narrative fact is linked to its source data

## ✨ Features

### Tier 1: Core Features

#### 📊 Program Review Dashboard
- **Interactive Filters**: Filter by month, district, block, grade, and subject
- **KPI Cards**: View total schools, participation rate, evidence rate, attendance rate, and enrollment with month-over-month trends
- **Performance Rankings**: See top and bottom performing districts and blocks
- **Risk Classification**: Automatic risk assessment using deterministic rules:
  - 🟢 **On Track**: ≥ 75%
  - 🟡 **Behind**: 60% - 74%
  - 🟠 **At Risk**: 35% - 59%
  - 🔴 **Critical**: < 35%

#### 📄 Grant Reporting Assistant
- **Grant Selection**: Choose from available grants and reporting months
- **Fact Panel**: View performance metrics, milestone progress, financial summary, and risks
- **Evidence Gallery**: Display synthetic evidence assets with status badges
- **Narrative Generation**: Auto-generated report narrative with three views:
  - Summary View: Quick overview with color-coded sections
  - Detailed View: Full breakdown of all narrative components
  - Source Traceability: See exactly where each fact originated

### Tier 2: Enhancements

#### 📋 Monthly Review Summary
- Structured program review document
- Achievements, month-over-month changes, risks, and priority districts/blocks
- Discussion points for leadership meetings

#### 🔍 Program Reporting Assistant
- Generate concise narratives for specific months, districts, or blocks
- Citation of facts used in the narrative

#### 📤 Report Export
- Copy-ready program summaries
- Exportable grant report sections


## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Zustand

### Backend
- **API**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **ORM**: Raw SQL (lightweight, no ORM overhead)
- **File Processing**: Papa Parse for CSV parsing

### Development Tools
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Formatting**: Prettier
- **Build Tool**: Next.js built-in

## 📦 Installation

### Prerequisites
- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/pbl-intelligence-app.git
cd pbl-intelligence-app