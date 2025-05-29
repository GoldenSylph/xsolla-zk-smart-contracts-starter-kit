// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ISetBaseURI
/// @author Oleg Bedrin - Xsolla Web3 <o.bedrin@xsolla.com>.
/// @notice Interface for setting the base URI for a contract.
interface ISetBaseURI {
    /// @notice Sets the base URI for the contract.
    /// @param newURI The new base URI to set.
    function setBaseURI(string memory newURI) external;
}