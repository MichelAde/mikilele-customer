# Mikilele Events - Admin Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Marketing Campaigns](#marketing-campaigns)
3. [Events Management](#events-management)
4. [School Management](#school-management)
5. [User Management](#user-management)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Admin Dashboard Access
- URL: https://mikilele-customer.vercel.app/admin
- Login: Use your admin account credentials

### Dashboard Overview
The admin dashboard provides access to:
- **Marketing Campaigns**: Email/SMS/WhatsApp automation
- **Events Admin**: Ticket sales, passes, analytics
- **School Admin**: Courses, enrollments, attendance
- **Analytics**: Revenue tracking and performance metrics

---

## Marketing Campaigns

### Creating a Campaign

1. **Navigate to Campaigns**
   - Click "Marketing Campaigns" from admin dashboard
   - Click "Create Campaign"

2. **Fill Campaign Details**
   - **Name**: Internal name for the campaign
   - **Subject Line**: Email subject (visible to recipients)
   - **Type**: Email, SMS, or WhatsApp
   - **Status**: Draft or Active

3. **Create Campaign Steps**
   - Click "Build Campaign" on your created campaign
   - Add steps: Email, SMS, or WhatsApp messages
   - Set delays between steps (e.g., "2 days after previous step")
   - Save each step

4. **Create Audience Segment**
   - Go to "Audience Segments"
   - Click "Create Segment"
   - Set filters:
     - Event attendance
     - Pass ownership
     - Enrollment status
     - Custom criteria
   - Save segment

5. **Link Segment to Campaign**
   - Edit your campaign
   - Select audience segment
   - View calculated audience size

6. **Launch Campaign**
   - Review all steps and audience
   - Set status to "Active"
   - Schedule or send immediately

### Campaign Analytics
- View sends, opens, clicks, conversions
- Track revenue generated
- Monitor engagement rates

---

## Events Management

### Creating Events

1. **Add Event**
   - Events Admin → Create Event
   - Fill in event details
   - Set date, time, location
   - Upload event image

2. **Create Ticket Types**
   - Navigate to "Ticket Types"
   - Click "Create Ticket Type"
   - Set:
     - Name (e.g., "Early Bird", "VIP")
     - Price
     - Quantity available
     - Sale start/end dates
     - Min/Max per order
   - Save

3. **Create Pass Products**
   - Go to "Pass Management"
   - Click "Create Pass"
   - Select type:
     - Single Event
     - Monthly Pass
     - All Access
     - Custom
   - Set duration and event limits
   - Add features list
   - Save

### Sales Dashboard
- View total revenue
- Track tickets sold
- Monitor pass sales
- See top events
- View recent orders

---

## School Management

### Creating Courses

1. **Course Creation with AI**
   - School Admin → Courses → "Create Course"
   - Fill in:
     - Course title
     - Level (Beginner/Intermediate/Advanced)
     - Duration (weeks)
     - Goals for AI generation
   - Click "Generate Curriculum with AI"
   - Review AI-generated:
     - Course overview
     - Learning objectives
     - Weekly lesson plans
   - Edit description if needed
   - Set max students, price, schedule
   - Save course

2. **Manual Curriculum**
   - Skip AI generation
   - Enter details manually
   - Save

### Managing Enrollments

1. **Enroll Student**
   - Enrollments → "Enroll Student"
   - Select course
   - Select or enter student email
   - Set payment status (Pending/Paid/Failed)
   - Enter payment amount
   - Add notes if needed
   - Save

2. **View Enrollments**
   - Filter by status (Active/Completed/Dropped)
   - Filter by payment status
   - Track progress percentage
   - Update enrollment status

3. **Enrollment Dashboard**
   - Total enrollments
   - Active students
   - Completed courses
   - Waitlist count
   - Total revenue

### Attendance Tracking

1. **Record Check-In**
   - Attendance → "Check-In Student"
   - Select student enrollment
   - Verify date (defaults to today)
   - Set status:
     - Present
     - Absent
     - Late
     - Excused
   - Add notes
   - Save

2. **Progress Calculation**
   - Progress auto-updates based on attendance
   - Formula: (Classes Attended / Total Classes) × 100
   - Updates enrollment progress automatically

3. **View Attendance**
   - Filter by course
   - Filter by date
   - View attendance rate
   - Export reports

---

## User Management

### Creating Admin Users

**Via Supabase Dashboard:**
1. Go to Supabase Dashboard
2. Authentication → Users
3. Add user with email/password
4. Copy user UUID
5. Run SQL to add to admin_users table

**Admin Roles:**
- **super_admin**: Full access to everything
- **admin**: Access to most features
- **course_admin**: Only course/enrollment management
- **event_admin**: Only event/ticket management

### Managing Permissions

Update permissions in `admin_users` table:
```sql
UPDATE admin_users 
SET permissions = '{"campaigns": true, "events": true}'::jsonb
WHERE user_id = 'USER_UUID';
```

---

## Troubleshooting

### Campaign Not Sending
- Check campaign status is "Active"
- Verify audience segment has members
- Check RESEND_API_KEY is set in Vercel
- Review campaign queue: `/admin/campaigns/queue`

### Course AI Generation Failed
- Verify ANTHROPIC_API_KEY is set
- Check API quota limits
- Try again or enter curriculum manually

### Enrollment Failed
- Check course isn't full
- Verify user isn't already enrolled
- Check payment amount is valid

### Attendance Not Updating Progress
- Verify attendance status is "present"
- Check course has duration_weeks set
- Progress updates automatically on save

### Database Connection Issues
- Verify Supabase keys in Vercel
- Check RLS policies allow access
- Verify tables exist

---

## Database Backup

### Manual Backup (Recommended Weekly)
1. Supabase Dashboard → Database
2. Click "Backups"
3. Click "Create Backup"
4. Download backup file

### Automated Backups
- Supabase Pro plan includes daily backups
- Point-in-time recovery available

---

## Security Best Practices

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols

2. **Enable 2FA**
   - Supabase Dashboard → Account → Security
   - Enable two-factor authentication

3. **Limit Admin Access**
   - Only grant admin privileges when needed
   - Use role-based permissions

4. **Monitor Access Logs**
   - Vercel Analytics tracks page views
   - Supabase logs authentication attempts

5. **Regular Updates**
   - Update dependencies monthly
   - Review security advisories

---

## Support Contacts

- **Technical Issues**: [your-email@example.com]
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support

---

## Changelog

### Version 1.0 - December 2024
- Initial platform launch
- Marketing Campaigns
- Events Admin
- School Management
- AI Course Generation
- Attendance Tracking

---

*Last Updated: December 18, 2024*