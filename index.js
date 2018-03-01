#!/usr/bin/env node

var axios = require('axios')
var google = require('./google')

const isPiped = !Boolean(process.stdout.isTTY)
const DEBUG = process.env.DEBUG_ENABLED || true
const DRIVE_URL = "https://www.googleapis.com/drive/v3/files"

let log = function (...args) {
	if ( DEBUG && !isPiped ) {
		console.log(...args)
	}
}

let output = function (data) {
	process.stdout.write(JSON.stringify(data))
  log(data)
}

let dirID = process.argv[3]
let index = parseInt(process.argv[2])

if ( !index ) {
  index = 0
}

if ( !dirID ) {
  dirID = "1m8Jp1xSM78VkJDdv0U8Q4rYCS4E_Vll5"
}

log("Using index", index)
log("Using dirID", dirID)

google.auth((auth) => {

  let headers = {
    "Authorization": "Bearer " + auth.credentials.access_token
  }

  let files = findFiles(auth, dirID)

  files.then( files => {
    log( 'files' )
		output( files )

    let checkpoint = files[ index ]
    if ( !checkpoint ) {
      throw new Error('File with index not found: '+index)
    }

    let id = checkpoint["id"]

    log( 'fileid', id )

    return id
  })
  .then( log('fileid') )
  .then( log )
  .catch(error => {
    if ( !error.response ) return console.error(error)
    console.error("ERROR " + error.response.status + " " + error.response.statusText + "\n" + error.response.config.url)
  })
})




/**
 * Searches and returns files in the directory
 *
 */

function findFiles(auth, dir) {
  let query = "?q='" + dir + "'+in+parents"
  let headers = {
    "Authorization": "Bearer " + auth.credentials.access_token
  }

  let url = DRIVE_URL + query

  return axios({ url, headers }).then( res => {

    if ( !res.data.files ) throw new Error('folder not found')

    return res.data.files
  })
}
