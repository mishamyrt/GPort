const mqtt = require('mqtt')
const config = require('./config.json')
const { createLogger } = require('./helpers')

class gPort {
  static start (argv) {
    this.services = {}

    this.log = createLogger(
      'gPort',
      argv.length > 2 && argv[2] === '-v'
    )

    this.connect()
      .then((client) => (this.client = client))
      .then(() => this.initDevices())
      .then(() => this.client.on('message', this.handeMessage.bind(this)))
  }

  static updateStatus (id, feature, status) {
    this.client.publish(`${config.path}/${id}/${feature}/set`, status)
  }

  static async handeMessage (topic, message) {
    const topicPath = topic.split('/')
    const feature = topicPath[topicPath.length - 1]
    const id = topicPath[topicPath.length - 2]

    this.log(`Handling message from topic ${feature} of ${id}`)

    switch (feature) {
      case 'onoff':
        if (message.toString() === '1') {
          await this.services[id].on()
        } else {
          await this.services[id].off()
        }
        this.updateStatus(id, feature, message)
        break
      case 'colorsettingjson':
        const color = JSON.parse(message)
        await this.services[id].setColor(
          color.red,
          color.green,
          color.blue
        )
        this.updateStatus(id, feature, message)
        break
      case 'colorsettingtemp':
        await this.services[id].setTemperature(
          parseInt(message, 10)
        )
        this.updateStatus(id, feature, message)
        break
      case 'brightness':
        await this.services[id].setBrightness(
          parseInt(message, 10)
        )
        this.updateStatus(id, feature, message)
        break
      default:
        this.log(`Unhandled feature '${feature}' on ${id}`)
        break
    }
  }

  static connect () {
    return new Promise((resolve) => {
      const client = mqtt.connect(config.url, {
        username: config.username,
        password: config.password
      })
      client.on('connect', () => {
        this.log(`Connected to MQTT: ${config.url}`)
        resolve(client)
      })
    })
  }

  static subscribe (path, id, features) {
    for (const feature of features) {
      this.client.subscribe(`${path}/${id}/${feature}`)
    }

    this.log(`Subsribed to ${features.length} topics of ${id}`)
  }

  static async initDevices () {
    for (const device of config.devices) {
      this.log(`Connecting to ${device.name}`)
      const driver = require(`gport-${device.service}`)
      this.services[device.id] = new driver.Service(
        createLogger(`${device.name}:${device.id}`, true)
      )
      await this.services[device.id].connect()
      this.log(`${device.name} is conneted`)
      this.subscribe(
        config.path,
        device.id,
        driver.features
      )
    }
  }
}

gPort.start(process.argv)
