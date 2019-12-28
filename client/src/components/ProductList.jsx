import React from 'react';

const ProductList = ({ products, purchaseProduct }) => {
  return (
    <div>
      <h2>Buy Product</h2>
      <div id="productList">
        {products.map((product, key) => {
          return (
            <div key={key}>
              <div scope="row">{product.id.toString()}</div>
              <div>{product.name}</div>
              <div>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} Eth</div>
              <div>{product.owner}</div>
              <div>
                {!product.purchased
                  ? <button
                    name={product.id}
                    value={product.price}
                    onClick={(e) => {
                      purchaseProduct(e.target.name, e.target.value)
                    }}
                  >
                    Buy
                  </button>
                  : null
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default ProductList;