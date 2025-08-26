# Fly.io Setup Instructions for Golf X

## Step 1: Install Fly CLI

### For Windows (PowerShell as Administrator):
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Alternative: Using Scoop
```powershell
scoop install flyctl
```

### After Installation:
1. Close and reopen your terminal
2. Verify installation:
```bash
fly version
```

## Step 2: Login to Fly.io

```bash
fly auth login
```
This will open your browser to authenticate.

## Step 3: Create the Fly.io Apps

### Production App:
```bash
cd D:\projects\repositories\golf-x
fly apps create golf-x
```

### Staging App (Optional):
```bash
fly apps create golf-x-staging
```

## Step 4: Set Secrets for Production

```bash
# Set your Supabase credentials
fly secrets set VITE_SUPABASE_URL="https://kdzbghjsqjnglzsmhxpu.supabase.co" --app golf-x
fly secrets set VITE_SUPABASE_ANON_KEY="your-anon-key-here" --app golf-x
```

## Step 5: Deploy to Fly.io

### First Deployment:
```bash
# Deploy to production
fly deploy --app golf-x

# Deploy to staging (if created)
fly deploy --app golf-x-staging
```

## Step 6: Get Your Fly API Token for GitHub

```bash
fly auth token
```

Copy this token - you'll need it for GitHub Actions.

## Step 7: Add Secrets to GitHub

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these secrets:
   - Name: `FLY_API_TOKEN`
   - Value: (paste the token from step 6)
   
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://kdzbghjsqjnglzsmhxpu.supabase.co`
   
   - Name: `VITE_SUPABASE_ANON_KEY`  
   - Value: (your anon key from .env)

## Step 8: Test Deployment

After deployment, your app will be available at:
- Production: https://golf-x.fly.dev
- Staging: https://golf-x-staging.fly.dev (if created)

## Useful Commands

### Check app status:
```bash
fly status --app golf-x
```

### View logs:
```bash
fly logs --app golf-x
```

### SSH into container:
```bash
fly ssh console --app golf-x
```

### Scale the app:
```bash
fly scale count 2 --app golf-x
```

### Destroy app (if needed):
```bash
fly apps destroy golf-x
```

## Troubleshooting

### If deployment fails:

1. Check build locally:
```bash
npm run build
```

2. Test Docker build:
```bash
docker build -t golf-x .
```

3. Check Fly.io logs:
```bash
fly logs --app golf-x
```

### Common Issues:

- **Port mismatch**: Ensure app runs on port 8080
- **Build failure**: Check Node version matches Dockerfile (18)
- **Secrets missing**: Verify all environment variables are set

## Notes

- The app uses `serve` to serve the static build files
- Health checks are configured to ping the root path `/`
- The app is configured for the `iad` (Virginia) region by default
- You can change the region in `fly.toml` if needed

## Ready to Deploy?

Once Fly CLI is installed and you're logged in, run:

```bash
cd D:\projects\repositories\golf-x
fly deploy
```

This will build and deploy your app to Fly.io!