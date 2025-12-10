#!/bin/bash
# Deploy Web Terminal to Google Cloud Platform

set -e

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-theos-98cdd}
REGION=${REGION:-us-central1}
SERVICE_NAME="theos-web-terminal"

echo "🚀 Deploying to Google Cloud Platform..."
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -f lib/web-terminal/Dockerfile -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest ../..

echo "📤 Pushing to Container Registry..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars "RPC_URL=https://arb1.arbitrum.io/rpc,NETWORK=arbitrum" \
    --memory 512Mi \
    --cpu 1

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo "   Service URL: $SERVICE_URL"
echo "   View logs: gcloud run logs read $SERVICE_NAME --region $REGION"
