FROM node:14
# Use an official Node.js image as parent image
WORKDIR /app
# Set working directory to /app
COPY package*.json ./
# Copy package.json and package-lock.json if applicable
RUN npm install
# Install Dependencies
COPY . .
# Copy the rest of the application code
RUN npm run bundle
# Build the Vite project
EXPOSE 3000
# Expose the port
CMD ["npm", "run", "serve"]
# Run the application
