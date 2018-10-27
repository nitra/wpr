'use strict'

const path = require('path')
const os = require('os')
const platform = os.platform()
const {
  spawn
} = require('child_process')
const {
  promisify
} = require('util')

const fs = require('fs')
const deleteFileAsync = promisify(fs.unlink)

const wprFile = '/tmp/archive.wprgo'
let child

exports.start = async function () {
  try {
    const wprPath = path.resolve(__dirname, 'platforms')

    child = spawn(`${wprPath}/${platform}/wpr`, ['replay', '--http_port=8080', '--https_port=8081', wprFile], {
      cwd: wprPath
    })

    // Show WPR output
    if (process.env.DEBUG) {
      child.stderr.on('data', (data) => {
        console.log(`wpr:\n${data}`)
      })
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

    try {
      await deleteFileAsync(wprFile)
      console.log(`${wprFile} deleted`)
    } catch (err) {
      console.log(`${wprFile} not exist`)
    }

    console.log('Wpr stopped and file cleaned')
  } catch (err) {
    console.error(err)
  }
}
