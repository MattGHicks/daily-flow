# Development Server Management Guide

Complete guide for managing the Daily Flow Dashboard development server.

---

## Quick Reference

| Action | Command |
|--------|---------|
| **Start** | `npm run dev` |
| **Stop** | `Ctrl + C` (in terminal) or `pkill -f "next dev"` |
| **Restart** | `pkill -f "next dev" && sleep 2 && npm run dev` |
| **Clean Restart** | `rm -rf .next && npm run dev` |

---

## 1. Starting the Server

### Standard Start

```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2"
npm run dev
```

The server will start on `http://localhost:3000`

**Expected Output:**
```
▲ Next.js 16.0.1 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.xxx.xxx:3000

✓ Ready in 381ms
```

### Start in Background

If you want to keep working in the terminal while the server runs:

```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2"
npm run dev &
```

**Note:** Background processes will continue running even if you close the terminal window.

### Clean Start (Recommended after major changes)

Clear build cache and start fresh:

```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2"
rm -rf .next
npm run dev
```

Use this when:
- After pulling new changes from git
- After updating dependencies
- When experiencing build errors
- After changing configuration files

---

## 2. Stopping the Server

### Method 1: Keyboard Interrupt (Foreground Server)

If the server is running in your current terminal:

```bash
Ctrl + C
```

Press `Control` + `C` keys simultaneously.

### Method 2: Kill Process (Background Server)

If the server is running in the background or another terminal:

```bash
pkill -f "next dev"
```

This command finds and stops all Next.js development servers.

### Method 3: Kill by Port

