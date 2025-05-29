// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { BaseERC20 } from './BaseERC20.sol';

/// @title ERC20Factory
/// @author Oleg Bedrin <o.bedrin@xsolla.com> - Xsolla Web3
/// @notice A factory contract for deploying BaseERC20 tokens with role-based access control.
contract ERC20Factory is Ownable {
    /// @notice Emitted when a new ERC20 token is deployed.
    /// @param newTokenAddress The address of the newly deployed ERC20 token.
    event NewERC20Deployed(address indexed newTokenAddress);

    /// @notice Deploys a new BaseERC20 token with the specified parameters.
    /// @param name The name of the token.
    /// @param symbol The symbol of the token.
    /// @param defaultAdmin The address to be granted DEFAULT_ADMIN_ROLE.
    /// @param pauser The address to be granted PAUSER_ROLE.
    /// @param minter The address to be granted MINTER_ROLE.
    function deployERC20(
        string memory name,
        string memory symbol,
        address defaultAdmin,
        address pauser,
        address minter
    ) external onlyOwner {
        BaseERC20 token = new BaseERC20(
            name,
            symbol,
            defaultAdmin,
            pauser,
            minter
        );
        emit NewERC20Deployed(address(token));
    }
}
