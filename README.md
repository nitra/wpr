# wpr
Web Page Replay Go binary

Platform dependent binary installer of [WebPageReplay](https://github.com/catapult-project/catapult/tree/master/web_page_replay_go) for node projects. Useful for serverless.

Provide binary of `wpr` for the Linux x64 and Mac platforms.

## Install

    npm install --save wpr
    
## Usage examples

```javascript
const wpr = require('wpr')

// start record
await wpr.start('record')

// start play
await wpr.start()

// start play or record
await wpr.stop()

// remove wpr file
await wpr.clean()
```