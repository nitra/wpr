'use strict'

const path = require('path')
const os = require('os')
const {
  spawn
} = require('child_process')
const {
  promisify
} = require('util')
const tcpPortUsed = require('tcp-port-used')
const fs = require('fs')
const deleteFileAsync = promisify(fs.unlink)

const platform = os.platform()
const wprPath = path.resolve(__dirname, 'platforms')

const wprFile = '/tmp/archive.wprgo'
let child

exports.start = async function (operation = 'replay') {
  try {
    child = spawn(`${wprPath}/${platform}/wpr`, [operation, '--http_port=8080', '--https_port=8081', wprFile], {
      cwd: wprPath
    })

    // Show WPR output
    if (process.env.DEBUG) {
      child.stderr.on('data', (data) => {
        console.log(`wpr:\n${data}`)
      })
    }

    // Wait 30 second for wpr start
    try {
      await tcpPortUsed.waitUntilUsed(8080, 500, 30000)
      console.log(`wpr started`)
    } catch (err) {
      console.error(err)
    }

    console.log('Wpr started')
  } catch (err) {
    console.error(err)
  }
}

exports.stop = async function () {
  try {
    if (child !== undefined) {
      console.log('Child exist')
      child.kill('SIGINT')
    }

    // Wait 30 second for wpr end
    try {
      await tcpPortUsed.waitUntilFree(8080, 500, 30000)
      console.log(`wpr stopped`)
    } catch (err) {
      console.error(err)
    }

    console.log('Wpr stopped')
  } catch (err) {
    console.error(err)
  }
}

exports.clean = async function () {
    try {
      await deleteFileAsync(wprFile)
      console.log(`${wprFile} deleted`)
    } catch (err) {
      console.log(`${wprFile} not exist`)
    }
}