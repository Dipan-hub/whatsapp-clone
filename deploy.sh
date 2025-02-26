#!/bin/bash

# Ask for commit message
echo "Enter commit message: "
read commit_message

# Execute the Git commands
git add .
git commit -m "$commit_message"
git push origin main


########################################
# How to run
# ./deploy.sh
#########################################