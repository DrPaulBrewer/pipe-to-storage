/* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* jshint esnext:true,eqeqeq:true,undef:true,lastsemic:true,strict:true,unused:true,node:true */

module.exports = function pipeToStorage(storage){
    "use strict";
    return function(localStream, bucketName, fileName, opt){
	function contentType(what){
	    return {
		metadata: {
		    contentType: what
		}
	    };
	}
	let meta;
	let wsOptions = {resumable:false};
	if (opt === 'json'){
	    meta = contentType('application/json');
	} else if (opt && (typeof(opt)==='string')){
	    meta = contentType(opt);
	} else if (opt && (typeof(opt)==='object')){
	    meta = opt;
	}
	if (meta)
	    Object.assign(wsOptions, meta);
	return new Promise(function(resolve, reject){
	    const remote = (storage
			    .bucket(bucketName)
			    .file(fileName)
			    .createWriteStream(wsOptions)
			   );
	    localStream.on('end', function(){
		resolve({bucket: bucketName, file: fileName});
	    });
	    localStream.on('error', function(e){
		// remote.end();
		reject("pipeToStorage: error while writing gs://"+bucketName+"/"+fileName+":"+e);
	    });
	    localStream.pipe(remote);
	});
    };
};
    
