import React from 'react';

const AddProduct = ({ createProduct }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    const name = e.target.elements.name.value;
    const price = window.web3.utils.toWei(e.target.elements.price.value.toString(), 'Ether')
    createProduct(name, price)
  }
  return (
    <div>
      <h2>Add Product</h2>
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
    </div>
  );
};

export default AddProduct;