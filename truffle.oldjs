var HDWalletProvider = require("@truffle/hdwallet-provider");
const MNEMONIC =
  "height convince torch crack snake relax reform pull match please over diagram";

module.exports = {
  mocha: {
    // timeout: 100000
  },
  networks: {
    // development: {
    //   host: "127.0.0.1",
    //   port: 7545,
    //   network_id: "*",
    // },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/v3/d6a7128b3b23484782dd12c7703d5d4a")
      },
      network_id: 3,
      gas: 4000000 ,     //make sure this gas allocation isn't over 4M, which is the max,
      skipDryRun : true,
    },
    matic: {
      provider: () =>
        new HDWalletProvider(
          MNEMONIC,
          `https://matic-mumbai.chainstacklabs.com/`
        ),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    testnetbsc: {
      provider: () =>
        new HDWalletProvider(
          MNEMONIC,
          `https://data-seed-prebsc-2-s3.binance.org:8545/`
        ),
      network_id: 97,
      confirmations: 10,
      
      timeoutBlocks: 2000,
      skipDryRun: true,
      gas: 5500000, // Ropsten has a lower block limit than mainnet
      networkCheckTimeout: 1000000,
    },
    bsc: {
      provider: () =>
        new HDWalletProvider(MNEMONIC, `https://bsc-dataseed1.binance.org`),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.14",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },
};

// hello word  contract address:   0x891bEf10EfC553989E3d68ed3914Df9a9D00d823
//hellow word 2 0x1002f948d14a50D71d4C142AE76B05FC7fF16efA
//hello word 2 matic mumbai : 0xDa42f15deB5326C179d9DA2C7c99e27BdEe2a1Cd // 0xaBEd8c33898D272c53737BAD5742F8E9636F5604
//cookie game ropsten : 0x0B5973eAcCF3E680dA2dF93afd1e07e5dFD08cd5