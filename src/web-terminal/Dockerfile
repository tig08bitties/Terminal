FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy web terminal files
COPY lib/web-terminal/ ./lib/web-terminal/
COPY lib/safe/ ./lib/safe/
COPY lib/chariot-agent/ ./lib/chariot-agent/

# Install gcloud CLI (optional, for gcloud shell)
RUN apk add --no-cache curl python3 py3-pip && \
    curl https://sdk.cloud.google.com | bash && \
    export PATH=$PATH:/root/google-cloud-sdk/bin && \
    gcloud components install gke-gcloud-auth-plugin --quiet || true

WORKDIR /app/lib/web-terminal

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "web-terminal-server.js"]
