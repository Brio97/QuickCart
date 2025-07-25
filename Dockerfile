# Multi-stage build for production deployment
FROM node:18-alpine AS frontend-builder

# Build frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Python backend
FROM python:3.11-slim AS backend

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server/ ./server/

# Copy built frontend
COPY --from=frontend-builder /app/client/dist ./client/dist

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONPATH=/app/server

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/api/health', timeout=10)"

# Start application
WORKDIR /app/server
CMD ["python", "run.py"]
