import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Slug from 'App/Models/Slug'
import Database from '@ioc:Adonis/Lucid/Database'

export default class PostsController {
  public async index() {
    return await Slug.all()
  }

  public async create({ request }: HttpContextContract) {
    const dbTransaction = await Database.transaction()
    try {
      const { name, slug } = request.all()
      const newSlug = await Slug.create(
        {
          name,
          slug,
        },
        {
          client: dbTransaction,
        }
      )
      if (newSlug.name == 'RESTRICTED NAME') {
        throw 'restricted name - rolling back'
      }
      await dbTransaction.commit()
      return newSlug
    } catch (e) {
      await dbTransaction.rollback()
      return e
    }
  }

  public async edit({ params, request }: HttpContextContract) {
    const dbTransaction = await Database.transaction()
    try {
      const { id } = params
      const { name, slug } = request.all()
      const existingSlug = await Slug.find(id)
      if (existingSlug) {
        existingSlug.name = name
        existingSlug.slug = slug
        await existingSlug.save()
        await dbTransaction.commit()
        return existingSlug
      }
      throw 'record not found'
    } catch (e) {
      await dbTransaction.rollback()
      throw e
    }
  }

  public async delete({ params }: HttpContextContract) {
    const dbTransaction = await Database.transaction()
    try {
      const { id } = params
      const existingSlug = await Slug.find(id)
      if (existingSlug) {
        await existingSlug.delete()
      } else {
        throw 'record not found'
      }
      await dbTransaction.commit()
      return 'record deleted'
    } catch (e) {
      await dbTransaction.rollback()
      return e
    }
  }
}
