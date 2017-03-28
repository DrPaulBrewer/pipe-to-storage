# pipe-to-storage

## Importing and Setup

On Google platforms:

    const storage = require('@google-cloud/storage')();

On other platforms: see [npm docs](https://www.npmjs.com/package/@google-cloud/storage)

**Pass the storage object** when setting up pipeToStorage for usage

    const pipeToStorage = require('pipe-to-storage')(storage);

## Usage

    pipeToStorage(source, bucketName, fileName [, optional] )

`source` may be:

* a string, which will be sent as-is to the new file [retry with same string]
* a function that returns a readable stream [retry by calling function to get fresh readable stream]
* a readable stream [can not retry]

`npm:promise-retry` will be used to retry failed storage promises in the first two cases.  A retry strategy
is used that is appropriate for a cloud back-end environment: up to 10 retries per call within 1-2 minutes, then fail.

`bucketname` and `filename` are the Google Cloud Storage[tm] bucket and file names.  `gs://` is **not** needed in `bucketName`

`optional` may be:

* the string `'json'` is shorthand to set `content-type: application/json`
* other strings will set the content type exactly
* an object overrides `writeStream.options` in the storage call

returns a Promise that resolves after saving the string or stream contents in `source` to 
`storage.bucket(bucketName).file(fileName)` or rejects with any errors




