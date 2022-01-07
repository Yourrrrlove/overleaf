// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { waitForDb } = require('../../../../app/js/mongodb')
const app = require('../../../../app')

module.exports = {
  running: false,
  initing: false,
  callbacks: [],
  ensureRunning(callback) {
    if (callback == null) {
      callback = function () {}
    }
    if (this.running) {
      return callback()
    } else if (this.initing) {
      return this.callbacks.push(callback)
    }
    this.initing = true
    this.callbacks.push(callback)
    waitForDb().then(() => {
      app.listen(3010, 'localhost', error => {
        if (error != null) {
          throw error
        }
        this.running = true
        for (callback of Array.from(this.callbacks)) {
          callback()
        }
      })
    })
  },
}
