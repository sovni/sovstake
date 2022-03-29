// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Dai is ERC20 {
    constructor() ERC20("DAI", "DAI") {
        _mint(msg.sender, 21000000000000000000000000);
    }
}

contract SovStake is ERC20, Ownable {
    struct stakableToken {
        string name;
        address aggregator;
        bool enabled;
        uint tvl;
        AggregatorV3Interface priceFeed;
        mapping(address => uint) stakers;
        mapping(address => uint) stakersDate;
    }
    mapping(address => bool) private privileged;
    mapping(address => stakableToken) private stakeTokens;
    address[] private tokenArray;

    uint private ratio;

    event TokenStaked(address staker, uint quantity);
    event TokenWithdrawn(address staker);
    event TokenAdded(address token);
    event RatioChanged(uint ratio);
    event RewardsSent(address staker, uint rewards);

    using SafeMath for uint;

    constructor() ERC20("SovToken", "SOV") {
        //_mint(msg.sender, 21000000000000000000000000);
        privileged[owner()] = true;
    }

    function addStakableToken(address token, string memory name, address aggregator) public onlyPrivileged {
        require(token != address(0), "token with zero address not allowed");
        require(aggregator != address(0), "aggregator cannot be a zero address");
        require(stakeTokens[token].aggregator == address(0), "token already existing");
        //require(name.length != 0, "token name cannot be empty");

        stakeTokens[token].name = name;
        stakeTokens[token].aggregator = aggregator;
        stakeTokens[token].enabled = true;
        //stakeTokens[token].priceFeed = AggregatorV3Interface(aggregator);

        tokenArray.push(token);

        emit TokenAdded(token);
    }

    function disableStakableToken(address token) public onlyPrivileged {
        require(token != address(0), "token with zero address not allowed");
        stakeTokens[token].enabled = false;
    }

    function getTokenArray()public view returns( address  [] memory){
        return tokenArray;
    }

    function getTokenName(address token) public view returns (string memory) {
        require(token != address(0), "token with zero address not allowed");
        return stakeTokens[token].name;
    }

    function getRatio()public view returns(uint){
        return ratio;
    }

    function setRatio(uint value) public onlyPrivileged {
        require(value != 0, "ratio cannot be 0");
        ratio = value;
        emit RatioChanged(ratio);
    }

    function stake(address token, uint quantity) public {
        require(token != address(0), "token with zero address not allowed");
        require(stakeTokens[token].enabled != false, "Stake of this token is disabled");

        if (stakeTokens[token].stakers[msg.sender] > 0 && stakeTokens[token].stakersDate[msg.sender] > 0) {
            computeRewards(token, msg.sender);
        }
        stakeTokens[token].stakers[msg.sender] =  stakeTokens[token].stakers[msg.sender].add(quantity);
        stakeTokens[token].tvl = stakeTokens[token].tvl.add(quantity);
        stakeTokens[token].stakersDate[msg.sender] = block.timestamp;
        ERC20(token).transferFrom(msg.sender, address(this), quantity);
        emit TokenStaked(msg.sender, quantity);
    }

    function withdraw(address token) public {
        require(stakeTokens[token].stakers[msg.sender] > 0, "No staked token.");
        require(stakeTokens[token].stakersDate[msg.sender] != 0, "No stake date registered.");
        
        computeRewards(token, msg.sender);
        uint quantity = stakeTokens[token].stakers[msg.sender];
        stakeTokens[token].stakers[msg.sender] = 0;
        stakeTokens[token].stakersDate[msg.sender] = 0;
        stakeTokens[token].tvl = stakeTokens[token].tvl.sub(quantity);
        ERC20(token).transfer(msg.sender, quantity);        
        emit TokenWithdrawn(msg.sender);
    }

    function computeRewards(address token, address staker) private {
        require(stakeTokens[token].stakers[staker] > 0, "No staked token.");
        require(stakeTokens[token].stakersDate[staker] != 0, "No stake date registered.");

        uint rewards = (getLatestPrice(token).mul(stakeTokens[token].stakers[staker])) * (block.timestamp - stakeTokens[token].stakersDate[staker]) / ratio;

        stakeTokens[token].stakersDate[staker] = block.timestamp;
        _mint(staker, rewards);
        emit RewardsSent(staker, rewards);
    }

    function getTVL(address token) public view returns (uint) {
        return stakeTokens[token].tvl;
    }   

    function getMyTVL(address token) public view returns (uint) {
        return stakeTokens[token].stakers[msg.sender];
    }   

    function updatePrivileged(address account, bool enabled) public onlyOwner {
        privileged[account] = enabled;
    }

    modifier onlyPrivileged() {
        require(privileged[_msgSender()] == true, "Caller is not privileged");
        _;
    }
    // Return latest price of Token in ETH
    function getLatestPrice(address token) public view returns (uint) {
        int price;
        price = 1;//stakeTokens[token].priceFeed.latestRoundData();
 
        return uint(price);
    }
}