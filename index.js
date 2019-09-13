'use strict'

const exitHook = require('exit-hook')
const path = require('path')
const os = require('os')
const { spawn } = require('child_process')
const { promisify } = require('util')
const tcpPortUsed = require('tcp-port-used')
const fs = require('fs')
const deleteFileAsync = promisify(fs.unlink)

const platform = os.platform()
const wprPath = path.resolve(__dirname, 'platforms')

const wprFile = '/tmp/archive.wprgo'
let child

const log = require('loglevel-colored-level-prefix')()
log.debug('WPR start in DEBUG MODE - http: 8888, https: 8081 ')

/**
 * Start replay or record
 *
 * @param {('replay'|'record')} operation Operation type
 */
exports.start = async function (operation = 'replay') {
  try {
    child = spawn(`${wprPath}/${platform}/wpr`, [operation, '--http_port=8888', '--https_port=8081', wprFile], {
      cwd: wprPath
    })

    // Show WPR output
    if (process.env.VERBOSE) {
      child.stderr.on('data', (data) => {
        log.debug(`wpr: ${data}`.trim())
      })
    }

    // Wait 30 second for wpr start
    await tcpPortUsed.waitUntilUsed(8888, 500, 30000)
    log.debug(`wpr started in ${operation} mode`)
  } catch (err) {
    throw new Error(err)
  }
}

/**
 * Stop replay or record
 */
exports.stop = async function () {
  try {
    if (child !== undefined) {
      log.debug('Child exist - kill him')
      child.kill('SIGINT')
    }
  } catch (err) {
    throw new Error(err)
  }

  // Wait 30 second for wpr end
  try {
    await tcpPortUsed.waitUntilFree(8888, 500, 30000)
  } catch (err) {
    log.debug(err)
  }

  log.debug('wpr stopped')
}

/**
 * delete wpr file
 */
exports.clean = async function () {
  try {
    await deleteFileAsync(wprFile)
    log.debug(`${wprFile} deleted`)
  } catch (err) {
    log.error(`${wprFile} not exist`)
  }
}

/**
 * get full path to wpr file
 *
 * @return {String}
 */
exports.wprFile = function () {
  return wprFile
}

// Stop and clean on exit
exitHook(() => {
  log.debug('Exiting')

  if (child !== undefined) {
    log.debug('Child exist - hard kill')
    child.kill('SIGINT')
  }

  if (fs.existsSync(wprFile)) {
    log.debug(`${wprFile} exist - delete`)
    fs.unlinkSync(wprFile)
  }
})
