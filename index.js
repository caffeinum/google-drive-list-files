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
  process.stdout.write(data)
  log(data)
  // log("\n")
}

google.auth((auth) => {
  let dirID = "1m8Jp1xSM78VkJDdv0U8Q4rYCS4E_Vll5"

  let headers = {
    "Authorization": "Bearer " + auth.credentials.access_token
  }

  let files = findFiles(auth, dirID)

  files.then( files => {
    log( 'files', files )

    let checkpoint = files[0]

    let id = checkpoint["id"]

    log( 'fileid', id )

    return id
  })
  .then( output )
  .catch(error => { console.error("ERROR " + error.response.status + " " + error.response.statusText + "\n" + error.response.config.url) })
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
