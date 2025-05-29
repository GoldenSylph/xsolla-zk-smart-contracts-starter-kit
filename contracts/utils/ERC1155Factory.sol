// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { BaseERC1155 } from './BaseERC1155.sol';

/// @title ERC1155Factory
/// @author Oleg Bedrin <o.bedrin@xsolla.com> - Xsolla Web3
/// @notice A factory contract for deploying ERC1155 collections with base URI management.
contract ERC1155Factory is Ownable {
    /// @notice Emitted when a new collection is deployed.
    /// @param newCollectionAddress The address of the newly deployed collection.
    event NewCollectionDeployed(address indexed newCollectionAddress);

    /// @notice Sets a new owner for a deployed collection.
    /// @param collectionAddress The address of the collection.
    /// @param newOwner The address of the new owner.
    function setNewOwnerOfCollection(address collectionAddress, address newOwner) external onlyOwner {
        Ownable(collectionAddress).transferOwnership(newOwner);
    }

    /// @notice Deploys a new ERC1155 collection with a specified base URI.
    /// @param baseURI The base URI for the new collection.
    function deployCollection(string memory baseURI) external {
        BaseERC1155 collection = new BaseERC1155();
        collection.setBaseURI(baseURI);
        emit NewCollectionDeployed(address(collection)); 
    }
}
