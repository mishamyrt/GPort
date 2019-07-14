const fs = require('fs')
const os = require('os')

const CONFIGURATION_FOLDER = `${os.homedir()}/.local/gport`
const CONFIGURATION_FILE = `${CONFIGURATION_FOLDER}/config.json`

const createConfigartionFolder = () => {
  return new Promise((resolve) => {
    fs.exists(CONFIGURATION_FOLDER, (exists) => {
      if (!exists) {
        fs.mkdir(CONFIGURATION_FOLDER, {
          mod: 0744
        }, () => resolve);
      }
    })
  })
}

const createConfigartionFile = () => {
  return new Promise((resolve) => {
    fs.exists(CONFIGURATION_FILE, (exists) => {
      if (!exists) {
        fs.writeFile(CONFIGURATION_FILE, '', () => {
          resolve()
        })
      }
    })
  })
}

const prepareEnvironment = () => {
  return createConfigartionFolder()
    .then(() => createConfigartionFile)
}

const getConfiguration = () => {
  return require(CONFIGURATION_FILE)
}

module.exports = {
  prepareEnvironment,
  getConfiguration
}