If something is blocking port 3000:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9
```

### Method 4: Kill All Node Processes (Nuclear Option)

**⚠️ Warning:** This will stop ALL Node.js processes on your machine:

```bash
pkill -9 node
```

Only use this if you're sure no other Node.js applications are running.

---

## 3. Restarting the Server

### Quick Restart

```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2"
pkill -f "next dev" && sleep 2 && npm run dev
```

**What this does:**
1. Stops the Next.js dev server
2. Waits 2 seconds to ensure clean shutdown
3. Starts a fresh server

### Clean Restart (Recommended)

```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2"
pkill -f "next dev" && sleep 2 && rm -rf .next && npm run dev
```

**What this does:**
1. Stops the Next.js dev server
2. Waits 2 seconds
3. Deletes build cache (`.next` folder)
4. Starts a fresh server with clean build

### Restart in Background

```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2"
pkill -f "next dev" && sleep 2 && npm run dev &
```

---

## 4. Checking Server Status

### Check if Server is Running

```bash
# Check by port
lsof -ti:3000
```

- If it returns a number (process ID), the server is running
- If it returns nothing, the server is stopped

### Check by Process Name

```bash
ps aux | grep "next dev"
```

Shows all running Next.js development servers.

### View Server Logs

If running in background, you can check logs with:

```bash
# View recent npm logs
cat ~/.npm/_logs/*-debug.log
```

---

## 5. Common Server Scripts

### Create Shortcuts (Optional)

Add these to your `~/.zshrc` or `~/.bashrc` for quick access:

```bash
# Add to ~/.zshrc
alias df-start='cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2" && npm run dev'
alias df-stop='pkill -f "next dev"'
alias df-restart='cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2" && pkill -f "next dev" && sleep 2 && npm run dev'
alias df-clean='cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2" && pkill -f "next dev" && sleep 2 && rm -rf .next && npm run dev'
```

After adding, reload your shell:

```bash
source ~/.zshrc
```

Then you can use:
- `df-start` - Start server
- `df-stop` - Stop server
- `df-restart` - Restart server
- `df-clean` - Clean restart

---

## 6. Troubleshooting

### Problem: Port 3000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use a different port
PORT=3001 npm run dev
```

### Problem: Module Not Found

**Error:**
```
Module not found: Can't resolve 'xyz'
```

**Solution:**

```bash
# Stop server
pkill -f "next dev"

# Reinstall dependencies
npm install

# Clean restart
rm -rf .next
npm run dev
```

### Problem: Build Errors After Git Pull

**Solution:**

```bash
# Stop server
pkill -f "next dev"

# Clean install
rm -rf node_modules .next
npm install

# Regenerate Prisma client
npx prisma generate

# Start server
npm run dev
```

### Problem: Server Running But Page Won't Load

**Check:**

1. Server is actually running:
   ```bash
   lsof -ti:3000
   ```

2. Try accessing `http://localhost:3000` directly (not just `localhost:3000`)

3. Clear browser cache and hard refresh (`Cmd + Shift + R`)

4. Check server logs for errors in the terminal

### Problem: Changes Not Appearing

**Solution:**

```bash
# Clean restart
pkill -f "next dev" && sleep 2 && rm -rf .next && npm run dev
```

### Problem: Too Many Background Processes

**Check how many are running:**

```bash
ps aux | grep "next dev" | grep -v grep
```

**Kill all:**

```bash
pkill -f "next dev"
```

---

## 7. Database Management

### Regenerate Prisma Client

After changing `prisma/schema.prisma`:

```bash
npx prisma generate
```

### Push Schema Changes

```bash
npx prisma db push
```

### Open Prisma Studio

Visual database browser:

```bash
npx prisma studio
```

Opens on `http://localhost:5555`

### Full Database Reset

**⚠️ Warning:** This deletes all data!

```bash
# Delete database
rm prisma/dev.db

# Recreate schema
npx prisma db push

# Regenerate client
npx prisma generate
```

---

## 8. Production Build

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

Production server runs on `http://localhost:3000`

---

## 9. Environment Variables

### Required Files

- `.env` - Your local environment variables (gitignored)
- `.env.example` - Template for required variables (in git)

### Create .env File

If `.env` doesn't exist:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values.

### After Changing .env

Always restart the server:

```bash
pkill -f "next dev" && sleep 2 && npm run dev
```

---

## 10. Complete Server Lifecycle

### Morning Startup Routine

```bash
# 1. Navigate to project
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2"

# 2. Pull latest changes (if working with git)
git pull

# 3. Install any new dependencies
npm install

# 4. Regenerate Prisma client (if schema changed)
npx prisma generate

# 5. Start server
npm run dev
```

### End of Day Shutdown

```bash
# Stop the server
pkill -f "next dev"

# Optional: Commit your work
git add .
git commit -m "Your commit message"
git push
```

---

## 11. Quick Command Reference

### Copy-Paste Scripts

**Start Server:**
```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2" && npm run dev
```

**Stop Server:**
```bash
pkill -f "next dev"
```

**Restart Server:**
```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2" && pkill -f "next dev" && sleep 2 && npm run dev
```

**Clean Restart:**
```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2" && pkill -f "next dev" && sleep 2 && rm -rf .next && npm run dev
```

**Full Reset:**
```bash
cd "/Users/matt/Documents/My Coding Projects/daily-flow-v2" && pkill -f "next dev" && rm -rf .next node_modules && npm install && npx prisma generate && npm run dev
```

**Kill Port 3000:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 12. Server Health Checks

### Quick Health Check

```bash
# Is server running?
lsof -ti:3000 && echo "✅ Server is running" || echo "❌ Server is stopped"

# Test HTTP response
curl -s http://localhost:3000 > /dev/null && echo "✅ Server responding" || echo "❌ Server not responding"
```

### Full Health Check Script

Create a file `health-check.sh`:

```bash
#!/bin/bash

echo "🔍 Daily Flow Server Health Check"
echo "=================================="

# Check if server is running
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ Server Process: Running"

    # Check if server is responding
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server Response: OK"
    else
        echo "⚠️  Server Response: Not responding"
    fi
else
    echo "❌ Server Process: Not running"
fi

# Check Node version
echo "📦 Node Version: $(node -v)"

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env File: Present"
else
    echo "⚠️  .env File: Missing"
fi

# Check if database exists
if [ -f prisma/dev.db ]; then
    echo "✅ Database: Present"
else
    echo "⚠️  Database: Missing"
fi

echo "=================================="
```

Make it executable:

```bash
chmod +x health-check.sh
```

Run it:

```bash
./health-check.sh
```

---

## Need Help?

- **Documentation:** See [README.md](./README.md) for project overview
- **Issues:** Check the GitHub issues page
- **Logs:** Check terminal output for error messages

---

**Last Updated:** November 4, 2025
