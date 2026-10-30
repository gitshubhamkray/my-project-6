const hre=require('hardhat');
const fs=require('fs');
const path=require('path');
const tokenCatalog=[
  ['gold',100000],['silver',85000],['platinum',30000],['palladium',25000],['wti',80000],['brent',70000],['gas',60000],['gasoline',45000],['copper',90000],['aluminium',60000],['nickel',55000],['zinc',40000],['lead',38000],['tin',30000],['wheat',70000],['corn',70000],['soybeans',65000],['coffee',50000],['cocoa',45000],['sugar',50000],['cotton',45000],['bitcoin',200000],['ethereum',150000],['solana',120000],['xrp',130000],['treasury',50000],['real-estate',10000]
];
async function main(){
 const [deployer]=await hre.ethers.getSigners();if(!deployer)throw new Error('Configure a testnet signer');
 const network=await hre.ethers.provider.getNetwork();if(![31337n,11155111n].includes(network.chainId))throw new Error('Only local Hardhat or Sepolia testnet supported');
 console.log('Deploying demo contracts using',deployer.address,'on chain',String(network.chainId));
 const Compliance=await hre.ethers.getContractFactory('ComplianceManager');const compliance=await Compliance.deploy(deployer.address);await compliance.waitForDeployment();
 const Asset=await hre.ethers.getContractFactory('AssetToken');const asset=await Asset.deploy(deployer.address,await compliance.getAddress());await asset.waitForDeployment();
 for(let i=0;i<tokenCatalog.length;i++){
   const [id,cap]=tokenCatalog[i];const metadata=process.env.METADATA_BASE_URI?`${process.env.METADATA_BASE_URI.replace(/\/$/,'')}/${id}.json`:'data:application/json;base64,'+Buffer.from(JSON.stringify({name:`VESTORA ${id.toUpperCase()} DEMO`,description:'Educational Sepolia token only. No claim to real assets, income, securities, or commodities.',attributes:[{trait_type:'Token ID',value:i+1},{trait_type:'Real-world ownership',value:'None'}]})).toString('base64');const tx=await asset.registerAsset(i+1,cap,Math.min(100,cap),metadata);await tx.wait();
 }
 const info={chainId:String(network.chainId),compliance:await compliance.getAddress(),assetToken:await asset.getAddress(),deployer:deployer.address,assetCount:tokenCatalog.length,notice:'Educational testnet tokens only, no real-world legal claim'};
 console.log(JSON.stringify(info,null,2));
 const file=path.resolve(__dirname,'../deployment.json');fs.writeFileSync(file,JSON.stringify(info,null,2));
 console.log('Set VITE_ASSET_TOKEN_ADDRESS and VITE_COMPLIANCE_ADDRESS in the root .env from deployment.json');
}
main().catch(e=>{console.error(e);process.exitCode=1});
