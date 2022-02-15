var SovStake = artifacts.require("./SovStake.sol");
var SovToken = artifacts.require("./SovStake.sol");

module.exports = function(deployer) {
  deployer.deploy(SovToken, 1000000000000000000000);
  deployer.deploy(SovStake, 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa, 0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D);
};
