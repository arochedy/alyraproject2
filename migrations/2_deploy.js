// Import du smart contract "Voting"
const Voting = artifacts.require("voting");
module.exports = (deployer) => {
 // Deployer le smart contract!
 deployer.deploy(Voting);
} 
