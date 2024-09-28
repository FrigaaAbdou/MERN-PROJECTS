import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation
import "../src/App.css"

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/product`)
      .then((response) => {
        setProducts(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  return (
    <div className='p-4 mx-1'>
      <h1 className='text-3xl my-4 text-center'>Products</h1>
      {loading ? (
        <h1 className='text-center'>Loading...</h1>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {products.length > 0 ? (
            products.map((product, index) => (
              <div key={index} className='border border-gray-300 shadow-lg rounded-lg overflow-hidden'>
                {/* Product Image */}
                <div className='h-48 bg-gray-200'>
                  <img
                    src={product.image || "https://via.placeholder.com/150"}
                    alt={product.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                {/* Product Info */}
                <div className='p-4'>
                  <h2 className='text-xl font-semibold mb-2'>{product.name}</h2>
                  <p className='text-gray-700 mb-4'>{product.disc}</p>
                  <div className='flex justify-between items-center'>
                    <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className='text-lg font-bold text-sky-600'>${product.price}</span>
                    {/* Details Button */}
                    <Link to={`/product/${product._id}`}>
                      <button className='bg-blue-500 text-white px-4 py-2 rounded-lg'>Details</button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h2 className='text-center col-span-full'>No products available</h2>
          )}
        </div>
      )}
    </div>
  );
}

export default Products;
