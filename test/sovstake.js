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
        await sovStakeInstance.disableStakableToken(address);
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


    /*it("...start proposal registration phase should not be allowed if no voters regsitered", async () => {
        await truffleAssert.fails(votingInstance.startProposalsRegistration({ from:ownerAddress }));
    });

    it("...voter registration should not be allowed from not owner", async () => {
        await truffleAssert.fails(votingInstance.voterRegistration(accounts[2], { from:address }));
    });

    it("...making new proposal should not be allowed during this phase", async () => {
        await truffleAssert.fails(votingInstance.proposalRegistration("Proposal 4", { from:accounts[4] }));
    });

    it("...voter registration for 4 addresses", async () => {
        await votingInstance.voterRegistration(accounts[2], { from:ownerAddress });
        await votingInstance.voterRegistration(accounts[3], { from:ownerAddress });
        await votingInstance.voterRegistration(accounts[4], { from:ownerAddress });
        await votingInstance.voterRegistration(accounts[5], { from:ownerAddress });
        const nbVoters = await votingInstance.getNbVoters();
        assert.equal(4, nbVoters, "There should be 4 Voting addresses registered");
    });

    it("...start proposal registration phase should not be allowed if no owner", async () => {
        await truffleAssert.fails(votingInstance.startProposalsRegistration({ from:address }));
    });

    it("...start proposal registration phase", async () => {
        await votingInstance.startProposalsRegistration({from: ownerAddress });
        const status = await votingInstance.getVotingStatus({from: address });
        assert.equal(status, Voting.WorkflowStatus.ProposalsRegistrationStarted, "Voting status should be ProposalsRegistrationStarted");
    });

    it("...registering new voters should not be allowed during this phase", async () => {
        await truffleAssert.fails(votingInstance.voterRegistration(accounts[6], { from:ownerAddress }));
    });

    it("...make 3 different proposals from 3 different addresses", async () => {
        await votingInstance.proposalRegistration("Proposal 1", { from:ownerAddress });
        await votingInstance.proposalRegistration("Proposal 2", { from:address });
        await votingInstance.proposalRegistration("Proposal 3", { from:accounts[3] });
        const nbProposal = await votingInstance.getNbProposals();
        assert.equal(3, nbProposal, "There should be 3 proposals");
    });

    it("...voting should not be allowed during this phase", async () => {
        await truffleAssert.fails(votingInstance.voting(1, { from:accounts[2] }));
    });

    it("...stop proposal registration phase should not be allowed if no owner", async () => {
        await truffleAssert.fails(votingInstance.stopProposalsRegistration({ from:address }));
    });

    it("...voting should not be allowed during this phase", async () => {
        await truffleAssert.fails(votingInstance.voting(1, { from:accounts[2] }));
    });

    it("...stop proposal registration phase", async () => {
        await votingInstance.stopProposalsRegistration({from: ownerAddress });
        const status = await votingInstance.getVotingStatus({from: address });
        assert.equal(status, Voting.WorkflowStatus.ProposalsRegistrationEnded, "Voting status should be ProposalsRegistrationEnded");
    });

    it("...making new proposal should not be allowed during this phase", async () => {
        await truffleAssert.fails(votingInstance.proposalRegistration("Proposal 4", { from:accounts[4] }));
    });

    it("...registering new voters should not be allowed during this phase", async () => {
        await truffleAssert.fails(votingInstance.voterRegistration(accounts[6], { from:ownerAddress }));
    });

    it("...voting should not be allowed during this phase", async () => {
        await truffleAssert.fails(votingInstance.voting(1, { from:accounts[2] }));
    });

    it("...start voting phase should not be allowed if no owner", async () => {
        await truffleAssert.fails(votingInstance.startVotingSession({ from:address }));
    });

    it("...start voting phase", async () => {
        await votingInstance.startVotingSession({from: ownerAddress });
        const status = await votingInstance.getVotingStatus({from: address });
        assert.equal(status, Voting.WorkflowStatus.VotingSessionStarted, "Voting status should be VotingSessionStarted");
    });

    it("...registering new voters should not be allowed during this phase", async () => {
        await truffleAssert.fails(votingInstance.voterRegistration(accounts[6], { from:ownerAddress }));
    });

    it("...making new proposal should not be allowed during this phase", async () => {
        await truffleAssert.fails(votingInstance.proposalRegistration("Proposal 4", { from:accounts[4] }));
    });

    it("...vote from unregistered address is not allowed", async () => {
        await truffleAssert.fails(votingInstance.voting(1, { from:address }));
    });

    it("...vote from unexisting proposal  is not allowed", async () => {
        await truffleAssert.fails(votingInstance.voting(50, { from:accounts[2] }));
    });

    it("...apply vote for the registered addresses", async () => {
        await votingInstance.voting(1, { from:accounts[2] });
        await votingInstance.voting(2, { from:accounts[3] });
        await votingInstance.voting(3, { from:accounts[4] });
        await votingInstance.voting(2, { from:accounts[5] });
    });

    it("...stop voting phase should not be allowed if no owner", async () => {
        await truffleAssert.fails(votingInstance.stopVotingSession({ from:address }));
    });

    it("...stop voting phase", async () => {
        await votingInstance.stopVotingSession({from: ownerAddress });
        const status = await votingInstance.getVotingStatus({from: address });
        assert.equal(status, Voting.WorkflowStatus.VotesTallied, "Voting status should be VotesTallied");
    });

    it("...winning proposal should be number Proposal 2", async () => {
        const winningProposal = await votingInstance.getWinningProposal({from: address });
        assert.equal("Proposal 2", winningProposal, "Voting winning proposal should be Proposal 2");
    });

    it("...winning nb votes should be 2", async () => {
        const nbVotes = await votingInstance.getWinningVotes({from: address });
        assert.equal(2, nbVotes, "Voting winning numbers should be  2");
    });*/
});