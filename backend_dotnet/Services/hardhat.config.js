require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const privateKey =
  "abd47e7cb955e202e66ff22d7e520e80d1064e8736fbcd2e2ebb79825ea1c692";

module.exports = {
  defaultNetwork: "polygon_mumbai",
  networks: {
    hardhat: {},
    polygon_mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78",
      accounts: [privateKey],
    },
    etherscan: {
      url: "https://api.polygonscan.com/api",
      apiKey: "NTJ9TJJYDU6BYWB1CW66Y17XS6MBF3P2XG",
    },
    eth: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "cc59d5791667a9c38445f6584f3647bfa54ef1919030068ae446875ac8933c80",
      ],
    },
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
