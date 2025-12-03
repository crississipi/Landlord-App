# Maintenance Scheduling & Documentation Backend - Setup Guide

## Overview

This implementation adds complete backend functionality for the Calendaryo component to:
1. Display maintenance requests that need scheduling
2. Schedule maintenance with date/time selection
3. Display scheduled maintenance on calendar with urgency color indicators
4. Mark maintenance as fixed and redirect to Documentation component
5. Save documentation with images, remarks, and material costs

---

## Database Schema Changes

### New Models Added

#### 1. Enhanced Documentation Model
```prisma
model Documentation {
  docuID            Int         @id @default(autoincrement())
  maintenanceID     Int         @unique
  remarks           String      @db.Text
  inChargeName      String?     @db.VarChar(255)
  inChargeNumber    String?     @db.VarChar(20)
  inChargePayment   Float?
  totalMaterialCost Float?      @default(0)
  dateFixed         DateTime    @default(now())
  dateIssued        DateTime    @default(now())
  maintenance       Maintenance @relation(fields: [maintenanceID], references: [maintenanceId])
  materials         DocumentationMaterial[]
  images            DocumentationImage[]
}
```

#### 2. DocumentationMaterial Model
```prisma
model DocumentationMaterial {
  id              Int           @id @default(autoincrement())
  documentationID Int
  material        String        @db.VarChar(255)
  cost            Float
  documentation   Documentation @relation(fields: [documentationID], references: [docuID], onDelete: Cascade)
}
```

#### 3. DocumentationImage Model
```prisma
model DocumentationImage {
  id              Int           @id @default(autoincrement())
  documentationID Int
  url             String        @db.Text
  fileName        String        @db.VarChar(255)
  createdAt       DateTime      @default(now())
  documentation   Documentation @relation(fields: [documentationID], references: [docuID], onDelete: Cascade)
}
```

---

## Setup Instructions

### Step 1: Database Migration

Run these commands in order:

```bash
# Generate Prisma Client with new schema
npx prisma generate

# Push schema changes to database
npx prisma db push

# Or create a migration (recommended for production)
npx prisma migrate dev --name add_maintenance_documentation_models
```

### Step 2: Verify Database Tables

Check that these new tables were created:
- `DocumentationMaterial`
- `DocumentationImage`
- Updated `Documentation` table with new columns

### Step 3: Environment Variables

Ensure these are set in your `.env` file (for image uploads):
```env
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_github_username
GITHUB_REPO=your_repo_name
GITHUB_BRANCH=main
```

---

## API Routes Created

### 1. `/api/maintenance` (GET, PATCH)
**GET** - Fetch maintenance requests with filters:
- `?status=pending` - Get pending maintenances
- `?status=scheduled` - Get scheduled maintenances
- `?date=2025-12-03` - Get maintenances for specific date
- `?month=12&year=2025` - Get maintenances for specific month
- `?propertyId=1` - Filter by property

**PATCH** - Update maintenance schedule/status

### 2. `/api/maintenance/schedule` (GET, POST)
**POST** - Schedule a maintenance request
```json
{
  "maintenanceId": 1,
  "scheduleDate": "2025-12-03",
  "startTime": "08:00",
  "endTime": "17:00"
}
```

**GET** - Get scheduled maintenances
- `?month=12&year=2025` - Get by month
- `?startDate=2025-12-01&endDate=2025-12-31` - Get by date range

### 3. `/api/maintenance/documentation` (GET, POST, PUT)
**POST** - Create documentation for fixed maintenance
```json
{
  "maintenanceId": 1,
  "remarks": "Fixed the broken faucet...",
  "inChargeName": "John Doe",
  "inChargeNumber": "09123456789",
  "inChargePayment": 500,
  "materials": [
    { "material": "Faucet", "cost": 300 },
    { "material": "Pipe", "cost": 150 }
  ],
  "images": [
    { "url": "https://...", "fileName": "before.jpg" },
    { "url": "https://...", "fileName": "after.jpg" }
  ]
}
```

**GET** - Fetch documentation
- `?maintenanceId=1` - Get by maintenance ID
- `?docuId=1` - Get by documentation ID

**PUT** - Update existing documentation

---

## Component Updates

### 1. Calendaryo Component (`app/components/Calendaryo.tsx`)
**Features:**
- Fetches pending and scheduled maintenances from API
- Displays urgency indicators on calendar dates (color-coded)
- Shows scheduled maintenances for selected date
- Allows scheduling pending maintenances with time selection
- Marks maintenance as fixed (redirects to Documentation)
- Darker colors indicate fixed/completed items

**Usage:**
```tsx
<Calendaryo setPage={setPage} />
```

