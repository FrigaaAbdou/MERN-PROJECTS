import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


const SignUp = () => {
  const [user, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers();
  }, [])

  const fetchUsers = () => {
    axios
    .get(`http://localhost:3001/register`)
    .then((res) => {
      // console.log(res.data)
    })
  }

  const handleRegister = (event) => {
    event.preventDefault()
    axios
    .post('http://localhost:3001/register', { email, username, password})
    .then(() => {
      alert('Registration Successful')
      setEmail('')
      setUsername('')
      setPassword('')
      fetchUsers()
      navigate('/login')
    })
    .catch((error) => {
      console.log('Unable to register user')
    })
  }

  return (
    <div className='w-full h-screen flex'>
      <div className="w-[50%] h-[100%] bg-[#1a1a1a] text-white flex justify-center items-center">
        <form action="" className='text-center  rounded-lg w-[600px] h-[400px] p-9' onSubmit={handleRegister}>
          {/* Email Input */}
        <label >Email</label>
        <br />
        <input type="email" className="w-[400px] h-[40px] rounded-xl bg-zinc-700 p-2" 
        placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
        <br />
        {/* Username Input  */}
        <label >Username</label>
        <br />
        <input type="text" className="w-[400px] h-[40px] rounded-xl bg-zinc-700 p-2"  
        placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)}/>
        <br />
        <br />
        {/* Password */}
        <label >Password</label>
        <br />
        <input type="password" className="w-[400px] h-[40px] rounded-xl bg-zinc-700 p-2" 
        placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <br />
        {/* Button  */}
        <button className='w-[200px] h-[50px] border hover:bg-sky-700' type='submit '>Sign Up</button>
        </form>
      </div>
      <div className="w-[50%] h-[100%] flex justify-center items-center bg-sky-600" >
        <h2 className='text-3xl text-white'>SIGN UP</h2>
      </div>
    </div>
  )
}

export default SignUp