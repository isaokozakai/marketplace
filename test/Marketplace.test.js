const Marketplace = artifacts.require('Marketplace');

require('chai').use(require('chai-as-promised')).should();

contract('Marketplace', ([deployer, seller, buyer]) => {
  let marketplace;

  before(async () => {
    marketplace = await Marketplace.deployed();
  });

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it('has a name', async () => {
      const name = await marketplace.name();
      assert.equal(name, 'Dapp University Marketplace');
    })
  });

  describe('product', async () => {
    let result, productCount;
    before(async () => {
      result = await marketplace.createProduct('iPhone X', web3.utils.toWei('1', 'Ether'), { from: seller });
      productCount = await marketplace.productCount();
    });

    it('creates products', async () => {
      assert.equal(productCount, 1);
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct');
      assert.equal(event.name, 'iPhone X', 'name is correct');
      assert.equal(event.price, '1000000000000000000', ' is correct');
      assert.equal(event.owner, seller, 'owner is correct');
      assert.equal(event.purchased, false, 'purchased is correct');
      assert.equal(event.available, true, 'available is correct');

      await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      await marketplace.createProduct('iPhone X', 0, { from: seller }).should.be.rejected;
    });

    it('lists products', async () => {
      const product = await marketplace.products(productCount);
      assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct');
      assert.equal(product.name, 'iPhone X', 'name is correct');
      assert.equal(product.price, '1000000000000000000', ' is correct');
      assert.equal(product.owner, seller, 'owner is correct');
      assert.equal(product.purchased, false, 'purchased is correct');
      assert.equal(product.available, true, 'available is correct');
    });

    it('sells products', async () => {
      await marketplace.purchaseProduct(99,  { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      await marketplace.purchaseProduct(productCount,  { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
      await marketplace.purchaseProduct(productCount,  { from: seller, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;

      let oldSellerBalance = new web3.utils.BN(await web3.eth.getBalance(seller));

      result = await marketplace.purchaseProduct(productCount,  { from: buyer, value: web3.utils.toWei('1', 'Ether') });
    
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct');
      assert.equal(event.name, 'iPhone X', 'name is correct');
      assert.equal(event.price, '1000000000000000000', ' is correct');
      assert.equal(event.owner, buyer, 'owner is correct');
      assert.equal(event.purchased, true, 'purchased is correct');
      assert.equal(event.available, false, 'available is correct');

      let newSellerBalance = new web3.utils.BN(await web3.eth.getBalance(seller));

      let price = new web3.utils.BN(web3.utils.toWei('1', 'Ether'));

      const expectedBalance = oldSellerBalance.add(price);

      assert.equal(newSellerBalance.toString(), expectedBalance.toString());

      await marketplace.purchaseProduct(productCount,  { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      await marketplace.purchaseProduct(productCount,  { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    });

    it('delete product', async () => {
      await marketplace.createProduct('iPhone X2', web3.utils.toWei('2', 'Ether'), { from: seller });
      await marketplace.createProduct('iPhone X3', web3.utils.toWei('3', 'Ether'), { from: seller });

      result = await marketplace.deleteProduct(2, { from: seller });

      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), 2, 'id is correct');
      assert.equal(event.name, 'iPhone X2', 'name is correct');
      assert.equal(event.price, '2000000000000000000', ' is correct');
      assert.equal(event.owner, seller, 'owner is correct');
      assert.equal(event.purchased, false, 'purchased is correct');
      assert.equal(event.available, false, 'available is correct');

      await marketplace.deleteProduct(3, { from: deployer }).should.be.rejected;
      await marketplace.deleteProduct(3, { from: buyer }).should.be.rejected;
      await marketplace.purchaseProduct(3,  { from: buyer, value: web3.utils.toWei('3', 'Ether') });
      await marketplace.deleteProduct(3, { from: seller }).should.be.rejected;
    });
  });
})