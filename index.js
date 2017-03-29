/* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* jshint esnext:true,eqeqeq:true,undef:true,lastsemic:true,strict:true,unused:true,node:true */

const intoStream = require('into-stream');
const promiseRetry = require('promise-retry');

function storeOrFail(storage, localStream, bucketName, fileName, wsOptions){
    "use strict";
    return new Promise(function(resolve, reject){
	const remote = (storage
			.bucket(bucketName)
			.file(fileName)
			.createWriteStream(wsOptions)
		       );

	// writing is finished when .finish is fired on remote
	// https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/0.8.0/storage/file?method=createWriteStream

	remote.on('finish', function(){
	    resolve({bucket: bucketName, file: fileName});
	});
	localStream.on('error', function(e){
	    remote.end();
	    reject("piptToStorage: error reading local input stream:"+e);
	});
	remote.on('error', function(e){
	    reject("pipeToStorage: error while writing gs://"+bucketName+"/"+fileName+":"+e);
	});
	localStream.pipe(remote);
    });
}


module.exports = function pipeToStorage(storage, _retryStrategy){
    "use strict";
    const retryStrategy = _retryStrategy || {
	retries: 3,
	factor: 1.5,
	minTimeout:  1000,
	maxTimeout: 10000,
	randomize: true
    };
    return function(source, bucketName, fileName, opt){
	function contentType(what){
	    return {
		metadata: {
		    contentType: what
		}
	    };
	}
	function isStreamLike(s){
	    return ((s) && (typeof(s)==='object') && (typeof(s.on)==='function') && (typeof(s.pipe)==='function'));
	}
	let meta;
	let wsOptions = {resumable:false};
	let streamer;
	if ((!source) || ((typeof(source)==='object') && (!isStreamLike(source)))){
	    return Promise.reject(new Error("pipeToStorage: source object passed to pipeToStorage is not a readable stream:"+JSON.stringify(source)));
	}
	if (typeof(source)==='string'){
	    streamer = ()=>(intoStream(source));
	} else if (typeof(source)==='function'){
	    streamer = source;
	}		
	if (opt === 'json'){
	    meta = contentType('application/json');
	} else if (opt && (typeof(opt)==='string')){
	    meta = contentType(opt);
	} else if (opt && (typeof(opt)==='object')){
	    meta = opt;
	}
	if (meta)
	    Object.assign(wsOptions, meta);
	if (typeof(streamer)==='function'){
	    return promiseRetry(function(retry){
		const localStream = streamer();
		if (!isStreamLike(localStream))
		    return Promise.reject(new Error("pipeToStorage: stream factory function did not return a readable stream: "+JSON.stringify(localStream)));
		return storeOrFail(storage, localStream, bucketName, fileName, wsOptions).catch(retry);
	    }, retryStrategy);
	}
	return storeOrFail(storage, source, bucketName, fileName, wsOptions);
    };
};
