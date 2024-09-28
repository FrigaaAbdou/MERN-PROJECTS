import React from 'react'
import { Link, useNavigate } from 'react-router-dom'


function Navbar() {
  const isUserSignedIn = !!localStorage.getItem('token')
  const navigate = useNavigate();


  const handleSignOut = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div >
      <nav className=" flex justify-around p-3 border-b border-zinc-800 items-center bg-[#1a1a1a]/90 text-zinc-300">
        <Link to={'/'}>
          <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
        </Link>
        <ul className="flex gap-6">
          <Link to={'/product'}><li>Products</li></Link>
          { isUserSignedIn ? (
            <>
            <Link to={'/account'}><li>Account</li></Link>
            <li><button onClick={handleSignOut}>Log Out</button></li>
            </>
          ) : (
            <>
             <Link to={'/login'}><li>LogIn</li></Link>
             <Link to={'/signup'}><li>Signup</li></Link> 
            </>
          ) }
        </ul>
      </nav>
    </div>
  )
}


export default Navbar
