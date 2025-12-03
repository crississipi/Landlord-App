# Quick Start Guide - Maintenance Backend

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration
```bash
npx prisma generate
npx prisma db push
```

### Step 2: Verify Environment Variables
Check your `.env` file has:
```env
GITHUB_TOKEN=your_token_here
GITHUB_USERNAME=your_username
GITHUB_REPO=your_repo_name
GITHUB_BRANCH=main
```

### Step 3: Start Your Server
```bash
npm run dev
```

That's it! Your maintenance scheduling and documentation system is ready.

---

## ✅ What You Can Do Now

### 1. View Pending Maintenances
Navigate to **Maintenance Page** (page 4) to see all pending maintenance requests.

### 2. Schedule a Maintenance
1. Click on a date in the calendar
2. Find a pending maintenance in the list below
3. Click the **+** button
4. Set start and end times
5. Click **"Set Schedule"**

### 3. View Scheduled Maintenances
- Calendar shows color-coded urgency indicators
- Click any date to see scheduled items for that day
- **Green** = Low urgency
- **Blue** = Medium urgency
- **Orange** = High urgency
- **Red** = Critical urgency

### 4. Mark as Fixed
1. Click the **✓** button on a scheduled maintenance
2. You'll be redirected to the Documentation page

### 5. Create Documentation
1. Upload at least 2 images (before/after)
2. Write remarks about the fix
3. Optionally add maintenance in-charge details
4. Optionally add material costs
5. Click **"Confirm"**

---

## 🎨 UI Features

### Calendar View
- **Color indicators** show urgency levels on each date
- **Darker colors** indicate fixed/completed items
- **Up to 4 indicators** per day (most urgent shown)
- Click dates to view schedules

### Pending List
- Shows all unscheduled maintenance requests
- Expandable to show full details
- Time picker for scheduling

### Scheduled List
- Shows time and tenant name
- Checkmark button to mark as fixed
- Color-coded by urgency

### Documentation Form
- Maintenance details header
- Image upload (drag & drop or click)
- Rich text remarks field
- Material cost calculator
- Auto-saves to database

---

## 📊 Data Flow

```
Pending Maintenance
    ↓
Schedule (set date/time)
    ↓
Scheduled Maintenance (appears on calendar)
    ↓
Mark as Fixed (click ✓)
    ↓
Documentation Page
    ↓
Save Documentation (images + remarks)
    ↓
Status: Fixed (darker color on calendar)
```

---

## 🔍 Testing Your Setup

### Test 1: Fetch Pending Maintenances
Open browser console and run:
```javascript
fetch('/api/maintenance?status=pending')
  .then(r => r.json())
  .then(console.log)
```

### Test 2: Check Calendar Data
```javascript
fetch('/api/maintenance/schedule?month=12&year=2025')
  .then(r => r.json())
  .then(console.log)
```

### Test 3: Verify Database
Check your database for these tables:
- `Documentation` (updated with new columns)
- `DocumentationMaterial` (new)
- `DocumentationImage` (new)

---

## 🐛 Common Issues

### Issue: TypeScript errors in API routes
**Fix:** Run `npx prisma generate`

### Issue: Calendar not showing data
**Fix:** Check browser console for API errors. Verify database has maintenance records with `schedule` field.

### Issue: Images not uploading
**Fix:** Verify GitHub environment variables are correct.

### Issue: Documentation not saving
**Fix:** Ensure at least 2 images are uploaded and remarks field is filled.

---

## 📚 Documentation Files

- **MAINTENANCE_BACKEND_SETUP.md** - Complete setup guide
- **API_REFERENCE_MAINTENANCE.md** - API endpoint documentation
- **QUICK_START_MAINTENANCE.md** - This file

---

## 🎯 Next Steps

1. Test the complete flow with sample data
2. Customize urgency colors if needed
3. Add more validation rules as required
4. Integrate with notification system
5. Add export/reporting features

---

## 💡 Tips

- **Urgency levels** are set when maintenance is created (from tenant app)
- **Fixed items** show darker colors to highlight pending work
- **Material costs** are automatically totaled
- **Images** are stored on GitHub for reliability
- **Documentation** is linked 1:1 with maintenance

---

## 🆘 Need Help?

1. Check the browser console for errors
2. Check server logs for API errors
3. Verify database schema matches Prisma schema
4. Review the setup guide for missed steps
5. Check that all environment variables are set

---

**Happy Coding! 🎉**
