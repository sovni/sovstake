const Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');
const SovStake = require('../build/contracts/SovStake.json');
require('dotenv').config();

const address = '0xb1855cd43D57DC181ac99E2B1905390eDFCFDD4E';
const privateKey = process.env.MNEMONIC;
const infuraUrl = 'https://kovan.infura.io/v3/' + process.env.INFURA_ID; 

//console.log(process.env);
//Easy way (Web3 + @truffle/hdwallet-provider)
const addChainlinkKovanFeeds = async () => {
    const provider = new Provider(privateKey, infuraUrl); 
    const web3 = new Web3(provider);
    const networkId = await web3.eth.net.getId();
    const sovContract = new web3.eth.Contract(
        SovStake.abi,
        SovStake.networks[networkId].address
    );
  
    // DAI/ETH
    console.log(await sovContract.methods.addStakableToken("0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa", "DAI", "0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541").send({from: address}));
    // LINK/ETH
    console.log(await sovContract.methods.addStakableToken("0xa36085F69e2889c224210F603D836748e7dC0088", "LINK", "0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38").send({from: address}));
    // KNC/ETH
    console.log(await sovContract.methods.addStakableToken("0xad67cB4d63C9da94AcA37fDF2761AaDF780ff4a2", "KNC", "0xb8E8130d244CFd13a75D6B9Aee029B1C33c808A7").send({from: address}));
    // MANA/ETH
    console.log(await sovContract.methods.addStakableToken("0xcb78b457c1F79a06091EAe744aA81dc75Ecb1183", "MANA", "0x1b93D8E109cfeDcBb3Cc74eD761DE286d5771511").send({from: address}));
    // MKR/ETH
    console.log(await sovContract.methods.addStakableToken("0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD", "MKR", "0x0B156192e04bAD92B6C1C13cf8739d14D78D5701").send({from: address}));
    // REP/ETH
    console.log(await sovContract.methods.addStakableToken("0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea", "REP", "0x3A7e6117F2979EFf81855de32819FBba48a63e9e").send({from: address}));
}
  
addChainlinkKovanFeeds();