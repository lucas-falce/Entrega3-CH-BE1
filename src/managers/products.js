import { ProductModel } from '../models/product.model.js'

export default class ProductManager {

  //Listar productos
  async getProducts(filter = {}) {
    try {
      return await ProductModel.find(filter).lean()
    } catch {
      return []
    }
  }

  //Obtener producto
  async getProductById(id) {
    try {
      return await ProductModel.findById(id).lean()
    } catch {
      return null
    }
  }

  //Agregar producto
  async addProduct(productIn) {
    try {
      const newProduct = await ProductModel.create(productIn)
      return newProduct
    } catch {
      return null
    }
  }

  //Actualizar producto
  async updateProduct(id, productIn) {
    try {
      const updated = await ProductModel.findByIdAndUpdate(
        id,
        productIn,
        { new: true }
      ).lean()

      return updated
    } catch {
      return null
    }
  }

  //Borrar producto
  async deleteProduct(id) {
    try {
      const result = await ProductModel.findByIdAndDelete(id)
      return !!result
    } catch {
      return false
    }
  }
}
