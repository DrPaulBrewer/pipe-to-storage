# pipe-to-storage

## Importing and Setup

On Google platforms:

    const storage = require('@google-cloud/storage')();

On other platforms: see [npm docs](https://www.npmjs.com/package/@google-cloud/storage)

**Pass the storage object** when setting up pipeToStorage for usage

    const pipeToStorage = require('pipe-to-storage')(storage);

## Usage

    pipeToStorage(source, bucketName, fileName , optional )
    .then(function onSuccess(what){ 
       console.log("hooray! I wrote "+what.file+" to bucket "+what.bucket);
     })
     .catch(function(e){
       console.log("oh no! an error occurred. here it is:");
       console.log(e);
     });

`source` must be either:

* a string, which will be sent as-is to the new file [retry will use the same string]
* a function that returns a readable stream [retry will call the function to get a fresh readable stream]
* a readable stream [can not retry]

`npm:promise-retry` will be used to retry failed storage promises in the first two cases.  A retry strategy
is used that is appropriate for a cloud back-end environment: up to 10 retries per call within 1-2 minutes, then fail.

`bucketname` and `filename` are the Google Cloud Storage[tm] bucket and file names.  `gs://` is **not** needed in `bucketName`

`optional` is optional and may be:

* the string `'json'`, shorthand to set metadata `content-type: application/json`
* other strings, for setting the `content-type` (be precise)
* an object, to set any `writeStream.options` in the internal storage `createWriteStream` call

returns a Promise that resolves after saving the contents of `source` to 
`storage.bucket(bucketName).file(fileName)` or rejects with any errors not caught in retrys




