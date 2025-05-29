// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { ERC721 } from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import { ERC721Enumerable } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import { ERC721URIStorage } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

import { SVGIconsLib } from './libraries/SVGIconsLib.sol';

/// @title BaseERC721
/// @author Oleg Bedrin <o.bedrin@xsolla.com> - Xsolla Web3
/// @notice BaseERC721 is a base contract for ERC721 tokens with SVG icons and IPFS support.
/// @custom:include-in-addresses-report false
contract BaseERC721 is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    /// @notice Indicates whether SVG icons are utilized.
    bool public utilizeSvg;

    /// @notice Default IPFS image URI.
    string public ipfsDefaultImage;

    /// @notice Default fields for SVG icons.
    SVGIconsLib.Field[8] public defaultFields;

    /// @notice Base URI for token metadata.
    string public baseURI;
 
    /// @notice Tracks the next token ID to be minted.
    uint256 public nextTokenId;

    /// @notice Maximum supply of tokens.
    uint256 public immutable maxSupply;

    /// @notice Indicates whether an address has been minted to once.
    mapping(address => bool) public isMintedOnce;

    /// @dev Error thrown when max supply is reached.
    error MaxSupplyReached();

    /// @dev Error thrown when an address has already minted once.
    error AlreadyMintedOnce(address sender);

    /// @notice Initializes the contract with the given parameters.
    /// @param _factoryAddress Address of the factory contract.
    /// @param _name Name of the token.
    /// @param _symbol Symbol of the token.
    /// @param _maxSupply Maximum supply of tokens.
    constructor(address _factoryAddress, string memory _name, string memory _symbol, uint256 _maxSupply) ERC721(_name, _symbol) {
        maxSupply = _maxSupply;
        transferOwnership(_factoryAddress);
    }

    /// @notice Sets the token URI for a specific token ID.
    /// @param tokenId ID of the token.
    /// @param _tokenURI URI to set for the token.
    function setTokenUri(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }

    /// @notice Sets the base URI for token metadata.
    /// @param _baseURI Base URI to set.
    function setBaseUri(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    /// @notice Sets the default IPFS image URI.
    /// @param _ipfsDefaultImage IPFS URI to set.
    function setIpfsDefaultImage(string memory _ipfsDefaultImage) external onlyOwner {
        ipfsDefaultImage = _ipfsDefaultImage;
    }

    /// @notice Sets the default fields for SVG icons.
    /// @param _defaultFields Array of default fields to set.
    function setDefaultFields(SVGIconsLib.Field[8] memory _defaultFields) external onlyOwner {
        defaultFields = _defaultFields;
    }

    /// @notice Toggles the utilization of SVG icons.
    function toggleSvg() external onlyOwner {
        utilizeSvg = !utilizeSvg;
    }

    /// @notice Mints a new token to the specified address.
    /// @param to Address to mint the token to.
    /// @dev Reverts if the total supply exceeds the maximum supply.
    function mint(address to) external {
        _safeMint(to, ++nextTokenId);
        if (isMintedOnce[to]) {
            revert AlreadyMintedOnce(to);
        }
        isMintedOnce[to] = true;
        if (totalSupply() > maxSupply) {
            revert MaxSupplyReached();
        }
    }

    /// @notice Mints a new token to the TX sender.
    /// @dev Reverts if the total supply exceeds the maximum supply.
    function mint() external {
        address sender = _msgSender();
        _safeMint(sender, ++nextTokenId);
        if (isMintedOnce[sender]) {
            revert AlreadyMintedOnce(sender);
        }
        isMintedOnce[sender] = true;
        if (totalSupply() > maxSupply) {
            revert MaxSupplyReached();
        }
    }

    /// @inheritdoc ERC721URIStorage
    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        if (utilizeSvg) {
            _requireMinted(tokenId);
            return
                SVGIconsLib.getIcon(
                    name(),
                    'https://xsolla.com',
                    'Xsolla ZK Early Testnet',
                    abi.encodePacked(tokenId),
                    defaultFields
                );
        } else {
            return super.tokenURI(tokenId);
        }
    }

    /// @inheritdoc ERC721Enumerable
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @inheritdoc ERC721
    function _baseURI() internal view virtual override returns (string memory) {
        if (bytes(baseURI).length > 0) {
            return baseURI;
        } else {
            return string(abi.encodePacked('ipfs://', ipfsDefaultImage));
        }
    }

    /// @inheritdoc ERC721URIStorage
    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /// @inheritdoc ERC721Enumerable
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}
