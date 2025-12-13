# Smart Hotel Booking Engine - BPMN Process Models

**Student:** Sesonga Raphael  
**Student ID:** 28301  
**Project:** Oracle PL/SQL Hotel Management System

## Overview

This document contains Business Process Model and Notation (BPMN) diagrams for the Smart Hotel Booking Engine, illustrating key business processes and workflows.

## Core Business Processes

### 1. Guest Registration and Reservation Process

```mermaid
graph TD
    A[Guest Inquiry] --> B{Guest Exists?}
    B -->|No| C[Create Guest Profile]
    B -->|Yes| D[Retrieve Guest Info]
    C --> E[Validate Guest Data]
    D --> F[Check Room Availability]
    E --> F
    F --> G{Room Available?}
    G -->|No| H[Show Alternative Rooms]
    G -->|Yes| I[Create Reservation]
    H --> G
    I --> J[Calculate Total Cost]
    J --> K[Send Confirmation]
    K --> L[Update Room Status to RESERVED]
    L --> M[End: Reservation Confirmed]
```

### 2. Check-in Process

```mermaid
graph TD
    A[Guest Arrives] --> B[Verify Identity]
    B --> C{Reservation Found?}
    C -->|No| D[Manual Reservation Lookup]
    C -->|Yes| E[Validate Check-in Date]
    D --> E
    E --> F{Date Valid?}
    F -->|No| G[Handle Early/Late Check-in]
    F -->|Yes| H[Check Room Status]
    G --> H
    H --> I{Room Ready?}
    I -->|No| J[Room Preparation]
    I -->|Yes| K[Issue Key Card]
    J --> K
    K --> L[Update Reservation Status to CHECKED_IN]
    L --> M[Update Room Status to OCCUPIED]
    M --> N[Welcome Guest]
    N --> O[End: Guest Checked In]
```

### 3. Service Request Process

```mermaid
graph TD
    A[Guest Service Request] --> B[Identify Service Type]
    B --> C{Service Available?}
    C -->|No| D[Suggest Alternatives]
    C -->|Yes| E[Check Service Capacity]
    D --> C
    E --> F{Capacity Available?}
    F -->|No| G[Schedule Later Time]
    F -->|Yes| H[Create Service Order]
    G --> H
    H --> I[Calculate Service Cost]
    I --> J[Add to Guest Bill]
    J --> K[Dispatch Service]
    K --> L[Service Delivery]
    L --> M[Guest Confirmation]
    M --> N[Update Service Status]
    N --> O[End: Service Completed]
```

### 4. Payment Processing Workflow

```mermaid
graph TD
    A[Payment Request] --> B[Calculate Total Amount]
    B --> C[Room Charges]
    B --> D[Service Charges]
    C --> E[Combine Charges]
    D --> E
    E --> F[Present Bill to Guest]
    F --> G[Guest Reviews Bill]
    G --> H{Bill Approved?}
    H -->|No| I[Dispute Resolution]
    H -->|Yes| J[Select Payment Method]
    I --> G
    J --> K{Payment Method}
    K -->|Cash| L[Process Cash Payment]
    K -->|Card| M[Process Card Payment]
    L --> N[Generate Receipt]
    M --> O{Card Approved?}
    O -->|No| P[Payment Failed]
    O -->|Yes| N
    P --> J
    N --> Q[Update Payment Status]
    Q --> R[End: Payment Completed]
```

### 5. Check-out Process

```mermaid
graph TD
    A[Guest Check-out Request] --> B[Retrieve Reservation]
    B --> C[Calculate Final Bill]
    C --> D[Present Bill to Guest]
    D --> E{Payment Required?}
    E -->|Yes| F[Process Payment]
    E -->|No| G[Room Inspection]
    F --> H{Payment Successful?}
    H -->|No| I[Handle Payment Issue]
    H -->|Yes| G
    I --> F
    G --> J{Room Condition OK?}
    J -->|No| K[Assess Damages]
    J -->|Yes| L[Return Key Card]
    K --> M[Additional Charges]
    M --> L
    L --> N[Update Reservation Status to CHECKED_OUT]
    N --> O[Update Room Status to AVAILABLE]
    O --> P[Generate Final Receipt]
    P --> Q[Guest Departure]
    Q --> R[End: Check-out Complete]
```

