#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Serverless Event API Deployment Script${NC}"
echo "----------------------------------------"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}AWS CLI is not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Verify SES email
read -p "Enter the email address to use for sending notifications: " EMAIL_FROM

# Check if email is already verified
VERIFICATION_STATUS=$(aws ses get-identity-verification-attributes --identities "$EMAIL_FROM" --query "VerificationAttributes.$EMAIL_FROM.VerificationStatus" --output text 2>/dev/null)

if [ "$VERIFICATION_STATUS" != "Success" ]; then
    echo -e "${YELLOW}Verifying email address $EMAIL_FROM with Amazon SES...${NC}"
    aws ses verify-email-identity --email-address "$EMAIL_FROM"
    echo -e "${GREEN}Verification email sent to $EMAIL_FROM. Please check your inbox and verify before continuing.${NC}"
    read -p "Press Enter once you've verified the email address..."
fi

# Update the environment variable in serverless.yml
sed -i '' "s/EMAIL_FROM: .*/EMAIL_FROM: $EMAIL_FROM/" serverless.yml

# Deploy the application
echo -e "${YELLOW}Deploying the application...${NC}"
npx serverless deploy --verbose

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    
    # Get the API endpoint
    API_URL=$(npx serverless info --verbose | grep -o 'ServiceEndpoint: .*' | cut -d' ' -f2)
    
    echo -e "${GREEN}API URL: $API_URL${NC}"
    echo "----------------------------------------"
    echo "Next steps:"
    echo "1. Update the frontend configuration with this API URL"
    echo "2. Deploy the frontend to a static hosting service"
    echo "3. Test the application end-to-end"
else
    echo -e "${RED}Deployment failed. Please check the error messages above.${NC}"
fi