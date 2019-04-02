pragma solidity ^0.5.7;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol";

contract SampleWithNodeModulesImport is ERC721Full, ERC721Mintable {
    constructor() ERC721Full("TEST721", "T721") public {
    }

    function setTokenURI(uint256 tokenId, string memory uri) public {
        _setTokenURI(tokenId, uri);   
    }
}