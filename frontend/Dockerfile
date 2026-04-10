FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install (remove cache)
RUN rm -rf node_modules package-lock.json && npm install

# Copy source code
COPY src ./src
COPY public ./public
COPY index.html vite.config.js ./
COPY .env.example .env

# Expose port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev", "--", "--host"]
