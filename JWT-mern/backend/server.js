const User = require('./models/userSchema')
const Product = require('./models/productSchema')
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const SECRET_KEY = 'secretkey'

// connect to express app 
const app = express()


// connect to mongoDb
const mongoURL = 'mongodb://localhost:27017/CLuster30'
mongoose.connect(mongoURL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => {
    app.listen(3001, () => {
        console.log('Server is connected to port 3001 and connected to mongodb')
    })
})
.catch((error) => {
    console.log('unable to connect to server')
})


// Middleware
app.use(bodyParser.json())
app.use(cors())

// Routes 

// 
// Create user (post)
app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ email, username, password: hashedPassword})
        await newUser.save()
        res.status(201).json({ message: 'User craeted successfully'})
    } catch (error) {
        res.status(500).json({ error: 'Error signing up'})
    }
})

// Create Product (post)
app.post('/product', async (req, res) => {
    try {
        const { name, disc, price, stock, image } = req.body
        const newProduct = new Product({ name, disc, price, stock, image})
        await newProduct.save()
        res.status(201).json({ message: 'Product craeted successfully'})
    } catch (error) {
        res.status(500).json({ error: 'Error creating Product'})
    }
})

app.get('/product/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Unable to get product details' });
    }
});
  

// Get registerd users
app.get('/register', async (req, res) => {
    try {
        const users = await User.find()
        res.status(201).json(users)
    } catch (error) {
        res.status(500).json({ error: 'Unable to get users'})
    }

})
// Get Products
app.get('/product', async (req, res) => {
    try {
        const products = await Product.find()
        res.status(200).json({
            count: products.length,
            data: products,
        });        
    } catch (error) {
        res.status(500).json({ error: 'Unable to get products'})
    }

})


// Login (post)

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({error: 'Invalid cerdentials'})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({error: 'Invalid cerdentials'})
        }
        const token = jwt.sign({ useId: user._id }, SECRET_KEY, { expiresIn: '1hr' })
        res.json({ message: 'Login successfuly' })
    }catch (error) {
        res.status(500).json({ error: 'Unable to login'})
    }
})



