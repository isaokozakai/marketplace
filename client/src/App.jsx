import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import logo from './logo.svg';
import './App.css';
import Marketplace from './contracts/Marketplace.json'

const App = () => {
  const [account, setAccount] = useState('');
  const [marketplace, setMarketplace] = useState();
  const [productCount, setProductCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadweb3();
    loadBlockchainData();
  }, []);

  const loadweb3 = async () => {
    // Modern dapp browsers
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    // Legacy dapp browsers
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    // Non-dapp browsers
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if (networkData) {
      const marketplaceTemp = new web3.eth.Contract(Marketplace.abi, networkData.address);
      setMarketplace(marketplaceTemp);
      const productCountTemp = await marketplaceTemp.methods.productCount().call();
      setProductCount(productCountTemp);
      // Load products
      let productsTemp = [];
      for (var i = 1; i <= productCountTemp; i++) {
        const product = await marketplaceTemp.methods.products(i).call();
        productsTemp.push(product);
      }
      setProducts(productsTemp);
      setLoading(false);
    } else {
      window.alert('Marketplace contract not deployed to detected network.');
    }
  };

  const createProduct = (name, price) => {
    setLoading(true);
    marketplace.methods.createProduct(name, price).send({ from: account })
      .once('receipt', (receipt) => {
        setLoading(false);
      });
  };

  const purchaseProduct = (id, price) => {
    setLoading(true);
    marketplace.methods.purchaseProduct(id).send({ from: account, value: price })
      .once('receipt', (receipt) => {
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    const name = e.target.elements.name.value;
    const price = window.web3.utils.toWei(e.target.elements.price.value.toString(), 'Ether')
    createProduct(name, price)
  }

  return (
    <div>
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="http://www.dappuniversity.com/bootcamp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dapp University
          </a>
        <p>{account}</p>
      </nav>
      <div id="content">
        <h1>Add Product</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group mr-sm-2">
            <input
              id="productName"
              type="text"
              name="name"
              className="form-control"
              placeholder="Product Name"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="productPrice"
              type="text"
              name="price"
              className="form-control"
              placeholder="Product Price"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Add Product</button>
        </form>
        <p>&nbsp;</p>
        <h2>Buy Product</h2>

      </div>
    </div>
  );
}

export default App;
