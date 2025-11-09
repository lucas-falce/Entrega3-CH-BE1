//Imports
import express from 'express'
import ProductManager from './managers/products.js'
import CartManager from './managers/carts.js'

//Variables y constantes
const app = express()
const PORT= 8080
const productManager = new ProductManager('./data/products.json')
const cartManager = new CartManager('./data/carts.json')


//para poder leer json.
app.use(express.json())

//Servidor
app.listen(PORT, ()=>{
    console.log(`SERVIDOR ESTA CORRIENDO EN http://localhost:${PORT}`)
})

app.get('/', (request,res)=>{
    res.send("servidor funcionando y listo para trabajar")
})


/////////////// PRODUCTOS //////////////////////

// GET products - Listar todos los productos
app.get('/api/products', async (req, res) => {
  const products = await productManager.getProducts()
  res.json(products)
}
)

// GET products - Obtener un producto
app.get('/api/products/:pid',async (req, res) => {
const pid = parseInt(req.params['pid'])
const product = await productManager.getProductById(pid)
if (!product) return res.status(404).json({ error: 'Producto no encontrado' })
res.json(product)
}
)

// POST products - Agregar un producto
app.post('/api/products',async (req, res) => {
await productManager.addProduct(req.body)
res.json({ message: 'Producto agregado' })
}
)

// DELETE products - Borrar producto
app.delete('/api/products/:pid',async (req, res) => {
const pid = parseInt(req.params['pid'])
await productManager.deleteProduct(pid)
res.json({ message: 'Producto eliminado' })
}
)

//PUT products - Actualizar producto
app.put('/api/products/:pid',async (req, res) => {
    const id = parseInt(req.params['pid'])
    const body = req.body
    const prodActualizado = await productManager.updateProduct(id, body)
    res.json(prodActualizado)
})


/////////////// CARRITOS //////////////////////

//POST carts - Creo un nuveo carrito VACIO
app.post('/api/carts',async (req, res) => {
const cart = await cartManager.newCart()
res.json(cart)
}
)

//GET carts - Ver un carrito por su id
app.get('/api/carts/:cid',async (req, res) => {
const id = parseInt(req.params['cid'])
const cart = await cartManager.getCartById(id)
res.json(cart)
}
)

//GET carts - Ver un carrito por su id
app.post('/api/carts/:cid/product/:pid',async (req, res) => {
const cid = parseInt(req.params['cid'])
const pid = parseInt(req.params['pid'])
const cart = await cartManager.addProductToCart(cid,pid)
if (!cart) return res.status(404).json({ error: 'Carrito o producto no encontrado' })
res.json(cart)
}
)