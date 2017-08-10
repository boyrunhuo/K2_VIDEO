var webhdfs = require('webhdfs');
var fs = require('fs');
var http = require('http');
var server = webhdfs.createClient({host:'localhost',port:50070});

function hdfsServer(){

	this.download = function(remotepath,localpath,callback){
		var remoteStream = server.createReadStream(remotepath);
		var localStream = fs.createWriteStream(localpath);
		var error = null;
		remoteStream.pipe(localStream);
		remoteStream.on('finish',function onFinish(){
			console.log('finsish');
		});
		remoteStream.on('error',function onError(err){
			console.log(err);
			error = err;
		});
		
		callback && callback(error);
	}	

	this.upload = function(localpath,remotepath,callback){
		var localStream = fs.createReadStream(localpath);
		var remoteStream = server.createWriteStream(remotepath);
		var error = null;
		localStream.pipe(remoteStream);
		remoteStream.on('finish',function onFinish(){
			console.log('finish');
		});
		remoteStream.on('error',function onError(err){
			console.log(err);
			error = err;
		});
		
		callback && callback(error);
	}

	this.play = function(remotepath,callback){

		var remotestream = server.createReadStream(remotepath);
		
		remotestream.on('error',function(err){
			console.log(err);
		});

		remotestream.on('finish',function(){
			console.log('finish');
		});

		callback && callback(remotestream);
	}
	
	this.readFile = function(filename,callback){
		var filePath = '/webhdfs/v1' + filename+'?op=OPEN';
		var options = {
			hostname:'116.56.129.93',
			port:50070,
			path:filePath,
			method:'GET'
		};
		var req = http.request(options,function(res){
			console.log(res.statusCode);
			var a = JSON.stringify(res.headers);
			console.log(a);
			var b = a.split(',');
			var c = b[10];
			var d = c.split('"');
			var e = d[3];
			var f = e.split('/');
			var h = f[2];
			var i = h.split(':');
			options.hostname = i[0];
			options.port = i[1];
			if(i[0]=='vm10')
				options.path = e.substring(17);
			else
				options.path = e.substring(16);
			console.log(options);

			req = http.request(options,function(res){
				
				console.log(res.statusCode);
				console.log(res.headers);
				var body='';
				res.on('data',function(data){
					callback && callback(data);
				});
			});

  			req.end();
			});	
		req.on('error',function(err){
			console.log(err);
		});
		req.end();
	}
	
	this.readCompletedFile = function(filename,callback){
		var filePath = '/webhdfs/v1' + filename+'?op=OPEN';
		var options = {
			hostname:'116.56.129.93',
			port:50070,
			path:filePath,
			method:'GET'
		};
		var req = http.request(options,function(res){
			
			console.log(res.statusCode);
			
			var a = JSON.stringify(res.headers);
			var b = a.split(',');
			var c = b[10];
			var d = c.split('"');
			var e = d[3];
			var f = e.split('/');
			var h = f[2];
			var i = h.split(':');
			options.hostname = i[0];
			options.port = i[1];
			
			if(i[0]=='vm10')
				options.path = e.substring(17);
			else
				options.path = e.substring(16);
			
			console.log(options);

			req = http.request(options,function(res){
				
				console.log(res.statusCode);
				console.log(res.headers);
				
				var body='';
				res.on('data',function(data){
					body+=data;
				});
				
				res.on('end',function(){
					callback && callback(body);
				});
			});

  			req.end();
			});	
			
		req.on('error',function(err){
			console.log(err);
		});
		
		req.end();
	}
}

module.exports = hdfsServer;
