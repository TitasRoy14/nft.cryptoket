// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol" ;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol" ;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarketplace is ERC721URIStorage {
 using Counters for Counters.Counter;

 Counters.Counter private _tokenIds;   
 Counters.Counter private _itemsSold; 

 uint256 listingPrice = 0.025 ether;

 address payable owner;
 mapping(uint256 => MarketItem) private idToMarketItem ;

 struct MarketItem {
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold ;
 }

 event MarketItemCreated(
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold  
 );

 constructor () ERC721("Metaverse","METT") {
    owner = payable(msg.sender);
 }
// Payable means it giving access to ethereum to accept ethers
 function updateListingPrice(uint256 _listingPrice) public payable {
   require(owner == msg.sender, "only Owner can update the listing price");
   listingPrice = _listingPrice;
 }

 function getListingPrice() public view returns(uint256){
   return listingPrice ;
 }

 function createToken(string memory _tokenURI, uint256 _price) public payable returns(uint){
   // increment is a function defined in Counter Contract
   _tokenIds.increment();

   uint256 newTokenId = _tokenIds.current();
   _mint(msg.sender,newTokenId);
   _setTokenURI(newTokenId, _tokenURI);

   createMarketItem(newTokenId,_price);

   return newTokenId;
 }

 function createMarketItem(uint256 _tokenId, uint256 _price) private {
  require(_price > 0 , "price must be at least 1");
  require(msg.value == listingPrice, "price must be equal to listing price" );

  idToMarketItem[_tokenId] = MarketItem (
    _tokenId,
    payable(msg.sender),
    payable(address(this)),
    _price,
    false
  );

  _transfer(msg.sender, address(this), _tokenId);

  emit MarketItemCreated(_tokenId, msg.sender, address(this), _price, false);
 }

 function resellToken(uint256 _tokenId, uint256 _price) public payable {
  require(idToMarketItem[_tokenId].owner == msg.sender, "Only item owner can perform this operation");
  require(msg.value == listingPrice, "price must be equal to listing price" );

  idToMarketItem[_tokenId].sold = false ; 
  idToMarketItem[_tokenId].price = _price ; 
  idToMarketItem[_tokenId].seller = payable(msg.sender) ; 
  idToMarketItem[_tokenId].owner = payable(address(this)) ;

  _itemsSold.decrement();

  _transfer(msg.sender, address(this), _tokenId);  
 }

 function createMarketSale(uint256 _tokenId) public payable {
  uint price = idToMarketItem[_tokenId].price;

  require(msg.value == price, "Plese submit the asking price in order to complete the purchase");

  // The person who is buying will become the owner
  idToMarketItem[_tokenId].owner = payable(msg.sender);
  idToMarketItem[_tokenId].sold = true;
  idToMarketItem[_tokenId].seller = payable(address(0));

  _itemsSold.increment();

  _transfer(address(this), msg.sender, _tokenId);


  payable(owner).transfer(listingPrice);
  payable(idToMarketItem[_tokenId].seller).transfer(msg.value);
 }

 function fetchMarketItems() public view returns (MarketItem[] memory) {
  uint itemCount = _tokenIds.current();
  uint unsoldItemCount = _tokenIds.current() - _itemsSold.current();
  uint currentIndex = 0 ;

  MarketItem[] memory items = new MarketItem[](unsoldItemCount);

  for(uint i = 0; i < itemCount ; i++){
    // this means market item will start from 0+1 becz MarketItem cannot be 0 and the seller has to be the contract
      if(idToMarketItem[i + 1].seller == address(this)){
          uint currentId = i+1 ;

          MarketItem storage currentItem = idToMarketItem[currentId];

          items[currentIndex]= currentItem ;

          currentIndex += 1;
      }
  }

  return items;
 }

 function fetchMyNFTs() public view returns(MarketItem[] memory) {
  uint totalItemCount = _tokenIds.current();
  uint itemCount = 0;
  uint currentIndex = 0 ;

  for(uint i=0;i<totalItemCount;i++){
    if(idToMarketItem[i+1].seller == msg.sender){
      itemCount += 1;
    }
  }

  MarketItem[] memory items = new MarketItem[](itemCount); 

   for(uint i = 0; i < totalItemCount ; i++){
    // this means market item will start from 0+1 becz MarketItem cannot be 0 and the seller has to be the contract
      if(idToMarketItem[i + 1].owner == msg.sender){
          uint currentId = i+1 ;

          MarketItem storage currentItem = idToMarketItem[currentId];

          items[currentIndex]= currentItem ;

          currentIndex += 1;
      }
  }

  return items;
 }

 function fetchItemListed() public view returns(MarketItem[] memory) {
    uint totalItemCount = _tokenIds.current();
  uint itemCount = 0;
  uint currentIndex = 0 ;

  for(uint i=0;i<totalItemCount;i++){
    if(idToMarketItem[i+1].seller == msg.sender){
      itemCount += 1;
    }
  }

  MarketItem[] memory items = new MarketItem[](itemCount); 

   for(uint i = 0; i < totalItemCount ; i++){
    // this means market item will start from 0+1 becz MarketItem cannot be 0 and the seller has to be the contract
      if(idToMarketItem[i + 1].seller == msg.sender){
          uint currentId = i+1 ;

          MarketItem storage currentItem = idToMarketItem[currentId];

          items[currentIndex]= currentItem ;

          currentIndex += 1;
      }
  }

  return items;
 }
}

