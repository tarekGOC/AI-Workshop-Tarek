FROM node:20-alpine

WORKDIR /app

# Copy pre-installed node_modules and source from local build
COPY node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
