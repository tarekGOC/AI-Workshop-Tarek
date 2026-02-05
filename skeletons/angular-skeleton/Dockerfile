FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Run development server
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000", "--disable-host-check"]
