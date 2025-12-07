import fs from 'fs/promises'
import ProductManager from './products.js'

export default class CartManager {
  constructor(path) {
    this.path = path
    this.productManager = new ProductManager('./data/products.json')
  }

  //Obtengo la lista de carritos
async getCarts(){
    try {
      const data = await fs.readFile(this.path, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
}

//Obtengo la data de un carrito
async getCartById(id) {
    const carts = await this.getCarts()
    return carts.find(c => c.id === id)
  }

//Creo un nuevo carrito VACIO
async newCart(){
    const carts = await this.getCarts()
    const id = carts.length ? carts[carts.length - 1].id + 1 : 1 //Obtengo el id del carrito
    const nuevoCarrito = {id, products:[]}
    carts.push(nuevoCarrito)
    await fs.writeFile(this.path,JSON.stringify(carts, null, 2))
    return nuevoCarrito
}

//Recibo carrito id y producto id y le agrego UNA unidad al producto en el carrito
 async addProductToCart(cid, pid) {
    const carts = await this.getCarts()
    const index = carts.findIndex(c => c.id === cid)
    if (index > -1) {
    
        //Controlo que exista el producto
    const product = await this.productManager.getProductById(pid)
    if (!product) return ("No se ha encontrado el producto")
    
    //Agrego el producto
    const ProductoDelCarrito = carts[index].products.find(p => p.product === pid)
    if (ProductoDelCarrito) { 
        ProductoDelCarrito.quantity++
    }else {carts[index].products.push ({product: pid, quantity: 1})}

    await fs.writeFile(this.path,JSON.stringify(carts, null, 2))
    return carts[index]
 }else{return("No se ha encontrado el carrito")}
}
}

