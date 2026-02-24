#!/bin/bash
# Kill any existing Next.js dev server on port 3000, then start fresh
lsof -ti :3000 | xargs kill -9 2>/dev/null
sleep 1
npx next dev
