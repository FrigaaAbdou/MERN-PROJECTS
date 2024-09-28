import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import Account from '../pages/Account';
import Navbar from '../components/Navbar';
import React from 'react';
import Products from '../pages/Products';
import ProductDetails from '../pages/productDetails'; // Make sure this path matches your actual file name

function App() {
  const isUserSignedIn = !!localStorage.getItem('token');

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/product' element={<Products />} />
        {/* Updated Route for Product Details */}
        <Route path='/product/:id' element={<ProductDetails />} />
        {isUserSignedIn && <Route path='/account' element={<Account />} />}
      </Routes>
    </div>
  );
}

export default App;
