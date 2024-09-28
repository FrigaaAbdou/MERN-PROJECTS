import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ProductDetails() {
  const { id } = useParams(); // Get the product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/product/${id}`) // Fetch specific product details
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <h1 className='text-center'>Loading...</h1>;
  }

  if (!product) {
    return <h1 className='text-center'>Product not found</h1>;
  }

  return (
    <div className='container mx-auto mt-8 p-4'>
      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Product Image Section */}
        <div className='w-full lg:w-1/2'>
          <img
            src={product.image || "https://via.placeholder.com/600"}
            alt={product.name}
            className='w-full h-auto object-cover rounded-lg shadow-md'
          />
        </div>

        {/* Product Information Section */}
        <div className='w-full lg:w-1/2'>
          <h1 className='text-4xl font-bold mb-4'>{product.name}</h1>
          
          <p className='text-gray-600 mb-4'>{product.disc}</p>

          {/* Price */}
          <div className='text-3xl font-semibold text-sky-600 mb-4'>
            ${product.price}
          </div>

          {/* Stock Status */}
          <div className='mb-6'>
            {product.stock > 0 ? (
              <span className='text-lg text-green-600 font-semibold'>In Stock</span>
            ) : (
              <span className='text-lg text-red-600 font-semibold'>Out of Stock</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex gap-4'>
            <button className='bg-sky-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-sky-700'>
              Add to Cart
            </button>
            <button className='bg-sky-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-sky-700'>
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Optional Additional Information */}
      <div className='mt-12'>
        <h2 className='text-2xl font-semibold mb-4'>Product Details</h2>
        <p className='text-gray-700'>{/* Add more specific product details here if needed */}</p>
      </div>
    </div>
  );
}

export default ProductDetails;
