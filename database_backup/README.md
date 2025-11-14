# Database Backup

This folder contains JSON backups of the MongoDB database for easy team collaboration.

## Collections

- `brands.json` - Brand data
- `categories.json` - Category data
- `users.json` - User accounts (includes admin and test users)
- `products.json` - Product listings with seller references
- `reviews.json` - Product reviews
- `offers.json` - Price offers (if any)

## How to Backup (For All Team Members)

When you make changes to your local database and want to share with your team:

1. **Export your current database:**
   ```bash
   npm run backup
   ```
   
   This will:
   - Connect to your local MongoDB (`mongodb://localhost:27017/thriftstyle`)
   - Export all collections to JSON files in this folder
   - Show summary of exported documents

2. **Commit and push the backup files:**
   ```bash
   git add database_backup/*.json
   git commit -m "Update database backup - added new products"
   git push
   ```

3. **Notify your team** in your group chat so they can pull and restore.

### What Gets Backed Up?

The backup script exports:
- ✅ All brands and categories
- ✅ All user accounts (with hashed passwords)
- ✅ All products with seller information
- ✅ All reviews and ratings
- ✅ All pending/accepted/declined offers

### When to Backup?

Create a new backup when you:
- Add new products, brands, or categories
- Create test accounts for specific scenarios
- Make significant data changes that others need
- Want to share your latest work with the team
- Before switching to work on another feature

**⚠️ Important:** Always pull latest changes before making your own backup to avoid conflicts!

## How to Restore (When Teammate Shares New Backup)

When your teammate pushes a new backup:

1. **Pull the latest changes:**
   ```bash
   git pull
   ```

2. **Restore the database:**
   ```bash
   npm run restore
   ```
   
   This will:
   - Read all JSON files from this folder
   - Clear existing data in your MongoDB
   - Import all documents
   - Show summary of imported data

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

✅ Your database is now synced with your teammate's!

## Team Workflow Example

**Scenario:** You and your teammate are working together on the project.

### Your teammate adds new products:
1. Creates 10 new products in their local database
2. Runs `npm run backup`
3. Commits: `git add database_backup/*.json`
4. Pushes: `git push`
5. Messages you: "Hey, I added new products, pull and restore!"

### You sync the changes:
1. Run `git pull`
2. Run `npm run restore`
3. Now you have those 10 new products too!

### You make changes:
1. Add new categories and brands
2. Run `npm run backup`
3. Commit and push
4. Tell your teammate to restore

**💡 Tip:** Use descriptive commit messages like:
- "Update backup - added electronics category"
- "Update backup - created test buyer/seller accounts"
- "Update backup - 20 new thrift products"

## First Time Setup (For New Team Members)

After cloning the repository:

1. **Make sure MongoDB is running** on your local machine

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Create `.env.local`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/thriftstyle
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=any-random-secret-key
   ```

4. **Restore the database:**
   ```bash
   npm run restore
   ```
   
   This will:
   - Read all JSON files from this folder
   - Clear existing data in your MongoDB
   - Import all documents
   - Show summary of imported data

5. **Start the app:**
   ```bash
   npm run dev
   ```

6. **Login with admin account:**
   - Email: `admin@thriftstyle.com`
   - Password: `admin123`

✅ You now have the exact same database as your teammate!

## Default Credentials

After restore, you can login with:

**Admin Account:**
- Email: admin@thriftstyle.com
- Password: admin123
- Access: Full dashboard access

**Test User:**
- Email: john@example.com
- Password: user123
- Access: Regular user features

## Technical Details

### Backup Script (`scripts/backup-db.ts`)
- Uses Mongoose to connect to MongoDB
- Reads collections using native MongoDB driver
- Writes JSON files with 2-space indentation
- No external tools required (no mongoexport needed)

### Restore Script (`scripts/restore-db.ts`)
- Reads JSON files from this folder
- Validates MongoDB ObjectIds
- Clears existing data before import
- Handles missing collections gracefully

### File Format
- Pure JSON format (human-readable)
- ObjectIds stored as strings with `$oid` wrapper
- Dates stored as ISO strings with `$date` wrapper
- Compatible with MongoDB Extended JSON

## Troubleshooting

**"Connection failed"**
- Make sure MongoDB is running: Check MongoDB Compass or run `mongod`
- Check your `.env.local` has correct `MONGODB_URI`

**"Collection not found"**
- Normal if backup was done before collection existed
- Safe to ignore

**"Duplicate key error"**
- Database already has data
- The restore script clears data first, but manual data might conflict
- Solution: Drop the database manually and restore again

## Notes

- ✅ Backup files are safe to commit to git
- ✅ Passwords are already hashed with bcrypt
- ✅ No sensitive data in plain text
- ✅ Works on Windows, Mac, and Linux
- ⚠️ Don't modify JSON files manually (might break ObjectId references)
