// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {Pausable} from '@openzeppelin/contracts/utils/Pausable.sol';
import {ComplianceManager} from './ComplianceManager.sol';

/** DEMO-ONLY ERC-1155. Tokens confer NO claim to property, commodities, cash flows, or securities.
 *  No real-money purchase or payments are supported. Public testnet faucet is rate-limited per wallet. */
contract AssetToken is ERC1155, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    ComplianceManager public immutable compliance;
    struct AssetConfig { uint256 cap; uint256 claimLimit; bool active; }
    mapping(uint256 => AssetConfig) public assets;
    mapping(uint256 => uint256) public minted;
    mapping(uint256 => mapping(address => uint256)) public claimed;
    mapping(uint256 => string) private customUris;
    event AssetRegistered(uint256 indexed id, uint256 cap, uint256 maxClaim);
    event DemoTokensClaimed(address indexed wallet, uint256 indexed id, uint256 quantity);
    constructor(address admin, address complianceAddress) ERC1155('') {
        require(admin != address(0) && complianceAddress != address(0), 'Invalid address');
        compliance = ComplianceManager(complianceAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }
    function registerAsset(uint256 id, uint256 cap, uint256 claimLimit, string calldata metadataUri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(id != 0 && cap > 0 && claimLimit > 0 && claimLimit <= cap, 'Invalid config');
        require(!assets[id].active, 'Asset registered');
        assets[id] = AssetConfig(cap, claimLimit, true);
        customUris[id] = metadataUri;
        emit AssetRegistered(id, cap, claimLimit);
    }
    function uri(uint256 id) public view override returns (string memory) { return customUris[id]; }
    function claimDemo(uint256 id, uint256 quantity) external whenNotPaused {
        AssetConfig memory a = assets[id];
        require(a.active && quantity > 0, 'Unknown asset or quantity');
        require(compliance.isApproved(msg.sender), 'Demo KYC not self-attested');
        require(claimed[id][msg.sender] + quantity <= a.claimLimit, 'Wallet faucet cap');
        require(minted[id] + quantity <= a.cap, 'Token cap');
        claimed[id][msg.sender] += quantity;
        minted[id] += quantity;
        _mint(msg.sender, id, quantity, '');
        emit DemoTokensClaimed(msg.sender, id, quantity);
    }
    function mintAuthorized(address to, uint256 id, uint256 quantity) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(assets[id].active && quantity > 0, 'Unknown asset or quantity');
        require(minted[id] + quantity <= assets[id].cap, 'Token cap');
        minted[id] += quantity;
        _mint(to, id, quantity, '');
    }
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
    function _update(address from,address to,uint256[] memory ids,uint256[] memory amounts) internal override whenNotPaused {
        if (from != address(0)) require(compliance.isApproved(from), 'Sender lacks demo KYC');
        if (to != address(0)) require(compliance.isApproved(to), 'Receiver lacks demo KYC');
        super._update(from,to,ids,amounts);
    }
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155,AccessControl) returns(bool){return super.supportsInterface(interfaceId);}
}
