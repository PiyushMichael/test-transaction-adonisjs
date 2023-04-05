import Database from '@ioc:Adonis/Lucid/Database'
import Slug from 'App/Models/Slug'

export default class PostsController {
  public async index() {
    return await Slug.all()
  }

  public async create() {
    const dbTransaction = await Database.transaction()
    dbTransaction.once('commit', () => {
      console.log('Transaction COMMITTED! ✅✅✅✅✅✅✅✅✅✅✅✅')
    })
    dbTransaction.once('rollback', () => {
      console.log('Transaction ROLLED BACK! ❌❌❌❌❌❌❌❌❌❌❌❌❌')
    })
    try {
      console.log('Before create', await Slug.all())
      await Slug.create(
        {
          name: 'test',
          slug: 'test',
        },
        {
          client: dbTransaction,
        }
      )
      console.log('After create', await Slug.all())
      throw new Error('throwing error')
      await dbTransaction.commit()
      return 'Done'
    } catch (e) {
      await dbTransaction.rollback()
      console.log('After rollback', await Slug.all())
      throw e
    }
  }
}
