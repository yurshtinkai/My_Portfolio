# Render.com Deployment Guide for EmailJS

## Problem
Your contact form works locally but not on Render.com because environment variables are not set in your Render deployment.

## Solution: Add Environment Variables in Render

### Step 1: Log into Render Dashboard
1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Log in to your account
3. Find your portfolio service (likely named something like "lourd-portfolio" or "my-portfolio-react")

### Step 2: Add Environment Variables
1. Click on your service to open its settings
2. Navigate to the **Environment** tab (or **Environment Variables** section)
3. Click **Add Environment Variable** or **+ Add Variable**

### Step 3: Add These Three Variables
Add each variable one by one:

**Variable 1:**
- **Key:** `REACT_APP_EMAILJS_SERVICE_ID`
- **Value:** `service_5lsodiq`

**Variable 2:**
- **Key:** `REACT_APP_EMAILJS_TEMPLATE_ID`
- **Value:** `template_410geeh`

**Variable 3:**
- **Key:** `REACT_APP_EMAILJS_PUBLIC_KEY`
- **Value:** `c14ARHFlyXwVD6HgC`

### Step 4: Save and Redeploy
1. Click **Save Changes** or **Save Environment Variables**
2. Render will automatically trigger a new deployment
3. Wait for the deployment to complete (usually 2-5 minutes)

### Step 5: Verify Deployment
1. Once deployment is complete, visit your site: `lourd-portfolio.onrender.com`
2. Open browser console (F12)
3. Go to Console tab
4. You should see: `EmailJS initialized with public key: c14***`
5. Test the contact form

## Alternative: Quick Fix (Hardcode Values)

If you need a quick fix and don't mind having the keys in your code (EmailJS public keys are safe to expose), you can temporarily hardcode them:

1. Open `src/App.jsx`
2. Find lines around 397-399
3. Replace with:
```javascript
const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_5lsodiq";
const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_410geeh";
const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "c14ARHFlyXwVD6HgC";
```

4. Commit and push to trigger a new deployment

**Note:** This is less secure but works immediately. The recommended approach is to use environment variables in Render.

## Troubleshooting

### Environment Variables Not Working?
1. Make sure variable names start with `REACT_APP_` (required for Create React App)
2. Check for typos in variable names
3. Make sure there are no spaces in the values
4. Redeploy after adding variables

### Still Not Working After Adding Variables?
1. Check Render build logs for errors
2. Verify the variables are set correctly in Render dashboard
3. Check browser console on your deployed site
4. Make sure you redeployed after adding variables

### How to Check if Variables Are Loaded
1. Open your deployed site
2. Open browser console (F12)
3. Look for: `EmailJS Configuration:`
4. It should show your service ID, template ID, and public key (not "NOT SET")

## Important Notes

- **Environment variables in Create React App are embedded at BUILD TIME**, not runtime
- You MUST redeploy after adding/changing environment variables
- Render automatically rebuilds when you add environment variables
- The `.env` file is in `.gitignore`, so it won't be deployed (which is correct for security)

## Render Dashboard Navigation

The exact location of environment variables in Render may vary, but typically:
- Go to your service → Settings → Environment
- Or: Your service → Environment Variables
- Or: Your service → Config → Environment Variables

Look for a section that says "Environment Variables" or "Build Environment Variables"

