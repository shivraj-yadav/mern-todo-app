# MERN Todo App Deployment Guide

## Prerequisites
- MongoDB Atlas account
- Render account
- Vercel account
- Git repository (GitHub/GitLab)

## Step 1: Setup MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account and cluster

2. **Get Connection String**
   - In your cluster, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

3. **Update Connection String**
   - Your connection string should look like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/todoDB?retryWrites=true&w=majority
   ```

## Step 2: Deploy Backend to Render

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

3. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository
   - Configure:
     - **Name**: `your-todo-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

4. **Add Environment Variables**
   - In Render dashboard, go to your service
   - Click "Environment" tab
   - Add these variables:
     ```
     MONGO_URI=your_mongodb_atlas_connection_string
     NODE_ENV=production
     FRONTEND_URL=https://your-vercel-app-url.vercel.app
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your Render URL (e.g., `https://your-todo-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. **Update Frontend Environment**
   - Edit `frontend/.env.production`
   - Replace with your actual Render backend URL:
   ```
   VITE_API_URL=https://your-todo-backend.onrender.com
   ```

2. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

3. **Deploy Frontend**
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

4. **Add Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add:
     ```
     VITE_API_URL=https://your-todo-backend.onrender.com
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

## Step 4: Update Backend CORS

1. **Update Render Environment Variables**
   - Go back to your Render backend service
   - Update `FRONTEND_URL` with your actual Vercel URL:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```

2. **Redeploy Backend**
   - Render will automatically redeploy with new environment variables

## Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Test adding, editing, and deleting todos
3. Check that data persists (stored in MongoDB Atlas)

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
   - Check that both URLs use `https://`

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Ensure database user has proper permissions
   - Check IP whitelist in MongoDB Atlas (allow all: 0.0.0.0/0)

3. **API Not Found (404)**
   - Verify `VITE_API_URL` in Vercel environment variables
   - Check that backend is running on Render

4. **Build Failures**
   - Check build logs in Render/Vercel dashboards
   - Ensure all dependencies are in package.json

### Useful Commands:

```bash
# Test locally with production environment
cd frontend
npm run build
npm run preview

# Check backend locally
cd backend
npm start
```

## Environment Variables Summary

### Backend (Render):
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/todoDB
NODE_ENV=production
FRONTEND_URL=https://your-project.vercel.app
```

### Frontend (Vercel):
```
VITE_API_URL=https://your-todo-backend.onrender.com
```

## Notes

- Render free tier may have cold starts (first request takes longer)
- MongoDB Atlas free tier has 512MB storage limit
- Vercel free tier has bandwidth limits
- Both services support custom domains on paid plans

Your MERN Todo App is now deployed and accessible worldwide! 🎉
