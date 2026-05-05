FROM node:18

# Set working directory
WORKDIR /app

# Copy backend package files
COPY Backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend code
COPY Backend/ .

# Copy frontend into the container
COPY frontend ./frontend

# Expose Cloud Run port
ENV PORT=8080
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
