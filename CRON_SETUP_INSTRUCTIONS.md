# Automatic Rent Billing - CRON Setup Instructions

This document provides detailed instructions for setting up automatic rent billing emails using a CRON service. The system will automatically send rent billing emails to tenants on their move-in anniversary date each month.

## How It Works

1. The system checks all active tenants daily
2. If today's date matches the day of the month when a tenant moved in (e.g., tenant moved in on Nov 12, billing is sent on Dec 12, Jan 12, etc.)
3. A rent billing is automatically created and emailed to the tenant
4. The system prevents duplicate billings for the same month

## Prerequisites

1. **Set tenant move-in dates** in the database (`moveInDate` field in Users table)
2. **Set tenant unit numbers** in the database (`unitNumber` field in Users table)
3. **Configure email settings** in `.env` file

## Environment Variables

Add the following to your `.env` file:

```env
# CRON Security (generate a random string)
CRON_SECRET=your-secure-random-string-here

# Email Configuration (already configured)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Rodriguez Properties Management
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

## Option 1: Using Vercel Cron Jobs (Recommended for Vercel Deployments)

### Step 1: Create vercel.json

Create or update `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/rent-billing",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This runs the cron job daily at 8:00 AM UTC.

### Step 2: Add CRON_SECRET to Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add `CRON_SECRET` with a secure random value
4. Redeploy your application

### Step 3: Verify Cron Job

After deployment, Vercel will automatically call your endpoint daily. Check the Vercel logs to verify it's working.

---

## Option 2: Using cron-job.org (Free External Service)

### Step 1: Create Account

1. Go to [https://cron-job.org](https://cron-job.org)
2. Create a free account

### Step 2: Create New Cron Job

1. Click "CREATE CRONJOB"
2. Fill in the details:
   - **Title**: Landlord App - Rent Billing
   - **URL**: `https://your-domain.com/api/cron/rent-billing`
   - **Schedule**: Custom → `0 8 * * *` (runs at 8 AM daily)
   - **Request Method**: GET

### Step 3: Add Authorization Header

1. In the "Advanced" section
2. Add a custom header:
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer your-cron-secret-here`

### Step 4: Save and Enable

1. Click "CREATE"
2. Make sure the job is enabled

---

## Option 3: Using Upstash QStash (Serverless-Friendly)

### Step 1: Create Upstash Account

1. Go to [https://upstash.com](https://upstash.com)
2. Create an account and set up QStash

### Step 2: Create Scheduled Job

```bash
curl -X POST "https://qstash.upstash.io/v2/schedules" \
  -H "Authorization: Bearer YOUR_QSTASH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "https://your-domain.com/api/cron/rent-billing",
    "cron": "0 8 * * *",
    "headers": {
      "Authorization": "Bearer your-cron-secret-here"
    }
  }'
```

---

## Option 4: Using Railway Cron (If Hosted on Railway)

### Step 1: Add Cron Service

1. In your Railway project, add a new service
2. Select "Cron Job"
3. Configure:
   - **Schedule**: `0 8 * * *`
   - **Command**: `curl -X GET https://your-domain.com/api/cron/rent-billing -H "Authorization: Bearer $CRON_SECRET"`

---

## Option 5: Using GitHub Actions (Free)

### Step 1: Create Workflow File

Create `.github/workflows/rent-billing-cron.yml`:

```yaml
name: Daily Rent Billing

on:
  schedule:
    # Runs at 8:00 AM UTC every day
    - cron: '0 8 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  trigger-rent-billing:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Rent Billing API
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/cron/rent-billing" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add secrets:
   - `APP_URL`: Your deployed app URL (e.g., `https://your-app.vercel.app`)
   - `CRON_SECRET`: Your cron secret from `.env`

---

## Testing the Cron Endpoint

### Manual Test via Browser/Postman

```bash
# Without authentication (will fail if CRON_SECRET is set)
curl https://your-domain.com/api/cron/rent-billing

# With authentication
curl https://your-domain.com/api/cron/rent-billing \
  -H "Authorization: Bearer your-cron-secret-here"
```

### Expected Response

```json
{
  "success": true,
  "message": "Processed 3 tenant(s) for rent billing",
  "date": "2024-12-05T08:00:00.000Z",
  "currentDay": 5,
  "results": [
    {
      "userID": 1,
      "name": "John Doe",
      "success": true
    },
    {
      "userID": 2,
      "name": "Jane Smith",
      "success": true
    }
  ]
}
```

---

## Setting Tenant Move-In Dates

To set a tenant's move-in date, you can:

### Option 1: Direct Database Update

```sql
UPDATE Users 
SET moveInDate = '2024-11-12', unitNumber = '101'
WHERE userID = 1;
```

### Option 2: Create an API Endpoint

You may want to create an admin endpoint to update tenant move-in dates:

```typescript
// Example: PUT /api/tenants/[id]/move-in-date
```

---

## Monitoring & Logs

1. **Check Vercel Logs**: Go to your Vercel dashboard → Deployments → Functions tab
2. **Check Database**: Query `RentBillingLog` table to see billing history
3. **Email Delivery**: Check your email provider's delivery logs

---

## Troubleshooting

### Issue: Cron job not triggering

- Verify the URL is correct and accessible
- Check if CRON_SECRET matches in both places
- Ensure the server is running

### Issue: Emails not sending

- Verify EMAIL_* environment variables
- Check if tenant has a valid email address
- Check email provider's sending limits

### Issue: Duplicate billings

- The system automatically prevents duplicates via `RentBillingLog`
- Check the log table for existing entries

---

## Database Migration Required

Before using this feature, run the Prisma migration:

```bash
npx prisma migrate dev --name add_billing_payment_features
npx prisma generate
```

This will create the necessary tables and fields:
- `moveInDate` and `unitNumber` in Users table
- `billingType`, `paymentStatus`, `amountPaid`, `dueDate` in Billing table
- `Payment` table for tracking payments
- `RentBillingLog` table for tracking automatic rent billings
