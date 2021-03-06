'use strict'

const db = require('../server/db')
const {
  User,
  Account,
  Category,
  // Perk,
  CreditCard
} = require('../server/db/models')
const creditCard = require('./creditCard')
const account = require('./account')
const category = require('./category')
// const perk = require('./perk')

async function seed() {
  await db.sync({force: true})
  console.log('db synced!')

  const users = await Promise.all([
    User.create({email: 'cody@email.com', password: '123'}),
    User.create({email: 'murphy@email.com', password: '123'})
  ])

  const categories = await Category.bulkCreate(category)
  const creditCards = await CreditCard.bulkCreate(creditCard)
  const getPerks = () => {
    let perks = {}
    categories.forEach(cg => {
      perks[cg.name] = {points: Math.floor(Math.random() * 3)}
    })
    return perks
  }
  creditCards.forEach(async cc => {
    cc.perks = getPerks()
    console.log(cc.perks)
    await cc.save()
  })
  account.forEach(acct => {
    acct.creditCardId =
      creditCards[Math.floor(Math.random() * creditCards.length)].id
    acct.userId = users[Math.floor(Math.random() * users.length)].id
  })
  const accounts = await Account.bulkCreate(account)
  // perk.forEach(p => {
  //   p.categoryId = categories[Math.floor(Math.random() * categories.length)].id
  //   p.creditCardId =
  //     creditCards[Math.floor(Math.random() * creditCards.length)].id
  // })
  // const perks = await Perk.bulkCreate(perk)

  console.log(`seeded ${users.length} users`)
  console.log(`seeded ${accounts.length} accounts`)
  // console.log(`seeded ${perks.length} perks`)
  console.log(`seeded successfully`)
}

// We've separated the `seed` function from the `runSeed` function.
// This way we can isolate the error handling and exit trapping.
// The `seed` function is concerned only with modifying the database.
async function runSeed() {
  console.log('seeding...')
  try {
    await seed()
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  } finally {
    console.log('closing db connection')
    await db.close()
    console.log('db connection closed')
  }
}

// Execute the `seed` function, IF we ran this module directly (`node seed`).
// `Async` functions always return a promise, so we can use `catch` to handle
// any errors that might occur inside of `seed`.
if (module === require.main) {
  runSeed()
}

// we export the seed function for testing purposes (see `./seed.spec.js`)
module.exports = seed
