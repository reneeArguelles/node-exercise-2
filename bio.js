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
}

const readCSV = (filePath) => csvjson.toObject(readFileSync(filePath, 'utf-8'), { delimiter: ',', quote: '"' })

const writeToCSV = (filePath, bioArray) => {
  try {
    writeFileSync(filePath, csvjson.toCSV(bioArray, { headers: 'key', delimiter: ',\t\t' }))
    return true
  } catch (error) {
    return false
  }
}

const createBioObject = (bioName, bioSex, bioAge, bioHeight, bioWeight) => {
  if (!['f', 'm', 'F', 'M'].includes(bioSex)) {
    console.log('Incorrect sex.')
    process.exit(1)
  }
  if (Number.isNaN(Number(bioAge)) || bioAge < 18) {
    console.log('Invalid age. Must be a number and greater than 18.')
    process.exit(1)
  }
  if (Number.isNaN(Number(bioHeight))) {
    console.log('Invalid height. Must be a number.')
    process.exit(1)
  }
  if (Number.isNaN(Number(bioWeight))) {
    console.log('Invalid weight. Must be a number.')
    process.exit(1)
  }
  return new BioObject(bioName, bioSex, bioAge, bioHeight, bioWeight)
}

const readBio = (bioArray, bioName) => bioArray.find((obj) => obj.name.toLowerCase() === bioName.toLowerCase())

const createBio = (bioArray, newBioObject) => [...bioArray, newBioObject]

const updateBio = (bioArray, updatedBioObject) => {
  bioArray.splice(bioArray.indexOf(readBio(bioArray, updatedBioObject.name)), 1, updatedBioObject)
}

const deleteBio = (bioArray, bioName) => {
  bioArray.splice(bioArray.indexOf(readBio(bioArray, bioName)), 1)
}

const dbPath = 'biostats.csv'
const origBioArray = readCSV(dbPath)

if (!(argv.c || argv.r || argv.u || argv.d)) {
  console.log('Invalid option. Must be in [-c, -r, -u, -d].')
  process.exit(1)
} else if (argv.c) {
  if (argv.name === undefined || argv.sex === undefined || argv.age === undefined
    || argv.height === undefined || argv.weight === undefined) {
    console.log('Incomplete arguments. Must contain <name> <sex> <age> <height> <weight>.')
    process.exit(1)
  }
  if (readBio(origBioArray, argv.name)) {
    console.log('No duplicates allowed. Data already exists.')
    process.exit(1)
  }
  const newBioArray = createBio(
    origBioArray,
    createBioObject(argv.name, argv.sex, argv.age, argv.height, argv.weight),
  )
  console.log(writeToCSV(dbPath, newBioArray))
  process.exit(1)
} else if (argv.r) {
  if (argv.name === undefined) {
    console.log('Missing <name> argument.')
    process.exit(1)
  }
  const person = readBio(origBioArray, argv.name)
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
  if (argv.name === undefined || argv.sex === undefined || argv.age === undefined
    || argv.height === undefined || argv.weight === undefined) {
    console.log('Incomplete arguments. Must contain <name> <sex> <age> <height> <weight>')
    process.exit(1)
  }
  if (readBio(origBioArray, argv.name) === undefined) {
    console.log('Data does not exist.')
    process.exit(1)
  }
  updateBio(origBioArray, createBioObject(argv.name, argv.sex, argv.age, argv.height, argv.weight))
  console.log(writeToCSV(dbPath, origBioArray))
  process.exit(1)
} else if (argv.d) {
  if (!(readBio(origBioArray, argv.name))) {
    console.log(`Person with name '${argv.name}' does not exist in the database.`)
    process.exit(1)
  } else {
    deleteBio(origBioArray, argv.name)
    console.log(writeToCSV(dbPath, origBioArray))
    process.exit(1)
  }
}
