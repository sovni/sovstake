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

contract SovToken is ERC20 {
    constructor() ERC20("SovToken", "SOV") {
        _mint(msg.sender, 21000000000000000000000000);
    }
}


contract SovStake is Ownable{
    IERC20 stakeToken;
    IERC20 rewardToken;

    mapping(address => uint) private stakers;
    mapping(address => uint) private stakersDate;
    //AggregatorV3Interface internal priceFeed;
    uint private tvl;
    uint private ratio;

    event TokenStaked();
    event TokenWithdrawn();

    using SafeMath for uint;

    constructor(address _rewardToken, address _stakeToken) {//}, address _priceFeed) {
        // DAI/ETH price Feed on Kovan testnet
        //priceFeed = AggregatorV3Interface(0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D);
        //priceFeed = AggregatorV3Interface(_priceFeed);
        // injecter l'address du token Dai à utiliser (Kovan)
        //dai = IERC20(0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa);
        stakeToken = IERC20(_stakeToken);
        rewardToken = IERC20(_rewardToken);
        ratio = 100;
    }


    function stake(uint quantity) public {
        if (stakers[msg.sender] > 0 && stakersDate[msg.sender] > 0) {
            computeRewards(msg.sender);
        }
        stakers[msg.sender] =  stakers[msg.sender].add(quantity);
        tvl = tvl.add(quantity);
        stakersDate[msg.sender] = block.timestamp;
        stakeToken.transferFrom(msg.sender, address(this), quantity);
        emit TokenStaked();
    }

    function withdraw() public {
        require(stakers[msg.sender] > 0, "No staked token.");
        require(stakersDate[msg.sender] != 0, "No stake date registered.");
        
        computeRewards(msg.sender);
        uint quantity = stakers[msg.sender];
        stakers[msg.sender] = 0;
        stakersDate[msg.sender] = 0;
        tvl = tvl.sub(quantity);
        stakeToken.transferFrom(address(this), msg.sender, quantity);        
        emit TokenWithdrawn();
    }

    function computeRewards(address staker) private {
        require(stakers[staker] > 0, "No staked token.");
        require(stakersDate[staker] != 0, "No stake date registered.");

        uint rewards = 10;//(getLatestPrice().mul(stakers[staker])) * (block.timestamp - stakersDate[staker]) / ratio;

        stakersDate[staker] = block.timestamp;
        rewardToken.transferFrom(address(this), staker, rewards);
    }

    function getTVL() public view returns (uint) {
        return tvl;
    }   

    function getMyTVL() public view returns (uint) {
        return stakers[msg.sender];
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