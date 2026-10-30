const {expect}=require('chai');
const {ethers}=require('hardhat');
describe('VESTORA testnet contracts',function(){
 async function setup(){
  const [admin,alice,bob]=await ethers.getSigners();
  const Compliance=await ethers.getContractFactory('ComplianceManager');const compliance=await Compliance.deploy(admin.address);
  const Token=await ethers.getContractFactory('AssetToken');const token=await Token.deploy(admin.address,await compliance.getAddress());
  await token.registerAsset(1,50,10,'ipfs://educational-asset');return {admin,alice,bob,compliance,token};
 }
 it('allows a demo KYC-attested wallet to claim within caps',async function(){const {alice,compliance,token}=await setup();await compliance.connect(alice).selfAttestForDemo();await expect(token.connect(alice).claimDemo(1,3)).to.emit(token,'DemoTokensClaimed');expect(await token.balanceOf(alice.address,1)).to.equal(3);expect(await token.uri(1)).to.equal('ipfs://educational-asset');});
 it('blocks claims without demo KYC',async function(){const {alice,token}=await setup();await expect(token.connect(alice).claimDemo(1,1)).to.be.revertedWith('Demo KYC not self-attested')});
 it('limits claims per wallet and cannot register an existing asset',async function(){const {alice,token,compliance}=await setup();await compliance.connect(alice).selfAttestForDemo();await token.connect(alice).claimDemo(1,10);await expect(token.connect(alice).claimDemo(1,1)).to.be.revertedWith('Wallet faucet cap');await expect(token.registerAsset(1,99,9,'x')).to.be.revertedWith('Asset registered')});
 it('restricts transfers to demo-attested recipients',async function(){const {alice,bob,token,compliance}=await setup();await compliance.connect(alice).selfAttestForDemo();await token.connect(alice).claimDemo(1,2);await expect(token.connect(alice).safeTransferFrom(alice.address,bob.address,1,1,'0x')).to.be.revertedWith('Receiver lacks demo KYC');await compliance.connect(bob).selfAttestForDemo();await token.connect(alice).safeTransferFrom(alice.address,bob.address,1,1,'0x');expect(await token.balanceOf(bob.address,1)).to.equal(1)});
 it('respects admin-only permissions and pause',async function(){const {alice,admin,token,compliance}=await setup();await expect(token.connect(alice).registerAsset(2,100,10,'x')).to.be.reverted;await compliance.connect(alice).selfAttestForDemo();await token.connect(admin).pause();await expect(token.connect(alice).claimDemo(1,1)).to.be.reverted;});
});
