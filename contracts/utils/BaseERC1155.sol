// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC1155 } from '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { ISetBaseURI } from './interfaces/ISetBaseURI.sol';

/// @title BaseERC1155
/// @author Oleg Bedrin <o.bedrin@xsolla.com> - Xsolla Web3
/// @notice A base contract for ERC1155 tokens with minting, burning, and base URI management.
/// @custom:include-in-addresses-report false
contract BaseERC1155 is ERC1155, Ownable, ISetBaseURI {
    /// @notice Initializes the contract with an empty URI.
    constructor() ERC1155('') {}

    /// @notice Mints a specified amount of tokens to a given address.
    /// @param to The address to mint tokens to.
    /// @param id The ID of the token to mint.
    /// @param value The amount of tokens to mint.
    function mint(address to, uint256 id, uint256 value) external virtual {
        _mint(to, id, value, abi.encodePacked(""));
    }

    /// @notice Burns a specified amount of tokens from a given address.
    /// @param from The address to burn tokens from.
    /// @param id The ID of the token to burn.
    /// @param value The amount of tokens to burn.
    function burn(address from, uint256 id, uint256 value) external virtual {
        _burn(from, id, value);
    }

    /// @notice Sets the base URI for all token types.
    /// @param newURI The new base URI to set.
    /// @inheritdoc ISetBaseURI
    function setBaseURI(string memory newURI) external virtual override onlyOwner {
        _setURI(newURI);
    }
}
