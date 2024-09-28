const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: { type: String, require: true },
    disc: { type: String, require: true },
    price: { type: Number, require: true },
    stock: { type: Number, require: true },
    image: { type: String, required: true }
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product