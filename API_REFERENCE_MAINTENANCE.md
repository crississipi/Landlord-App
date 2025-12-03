# Maintenance API Reference

## Base URL
All endpoints are relative to your application's base URL.

---

## Endpoints

### 1. Get Maintenance Requests

**Endpoint:** `GET /api/maintenance`

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by status (pending, scheduled, fixed) | `?status=pending` |
| `date` | string | Filter by specific date (YYYY-MM-DD) | `?date=2025-12-03` |
| `month` | number | Filter by month (1-12) | `?month=12` |
| `year` | number | Filter by year | `?year=2025` |
| `propertyId` | number | Filter by property | `?propertyId=1` |
| `maintenanceId` | number | Get specific maintenance | `?maintenanceId=1` |

**Response:**
```json
{
  "success": true,
  "maintenances": [
    {
      "maintenanceId": 1,
      "userId": 5,
      "propertyId": 2,
      "rawRequest": "Broken faucet in bathroom",
      "processedRequest": "Broken Faucet",
      "urgency": "high",
      "urgencyColor": "orange",
      "status": "pending",
      "schedule": null,
      "dateIssued": "2025-12-01T10:30:00.000Z",
      "isFixed": false,
      "tenantName": "John Doe",
      "user": {
        "userID": 5,
        "firstName": "John",
        "lastName": "Doe",
        "propertyId": 2
      },
      "property": {
        "propertyId": 2,
        "name": "Unit 101"
      }
    }
  ]
}
```

---

### 2. Update Maintenance

**Endpoint:** `PATCH /api/maintenance`

**Request Body:**
```json
{
  "maintenanceId": 1,
  "schedule": "2025-12-05T08:00:00.000Z",
  "status": "scheduled"
}
```

**Response:**
```json
{
  "success": true,
  "maintenance": {
    "maintenanceId": 1,
    "schedule": "2025-12-05T08:00:00.000Z",
    "status": "scheduled",
    ...
  }
}
```

---

### 3. Schedule Maintenance

**Endpoint:** `POST /api/maintenance/schedule`

**Request Body:**
```json
{
  "maintenanceId": 1,
  "scheduleDate": "2025-12-05",
  "startTime": "08:00",
  "endTime": "17:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance scheduled successfully",
  "maintenance": {
    "maintenanceId": 1,
    "schedule": "2025-12-05T08:00:00.000Z",
    "status": "scheduled",
    ...
  }
}
```

---

### 4. Get Scheduled Maintenances

**Endpoint:** `GET /api/maintenance/schedule`

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `month` | number | Month (1-12) | `?month=12` |
| `year` | number | Year | `?year=2025` |
| `startDate` | string | Start date (YYYY-MM-DD) | `?startDate=2025-12-01` |
| `endDate` | string | End date (YYYY-MM-DD) | `?endDate=2025-12-31` |

**Response:**
```json
{
  "success": true,
  "scheduled": [...],
  "groupedByDate": {
    "2025-12-05": [
      {
        "maintenanceId": 1,
        "urgencyColor": "orange",
        "isFixed": false,
        ...
      }
    ],
    "2025-12-10": [...]
  }
}
```

---

### 5. Create Documentation

**Endpoint:** `POST /api/maintenance/documentation`

**Request Body:**
```json
{
  "maintenanceId": 1,
  "remarks": "Replaced the broken faucet with a new one. Fixed the leaking pipe connection.",
  "inChargeName": "John Maintenance",
  "inChargeNumber": "09123456789",
  "inChargePayment": 500,
  "materials": [
    {
      "material": "Faucet",
      "cost": 300
    },
    {
      "material": "Pipe connector",
      "cost": 150
    }
  ],
  "images": [
    {
      "url": "https://raw.githubusercontent.com/user/repo/main/maintenance-docs/1/before.jpg",
      "fileName": "before.jpg"
    },
    {
      "url": "https://raw.githubusercontent.com/user/repo/main/maintenance-docs/1/after.jpg",
      "fileName": "after.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documentation created successfully",
  "documentation": {
    "docuID": 1,
    "maintenanceID": 1,
    "remarks": "Replaced the broken faucet...",
    "inChargeName": "John Maintenance",
    "inChargeNumber": "09123456789",
    "inChargePayment": 500,
    "totalMaterialCost": 450,
    "dateFixed": "2025-12-05T14:30:00.000Z",
    "materials": [...],
    "images": [...],
    "maintenance": {...}
  }
}
```

---

### 6. Get Documentation

**Endpoint:** `GET /api/maintenance/documentation`

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `maintenanceId` | number | Get by maintenance ID | `?maintenanceId=1` |
| `docuId` | number | Get by documentation ID | `?docuId=1` |

**Response:**
```json
{
  "success": true,
  "documentation": {
    "docuID": 1,
    "maintenanceID": 1,
    "remarks": "...",
    "materials": [
      {
        "id": 1,
        "material": "Faucet",
        "cost": 300
      }
    ],
    "images": [
      {
        "id": 1,
        "url": "https://...",
        "fileName": "before.jpg"
      }
    ],
    "maintenance": {...}
  }
}
```

---

### 7. Update Documentation

**Endpoint:** `PUT /api/maintenance/documentation`

**Request Body:**
```json
{
  "docuId": 1,
  "remarks": "Updated remarks...",
  "inChargeName": "Updated Name",
  "materials": [...],
  "images": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documentation updated successfully",
  "documentation": {...}
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing required fields)
- `404` - Not Found
- `409` - Conflict (e.g., documentation already exists)
- `500` - Internal Server Error

---

## Usage Examples

### Example 1: Get All Pending Maintenances
```javascript
const response = await fetch('/api/maintenance?status=pending');
const data = await response.json();
console.log(data.maintenances);
```

### Example 2: Schedule a Maintenance
```javascript
const response = await fetch('/api/maintenance/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    maintenanceId: 1,
    scheduleDate: '2025-12-05',
    startTime: '08:00',
    endTime: '17:00'
  })
});
const data = await response.json();
```

### Example 3: Get Maintenances for a Specific Date
```javascript
const response = await fetch('/api/maintenance?date=2025-12-05&status=scheduled');
const data = await response.json();
```

### Example 4: Create Documentation
```javascript
// First upload images
const imageResponse = await fetch('/api/upload-images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    images: [
      { name: 'before.jpg', content: base64Content }
    ],
    folderName: 'maintenance-docs/1'
  })
});
const { urls } = await imageResponse.json();

// Then create documentation
const docResponse = await fetch('/api/maintenance/documentation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    maintenanceId: 1,
    remarks: 'Fixed the issue',
    images: urls.map((url, idx) => ({
      url,
      fileName: `image-${idx}.jpg`
    }))
  })
});
```

---

## Notes

- All dates should be in ISO 8601 format
- Times are in 24-hour format (HH:MM)
- Images must be uploaded to GitHub before creating documentation
- A maintenance can only have one documentation (unique constraint)
- Scheduling a maintenance automatically updates its status to "scheduled"
- Creating documentation automatically updates maintenance status to "fixed"
