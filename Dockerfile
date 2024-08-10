# Use an official Node.js runtime as a parent image
FROM node:20


RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://raw.githubusercontent.com/Tenderly/tenderly-cli/master/scripts/install-linux.sh | sh


# Set the working directory
WORKDIR /usr/src/app


# Copy the package.json and package-lock.json
COPY package*.json ./


RUN npm install -g pnpm

# Install dependencies for backend
RUN pnpm i 

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["node", "index.js"]