# Smart Hotel Booking Engine

**Student:** Sesonga Raphael  
**Student ID:** 28301  
**Project:** Oracle PL/SQL Hotel Management System

## Problem Statement
Manual reservation logs breed double-bookings, lost payments and unhappy guests. This project replaces fragile workflows with a single Oracle-backed engine that updates room state, pricing and guest data in real time.

## Key Objectives
- Automate guest registration and room allocation
- Implement real-time reservation lifecycle management  
- Process payments with full audit trails
- Eliminate double-bookings through database triggers
- Provide role-based access control and security

## Quick Start
1. Run `database/scripts/01_create_database.sql` to set up database
2. Execute `database/scripts/02_create_tables.sql` for table structure
3. Load test data with `database/scripts/03_insert_data.sql`
4. Deploy procedures from `database/scripts/04_procedures.sql`

## Project Structure
```
smart-hotel-booking/
├── database/
│   ├── scripts/
│   └── documentation/
├── queries/
├── business_intelligence/
├── screenshots/
└── documentation/
```

## Documentation Links
- [Data Dictionary](documentation/data_dictionary.md)
- [Architecture](documentation/architecture.md)
- [Business Process Model](documentation/business_process.md)