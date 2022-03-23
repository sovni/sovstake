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
        mapping(address => uint) stakers;
        mapping(address => uint) stakersDate;
    }

    mapping(address => stakableToken) private stakeTokens;
    address[] private tokenArray;

    //AggregatorV3Interface internal priceFeed;
    uint private ratio;

    event TokenStaked();
    event TokenWithdrawn();

    using SafeMath for uint;

    constructor() ERC20("SovToken", "SOV") {
        //_mint(msg.sender, 21000000000000000000000000);
    }

    function addStakableToken(address token, string memory name, address aggregator) public onlyOwner {
        require(token != address(0), "token with zero address not allowed");
        require(aggregator != address(0), "aggregator cannot be a zero address");
        //require(name.length != 0, "token name cannot be empty");

        stakeTokens[token].name = name;
        stakeTokens[token].aggregator = aggregator;
        stakeTokens[token].enabled = true;
        tokenArray.push(token);
    }

    function getTokenName(address token) public view returns (string memory) {
        require(token != address(0), "token with zero address not allowed");
        return stakeTokens[token].name;
}

    function disableStakableToken(address token) public onlyOwner {
        require(token != address(0), "token with zero address not allowed");
        stakeTokens[token].enabled = false;
    }

    /*function addStakableToken(address _stakeToken) public onlyOwner {//}, address _priceFeed) {
        // DAI/ETH price Feed on Kovan testnet
        //priceFeed = AggregatorV3Interface(0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D);
        //priceFeed = AggregatorV3Interface(_priceFeed);
        // injecter l'address du token Dai à utiliser (Kovan)
        //dai = IERC20(0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa);
        stakeToken = IERC20(_stakeToken);
        //rewardToken = IERC20(_rewardToken);
        ratio = 100;
    }*/


    function stake(address token, uint quantity) public {
        require(token != address(0), "token with zero address not allowed");
        //require(stakeTokens[token].name.length != 0, "Not possible to stake this token");
        require(stakeTokens[token].enabled != false, "Stake of this token is disabled");

        if (stakeTokens[token].stakers[msg.sender] > 0 && stakeTokens[token].stakersDate[msg.sender] > 0) {
            computeRewards(token, msg.sender);
        }
        stakeTokens[token].stakers[msg.sender] =  stakeTokens[token].stakers[msg.sender].add(quantity);
        stakeTokens[token].tvl = stakeTokens[token].tvl.add(quantity);
        stakeTokens[token].stakersDate[msg.sender] = block.timestamp;
        ERC20(token).transferFrom(msg.sender, address(this), quantity);
        emit TokenStaked();
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
        emit TokenWithdrawn();
    }

    function computeRewards(address token, address staker) private {
        require(stakeTokens[token].stakers[staker] > 0, "No staked token.");
        require(stakeTokens[token].stakersDate[staker] != 0, "No stake date registered.");

        uint rewards = 10000000000000000000;//(getLatestPrice().mul(stakers[staker])) * (block.timestamp - stakersDate[staker]) / ratio;

        stakeTokens[token].stakersDate[staker] = block.timestamp;
        _mint(staker, rewards);
    }

    function getTVL(address token) public view returns (uint) {
        return stakeTokens[token].tvl;
    }   

    function getMyTVL(address token) public view returns (uint) {
        return stakeTokens[token].stakers[msg.sender];
    }   

    // Return latest price of DIA in ETH
    /*function getLatestPrice() public view returns (uint) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return uint(price);
    }*/
}