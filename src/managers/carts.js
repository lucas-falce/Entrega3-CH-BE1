import CartModel from '../models/cart.model.js'
import ProductModel from '../models/product.model.js'

export default class CartManager {

  //Obtengo la lista de carritos
  async getCarts() {
    return await CartModel.find().lean()
  }

  //Obtengo la data de un carrito
  async getCartById(id) {
    return await CartModel.findById(id)
      .populate('products.product')
      .lean()
  }

  //Creo un nuevo carrito VACIO
  async newCart() {
    const nuevoCarrito = await CartModel.create({ products: [] })
    return nuevoCarrito
  }

  //Recibo carrito id y producto id y le agrego UNA unidad al producto en el carrito
  async addProductToCart(cid, pid) {

    const cart = await CartModel.findById(cid)
    if (!cart) return null

    const product = await ProductModel.findById(pid)
    if (!product) return null

    const productoEnCarrito = cart.products.find(
      p => p.product.toString() === pid
    )

    if (productoEnCarrito) {
      productoEnCarrito.quantity++
    } else {
      cart.products.push({ product: pid, quantity: 1 })
    }

    await cart.save()
    return cart
  }

}
