// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SovToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("SovToken", "SOV") {
        _mint(msg.sender, initialSupply);
    }
}

contract SovStake is Ownable{
    IERC20 stakeToken;
    SovToken rewardToken;

    mapping(address => uint) private stakers;
    mapping(address => uint) private stakersDate;
    AggregatorV3Interface internal priceFeed;

    constructor(address _stakeToken, address _priceFeed) {
        // DAI/ETH price Feed on Kovan testnet
        //priceFeed = AggregatorV3Interface(0x74825DbC8BF76CC4e9494d0ecB210f676Efa001D);
        priceFeed = AggregatorV3Interface(_priceFeed);
        // injecter l'address du token Dai à utiliser (Kovan)
        //dai = IERC20(0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa);
        stakeToken = IERC20(_stakeToken);
        //rewardToken = IERC20(_stakeToken);
    }

    function stake(uint quantity) public {
        if (stakers[msg.sender] > 0 && stakersDate[msg.sender] > 0) {
            computeRewards(msg.sender);
        }
        stakers[msg.sender] =  stakers[msg.sender] + quantity;
        stakersDate[msg.sender] = block.timestamp;
        stakeToken.transferFrom(msg.sender, address(this), quantity);
    }

    function computeRewards(address staker) private {

    }
   
    // Return latest price of DIA in ETH
    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
}