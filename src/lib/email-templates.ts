interface EmailTemplate {
    subject: string
    html: string
    text: string
  }
  
  // Base email wrapper
  function emailWrapper(content: string): string {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        color: white;
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 30px;
      }
      .button {
        display: inline-block;
        padding: 12px 30px;
        background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
        color: white !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 20px 0;
      }
      .footer {
        background: #f9fafb;
        padding: 20px 30px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
        border-top: 1px solid #e5e7eb;
      }
      .info-box {
        background: #f3f4f6;
        border-left: 4px solid #9333ea;
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎭 Mikilele Events</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Mikilele Events. All rights reserved.</p>
        <p>
          <a href="{{unsubscribe_url}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    </div>
  </body>
  </html>
    `
  }
  
  // Welcome Email
  export function welcomeEmail(userName: string): EmailTemplate {
    const content = `
      <h2>Welcome to Mikilele Events! 🎉</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for joining Mikilele Events! We're excited to have you as part of our community.</p>
      <p>Here's what you can do now:</p>
      <ul>
        <li>Browse upcoming events</li>
        <li>Enroll in dance courses</li>
        <li>Purchase event passes</li>
        <li>Track your progress</li>
      </ul>
      <a href="{{portal_url}}" class="button">Visit Your Portal</a>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The Mikilele Events Team</p>
    `
  
    return {
      subject: 'Welcome to Mikilele Events! 🎉',
      html: emailWrapper(content),
      text: `Welcome to Mikilele Events!\n\nHi ${userName},\n\nThank you for joining Mikilele Events! We're excited to have you as part of our community.\n\nVisit your portal: {{portal_url}}\n\nBest regards,\nThe Mikilele Events Team`
    }
  }
  
  // Enrollment Confirmation
  export function enrollmentConfirmationEmail(
    userName: string,
    courseName: string,
    instructor: string,
    schedule: string
  ): EmailTemplate {
    const content = `
      <h2>Enrollment Confirmed! 📚</h2>
      <p>Hi ${userName},</p>
      <p>Great news! You've been successfully enrolled in:</p>
      <div class="info-box">
        <h3 style="margin-top: 0;">${courseName}</h3>
        <p><strong>Instructor:</strong> ${instructor}</p>
        <p><strong>Schedule:</strong> ${schedule}</p>
      </div>
      <p>Your journey begins now! Check your portal to see your course details and track your progress.</p>
      <a href="{{course_url}}" class="button">View Course Details</a>
      <p>See you in class!</p>
      <p>Best regards,<br>The Mikilele Events Team</p>
    `
  
    return {
      subject: `Enrollment Confirmed: ${courseName}`,
      html: emailWrapper(content),
      text: `Enrollment Confirmed!\n\nHi ${userName},\n\nYou've been enrolled in ${courseName}.\nInstructor: ${instructor}\nSchedule: ${schedule}\n\nView course: {{course_url}}\n\nBest regards,\nThe Mikilele Events Team`
    }
  }
  
  // Ticket Purchase Confirmation
  export function ticketPurchaseEmail(
    userName: string,
    eventName: string,
    eventDate: string,
    ticketType: string,
    quantity: number
  ): EmailTemplate {
    const content = `
      <h2>Ticket Confirmed! 🎫</h2>
      <p>Hi ${userName},</p>
      <p>Your ticket purchase is confirmed! Here are your details:</p>
      <div class="info-box">
        <h3 style="margin-top: 0;">${eventName}</h3>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Ticket Type:</strong> ${ticketType}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
      </div>
      <p>Your tickets are attached to this email. You can also access them anytime in your portal.</p>
      <a href="{{ticket_url}}" class="button">View Tickets</a>
      <p>We can't wait to see you there!</p>
      <p>Best regards,<br>The Mikilele Events Team</p>
    `
  
    return {
      subject: `Tickets Confirmed: ${eventName}`,
      html: emailWrapper(content),
      text: `Ticket Confirmed!\n\nHi ${userName},\n\nEvent: ${eventName}\nDate: ${eventDate}\nTicket: ${ticketType} x${quantity}\n\nView tickets: {{ticket_url}}\n\nBest regards,\nThe Mikilele Events Team`
    }
  }
  
  // Event Reminder (24 hours before)
  export function eventReminderEmail(
    userName: string,
    eventName: string,
    eventDate: string,
    location: string
  ): EmailTemplate {
    const content = `
      <h2>Event Reminder! ⏰</h2>
      <p>Hi ${userName},</p>
      <p>This is a friendly reminder that you have an event coming up tomorrow!</p>
      <div class="info-box">
        <h3 style="margin-top: 0;">${eventName}</h3>
        <p><strong>📅 Date:</strong> ${eventDate}</p>
        <p><strong>📍 Location:</strong> ${location}</p>
      </div>
      <p>Don't forget to bring your ticket! You can access it from your portal.</p>
      <a href="{{event_url}}" class="button">View Event Details</a>
      <p>See you soon!</p>
      <p>Best regards,<br>The Mikilele Events Team</p>
    `
  
    return {
      subject: `Reminder: ${eventName} is Tomorrow!`,
      html: emailWrapper(content),
      text: `Event Reminder!\n\nHi ${userName},\n\nEvent: ${eventName}\nDate: ${eventDate}\nLocation: ${location}\n\nView details: {{event_url}}\n\nBest regards,\nThe Mikilele Events Team`
    }
  }
  
  // Class Reminder
  export function classReminderEmail(
    userName: string,
    courseName: string,
    classDate: string,
    instructor: string
  ): EmailTemplate {
    const content = `
      <h2>Class Reminder! 📚</h2>
      <p>Hi ${userName},</p>
      <p>You have a class coming up soon!</p>
      <div class="info-box">
        <h3 style="margin-top: 0;">${courseName}</h3>
        <p><strong>📅 Date:</strong> ${classDate}</p>
        <p><strong>👨‍🏫 Instructor:</strong> ${instructor}</p>
      </div>
      <p>Make sure you're prepared for today's lesson. Check your course materials in the portal.</p>
      <a href="{{course_url}}" class="button">View Course</a>
      <p>See you in class!</p>
      <p>Best regards,<br>The Mikilele Events Team</p>
    `
  
    return {
      subject: `Class Reminder: ${courseName}`,
      html: emailWrapper(content),
      text: `Class Reminder!\n\nHi ${userName},\n\nCourse: ${courseName}\nDate: ${classDate}\nInstructor: ${instructor}\n\nView course: {{course_url}}\n\nBest regards,\nThe Mikilele Events Team`
    }
  }
  
  // Payment Receipt
  export function paymentReceiptEmail(
    userName: string,
    orderNumber: string,
    items: Array<{ name: string; quantity: number; price: number }>,
    total: number
  ): EmailTemplate {
    const itemsList = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `).join('')
  
    const content = `
      <h2>Payment Receipt 💳</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for your payment! Here's your receipt:</p>
      <div class="info-box">
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <table style="width: 100%; margin-top: 15px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold;">
              <td colspan="2" style="padding: 15px; text-align: right;">Total:</td>
              <td style="padding: 15px; text-align: right;">$${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <a href="{{receipt_url}}" class="button">View Full Receipt</a>
      <p>Best regards,<br>The Mikilele Events Team</p>
    `
  
    return {
      subject: `Payment Receipt - Order ${orderNumber}`,
      html: emailWrapper(content),
      text: `Payment Receipt\n\nOrder: ${orderNumber}\nTotal: $${total.toFixed(2)}\n\nView receipt: {{receipt_url}}\n\nBest regards,\nThe Mikilele Events Team`
    }
  }
  
  // Course Completion
  export function courseCompletionEmail(
    userName: string,
    courseName: string,
    completionDate: string
  ): EmailTemplate {
    const content = `
      <h2>Congratulations! 🎓</h2>
      <p>Hi ${userName},</p>
      <p>You did it! We're thrilled to announce that you've successfully completed:</p>
      <div class="info-box">
        <h3 style="margin-top: 0;">${courseName}</h3>
        <p><strong>Completion Date:</strong> ${completionDate}</p>
      </div>
      <p>Your dedication and hard work have paid off. Your certificate is now available in your portal.</p>
      <a href="{{certificate_url}}" class="button">Download Certificate</a>
      <p>Keep dancing and learning!</p>
      <p>Best regards,<br>The Mikilele Events Team</p>
    `
  
    return {
      subject: `Course Completed: ${courseName} 🎓`,
      html: emailWrapper(content),
      text: `Congratulations!\n\nYou've completed ${courseName}!\nCompletion Date: ${completionDate}\n\nDownload certificate: {{certificate_url}}\n\nBest regards,\nThe Mikilele Events Team`
    }
  }
  
  // Password Reset
  export function passwordResetEmail(resetUrl: string): EmailTemplate {
    const content = `
      <h2>Reset Your Password 🔒</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
      <p>Best regards,<br>The Mikilele Events Team</p>
    `
  
    return {
      subject: 'Reset Your Password',
      html: emailWrapper(content),
      text: `Reset Your Password\n\nClick here to reset: ${resetUrl}\n\nThis link expires in 1 hour.\n\nBest regards,\nThe Mikilele Events Team`
    }
  }
  
  // Admin Alert
  export function adminAlertEmail(
    alertType: string,
    message: string,
    details: any
  ): EmailTemplate {
    const content = `
      <h2>⚠️ Admin Alert: ${alertType}</h2>
      <p>${message}</p>
      <div class="info-box">
        <pre style="overflow-x: auto; font-size: 12px;">${JSON.stringify(details, null, 2)}</pre>
      </div>
      <a href="{{admin_url}}" class="button">View Admin Dashboard</a>
      <p>This is an automated alert from your Mikilele Events platform.</p>
    `
  
    return {
      subject: `Admin Alert: ${alertType}`,
      html: emailWrapper(content),
      text: `Admin Alert: ${alertType}\n\n${message}\n\nDetails: ${JSON.stringify(details)}\n\nAdmin Dashboard: {{admin_url}}`
    }
  }