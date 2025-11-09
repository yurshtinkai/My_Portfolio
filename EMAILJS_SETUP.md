# EmailJS Setup Guide

This guide will help you set up EmailJS to receive contact form submissions directly to your Gmail inbox.

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (free tier includes 200 emails per month)
3. Verify your email address

## Step 2: Add Email Service

1. Log in to your EmailJS dashboard
2. Go to **Email Services** → **Add New Service**
3. Choose **Gmail** as your email service
4. Click **Connect Account** and authorize EmailJS to access your Gmail
5. Click **Create Service**
6. **Copy the Service ID** (you'll need this later)

## Step 3: Create Email Template

1. Go to **Email Templates** → **Create New Template**
2. Choose a template or start from scratch
3. Set up your template with the following variables:
   - `{{from_name}}` - Sender's full name
   - `{{from_email}}` - Sender's email address
   - `{{subject}}` - Email subject
   - `{{message}}` - Message content
   - `{{to_email}}` - Your email address (optional)

4. Example template:
   ```
   Subject: Portfolio Contact: {{subject}}
   
   From: {{from_name}} ({{from_email}})
   
   Message:
   {{message}}
   
   ---
   This message was sent from your portfolio contact form.
   ```

   **Important**: Make sure your template uses these exact variable names:
   - `{{from_name}}` - NOT `{{name}}`
   - `{{from_email}}` - NOT `{{email}}`
   - `{{subject}}` - NOT `{{title}}`
   - `{{message}}` - This is correct
   
   In the template settings (right sidebar):
   - **From Name**: Use `{{from_name}}`
   - **Reply To**: Use `{{from_email}}`
   - **To Email**: Your Gmail address (e.g., `lourdangeloubufete17@gmail.com`)

5. Click **Save**
6. **Copy the Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. Go to **Account** → **General** in EmailJS dashboard
2. Find **Public Key** section
3. **Copy your Public Key**

## Step 5: Configure Your Code

You have two options to configure EmailJS:

### Option 1: Environment Variables (Recommended)

1. Create a `.env` file in your project root (same level as `package.json`)
2. Add the following variables:
```
REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
```

3. Replace the placeholder values with your actual IDs and keys from EmailJS
4. Make sure `.env` is in your `.gitignore` file (it should be by default)
5. Restart your development server after creating/updating `.env`

### Option 2: Direct Configuration in Code

1. Open `src/App.jsx`
2. Find the following lines and replace the placeholders:
   - **Line ~250**: Replace `"YOUR_EMAILJS_PUBLIC_KEY"` with your actual public key
   - **Line ~354**: Replace `"YOUR_SERVICE_ID"` with your service ID
   - **Line ~355**: Replace `"YOUR_TEMPLATE_ID"` with your template ID
   - **Line ~356**: Replace `"YOUR_EMAILJS_PUBLIC_KEY"` with your actual public key

Example:
```javascript
// Around line 250
const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "abc123xyz789";

// Around lines 354-356
const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_abc123";
const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_xyz789";
const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "abc123xyz789";
```

**Note**: Option 1 (environment variables) is recommended because it keeps your keys out of your source code.

## Step 6: Test Your Form

1. Start your development server: `npm start`
2. Navigate to the contact section
3. Fill out the form with a test message
4. Click "Send Message"
5. Check your Gmail inbox for the message

## Troubleshooting

### Emails not sending?
- Verify all IDs and keys are correct
- Check EmailJS dashboard for error logs
- Make sure you've authorized Gmail access
- Check your browser console for errors

### Email validation not working?
- The form uses basic email validation by default
- For advanced validation with API, you can sign up for a free API key at [Abstract API](https://www.abstractapi.com/email-validation-api) and replace `YOUR_API_KEY` in the code (line 190)

### Rate Limits
- Free tier: 200 emails per month
- Upgrade if you need more capacity

## Security Notes

- Never commit your EmailJS keys to public repositories
- Consider using environment variables for production
- The public key is safe to use in frontend code (it's designed for client-side use)

## Optional: Environment Variables (Recommended for Production)

1. Create a `.env` file in your project root:
```
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

2. Update `App.jsx` to use environment variables:
```javascript
const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
```

3. Add `.env` to your `.gitignore` file

## Need Help?

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: Check their website for support options