### 6. Room Maintenance Process

```mermaid
graph TD
    A[Maintenance Request] --> B{Request Type}
    B -->|Scheduled| C[Planned Maintenance]
    B -->|Emergency| D[Urgent Repair]
    C --> E[Update Room Status to MAINTENANCE]
    D --> E
    E --> F[Assign Maintenance Staff]
    F --> G[Perform Maintenance]
    G --> H[Quality Check]
    H --> I{Maintenance Complete?}
    I -->|No| J[Additional Work Required]
    I -->|Yes| K[Update Room Status to AVAILABLE]
    J --> G
    K --> L[Notify Front Desk]
    L --> M[End: Room Ready]
```

### 7. Cancellation Process

```mermaid
graph TD
    A[Cancellation Request] --> B[Retrieve Reservation]
    B --> C[Check Cancellation Policy]
    C --> D{Within Free Cancellation?}
    D -->|Yes| E[Full Refund]
    D -->|No| F[Calculate Penalty]
    E --> G[Process Refund]
    F --> H{Penalty Accepted?}
    H -->|No| I[Negotiate Terms]
    H -->|Yes| J[Partial Refund]
    I --> H
    G --> K[Update Reservation Status to CANCELLED]
    J --> K
    K --> L[Release Room]
    L --> M[Update Room Status to AVAILABLE]
    M --> N[Send Cancellation Confirmation]
    N --> O[End: Cancellation Processed]
```

### 8. Business Hours Validation Process

```mermaid
graph TD
    A[System Operation Request] --> B[Check Current Day]
    B --> C{Weekday?}
    C -->|Yes| D[Check Holiday Calendar]
    C -->|No| E[Allow Operation]
    D --> F{Holiday?}
    F -->|Yes| G[Block Operation]
    F -->|No| G
    E --> H[Execute Operation]
    G --> I[Return Error Message]
    H --> J[Log Operation]
    I --> K[End: Operation Blocked]
    J --> L[End: Operation Completed]
```

## Swimlane Diagrams

### Guest Check-in Process (Multi-Actor)

```mermaid
graph TD
    subgraph "Guest"
        A1[Arrive at Hotel]
        A2[Provide ID]
        A3[Receive Key Card]
    end
    
    subgraph "Front Desk Staff"
        B1[Greet Guest]
        B2[Verify Reservation]
        B3[Check Room Status]
        B4[Issue Key Card]
        B5[Explain Hotel Services]
    end
    
    subgraph "System"
        C1[Lookup Reservation]
        C2[Validate Check-in Date]
        C3[Update Reservation Status]
        C4[Update Room Status]
        C5[Generate Audit Log]
    end
    
    subgraph "Housekeeping"
        D1[Confirm Room Ready]
        D2[Final Room Check]
    end
    
    A1 --> B1
    B1 --> A2
    A2 --> B2
    B2 --> C1
    C1 --> C2
    C2 --> B3
    B3 --> D1
    D1 --> D2
    D2 --> B4
    B4 --> C3
    C3 --> C4
    C4 --> C5
    B4 --> A3
    A3 --> B5
```

### Payment Processing (Multi-System)

```mermaid
graph TD
    subgraph "Hotel System"
        A1[Calculate Bill]
        A2[Present to Guest]
        A3[Process Payment]
        A4[Update Records]
    end
    
    subgraph "Payment Gateway"
        B1[Validate Card]
        B2[Process Transaction]
        B3[Return Result]
    end
    
    subgraph "Bank System"
        C1[Authorize Payment]
        C2[Transfer Funds]
        C3[Send Confirmation]
    end
    
    subgraph "Audit System"
        D1[Log Transaction]
        D2[Generate Receipt]
        D3[Archive Records]
    end
    
    A1 --> A2
    A2 --> A3
    A3 --> B1
    B1 --> C1
    C1 --> C2
    C2 --> B2
    B2 --> B3
    B3 --> A4
    A4 --> D1
    D1 --> D2
    D2 --> D3
```

