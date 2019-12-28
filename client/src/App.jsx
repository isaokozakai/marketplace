import React, { useState, useEffect } from 'react';
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import Web3 from 'web3';
import logo from './logo.svg';
import './App.css';
import Marketplace from './contracts/Marketplace.json';
import Navbar from './components/Navbar';
import 'react-tabs/style/react-tabs.css';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';

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
        console.log('done')
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

  return (
    <div>
      <Navbar account={account} />
      <Tabs>
        <TabList>
          <Tab>Product List</Tab>
          <Tab>Add Product</Tab>
        </TabList>
        <TabPanel>
          <ProductList products={products} purchaseProduct={purchaseProduct} />
        </TabPanel>
        <TabPanel>
          <AddProduct createProduct={createProduct} />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
