const colors = require('colors/safe')
const fs = require('fs')

const dateOptions = {
  month: 'long',
  day: 'numeric',
  hour12: false,
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
}

const createLogger = (target, verbose) => {
  if (verbose) {
    return function () {
      const now = new Date()
      console.log(
        colors.gray(now.toLocaleString('en-US', dateOptions)),
        colors.yellow(`${target}`),
        ...arguments
      )
    }
  } else {
    return function () {
      const now = new Date()
      let content = now.toLocaleString('en-US', dateOptions)
      content += ` ${target}`
      arguments.forEach((argument) => {
        content += ` ${argument}`
      })
      fs.appendFile('gport.log', content)
    }
  }
}

module.exports = {
  createLogger
}
