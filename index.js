'use strict'

const exitHook = require('exit-hook')
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

const getLogger = require('loglevel-colored-level-prefix')
const log = getLogger()
log.debug('WPR start in DEBUG MODE')

// Start replay or record
exports.start = async function (operation = 'replay') {
  try {
    child = spawn(`${wprPath}/${platform}/wpr`, [operation, '--http_port=8080', '--https_port=8081', wprFile], {
      cwd: wprPath
    })

    // Show WPR output
    // if (log.getLevel() === log.levels.DEBUG) {
    child.stderr.on('data', (data) => {
      log.debug(`wpr: ${data}`.trim())
    })
    // }

    // Wait 30 second for wpr start
    await tcpPortUsed.waitUntilUsed(8080, 500, 30000)
    log.debug(`wpr started in ${operation} mode`)
  } catch (err) {
    throw new Error(err)
  }
}

// Stop replay or record
exports.stop = async function () {
  try {
    if (child !== undefined) {
      log.debug('Child exist')
      child.kill('SIGINT')
    }

    // Wait 30 second for wpr end
    await tcpPortUsed.waitUntilFree(8080, 500, 30000)
    log.debug(`wpr stopped`)
  } catch (err) {
    throw new Error(err)
  }
}

// delete wpr file
exports.clean = async function () {
  try {
    await deleteFileAsync(wprFile)
    log.debug(`${wprFile} deleted`)
  } catch (err) {
    log.error(`${wprFile} not exist`)
  }
}

// get full path to wpr file
exports.wprFile = function () {
  return wprFile
}

// Stop and clean on exit
exitHook(() => {
  log.debug('Exiting')

  if (child !== undefined) {
    log.debug('Child exist - kill')
    child.kill('SIGINT')
  }

  if (fs.existsSync(wprFile)) {
    log.debug(`${wprFile} exist - delete`)
    fs.unlinkSync(wprFile)
  }
})
