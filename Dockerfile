# Use the official Node.js 14 image from Docker Hub
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Install the application dependencies
# We are using a wildcard to ensure both package.json AND package-lock.json are copied
# where available
COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle the application source inside the Docker image
COPY . .

# Expose the application on port 3000
EXPOSE 3000

# Define the command to run the application
CMD [ "npm", "start" ]
