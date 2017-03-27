/* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* jshint esnext:true,eqeqeq:true,undef:true,lastsemic:true,strict:true,unused:true,node:true */

module.exports = function pipeToStorage(storage){
    return function(localStream, bucketName, fileName){
	return new Promise(function(resolve, reject){
	    const remote = (storage
			    .bucket(bucketName)
			    .file(fileName)
			    .createWriteStream({resumable:false})
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
    }
}
    
