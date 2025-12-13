# Smart Hotel Booking Engine - Dashboard UI Generation Prompt

## Project Context
Create a modern, responsive dashboard UI for the Smart Hotel Booking Engine - an Oracle PL/SQL-based hotel management system that automates guest registration, room allocation, payments, and eliminates double-bookings through real-time database integration.

## Dashboard Requirements

### 1. Executive Dashboard
**Primary Users:** Hotel Management, Executives
**Key Metrics to Display:**
- Occupancy Rate (current: XX%)
- Average Daily Rate (ADR): $XXX
- Revenue Per Available Room (RevPAR): $XXX
- Daily/Monthly/YTD Revenue: $X,XXX / $XX,XXX / $XXX,XXX
- Guest Satisfaction Score
- Booking Conversion Rate

**Visual Elements:**
- Large KPI cards with trend indicators (↑↓)
- Revenue trend line chart (last 30 days)
- Occupancy donut chart
- Monthly comparison bar chart

### 2. Operations Dashboard
**Primary Users:** Front Desk, Operations Team
**Real-time Components:**
- Room Status Grid (Available/Occupied/Reserved/Maintenance)
- Today's Check-ins/Check-outs list
- Pending Payments alert panel
- Service Requests queue
- Live reservation timeline

**Interactive Features:**
- Click room numbers to view details
- Quick check-in/check-out buttons
- Payment processing shortcuts
- Service request assignment

### 3. Financial Dashboard
**Primary Users:** Finance Department, Accounting
**Financial Metrics:**
- Revenue by room type (pie chart)
- Payment method distribution
- Outstanding payments table
- Daily cash flow graph
- Service revenue contribution

**Data Tables:**
- Recent transactions (sortable/filterable)
- Pending payments with aging
- Refund/cancellation tracking

### 4. Guest Analytics Dashboard
**Primary Users:** Marketing, Customer Relations
**Customer Insights:**
- Guest loyalty distribution (VIP/Gold/Silver/New)
- Repeat customer rate
- Booking patterns heatmap
- Service preferences analysis
- Customer lifetime value metrics

### 5. Business Intelligence & Analytics Dashboard
**Primary Users:** Data Analysts, Strategic Planning, Management
**Advanced Analytics:**
- Predictive occupancy forecasting (next 30/90 days)
- Revenue optimization recommendations
- Market trend analysis and competitive positioning
- Seasonal demand patterns with ML predictions
- Customer segmentation with behavioral clustering
- Price elasticity analysis and dynamic pricing suggestions

**Interactive BI Components:**
- Drill-down capability from summary to detailed views
- Custom date range selectors with comparison periods
- Cohort analysis for guest retention tracking
- A/B testing results for marketing campaigns
- What-if scenario modeling for pricing strategies

**Advanced KPIs & Metrics:**
- Customer Acquisition Cost (CAC) by channel
- Lifetime Value to CAC ratio (LTV:CAC)
- Net Promoter Score (NPS) trending
- Market share analysis vs competitors
- Booking lead time distribution
- Cancellation rate by booking source
- Service attachment rate and cross-selling success
- Staff productivity metrics and labor cost per room

**Automated Reports:**
- Daily operational summary (auto-generated at 6 AM)
- Weekly performance digest (sent to management)
- Monthly financial statements with variance analysis
- Quarterly business review with strategic insights
- Annual trend analysis and forecasting report

**Data Visualization Types:**
- Sankey diagrams for customer journey mapping
- Heat maps for occupancy patterns by day/season
- Scatter plots for price vs demand correlation
- Funnel charts for booking conversion analysis
- Waterfall charts for revenue breakdown
- Box plots for rate distribution analysis
- Geographic maps for guest origin tracking

## Technical Specifications

### Technology Stack
- **Frontend:** React.js with TypeScript
- **UI Framework:** Material-UI or Ant Design
- **Charts:** Chart.js or Recharts
- **State Management:** Redux Toolkit
- **API Integration:** Axios for Oracle REST API calls
- **Responsive Design:** CSS Grid/Flexbox

### Database Integration
**Oracle PL/SQL Backend Connection:**
- REST API endpoints for real-time data
- WebSocket for live updates (room status, new bookings)
- Stored procedures integration for:
  - get_occupancy_stats()
  - get_revenue_summary()
  - get_room_status_grid()
  - get_pending_payments()
  - get_bi_analytics_data()
  - get_predictive_metrics()
  - generate_automated_reports()
  - get_kpi_benchmarks()

**BI Data Pipeline:**
- ETL processes for data warehouse integration
- Real-time streaming analytics for live KPIs
- Historical data aggregation for trend analysis
- Machine learning model integration for predictions
- External data source connectors (market data, weather, events)

