// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { Base64 } from '@openzeppelin/contracts/utils/Base64.sol';

/// @title SVGIconsLib
/// @author Oleg Bedrin <o.bedrin@xsolla.com> - Xsolla Web3
/// @notice The library generates SVG icons for NFTs.
/// @dev Uses Base64 encoding to generate SVG icons and returns them as JSON data compatible with OpenSea-like marketplaces.
library SVGIconsLib {
    /// @notice Represents a field in the SVG icon.
    /// @param name The name of the field.
    /// @param content The content of the field.
    /// @param displayType The display type of the field.
    struct Field {
        string name;
        string content;
        string displayType;
    }

    /// @notice Generates an SVG icon and returns it as a JSON string.
    /// @param name The name of the NFT.
    /// @param externalUrl The external URL associated with the NFT.
    /// @param shortDescription A short description of the NFT.
    /// @param tokenId The token ID of the NFT.
    /// @param fields An array of fields to include in the SVG icon.
    /// @return A JSON string containing the SVG icon and metadata.
    function getIcon(
        string memory name,
        string memory externalUrl,
        string memory shortDescription,
        bytes memory tokenId,
        Field[8] memory fields
    )
        external
        pure
        returns (string memory)
    {
        bytes memory _name = abi.encodePacked(name);
        bytes memory _externalUrl = abi.encodePacked(externalUrl);
        bytes memory _shortDescription = abi.encodePacked(shortDescription);
        bytes memory _tokenId = abi.encodePacked(tokenId);

        bytes memory attrs = abi.encodePacked(
            _makeAttr(fields[0].name, fields[0].content, fields[0].displayType),
            ",",
            _makeAttr(fields[1].name, fields[1].content, fields[1].displayType),
            ",",
            _makeAttr(fields[2].name, fields[2].content, fields[2].displayType),
            ",",
            _makeAttr(fields[3].name, fields[3].content, fields[3].displayType),
            ",",
            _makeAttr(fields[4].name, fields[4].content, fields[4].displayType),
            ",",
            _makeAttr(fields[5].name, fields[5].content, fields[5].displayType),
            ",",
            _makeAttr(fields[6].name, fields[6].content, fields[6].displayType),
            ",",
            _makeAttr(fields[7].name, fields[7].content, fields[7].displayType)
        );

        bytes memory svg = _makeSvg(_name, _tokenId, fields);

        return _makeJson(_name, _externalUrl, _shortDescription, svg, attrs);
    }

    /// @notice Creates a JSON string for the NFT metadata.
    /// @param name The name of the NFT.
    /// @param externalUrl The external URL associated with the NFT.
    /// @param shortDescription A short description of the NFT.
    /// @param svg The SVG data for the NFT.
    /// @param attrs The attributes of the NFT.
    /// @return A JSON string containing the NFT metadata.
    function _makeJson(
        bytes memory name,
        bytes memory externalUrl,
        bytes memory shortDescription,
        bytes memory svg,
        bytes memory attrs
    ) internal pure returns (string memory) {
        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                name, '", "external_url": "', externalUrl,
                '", "description": "', shortDescription, '", "image_data": "data:image/svg+xml;base64,',
                Base64.encode(svg),
                '", "attributes": [',
                attrs,
                "]}"
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /// @notice Creates the SVG data for the NFT.
    /// @param name The name of the NFT.
    /// @param tokenId The token ID of the NFT.
    /// @param fields An array of fields to include in the SVG icon.
    /// @return The SVG data as bytes.
    function _makeSvg(bytes memory name, bytes memory tokenId, Field[8] memory fields)
        internal
        pure
        returns (bytes memory)
    {
        string
            memory head = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><defs><clipPath id="clp"><rect width="100%" height="100%"/></clipPath><pattern xmlns="http://www.w3.org/2000/svg" patternUnits="userSpaceOnUse" width="25" height="13" patternTransform="scale(2) rotate(0)" id="star"><path d="M25.044 22.25c0 6.904-5.596 12.5-12.5 12.5s-12.5-5.596-12.5-12.5 5.596-12.5 12.5-12.5c5.786 0 10.655 3.932 12.079 9.27.274 1.03.421 2.113.421 3.23m0-9a2.5 2.5 0 00-2.363 1.688 12.5 12.5 0 011.672 3.212v.002a2.5 2.5 0 10.69-4.902zm-.037-5a7.5 7.5 0 00-6.125 3.227 12.5 12.5 0 016.121 11.773h.04a7.5 7.5 0 10-.036-15zm.023-5a12.5 12.5 0 00-10.998 6.588c.097.012.193.025.29.039h.005c.097.014.194.029.29.045h.003c.194.033.388.07.58.113h.004a12.5 12.5 0 011.123.3l.02.007.006.002a12.496 12.496 0 011.077.403l.032.01.033.016c.166.07.33.145.492.223l.016.008.004.002c.176.086.35.177.523.271l.006.002c.085.047.17.094.254.143l.004.002c.085.049.169.099.252.15l.004.002c.083.051.166.103.248.156l.004.002c.082.052.163.106.244.16l.004.002.24.168.004.002c.899.618 1.672 1.418 2.385 2.219l.004.004c.125.151.246.306.363.463l.004.004c.058.078.116.157.172.236l.004.004c.056.08.112.16.166.24l.002.004c.577.817.987 1.72 1.359 2.633l.002.004c.034.091.066.183.098.275l.002.004c.032.092.062.185.092.278l.002.003c.03.094.058.188.086.282l.002.004c.027.093.053.186.078.28l.002.005c.025.095.05.19.072.285l.002.004c.023.095.046.19.067.285.136.57.19 1.141.25 1.713l.003.05.002.04c.013.178.022.356.028.535v.023c.003.098.004.195.004.293v.014a12.5 12.5 0 01-.127 1.777c-.184 1.281-.582 2.34-1.002 3.412a12.505 12.505 0 01-.36.723c.494.059.99.088 1.488.088 6.904 0 12.5-5.596 12.5-12.5s-5.596-12.5-12.5-12.5zm-24.986 10a2.5 2.5 0 10.691 4.902 12.5 12.5 0 011.672-3.214A2.5 2.5 0 00.044 13.25zm-.037-5a7.5 7.5 0 10.078 15 12.5 12.5 0 016.121-11.773A7.5 7.5 0 00.007 8.25zm-.065-5c-6.898.008-12.486 5.602-12.486 12.5 0 6.904 5.596 12.5 12.5 12.5.525 0 1.05-.034 1.57-.1a12.5 12.5 0 019.448-18.3A12.5 12.5 0 00-.044 3.25zm12.602 3.5a2.5 2.5 0 00-2.39 1.773c.3.425.575.868.82 1.327a12.5 12.5 0 013.058-.012 12.5 12.5 0 01.875-1.399 2.5 2.5 0 00-2.363-1.689zm-1.57 3.1a12.5 12.5 0 013.058-.012M12.507 1.75a7.5 7.5 0 00-6.15 3.266 12.5 12.5 0 014.617 4.834 12.5 12.5 0 013.058-.012 12.5 12.5 0 014.676-4.861 7.5 7.5 0 00-6.201-3.227zm5.226 9.129a12.47 12.47 0 010 0zM10.974 9.85a12.5 12.5 0 013.058-.012m3.702 1.041a12.493 12.493 0 01-.001 0zM12.53-3.25a12.5 12.5 0 00-11.004 6.6 12.5 12.5 0 019.448 6.5 12.5 12.5 0 013.058-.012 12.5 12.5 0 019.526-6.498 12.5 12.5 0 00-11.014-6.59zm5.203 14.129a12.47 12.47 0 010 0zM25.043.25a2.5 2.5 0 00-2.362 1.688c.323.447.616.915.877 1.4a12.5 12.5 0 011.472-.088h.014a12.5 12.5 0 012.389.23 2.5 2.5 0 00-2.39-3.23zm-.036-5a7.5 7.5 0 00-6.125 3.227 12.5 12.5 0 014.676 4.86 12.5 12.5 0 011.472-.087h.014c2.5 0 4.944.75 7.014 2.152A7.5 7.5 0 0025.007-4.75zm-1.449 8.088a12.5 12.5 0 011.472-.088h.014m-.014-13a12.5 12.5 0 00-10.998 6.59 12.5 12.5 0 019.526 6.498 12.5 12.5 0 011.472-.088h.014a12.5 12.5 0 0110.678 6 12.5 12.5 0 001.822-6.5c0-6.904-5.596-12.5-12.5-12.5zM14.69 8.75a12.529 12.529 0 000 0zm3.043 2.129a12.47 12.47 0 010 0zM.043.25a2.5 2.5 0 00-2.394 3.217A12.5 12.5 0 01-.058 3.25h.014c.525 0 1.05.034 1.57.1a12.5 12.5 0 01.881-1.41A2.5 2.5 0 00.044.25zm-.036-5A7.5 7.5 0 00-6.987 5.355 12.5 12.5 0 01-.057 3.25h.013c.525 0 1.05.034 1.57.1a12.5 12.5 0 014.682-4.873A7.5 7.5 0 00.007-4.75zm.023-5c-6.898.008-12.486 5.602-12.486 12.5a12.5 12.5 0 001.78 6.428A12.5 12.5 0 01-.059 3.25h.014c.525 0 1.05.034 1.57.1a12.5 12.5 0 019.532-6.51A12.5 12.5 0 00.044-9.75zM9.722 7.951a12.497 12.497 0 010 0z" stroke-width="1" stroke="gold" fill="#002366"/></pattern></defs><style>text{fill:#fff;font-family:Courier New;font-size:13px}.tag{font-size:24px}ellipse{clip-path:url(#clp)}</style><rect width="100%" height="100%" fill="#002366"/><ellipse cx="400" cy="200" rx="150" ry="350" fill="url(#star)"/>';

        bytes memory items = abi.encodePacked(
            _textTag(fields[0].name, fields[0].content, "50"),
            _textTag(fields[1].name, fields[1].content, "73"),
            _textTag(fields[2].name, fields[2].content, "96"),
            _textTag(fields[3].name, fields[3].content, "119"),
            _textTag(fields[4].name, fields[4].content, "142"),
            _textTag(fields[5].name, fields[5].content, "165"),
            _textTag(fields[6].name, fields[6].content, "188"),
            _textTag(fields[7].name, fields[7].content, "211")
        );

        return
            abi.encodePacked(
                head,
                abi.encodePacked(
                    '<text x="8" y="30" class="tag">',
                    name,
                    "</text>",
                    '<text x="8" y="335">Token ID: ',
                    tokenId,
                    "</text>"
                ),
                items,
                "</svg>"
            );
    }

    /// @notice Creates a text tag for the SVG icon.
    /// @param _prefixTxt The prefix text for the tag.
    /// @param _txt The main text for the tag.
    /// @param _yPos The y-position of the text tag.
    /// @return The text tag as bytes.
    function _textTag(
        string memory _prefixTxt,
        string memory _txt,
        string memory _yPos
    )
        internal
        pure
        returns (bytes memory)
    {
        return
            abi.encodePacked('<text x="8" y="', _yPos, '">', _prefixTxt, _txt, "</text>");
    }

    /// @notice Creates an attribute for the NFT metadata.
    /// @param _k The key of the attribute.
    /// @param _v The value of the attribute.
    /// @param _d The display type of the attribute.
    /// @return The attribute as bytes.
    function _makeAttr(string memory _k, string memory _v, string memory _d)
        internal
        pure
        returns (bytes memory)
    {
        if (keccak256(abi.encodePacked(_d)) == keccak256(abi.encodePacked('none'))) {
            return
                abi.encodePacked('{"trait_type": "', _k, '", "value": "', _v, '"}');
        } else if (keccak256(abi.encodePacked(_d)) == keccak256(abi.encodePacked('ranking'))) {
            return
                abi.encodePacked('{"trait_type": "', _k, '", "value": ', _v, '}');
        } else {
            return
                abi.encodePacked('{"trait_type": "', _k, '", "value": "', _v, '", "display_type": "', _d, '"}');
        }
    }
}
