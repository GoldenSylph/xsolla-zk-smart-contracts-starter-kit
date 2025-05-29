// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title BaseERC20
/// @author Oleg Bedrin <o.bedrin@xsolla.com> - Xsolla Web3
/// @notice ERC20 token with pausable, mintable, and permit (EIP-2612) features, using role-based access control.
/// @custom:security-contact o.bedrin@xsolla.com
/// @custom:include-in-addresses-report false
contract BaseERC20 is ERC20, ERC20Pausable, AccessControl, ERC20Permit {
    /// @notice Role identifier for pausers
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    /// @notice Role identifier for minters
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Initializes the ERC20 token with roles and permit support
    /// @param name The name of the token
    /// @param symbol The symbol of the token
    /// @param defaultAdmin The address to be granted DEFAULT_ADMIN_ROLE
    /// @param pauser The address to be granted PAUSER_ROLE
    /// @param minter The address to be granted MINTER_ROLE
    constructor(string memory name, string memory symbol, address defaultAdmin, address pauser, address minter)
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, pauser);
        _grantRole(MINTER_ROLE, minter);
    }

    /// @notice Pauses all token transfers
    /// @dev Only callable by accounts with PAUSER_ROLE
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpauses all token transfers
    /// @dev Only callable by accounts with PAUSER_ROLE
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Mints new tokens to a specified address
    /// @dev Only callable by accounts with MINTER_ROLE
    /// @param to The address to receive the minted tokens
    /// @param amount The amount of tokens to mint
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /// @inheritdoc ERC20
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
}
