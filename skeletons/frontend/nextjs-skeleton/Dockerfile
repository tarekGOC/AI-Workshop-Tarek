FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose Next.js dev server port
EXPOSE 3000

# Run development server
CMD ["npm", "run", "dev"]
