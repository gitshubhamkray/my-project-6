require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();
if(process.env.SEPOLIA_RPC_URL&&(!process.env.DEPLOYER_PRIVATE_KEY||!/^0x[0-9a-fA-F]{64}$/.test(process.env.DEPLOYER_PRIVATE_KEY)))console.warn('Set a valid testnet DEPLOYER_PRIVATE_KEY to deploy to Sepolia');
module.exports={
 solidity:{version:'0.8.24',settings:{optimizer:{enabled:true,runs:200}}},
 networks:{hardhat:{chainId:31337},sepolia:{url:process.env.SEPOLIA_RPC_URL||'https://ethereum-sepolia-rpc.publicnode.com',accounts:process.env.DEPLOYER_PRIVATE_KEY&&/^0x[0-9a-fA-F]{64}$/.test(process.env.DEPLOYER_PRIVATE_KEY)?[process.env.DEPLOYER_PRIVATE_KEY]:[],chainId:11155111}},
 etherscan:{apiKey:process.env.ETHERSCAN_API_KEY||''}
};
