const SovStake = artifacts.require("SovStake");
const Dai = artifacts.require("Dai");
const truffleAssert = require('truffle-assertions');

contract("SovStake", accounts => {
    let sovStakeInstance;
    let daiInstance;
    let ownerAddress = accounts[0];
    let address  = accounts[1];
    let admin = accounts[2];

    beforeEach(async () => {
        sovStakeInstance = await SovStake.deployed();
        daiInstance = await Dai.deployed();
    })    

    it("...transfer DAI tokens", async () => {
        await daiInstance.transfer(address, web3.utils.toWei("1000", "ether"), {from: ownerAddress });
        let balance = await daiInstance.balanceOf(address);
        assert.equal(balance, web3.utils.toWei("1000", "ether"), "balance of token should be equal");
    });

    it("...Add DAI stakable tokens", async () => {
        let tx = await sovStakeInstance.addStakableToken(daiInstance.address, "DAI", daiInstance.address);
        truffleAssert.eventEmitted(tx, 'TokenAdded', (ev) => {
            return ev.token == daiInstance.address;
        });
        let name = await sovStakeInstance.getTokenName(daiInstance.address);
        assert.equal(name, "DAI", "Token name should be set to DAI");
    });

    it("...check list of tokens", async () => {
        let tokens = await sovStakeInstance.getTokenArray();
        let res = [daiInstance.address];
        assert.equal(tokens[0], res[0], "Token list should be not empty");
    });

    it("...set allowance", async () => {
        const status = await daiInstance.increaseAllowance(sovStakeInstance.address, web3.utils.toWei("100", "ether"), {from: address });
        let allowance = await daiInstance.allowance(address, sovStakeInstance.address);
        assert.equal(allowance, web3.utils.toWei("100", "ether"), "allowance should be equal to stake value and not to " + allowance.toString());
    });

    it("...stake tokens", async () => {
        let tx = await sovStakeInstance.stake(daiInstance.address, web3.utils.toWei("100", "ether"), {from: address });
        truffleAssert.eventEmitted(tx, 'TokenStaked', (ev) => {
            return ev.staker == address && ev.quantity == web3.utils.toWei("100", "ether");
        });
        let tvl = await sovStakeInstance.getMyTVL(daiInstance.address, {from: address });
        assert.equal(tvl, web3.utils.toWei("100", "ether"), "tvl should be equal to stake value ");
    });

    it("...withdraw tokens", async () => {
        let tx = await sovStakeInstance.withdraw(daiInstance.address, {from: address });
        truffleAssert.eventEmitted(tx, 'RewardsSent', (ev) => {
            return ev.staker == address;
        });
        truffleAssert.eventEmitted(tx, 'TokenWithdrawn', (ev) => {
            return ev.staker == address;
        });
        let tvl = await sovStakeInstance.getMyTVL(daiInstance.address, {from: address });
        assert.equal(tvl, web3.utils.toWei("0", "ether"), "tvl should be equal to zero ");
    });
    
    it("...get reward balance", async () => {
        let reward = await sovStakeInstance.balanceOf(address);
        assert.notEqual(reward, 0, "reward should not be equal to 0 " + reward.toString());
    });

    it("...disable stakable token", async () => {
        await sovStakeInstance.updateTokenStatus(address, false);
        await truffleAssert.fails(sovStakeInstance.stake(daiInstance.address, web3.utils.toWei("100", "ether"), {from: address }));
    });    

    it("...test privilege right", async () => {
        await truffleAssert.fails(sovStakeInstance.setRatio(10, {from: admin }));
    });

    it("...add admin address privileges and check ratio", async () => {
        await sovStakeInstance.updatePrivileged(admin, true);
        let tx = await sovStakeInstance.setRatio(50, {from: admin });
        truffleAssert.eventEmitted(tx, 'RatioChanged', (ev) => {
            return ev.ratio == 50;
        });
    });

    it("...get ratio", async () => {
        let value = await sovStakeInstance.getRatio();
        assert.equal(value, 50, "Ratio should be equal to 50");

    });

    it("...remove privilege to admin", async () => {
        await sovStakeInstance.updatePrivileged(admin, false);
        await truffleAssert.fails(sovStakeInstance.setRatio(10, {from: admin }));
    });
});