const { readFileSync, writeFileSync } = require('fs')
const csvjson = require('csvjson')
const { argv } = require('yargs/yargs')(process.argv.slice(2))

class BioObject {
  constructor(bioName, bioSex, bioAge, bioHeight, bioWeight) {
    this.name = bioName[0].toUpperCase() + bioName.substring(1).toLowerCase()
    this.sex = bioSex.toUpperCase()
    this.age = Number(bioAge)
    this.height = Number(bioHeight)
    this.weight = Number(bioWeight)
  }

  iisValidName() {
    if (!(typeof this.name === 'string')) {
      console.log('Invalid name.')
      process.exit(1)
    }
    return true
  }

  isValidSex() {
    if (!['F', 'M'].includes(this.sex)) {
      console.log('Incorrect sex.')
      process.exit(1)
    }
    return true
  }

  isValidAge() {
    if (Number.isNaN(this.age) || this.age < 18) {
      console.log('Invalid age. Must be a number and greater than 18.')
      process.exit(1)
    }
    return true
  }

  isValidHeight() {
    if (Number.isNaN(this.height)) {
      console.log('Invalid height. Must be a number.')
      process.exit(1)
    }
    return true
  }

  isValidWeight() {
    if (Number.isNaN(this.weight)) {
      console.log('Invalid weight. Must be a number.')
      process.exit(1)
    }
    return true
  }
}

const readCSV = (filePath) => csvjson.toObject(readFileSync(filePath, 'utf-8'), { delimiter: ',', quote: '"' })

const writeToCSV = (filePath, bioMap) => {
  try {
    writeFileSync(filePath, csvjson.toCSV(Array.from(bioMap.values()), { headers: 'key', delimiter: ',\t\t' }))
    return true
  } catch (error) {
    return false
  }
}

const createBioObject = (bioName, bioSex, bioAge, bioHeight, bioWeight) => {
  const newBio = new BioObject(bioName, bioSex, bioAge, bioHeight, bioWeight)

  if (newBio.iisValidName() && newBio.isValidSex() && newBio.isValidAge()
    && newBio.isValidHeight() && newBio.isValidWeight()) {
    return newBio
  }
  return null
}

const readBio = (bioMap, bioName) => bioMap.get(`${bioName[0].toUpperCase() + bioName.substring(1).toLowerCase()}`)

const createBio = (bioMap, newBioObject) => bioMap.set(newBioObject.name, newBioObject)

const updateBio = (bioMap, updatedBio) => bioMap.set(updatedBio.name, updatedBio)

const deleteBio = (bioMap, bioName) => bioMap.delete(`${bioName[0].toUpperCase() + bioName.substring(1).toLowerCase()}`)

const arrayToMap = (array) => new Map(array.map((item) => [item.name, item]))

const checkIfExisting = (bioMap, bioName, command) => {
  const existing = bioMap.has(bioName[0].toUpperCase() + bioName.substring(1).toLowerCase())

  if (command === '-c' && existing) {
    console.log('No duplicates allowed. Data already exists.')
    process.exit(1)
  } else if (command === '-u' && !existing) {
    console.log('Data does not exist.')
    process.exit(1)
  } else if (command === '-d' && !existing) {
    console.log(`Person with name '${argv.name}' does not exist in the database.`)
    process.exit(1)
  }
}

const saveAndExit = (dbPath, bioMap) => {
  console.log(writeToCSV(dbPath, bioMap))
  process.exit(1)
}

const dbPath = 'biostats.csv'
const bioMap = arrayToMap(readCSV(dbPath))

if (!(argv.c || argv.r || argv.u || argv.d)) {
  console.log('Invalid option. Must be in [-c, -r, -u, -d].')
  process.exit(1)
} else if (argv.c) {
  checkIfExisting(bioMap, argv.name, '-c')
  createBio(bioMap, createBioObject(argv.name, argv.sex, argv.age, argv.height, argv.weight))
  saveAndExit(dbPath, bioMap)
} else if (argv.r) {
  const person = readBio(bioMap, argv.name)
  if (!person) {
    console.log('Data not found.')
    process.exit(1)
  } else {
    console.log(`\n================== BIO DATA ==================\n
      Name: ${person.name}
      Sex: ${person.sex === 'M' ? 'Male' : 'Female'}
      Age: ${person.age} years old
      Height: ${person.height} in (${person.height * 2.54} cm)
      Weight: ${person.weight} lbs (${(person.weight * 0.45359237).toFixed(2)} kg)\n
==============================================\n`)
    process.exit(1)
  }
} else if (argv.u) {
  checkIfExisting(bioMap, argv.name, '-u')
  updateBio(bioMap, createBioObject(argv.name, argv.sex, argv.age, argv.height, argv.weight))
  saveAndExit(dbPath, bioMap)
} else if (argv.d) {
  checkIfExisting(bioMap, argv.name, '-d')
  deleteBio(bioMap, argv.name)
  saveAndExit(dbPath, bioMap)
}