### UI/UX Design Guidelines

**Color Scheme:**
- Primary: Hotel brand blue (#1976D2)
- Success: Green (#4CAF50) for available rooms
- Warning: Orange (#FF9800) for pending items
- Error: Red (#F44336) for maintenance/issues
- Neutral: Gray (#757575) for inactive elements

**Layout Structure:**
```
Header: Logo + User Profile + Notifications
Sidebar: Dashboard Navigation Menu
Main Content: Grid-based dashboard widgets
Footer: System status + Last updated timestamp
```

**Responsive Breakpoints:**
- Desktop: 1200px+ (4-column grid)
- Tablet: 768px-1199px (2-column grid)
- Mobile: <768px (1-column stack)

### Key Components to Generate

1. **KPI Card Component**
   - Metric value with trend indicator
   - Comparison to previous period
   - Color-coded performance status

2. **Room Status Grid**
   - Visual room layout representation
   - Color-coded status indicators
   - Hover tooltips with guest info

3. **Revenue Chart Component**
   - Multi-line chart for trends
   - Date range selector
   - Export functionality

4. **Data Table Component**
   - Sortable columns
   - Search/filter capabilities
   - Pagination for large datasets

5. **Alert/Notification Panel**
   - Priority-based color coding
   - Dismissible notifications
   - Action buttons for quick resolution

6. **BI Analytics Components**
   - Interactive pivot tables with drag-drop functionality
   - Advanced filtering with multi-dimensional slicing
   - Predictive analytics widgets with confidence intervals
   - Automated insight generation with natural language summaries
   - Custom report builder with template library

7. **KPI Scorecard Component**
   - Traffic light indicators (Red/Yellow/Green)
   - Benchmark comparisons vs industry standards
   - Goal tracking with progress bars
   - Historical performance trending
   - Drill-down capability to root cause analysis

### Sample Data Structure
```javascript
// KPI Data
{
  occupancyRate: 85.5,
  occupancyTrend: 2.3,
  dailyRevenue: 12450.00,
  revenueTrend: -1.2,
  totalRooms: 120,
  availableRooms: 18
}

// Room Status Data
{
  roomId: 101,
  roomNumber: "101",
  status: "OCCUPIED",
  guestName: "Josiane Uwimana",
  checkOut: "2024-01-15",
  roomType: "DELUXE"
}

// BI Analytics Data
{
  predictiveOccupancy: {
    next30Days: [78.2, 82.1, 85.5, 89.3],
    confidence: 0.87,
    seasonalFactor: 1.15
  },
  customerSegments: {
    business: { percentage: 45, avgStay: 2.1, revenue: 125000 },
    leisure: { percentage: 55, avgStay: 3.8, revenue: 185000 }
  },
  kpiScorecard: {
    occupancyTarget: 80,
    occupancyCurrent: 85.5,
    status: "GREEN",
    variance: 5.5
  }
}

// Report Metadata
{
  reportId: "monthly_performance_2024_01",
  generatedAt: "2024-01-31T23:59:59Z",
  reportType: "AUTOMATED",
  recipients: ["management@hotel.com"],
  format: "PDF",
  status: "DELIVERED"
}
```

### Performance Requirements
- Initial load time: <3 seconds
- Real-time updates: Every 30 seconds
- Chart rendering: <1 second
- Mobile responsiveness: All screen sizes
- Offline capability: Show cached data with indicators

### Security Considerations
- Role-based dashboard access
- Secure API authentication
- Data masking for sensitive information
- Audit trail for dashboard actions

### Accessibility Features
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode option
- Font size adjustment controls

## Deliverables Expected
1. Complete React dashboard application
2. Responsive CSS styling
3. Interactive chart components
4. Real-time data integration
5. Mobile-optimized interface
6. User authentication system
7. Export/print functionality
8. Documentation and setup guide
9. **BI & Analytics Module:**
   - Advanced analytics dashboard with predictive capabilities
   - Custom report builder with drag-drop interface
   - Automated report scheduling and distribution system
   - KPI scorecard with benchmark comparisons
   - Interactive data exploration tools
   - Machine learning insights integration
   - Executive summary generator with natural language insights
10. **Reporting Engine:**
    - Template-based report generation
    - Multi-format export (PDF, Excel, PowerPoint)
    - Scheduled report delivery via email
    - Report versioning and audit trail
    - Custom branding and white-label options

Generate a production-ready dashboard that provides hotel staff with comprehensive, real-time insights into operations, finances, and guest management while maintaining excellent user experience across all devices.