### 2. Documentation Component (`app/components/Documentation.tsx`)
**Features:**
- Receives `maintenanceId` prop from page navigation
- Fetches maintenance details
- Uploads images to GitHub
- Saves documentation with remarks, materials, and images
- Validates minimum 2 images required
- Shows success message and redirects after save

**Usage:**
```tsx
<Documentation 
  setPage={setPage} 
  setImage={setImage} 
  maintenanceId={selectedMaintenanceId} 
/>
```

### 3. Updated Types (`types/index.ts`)
New TypeScript interfaces:
- `MaintenanceRequest`
- `ScheduledByDate`
- `DocumentationMaterial`
- `DocumentationImage`
- `MaintenanceDocumentation`
- `CalendaryoProps`

---

## Usage Flow

### Scheduling Maintenance

1. User navigates to Maintenance page (page 4)
2. Calendaryo component loads pending maintenances
3. User selects a date on calendar
4. User clicks "+" button on pending maintenance
5. User sets start/end time
6. User clicks "Set Schedule"
7. Maintenance is scheduled and appears on calendar with urgency color

### Marking as Fixed

1. User sees scheduled maintenance on selected date
2. User clicks checkmark (✓) button
3. User is redirected to Documentation page (page 12)
4. `maintenanceId` is passed via `setPage(12, maintenanceId)`

### Creating Documentation

1. Documentation page loads with maintenance details
2. User uploads at least 2 images (before/after)
3. User writes remarks about the fix
4. User optionally adds:
   - Maintenance in-charge details
   - Material costs
5. User clicks "Confirm"
6. Images are uploaded to GitHub
7. Documentation is saved to database
8. Maintenance status is updated to "fixed"
9. User is redirected back to Maintenance page

---

## Urgency Color Mapping

The system uses these colors for urgency levels:

| Urgency | Color | Active | Fixed/Done |
|---------|-------|--------|------------|
| Low | Emerald | `bg-emerald-400` | `bg-emerald-600` |
| Medium | Blue | `bg-blue-400` | `bg-blue-600` |
| High | Orange | `bg-orange-400` | `bg-orange-600` |
| Critical | Red | `bg-red-400` | `bg-red-600` |

Fixed items show darker colors to highlight unfinished tasks.

---

## Testing Checklist

- [ ] Database migration successful
- [ ] Prisma client regenerated
- [ ] Can fetch pending maintenances
- [ ] Can schedule a maintenance
- [ ] Calendar shows urgency indicators
- [ ] Can view scheduled maintenances for a date
- [ ] Can mark maintenance as fixed
- [ ] Documentation page receives maintenanceId
- [ ] Can upload images (GitHub integration working)
- [ ] Can save documentation
- [ ] Maintenance status updates to "fixed"
- [ ] Fixed items show darker colors on calendar

---

## Troubleshooting

### TypeScript Errors in API Routes
**Issue:** Property 'documentations' does not exist on type...

**Solution:** Run `npx prisma generate` to regenerate Prisma client after schema changes.

### Images Not Uploading
**Issue:** Failed to upload images to GitHub

**Solution:** 
1. Check GitHub environment variables in `.env`
2. Verify GitHub token has write permissions
3. Check repository exists and is accessible

### Calendar Not Showing Indicators
**Issue:** No urgency indicators on calendar dates

**Solution:**
1. Check if maintenances have `schedule` field set
2. Verify urgency field is one of: low, medium, high, critical
3. Check browser console for API errors

### Documentation Not Saving
**Issue:** Documentation fails to save

**Solution:**
1. Ensure at least 2 images are uploaded
2. Check remarks field is not empty
3. Verify maintenanceId is being passed correctly
4. Check database foreign key constraints

---

## File Structure

```
app/
├── api/
│   └── maintenance/
│       ├── route.ts                    # GET, PATCH maintenance
│       ├── schedule/
│       │   └── route.ts               # Schedule maintenance
│       └── documentation/
│           └── route.ts               # Create/update documentation
├── components/
│   ├── Calendaryo.tsx                 # Updated with backend integration
│   └── Documentation.tsx              # Updated with backend integration
├── page.tsx                           # Updated to pass maintenanceId
prisma/
└── schema.prisma                      # Updated with new models
types/
└── index.ts                           # New maintenance types added
```

---

## Notes

- The system maintains backward compatibility with existing maintenance data
- All API routes follow the existing coding patterns in the project
- Image uploads use the existing GitHub integration
- The calendar supports up to 4 urgency indicators per day
- Documentation is linked 1:1 with maintenance (unique constraint)

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs for API errors
3. Verify database schema matches Prisma schema
4. Ensure all environment variables are set correctly
