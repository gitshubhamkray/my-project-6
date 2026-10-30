// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';

/** Educational compliance demo ONLY. No identity check takes place.
 *  Self-attestation is deliberately permitted on testnets for hackathon flows.
 *  DO NOT deploy this contract as a compliance mechanism for real assets. */
contract ComplianceManager is AccessControl {
    mapping(address => bool) private approved;
    event DemoApprovalSet(address indexed wallet, bool approved, address indexed actor);
    constructor(address admin) {
        require(admin != address(0), 'Invalid admin');
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }
    function selfAttestForDemo() external {
        approved[msg.sender] = true;
        emit DemoApprovalSet(msg.sender, true, msg.sender);
    }
    function setDemoApproval(address wallet, bool value) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(wallet != address(0), 'Invalid wallet');
        approved[wallet] = value;
        emit DemoApprovalSet(wallet, value, msg.sender);
    }
    function isApproved(address wallet) external view returns (bool) { return approved[wallet]; }
}
