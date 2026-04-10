FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install (remove cache)
RUN rm -rf node_modules package-lock.json && npm install

# Copy source code
COPY src ./src
COPY .env.example .env

# Expose port
EXPOSE 5000

# Start dev server
CMD ["npm", "run", "dev"]
