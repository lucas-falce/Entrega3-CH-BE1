import express from 'express'
import mongoose from 'mongoose'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'

import ProductModel from './models/product.model.js'
import CartModel from './models/cart.model.js'
import CartManager from './managers/carts.js'

// __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// App
const app = express()
const PORT = 8080
const cartManager = new CartManager()

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

// Mongo
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')
  .then(() => console.log('Mongo conectado'))
  .catch(err => console.error(err))

// Server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

//////////////////// VISTAS ////////////////////

// /products
app.get('/products', async (req, res) => {
  const { page = 1 } = req.query

  const result = await ProductModel.paginate({}, {
    page: Number(page),
    limit: 10,
    lean: true
  })

  res.render('index', {
    products: result.docs,
    page: result.page,
    totalPages: result.totalPages,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage,
    nextPage: result.nextPage
  })
})

// /products/:pid
app.get('/products/:pid', async (req, res) => {
  const product = await ProductModel.findById(req.params.pid).lean()
  if (!product) return res.status(404).send('Producto no encontrado')

  res.render('productDetail', {
    product,
    cartId: 'PEGAR_ACA_UN_CART_ID_REAL'
  })
})

// /carts/:cid
app.get('/carts/:cid', async (req, res) => {
  const cart = await CartModel.findById(req.params.cid)
    .populate('products.product')
    .lean()

  if (!cart) return res.status(404).send('Carrito no encontrado')

  res.render('cart', { cart })
})

//////////////////// API PRODUCTS ////////////////////

// GET products
app.get('/api/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query

    let filter = {}

    if (query) {
      if (query === 'true' || query === 'false') {
        filter.status = query === 'true'
      } else {
        filter.category = query
      }
    }

    let sortOption = {}
    if (sort === 'asc') sortOption.price = 1
    if (sort === 'desc') sortOption.price = -1

    const result = await ProductModel.paginate(filter, {
      page: Number(page),
      limit: Number(limit),
      sort: Object.keys(sortOption).length ? sortOption : undefined,
      lean: true
    })

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/api/products?page=${result.prevPage}&limit=${limit}`
        : null,
      nextLink: result.hasNextPage
        ? `/api/products?page=${result.nextPage}&limit=${limit}`
        : null
    })
  } catch {
    res.status(500).json({ status: 'error', error: 'Error al obtener productos' })
  }
})

// POST products
app.post('/api/products', async (req, res) => {
  try {
    const product = await ProductModel.create(req.body)
    res.json(product)
  } catch {
    res.status(500).json({ error: 'Error al crear producto' })
  }
})

//////////////////// API CARTS ////////////////////

app.post('/api/carts', async (req, res) => {
  const cart = await cartManager.newCart()
  res.json(cart)
})

app.get('/api/carts/:cid', async (req, res) => {
  const cart = await cartManager.getCartById(req.params.cid)
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' })
  res.json(cart)
})

app.post('/api/carts/:cid/product/:pid', async (req, res) => {
  const cart = await cartManager.addProductToCart(
    req.params.cid,
    req.params.pid
  )
  if (!cart) return res.status(404).json({ error: 'Carrito o producto no encontrado' })
  res.json(cart)
})

app.delete('/api/carts/:cid/products/:pid', async (req, res) => {
  const cart = await CartModel.findById(req.params.cid)
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' })

  cart.products = cart.products.filter(
    p => p.product.toString() !== req.params.pid
  )

  await cart.save()
  res.json({ message: 'Producto eliminado del carrito' })
})

app.put('/api/carts/:cid', async (req, res) => {
  const cart = await CartModel.findByIdAndUpdate(
    req.params.cid,
    { products: req.body },
    { new: true }
  )
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' })
  res.json(cart)
})

app.put('/api/carts/:cid/products/:pid', async (req, res) => {
  const { quantity } = req.body
  const cart = await CartModel.findById(req.params.cid)
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' })

  const product = cart.products.find(
    p => p.product.toString() === req.params.pid
  )

  if (!product) return res.status(404).json({ error: 'Producto no encontrado en carrito' })

  product.quantity = quantity
  await cart.save()
  res.json(cart)
})

app.delete('/api/carts/:cid', async (req, res) => {
  const cart = await CartModel.findByIdAndUpdate(
    req.params.cid,
    { products: [] },
    { new: true }
  )
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' })
  res.json({ message: 'Carrito vaciado' })
})
