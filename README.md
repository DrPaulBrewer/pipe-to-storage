# pipe-to-storage

## Importing and Setup

On Google platforms:

const storage = require('@google-cloud/storage')();

On other platforms: see [npm docs](https://www.npmjs.com/package/@google-cloud/storage)

**Pass the storage object** when setting up pipeToStorage for usage

const pipeToStorage = require('pipe-to-storage')(storage);

## Usage

    pipeToStorage(localStream, bucketName, fileName)

returns a Promise that resolves after saving contents of `readable-stream`
`localStream` to `storage.bucket(bucketName).file(fileName)` or rejects
with any errors




