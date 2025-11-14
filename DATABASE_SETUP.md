# Database Setup - Neon PostgreSQL

This project uses Neon PostgreSQL to store user demographic data.

## Setup Instructions

### 1. Create Neon Account
- Go to https://console.neon.tech/
- Sign up or log in to your account

### 2. Create a New Project
- Click "Create Project"
- Choose a name (e.g., "switch-wrapper")
- Select a region close to your users

### 3. Get Your Connection String
- In the Neon dashboard, click on your project
- Go to "Connection Details"
- Copy the connection string (it should look like):
  ```
  postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
  ```

### 4. Add to Environment Variables

#### For Local Development:
1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add the following line:
   ```
   DATABASE_URL=your_neon_connection_string_here
   ```

#### For Vercel Deployment:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string
   - **Environments**: Select "Production", "Preview", and "Development"

### 5. Database Schema

The `demographics` table will be created automatically on first API call with this schema:

```sql
CREATE TABLE demographics (
  id SERIAL PRIMARY KEY,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL,
  profession VARCHAR(100) NOT NULL,
  fruits_vegetables VARCHAR(100) NOT NULL,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Test the Connection

After deploying to Vercel:
1. Visit your app
2. Fill out the demographics form
3. Click "Next"
4. Check the Vercel function logs to see if the data was saved successfully

### 7. Query Your Data

You can query your data directly in the Neon console:
1. Go to https://console.neon.tech/
2. Select your project
3. Go to "SQL Editor"
4. Run queries like:
   ```sql
   SELECT * FROM demographics ORDER BY created_at DESC LIMIT 10;
   ```

## Troubleshooting

### Connection Issues
- Make sure your DATABASE_URL includes `?sslmode=require` at the end
- Check that the environment variable is set in Vercel
- Verify the connection string doesn't have any extra spaces

### Table Not Created
- The table is created automatically on first use
- Check Vercel function logs for any errors
- You can manually create the table using the SQL Editor in Neon console

### Data Not Saving
- Check browser console for errors
- Check Vercel function logs
- The form will still work with localStorage as fallback if database fails
