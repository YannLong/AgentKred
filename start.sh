#!/bin/bash

echo "🚀 Starting AgentKred Protocol..."

# 1. Start DB
echo "📦 Checking Database..."
if [ ! "$(docker ps -q -f name=agentkred-pg)" ]; then
    if [ "$(docker ps -aq -f name=agentkred-pg)" ]; then
        echo "   Starting existing container..."
        docker start agentkred-pg
    else
        echo "   Creating new container..."
        docker run --name agentkred-pg -e POSTGRES_USER=kred_user -e POSTGRES_PASSWORD=kred_pass -e POSTGRES_DB=agentkred -p 5432:5432 -d postgres:15-alpine
    fi
else
    echo "   Database is running."
fi

# 2. Start Backend
echo "🐍 Starting Backend (Port 8004)..."
nohup /Users/ymini/.local/bin/uv run main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# 3. Start Frontend
echo "⚛️  Starting Frontend (Port 3000)..."
cd web
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo "✅ All systems go!"
echo "   API Docs: http://localhost:8004/docs"
echo "   Dashboard: http://localhost:3000"
echo "   Logs: backend.log, web/frontend.log"
