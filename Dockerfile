# Stage 1: Build the React application
FROM node:18-alpine as build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . ./

# Build the React app for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built files from the previous stage to Nginx's default public directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
