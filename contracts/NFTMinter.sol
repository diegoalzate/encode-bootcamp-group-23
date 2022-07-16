// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract NFTMinter is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, AccessControlEnumerable, ERC721Burnable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

/**
* Granualar Access Control
*
* Canonical Explanations:
* https://blog.openzeppelin.com/workshop-recap-setting-up-access-control-for-smart-contracts/
* https://docs.openzeppelin.com/contracts/4.x/access-control#using-access-control
*
* NB: A role’s admin can even be the same role itself, which would cause accounts with
*     that role to be able to also grant and revoke it.
*
* Other Explanations (Mainly Repeating the Canonical Info Above):
* https://medium.com/coinmonks/how-to-use-accesscontrol-sol-9ea3a57f4b15#200
* https://betterprogramming.pub/how-to-use-openzeppelins-new-accesscontrol-contract-5b49a4bcd160#fd26
*
* https://programming.vip/docs/access-control-implementation-in-solidity-contracts-ownable-roles-accesscontrol.html
*
*
 */

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor(address _admin2, address _admin3, address _admin4) ERC721("NFTMinter", "NFTM") {
        // Grant the contract deployer the default admin role: it will be able
        // to grant and revoke any roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);

        _setupRole(MINTER_ROLE, _admin2);
        _setupRole(PAUSER_ROLE, _admin2);

        _setupRole(MINTER_ROLE, _admin3);
        _setupRole(PAUSER_ROLE, _admin3);

        _setupRole(MINTER_ROLE, _admin4);
        _setupRole(PAUSER_ROLE, _admin4);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function safeMint(address to, string memory uri) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControlEnumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    
}
