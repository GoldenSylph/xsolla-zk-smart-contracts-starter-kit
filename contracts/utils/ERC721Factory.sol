// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { BaseERC721 } from './BaseERC721.sol';
import { SVGIconsLib } from './libraries/SVGIconsLib.sol';

/// @title ERC721Factory
/// @author Oleg Bedrin <o.bedrin@xsolla.com> - Xsolla Web3
/// @notice A factory contract for deploying ERC721 collections with default or custom configurations.
contract ERC721Factory is Ownable {
    /// @notice Emitted when a new collection is deployed.
    /// @param newCollectionAddress The address of the newly deployed collection.
    event NewCollectionDeployed(address indexed newCollectionAddress);

    /// @notice Sets a new owner for a deployed collection.
    /// @param collectionAddress The address of the collection.
    /// @param newOwner The address of the new owner.
    function setNewOwnerOfCollection(address collectionAddress, address newOwner) external onlyOwner {
        Ownable(collectionAddress).transferOwnership(newOwner);
    }

    /// @notice The default maximum supply for collections.
    uint256 public constant DEFAULT_MAX_SUPPLY = 100_000;

    /// @notice Default fields for SVG icons.
    SVGIconsLib.Field[8] internal DEFAULT_FIELDS = [
        SVGIconsLib.Field('Name: ', 'XZKET', 'none'),
        SVGIconsLib.Field('Description: ', 'Testing token', 'none'),
        SVGIconsLib.Field('', '', 'none'),
        SVGIconsLib.Field('', '', 'none'),
        SVGIconsLib.Field('', '', 'none'),
        SVGIconsLib.Field('', '', 'none'),
        SVGIconsLib.Field('', '', 'none'),
        SVGIconsLib.Field('', '', 'none')
    ];

    /// @notice Default IPFS image URI.
    string public constant IPFS_DEFAULT_IMAGE = "bafkreie7ohywtosou76tasm7j63yigtzxe7d5zqus4zu3j6oltvgtibeom"; // Hello IPFS image.

    /// @notice Deploys a new collection with default configurations.
    /// @param _name The name of the collection.
    /// @param _symbol The symbol of the collection.
    function deployDefaultCollection(
        string memory _name,
        string memory _symbol
    ) external {
        BaseERC721 collection = new BaseERC721(
            address(this),
            _name,
            _symbol,
            DEFAULT_MAX_SUPPLY
        );
        collection.setDefaultFields(DEFAULT_FIELDS);
        collection.setIpfsDefaultImage(IPFS_DEFAULT_IMAGE);
        emit NewCollectionDeployed(address(collection)); 
    }

    /// @notice Deploys a new collection with custom configurations.
    /// @param _defaultFields The default fields for SVG icons.
    /// @param _ipfsDefaultImage The default IPFS image URI.
    /// @param _name The name of the collection.
    /// @param _symbol The symbol of the collection.
    /// @param _maxSupply The maximum supply of the collection.
    function deployCollection(
        SVGIconsLib.Field[8] memory _defaultFields,
        string memory _ipfsDefaultImage,
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply
    ) external {
        BaseERC721 collection = new BaseERC721(
            address(this),
            _name,
            _symbol,
            _maxSupply
        );
        collection.setDefaultFields(_defaultFields);
        collection.setIpfsDefaultImage(_ipfsDefaultImage);
        emit NewCollectionDeployed(address(collection)); 
    }
}