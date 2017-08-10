var hbase = require('hbase');
var db = hbase({host:'116.56.129.93',port:18080});

function hbaseHandler(){

	this.insertRecord = function(obj,callback){
	//	db.table(obj.table).create(obj.columnFamily,function(err,success){
			db.table(obj.table).row(obj.rowKey).put(obj.column,obj.columnValue,function(err,success){
				if(err){
					callback && callback(err,null);
				}
				else{
					if(success){
						status = 1;//successfully insert record
						callback && callback(err,status);
					}
				}
			});
	//	});
	}

	this.insertAllRecord = function(obj,callback){
		//db.table(obj.table).create(obj.columnFamily,function(err,success){
			db.table(obj.table).row(obj.rowKey).put(obj.cells,function(err,success){
				if(err)
					callback && callback(err,null);
				else{
					status = 1;
					callback && callback(err,status);
				}
			});
		//});
	}

	this.deleteRecord = function(obj,callback){
		db.table(obj.table).row(obj.rowKey)["delete"](function(err,success){
			if(err){
				callback && callback(err,null);
			}else{
				status = 1;//successfully delete record
				callback && callback(err,status);
			}	
		});
	}

	this.queryRecord = function(obj,callback){
		db.table(obj.table).row(obj.rowKey).exists(obj.column,function(err,exists){
			if(exists){
				this.get(obj.column,function(err,value){
					value[0].key = obj.rowKey;
					callback && callback(err,value);
				});
			}else
				callback && callback(err,null);
		});
	}

	this.queryAllRecord = function(obj,callback){
		db.table(obj.table).row(obj.rowKey).exists(obj.columnFamily,function(err,exists){
			if(exists){
				this.get(obj.columnFamily,function(err,values){
					callback && callback(err,values);
				});
			}else
				callback && callback(err,null);
		});
		
	}

	this.queryRowKeyAndRecord = function(obj,callback){
		var scanner = db.table(obj.table).scan({startRow:obj.startRow,maxVersion:1,column:obj.column,endRow:obj.endRow});
		var rows = new Array();
		scanner.on('readable',function(err){
			if(err)
				callback && callback(err,null);
			else{
				var chunk;

				while(chunk=scanner.read()){
					rows.push(chunk);
					
				}

				
			}
		});
		scanner.on('end',function(err){
			callback && callback(err,rows);
		});
	}

	this.queryRowKeyByValue = function(filename,callback){
		
		var row = new Array()
		var scanner = db.table('Table_VideoInteractionLog').scan({
		maxVersion:1,
		filter:{
				'op':'EQUAL',
				'type':'ValueFilter',
				'comparator':{
							  'value':'/root/'+filename,
	              		 	  'type':'BinaryComparator'},
		}});

		scanner.on('readable',function(err){
			if(err) callback && callback(err,null);
			else{
				var chunk;
		    	while(chunk=scanner.read())
					row.push(chunk);
			}
		});

		scanner.on('end',function(err){
			callback && callback(err,row);
		});

	
	}

	this.queryRowKeyByMD5 = function(md5,callback){
	
		var row = new Array()
		var scanner = db.table('Table_VideoIndex').scan({
					maxVersion:1,
					filter:{
						'op':'EQUAL',
	    				'type':'ValueFilter',
						'comparator':{
						'value':md5,
						'type':'BinaryComparator'},
		}});

		scanner.on('readable',function(err){
			if(err) callback && callback(err,null);
			else{
				var chunk;
				while(chunk=scanner.read())	
					row.push(chunk);
			}
		});

		scanner.on('end',function(err){	
			callback && callback(err,row);
		});
	}

	this.query = function(obj,callback){
		var rows = new Array();
		var scanner = db.table(obj.table).scan({
					maxVersion:1,
					filter:
					{
						"type":"FilterList",
						"op":"MUST_PASS_All",
						"filters":
						[
							{
							"type":"FamilyFilter",
							"op":"EQUAL",
							"comparator":{
								"type":"BinaryComparator",
								"value":"BasicInformation"
								}
							},
							{
							"type":"QualifierFilter",
							"op":"EQUAL",
							"comparator":{
								"type":"BinaryComparator",
								"value":"Userpassword"
								}
							},
							{
							"type":"ValueFilter",
							"op":"EQUAL",
							"comparator":{
								"type":"BinaryComparator",
								"value":"222222"
								}
							}
						]
					}
		});

		scanner.on('readable',function(err){
			if(err) callback && callback(err,null);
			else{
				var chunk;
				while(chunk=scanner.read())
					rows.push(chunk);
			}
		});
	
		scanner.on('end',function(err){
			callback && callback(err,rows);
		});
	}


	this.fuzzquery=function(filename,callback){
		var rows = new Array();
		var scanner = db.table('Table_VideoInteractionLog').scan(
			{
			maxVersions: 1,
			filter :{
        		op:'MUST_PASS_ALL',
        		type:'FilterList',
        		filters:[
        			{	
        				op:'EQUAL',
        				type:'QualifierFilter',
        				comparator:{value : 'CatalogueVideoName',  type: 'BinaryComparator'}
        							},
        			{
        				op:'EQUAL',
        				type:'ValueFilter',
        				comparator:{value : filename,type:'RegexStringComparator'}
        							}
        			]
				}

			});

		var chunk;
		scanner.on('readable',function(err){
        		if (err)  callback && callback(err.null);
			else {	while(chunk=scanner.read()){
                		rows.push(chunk);
					}
				}
		});
		
		scanner.on('end',function(err){
			callback && callback(err,rows);
		});


		}
}

module.exports = hbaseHandler;
