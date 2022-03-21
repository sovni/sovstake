var SovStake = artifacts.require("SovStake");
var SovToken = artifacts.require("SovToken");
var DaiToken = artifacts.require("Dai");

module.exports = function(deployer) {
  deployer.deploy(SovToken)
  .then(() =>
    deployer.deploy(DaiToken)
    .then(() =>
      deployer.deploy(SovStake, SovToken.address, DaiToken.address)));
};