## Exception Handling Processes

### No-Show Handling

```mermaid
graph TD
    A[Daily No-Show Check] --> B[Query Overdue Reservations]
    B --> C{Reservations Found?}
    C -->|No| D[End: No Action Required]
    C -->|Yes| E[For Each Reservation]
    E --> F[Check Grace Period]
    F --> G{Grace Period Expired?}
    G -->|No| H[Skip Reservation]
    G -->|Yes| I[Mark as No-Show]
    I --> J[Cancel Reservation]
    J --> K[Release Room]
    K --> L[Apply No-Show Penalty]
    L --> M[Send Notification]
    H --> N{More Reservations?}
    M --> N
    N -->|Yes| E
    N -->|No| O[End: No-Show Processing Complete]
```

### System Error Recovery

```mermaid
graph TD
    A[System Error Detected] --> B[Log Error Details]
    B --> C{Error Type}
    C -->|Database| D[Database Recovery]
    C -->|Network| E[Network Retry]
    C -->|Application| F[Application Restart]
    D --> G[Restore Connection]
    E --> H[Retry Operation]
    F --> I[Reload Application]
    G --> J{Recovery Successful?}
    H --> J
    I --> J
    J -->|Yes| K[Resume Normal Operation]
    J -->|No| L[Escalate to Admin]
    K --> M[End: System Recovered]
    L --> N[Manual Intervention]
    N --> O[End: Manual Resolution]
```

## Compliance and Audit Processes

### Audit Trail Generation

```mermaid
graph TD
    A[Database Operation] --> B[Capture Operation Details]
    B --> C[Identify User]
    C --> D[Record Timestamp]
    D --> E[Capture Old Values]
    E --> F[Capture New Values]
    F --> G[Generate Audit Record]
    G --> H[Store in Audit Log]
    H --> I{Storage Successful?}
    I -->|Yes| J[End: Audit Recorded]
    I -->|No| K[Retry Storage]
    K --> L{Retry Successful?}
    L -->|Yes| J
    L -->|No| M[Alert Administrator]
    M --> N[End: Audit Failed]
```

### Data Retention Process

```mermaid
graph TD
    A[Monthly Data Review] --> B[Identify Old Records]
    B --> C{Records > Retention Period?}
    C -->|No| D[End: No Action Required]
    C -->|Yes| E[Create Archive]
    E --> F[Backup Old Data]
    F --> G[Verify Backup]
    G --> H{Backup Valid?}
    H -->|No| I[Retry Backup]
    H -->|Yes| J[Delete Old Records]
    I --> G
    J --> K[Update Retention Log]
    K --> L[End: Data Archived]
```

## Performance Monitoring Processes

### System Health Check

```mermaid
graph TD
    A[Scheduled Health Check] --> B[Check Database Connection]
    B --> C[Check API Response Times]
    C --> D[Check Disk Space]
    D --> E[Check Memory Usage]
    E --> F[Compile Health Report]
    F --> G{All Systems Healthy?}
    G -->|Yes| H[Log Success]
    G -->|No| I[Identify Issues]
    I --> J[Send Alerts]
    J --> K[Attempt Auto-Recovery]
    K --> L{Recovery Successful?}
    L -->|Yes| H
    L -->|No| M[Escalate to Support]
    H --> N[End: Health Check Complete]
    M --> O[End: Manual Intervention Required]
```

## Integration Points

### External System Integration

```mermaid
graph TD
    A[External Request] --> B[Validate Request]
    B --> C{Valid Request?}
    C -->|No| D[Return Error]
    C -->|Yes| E[Transform Data]
    E --> F[Process Business Logic]
    F --> G[Update Database]
    G --> H[Transform Response]
    H --> I[Send Response]
    I --> J[Log Transaction]
    J --> K[End: Integration Complete]
    D --> L[End: Request Rejected]
```

---

*These BPMN diagrams provide a comprehensive view of all business processes in the Smart Hotel Booking Engine, ensuring clear understanding of workflows and decision points.*