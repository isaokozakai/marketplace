pragma solidity ^0.5.0;

contract Marketplace {
  string public name;
  uint public productCount = 0;
  mapping(uint => Product) public products;

  struct Product {
    uint id;
    string name;
    uint price;
    address payable owner;
    bool purchased;
    bool available;
  }

  event ProductCreated(
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased,
    bool available
  );

  event DeleteProduct(
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased,
    bool available
  );

  event ProductPurchased(
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased,
    bool available
  );

  constructor() public {
    name = "Dapp University Marketplace";
  }

  function createProduct(string memory _name, uint _price) public {
    require(bytes(_name).length > 0);
    require(_price > 0);
    productCount++;
    products[productCount] = Product(productCount, _name, _price, msg.sender, false, true);
    emit ProductCreated(productCount, _name, _price, msg.sender, false, true);
  }

  function purchaseProduct(uint _id) public payable {
    Product memory _product = products[_id];
    address payable _seller = _product.owner;

    require(_product.id > 0 && _product.id <= productCount);
    require(msg.value >= _product.price);
    require(!_product.purchased);
    require(_product.available);
    require(_seller != msg.sender);

    _product.owner = msg.sender;
    _product.purchased = true;
    _product.available = false;
    products[_id] = _product;

    address(_seller).transfer(msg.value);
    emit ProductPurchased(_product.id, _product.name, _product.price, msg.sender, true, false);
  }

  function deleteProduct(uint _id) public payable {
    Product memory _product = products[_id];
    address payable _seller = _product.owner;

    require(!_product.purchased);
    require(_seller == msg.sender);

    _product.available = false;
    products[_id] = _product;

    emit DeleteProduct(_product.id, _product.name, _product.price, msg.sender, _product.purchased, _product.available);
  }
}