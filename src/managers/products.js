import fs from 'fs/promises'

export default class ProductManager {

  constructor(path) {
    this.path = path
  }

  // Obtener todos los productos
  async getProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      return []
    }
  }


//
  // Obtener producto por ID
  async getProductById(id) {
    try {
      const products = await this.getProducts()
      id = Number(id)
      return products.find(p => p.id === id) || null
    } catch (error) {
      return null
    }
  }

  // Agregar producto
  //
  async addProduct(productIn) {
    try {
      const { title, price, code, stock } = productIn

      // Validación  de campos 
      if (!title || !price || !code || stock === undefined) {
        return null
      }

      const products = await this.getProducts()
      const id = products.length
        ? Math.max(...products.map(p => p.id)) + 1
        : 1

      const newProduct = { id, ...productIn }
      products.push(newProduct)

      await fs.writeFile(this.path, JSON.stringify(products, null, 2))
      return newProduct

    } catch (error) {
      return null
    }
  }

  // Actualizar
  async updateProduct(id, productIn) {
    try {
      const products = await this.getProducts()
      id = Number(id)

      const index = products.findIndex(p => p.id === id)
      if (index === -1) return null

      products[index] = {

        ...products[index],
        ...productIn,
        id // Controlo ID no se modifique
      }

      await fs.writeFile(this.path, JSON.stringify(products, null, 2))
      return products[index]

    } catch (error) {
      return null
    }
  }

  // Borrar producto
  async deleteProduct(id) {
    try {
      const products = await this.getProducts()
      id = Number(id)

      const originalLength = products.length
      const filtered = products.filter(p => p.id !== id)

      await fs.writeFile(this.path, JSON.stringify(filtered, null, 2))

      return filtered.length < originalLength
    } catch (error) {
      return false
    }
  }
}