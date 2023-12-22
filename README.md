# Sulaunch Setup Guide

## Requirements
   - Pull the latest version of the project
   Install node.js v18
   - Install pnpm with (npm install -g pnpm)
  
  
  
## To Run Frontend:
### In frontend_react 

  run: pnpm i 

### In /src/contracts_hardhat 

  run:
  
  pnpm add -D hardhat
  
  pnpm hardhat compile

### In frontend_react 

  run: pnpm start

## To Run Backend:
### In backend_dotnet 

  run: dotnet run

## To set up metamask
  Create a wallet
  Go to settings -> networks -> Add a network

  Network Name: Mumbai Testnet (Optional)
  New RPC URL: https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78
  Chain ID: 80001
  Currency Symbol: MATIC
  Block Explorer URL (optional): https://mumbai.polygonscan.com

  After the network, go to assets -> Import Tokens and enter the current address of SUCoin.

  Press save and use this Metamask settings while entering the website. This process is automatic for users when they first enter the website. They just need to agree on the changes.

## Docker Setup

### Docker Commands

  run:

  docker compose build

  docker compose -f docker-compose.yml up -d

  Important:
   
  -d flag is not required if the containers will run on a screen
  
  REACT_APP_BACKEND_URL and REACT_APP_FRONTEND_URL need to be set accordingly inside the docker-compose.yml file

### Shutting down the containers
  run: docker compose down

  if it does not work,

  run: 

  docker stop $(docker ps -aq) 

  docker rm $(docker ps -aq)

### For Linux Enviroments
  podman-compose can be used instead of docker compose and podman instead of docker if root access is not available

  To keep the containers running in the background when the terminal is closed, create a new screen and run the commands inside of it

### Screen controls
### To create a new screen 
  run: screen -S <screen_name>

### Deattach the current screen 
  Press CTRL+A and then D

### Reattach a screen
  run: screen -x <screen_name>

### To terminate the current screen
  Press CTRL+A and then K then Y and then Enter

## Smart Contract Deployment

When the project will operate on the Polygon Mainnet, Contracts have to be redeployed with the instructions below:

`Sucoin`, `Project Register` and `BokkyPooBahsRedBlackTreeLibrary` Contracts need to be deployed manually before all the others and their address needs to be set in 
the `deploy_maestro.js` file at frontend_react\src\contracts_hardhat\scripts\deploy_maestro.js.

`Sucoin` is handled by the Supayment team. Please contact them to learn the address of the contract.

`Project Register` is in frontend_react\src\contracts_hardhat\contracts.

`BokkyPooBahsRedBlackTreeLibrary` is in the libraries folder of the same directory.

Deploy them using Remix or any other contract deployment tool. To learn how to deploy contracts using Remix, please refer [here](https://wiki.polygon.technology/docs/develop/remix/)

After these steps, hardhat.config.js file needs to be updated for the polygon mainnet. the necessary steps can be found [here](https://wiki.polygon.technology/docs/develop/hardhat) at the `Setting up the contract` section.

Now the rest of the contracts are ready to be deployed. To deploy them with hardhat run the following commands in the frontend_react\src\contracts_hardhat directory:

pnpm hardhat compile

pnpm hardhat run scripts/deploy_maestro.js --polygon_mumbai

After the contracts are deployed, their addresses will be printed to the console. These addresses need to be set in the location of the contract addresses in the project before booting up.

## Locations of Contract Addresses
 Enviorment Variables:
 - REACT_APP_MAESTRO_ADDRESS for Maestro(Auction) Contract
 - REACT_APP_PROJECT_REGISTER_ADDRESS for ProjectRegister Contract
 - REACT_APP_SUCOIN_ADDRESS for Sucoin Contract

They can also be set in the following files:
 - backend_dotnet\Constants\ContractConstants.cs
 - frontend_react\src\config.js


