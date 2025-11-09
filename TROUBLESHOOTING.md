# Troubleshooting Contact Form Issues

## Error: "Failed to send message"

If you're seeing this error, follow these steps:

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (Press F12)
2. Go to the **Console** tab
3. Try submitting the form again
4. Look for error messages - they will show the exact problem

### Step 2: Verify Environment Variables Are Loaded
1. Check the console for: `EmailJS Configuration:`
2. Verify all three values are shown (not "NOT SET"):
   - `serviceId`: Should show `service_5lsodiq`
   - `templateId`: Should show `template_410geeh`
   - `publicKey`: Should show `c14***` (first 4 characters)

**If you see "NOT SET":**
- Make sure `.env` file exists in `My_Portfolio/My_Portfolio/` directory (same level as `package.json`)
- Restart your development server:
  - Stop the server (Ctrl + C)
  - Run `npm start` again

### Step 3: Verify .env File Location
The `.env` file must be in the same directory as `package.json`:
```
My_Portfolio/
  └── My_Portfolio/
      ├── package.json
      ├── .env          ← Must be here
      └── src/
```

### Step 4: Check .env File Content
Open `.env` file and verify it contains:
```
REACT_APP_EMAILJS_SERVICE_ID=service_5lsodiq
REACT_APP_EMAILJS_TEMPLATE_ID=template_410geeh
REACT_APP_EMAILJS_PUBLIC_KEY=c14ARHFlyXwVD6HgC
```

**Important:**
- No spaces around the `=` sign
- No quotes around the values
- Each variable on its own line

### Step 5: Common EmailJS Errors

#### Error: "Invalid public key"
- Check your Public Key in EmailJS dashboard
- Make sure there are no extra spaces in `.env` file

#### Error: "Template not found"
- Verify Template ID is correct
- Check EmailJS dashboard → Email Templates

#### Error: "Service not found"
- Verify Service ID is correct
- Check EmailJS dashboard → Email Services
- Make sure Gmail service is connected and active

#### Error: "Template variables mismatch"
- Check that your EmailJS template uses these exact variable names:
  - `{{from_name}}`
  - `{{from_email}}`
  - `{{subject}}`
  - `{{message}}`

### Step 6: Production Deployment
If you're deploying to production (e.g., Netlify, Vercel, etc.):

1. **Add environment variables in your hosting platform:**
   - Go to your hosting platform's settings
   - Find "Environment Variables" or "Build Environment Variables"
   - Add all three variables:
     - `REACT_APP_EMAILJS_SERVICE_ID`
     - `REACT_APP_EMAILJS_TEMPLATE_ID`
     - `REACT_APP_EMAILJS_PUBLIC_KEY`

2. **Rebuild your site** after adding environment variables

### Step 7: Test EmailJS Configuration
1. Go to EmailJS dashboard
2. Click "Test It" button on your template
3. Fill in test values and send
4. Check if the test email arrives in your Gmail

### Step 8: Check EmailJS Quota
1. Go to EmailJS dashboard
2. Check "Requests received" counter
3. Free tier: 200 emails/month
4. If quota exceeded, wait for reset or upgrade

## Still Not Working?

1. **Check Network Tab:**
   - Open Developer Tools → Network tab
   - Submit the form
   - Look for failed requests to `api.emailjs.com`
   - Check the error response

2. **Verify EmailJS Account:**
   - Make sure your EmailJS account is active
   - Verify Gmail service is connected
   - Check email notifications in EmailJS dashboard

3. **Contact Support:**
   - EmailJS Support: Check their website
   - Check EmailJS documentation: https://www.emailjs.com/docs/

## Quick Checklist
- [ ] `.env` file exists in correct location
- [ ] Environment variables are correct (no typos)
- [ ] Development server was restarted after creating `.env`
- [ ] Browser console shows EmailJS configuration loaded
- [ ] EmailJS template uses correct variable names
- [ ] Gmail service is connected in EmailJS dashboard
- [ ] EmailJS quota not exceeded
- [ ] Network requests are not blocked

