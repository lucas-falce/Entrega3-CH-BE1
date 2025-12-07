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
    parseInt(id)
    return products.find(p => p.id === id)
  }

//Borrar producto
async deleteProduct(id) {
  const products = await this.getProducts()
  const originalLength = products.length
  const filtered = products.filter(p => p.id !== Number(id))

  await fs.writeFile(this.path, JSON.stringify(filtered, null, 2))

  return filtered.length < originalLength   // true = se borró; false = no existía
}

//Agregar producto
  async addProduct(productIn) {
    const products = await this.getProducts()
    const id = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1 //Obtengo el id del producto
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

    } else {return null}
  }
}