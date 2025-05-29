// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IGetBeacon
/// @author Oleg Bedrin - Xsolla Web3 <o.bedrin@xsolla.com>.
/// @notice Interface for retrieving the beacon address and its proxy bytecode hash.
interface IGetBeacon {
    /// @notice Returns the address of the beacon.
    /// @return The address of the beacon.
    function beacon() external view returns (address);

    /// @notice Returns the hash of the beacon proxy bytecode.
    /// @return The hash of the beacon proxy bytecode.
    function beaconProxyBytecodeHash() external view returns (bytes32);
}