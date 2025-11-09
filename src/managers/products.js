import fs from 'fs/promises'

export default class ProductManager {
//Constructor
    constructor(path) {
    this.path = path
  }

//Listar productos
    async getProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

//Obtener producto
    async getProductById(id) {
    const products = await this.getProducts()
    return products.find(p => p.id === id)
  }

//Borrar producto
    async deleteProduct(id) {
    let products = await this.getProducts()
    products = products.filter(p => p.id !== id)
    await fs.writeFile(this.path, JSON.stringify(products, null, 2))
  }

//Agregar producto
  async addProduct(productIn) {
    const products = await this.getProducts()
    const id = products.length ? products[products.length - 1].id + 1 : 1 //Obtengo el id del producto
    const newProduct = {id,...productIn}
    products.push(newProduct)
    await fs.writeFile(this.path, JSON.stringify(products, null, 2))
    return(newProduct)
  }

//Actualizar producto
  async updateProduct(id,productIn) {
    const products = await this.getProducts()
    const index = products.findIndex(p => p.id === id)
    if (index > -1) {
    products[index] = {...products[index],...productIn,id}
    await fs.writeFile(this.path, JSON.stringify(products, null, 2))
    return products[index]

    } else {return("No se ha encontrado el id del producto")}
  }
}