# UP Police AI Assistant - Render Deployment Guide

To fix the errors you are seeing on Render, follow these steps exactly:

## 1. Delete the "Static Site" on Render
If you created a "Static Site" service, it will not work because the AI needs a backend server. You must create a **Web Service**.

## 2. Create a New "Web Service"
In the Render dashboard, click **New +** and select **Web Service**. Connect your GitHub repository.

## 3. Set These Configurations
On the settings page, fill in these values:

- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## 4. Add Environment Variables
This is the most important part! Go to the **Environment** tab in Render and add:

- **Key**: `GEMINI_API_KEY`
- **Value**: `(Your actual Gemini API Key starting with AIza...)`

## 5. Fix "Publish directory" (If asked)
If you see any setting for "Publish Directory", set it to `dist`.

---

### Why the error "Publish directory web does not exist" happened:
Render was looking for a folder named `web`, but our project is configured to use `dist`. The changes I just made explicitly tell the project to use `dist`. When you set the Build Command to `npm run build`, it will create this `dist` folder automatically.
