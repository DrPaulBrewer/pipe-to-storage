/* jshint node:true,mocha:true,esnext:true,eqeqeq:true,undef:true,lastsemic:true */

const assert = require('assert');
require('should');

const storage = require('@google-cloud/storage')({
    projectId: 'eaftc-open-source-testing',
    keyFilename: './test/storage.json'
});

const pipeToStorage = require('../index.js')(storage);
const bucket = 'eaftc-travis-testing';

function rm(fname){
 
}

const fs = require('fs');

function testWrite(source, fname, contents){
    it('should write without error, resolving to {bucket, file}', function(){
	return (pipeToStorage(source, bucket, fname)
		.then(function(ok){
		    assert.equal(ok.bucket, bucket);
		    assert.equal(ok.file, fname);
		})
	       );
    });
    
    it('should read back written message', function(){
	return (storage
		.bucket(bucket)
		.file(fname)
		.download()
		.then(function(buffer){
		    return buffer.toString('utf8');
		})
		.then(function(out){
		    assert.equal(out, contents);
		})
	       );
    });
    it('cleanup', function(){
	return (storage
		.bucket(bucket)
		.file(fname)
		.delete()
	       );
    }); 

}

function suite(){
    describe('setup:', function(){
	it('should be a function', function(){
	    assert.equal(typeof(pipeToStorage), 'function');
	});
    });
    describe('write a string', function(){
	const msg = 'Hello World '+Math.random();
	const fname = 'string-test.txt';
	testWrite(msg, fname, msg);
    });
    describe('write from a function that returns readable stream, via a function (allows retry)', function(){
	const localfname = './test/index.js';
	const source = ()=>(fs.createReadStream(localfname));
	const fname = 'function-test.txt';
	const contents = fs.readFileSync(localfname, 'utf8');
	testWrite(source, fname, contents);
    });
    describe('write from a readable stream (no retries)', function(){
	const localfname = './test/index.js';
	const source = fs.createReadStream(localfname);
	const contents = fs.readFileSync(localfname, 'utf8');
	const fname = 'stream-test.txt';
	testWrite(source, fname, contents);
    });
}

describe('pipeToStorage, test group 1 ', function(){
    suite();
});

describe('pupeToStorage, test group 2 (with 5 min delay) ', function(done){
    this.timeout(8*60*1000);
    beforeEach(function(done){
	setTimeout(5*60*1000, done);
    });
    suite();
});
