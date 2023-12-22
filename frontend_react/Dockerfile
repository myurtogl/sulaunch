#Create an image based on the official Node 18
FROM node:18

# Change directory so that our commands run inside this new directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN mkdir -p /app/src/contracts_hardhat/
COPY src/contracts_hardhat/package*.json src/contracts_hardhat/
COPY src/contracts_hardhat/hardhat.config.js src/contracts_hardhat/
COPY src/contracts_hardhat/contracts/ src/contracts_hardhat/contracts/
RUN npm install -g pnpm
RUN pnpm install

# Copy dependency definitions for smart contracts
WORKDIR /app/src/contracts_hardhat
RUN pnpm add -D hardhat
RUN pnpm hardhat compile


# Get all the code needed to run the app
WORKDIR /app
COPY ./ ./

# Expose the port the app runs in
EXPOSE 3000

# Serve the app
CMD ["pnpm", "start"]

