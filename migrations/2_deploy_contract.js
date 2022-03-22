var SovStake = artifacts.require("SovStake");
var DaiToken = artifacts.require("Dai");

module.exports = function(deployer) {
    deployer.deploy(DaiToken)
    .then(() =>
      deployer.deploy(SovStake));
};
