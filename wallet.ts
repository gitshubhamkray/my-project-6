import {BrowserProvider,Contract} from 'ethers';
export const CHAIN_ID=Number(import.meta.env.VITE_TESTNET_CHAIN_ID||11155111);
export const EXPLORER=import.meta.env.VITE_BLOCK_EXPLORER||'https://sepolia.etherscan.io';
export const TOKEN_ADDRESS=import.meta.env.VITE_ASSET_TOKEN_ADDRESS||'';
export const COMPLIANCE_ADDRESS=import.meta.env.VITE_COMPLIANCE_ADDRESS||'';
export const TOKEN_ABI=[
 'function balanceOf(address,uint256) view returns (uint256)',
 'function claimDemo(uint256,uint256)',
 'function assets(uint256) view returns (uint256 cap,uint256 claimLimit,bool active)',
 'function claimed(uint256,address) view returns (uint256)',
 'function minted(uint256) view returns (uint256)'
];
export const KYC_ABI=['function isApproved(address) view returns (bool)','function selfAttestForDemo()'];
export function injected(){return (window as Window & {ethereum?:any}).ethereum}
export async function getProvider(){const eth=injected();if(!eth)throw new Error('MetaMask not detected. Install MetaMask or use demo mode.');return new BrowserProvider(eth)}
export async function connectWallet(){const provider=await getProvider();await provider.send('eth_requestAccounts',[]);const signer=await provider.getSigner();const network=await provider.getNetwork();return {address:await signer.getAddress(),chainId:Number(network.chainId)}}
export async function switchTestnet(){const eth=injected();if(!eth)throw new Error('MetaMask not available');await eth.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x'+CHAIN_ID.toString(16)}]})}
export async function balanceFor(address:string,id:number){if(!TOKEN_ADDRESS)return null;const provider=await getProvider();const net=await provider.getNetwork();if(Number(net.chainId)!==CHAIN_ID)return null;const token=new Contract(TOKEN_ADDRESS,TOKEN_ABI,provider);return Number(await token.balanceOf(address,id))}
export async function claimTestnet(assetId:number,quantity:number,onStatus:(message:string)=>void){
 if(!TOKEN_ADDRESS||!COMPLIANCE_ADDRESS)throw new Error('Testnet contracts are not configured. Use demo mode or deploy contracts and set VITE_* addresses.');
 if(!Number.isSafeInteger(quantity)||quantity<1)throw new Error('Enter a whole-number quantity of at least 1 token');
 const provider=await getProvider();const network=await provider.getNetwork();if(Number(network.chainId)!==CHAIN_ID)throw new Error('Switch MetaMask to the configured testnet before continuing');
 const signer=await provider.getSigner();const address=await signer.getAddress();const kyc=new Contract(COMPLIANCE_ADDRESS,KYC_ABI,signer);
 if(!(await kyc.isApproved(address))){onStatus('Requesting mock on-chain verification…');const verify=await kyc.selfAttestForDemo();onStatus('Waiting for mock verification confirmation…');await verify.wait()}
 const token=new Contract(TOKEN_ADDRESS,TOKEN_ABI,signer);const config=await token.assets(assetId);
 if(!config.active)throw new Error('This asset is not registered on the configured testnet contract');
 const used=await token.claimed(assetId,address);
 if(used+BigInt(quantity)>config.claimLimit)throw new Error(`Testnet claim cap exceeded. Remaining: ${Math.max(0,Number(config.claimLimit-used))} tokens`);
 onStatus('Approve the testnet claim in MetaMask…');const tx=await token.claimDemo(assetId,quantity);onStatus('Waiting for testnet confirmation…');const receipt=await tx.wait();if(!receipt||receipt.status!==1)throw new Error('Testnet transaction reverted');
 return {hash:tx.hash,address};
}
