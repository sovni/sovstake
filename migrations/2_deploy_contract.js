var SovStake = artifacts.require("SovStake");
var SovToken = artifacts.require("SovToken");
var DaiToken = artifacts.require("Dai");

module.exports = function(deployer) {
  deployer.deploy(SovToken);
  deployer.deploy(DaiToken);
  deployer.deploy(SovStake, '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa', '0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D');
};
