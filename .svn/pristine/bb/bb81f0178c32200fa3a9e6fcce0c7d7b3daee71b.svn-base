var express = require('express');
var router = express.Router();
var path=require('path');

var hdfsHandler = require('../hdfs/hdfs.js');
var hdfs = new hdfsHandler();

var hbaseHandler = require('../database/hbaseInterface.js');
var hbase = new hbaseHandler();

var dir=path.resolve(__dirname, '..');//返回上一层目录
/*
管理员登录
req.body:{
		adminName 管理员账号
		adminPassword管理员密码
			} 
res:{
    status:0   状态码0为成功，1为密码错误，2为账号不存在，3为系统错误
}
 */
router.post('/adminLogin',function(req,res,next){
	var name=req.body.adminName;
	var password=req.body.adminPassword;
	/*var name='admin';
	var password='admin';*/

	var obj={
			table:'Table_Manager',
			columnFamily:'BasicInformation',
			column:'BasicInformation:Managerpassword',
			rowKey:name,
	};

	hbase.queryRecord(obj,function(err,value){

		if(err){
			console.log(err);
			res.json({status:3});
		}
		else{
			if(value==null)
			{
				console.log("账号不存在");
				res.json({status:2});
			}else{
				if(value[0].$==password){
					console.log("密码正确");
					req.session.adminName=name;
					res.json({status:0});
				}else{
					console.log("密码错误");
					res.json({status:1});
				}
			}
		}
	});
});

/*管理员修改密码前进行旧密码的检查
req.body:{
		oldPassword
		} 
res:{
    status:0   状态码0为成功，1为密码错误，2为系统错误
}
*/
router.post('/adminCheckPass',function(req,res,next){
	//var name='admin';
	var name=req.session.adminName;
	var password=req.body.oldPassword;


	var obj={
			table:'Table_Manager',
			columnFamily:'BasicInformation',
			column:'BasicInformation:Managerpassword',
			rowKey:name,
	};

	hbase.queryRecord(obj,function(err,value){
		if(err){
			console.log(err);
			res.json({status:2});
		}else{
			if(value[0].$==password){
				console.log("旧密码输入正确");
				res.json({status:0});
			}else{
				console.log("旧密码输入错误");
				res.json({status:1});
			}
		}
	});

});

/*管理员修改密码
req.body:{
		newPassword
		} 
res:{
    status:0   状态码0为成功，1为系统错误
}
*/
router.post('/adminChangePass',function(req,res,next){
	var name=req.session.adminName;
	var newPassword=req.body.newPassword;
	/*var name='admin';
	var newPassword='admin';*/


	var obj={
			table:'Table_Manager',
			columnFamily:'BasicInformation',
			rowKey:name,
			column:'BasicInformation:Managerpassword',
			columnValue:newPassword
	};

	hbase.insertRecord(obj,function(err,value){
		if(err){
			console.log(err);
			res.json({status:1});
		}else{
				console.log('修改密码成功');
				res.json({status:0});
			
		}
	});
});

/*
管理员获取用户列表数组

res:{
    userList   用户列表数组
    {
		uname 	用户名
   		userLevel   用户等级
   		userStorage   用户已用空间
   		fileNum     用户上传数
   		userState	用户禁用状态，，0为未被禁用，1为禁用
    }
}
 */

router.post('/adminGetUser',function(req,res,next){

		var obj={
			table:'Table_User',
			startRow:' ',
			columnFamily:'BasicInformation',
		};
		hbase.queryRowKeyAndRecord(obj,function(err,value){
			//console.log(value);
			if(err){
				console.log(err);
			}else{
				var userList=new Array();
				for(var i=1;i<value.length;i++){
					var eachName=value[i].key;
					var eachUser={
						'uname':value[i].key,
						'userStorage':value[i].$,
						'userLevel':value[++i].$,
						'userState':value[++i].$,
						'fileNum':0
					}
					i++;
					userList.push(eachUser);			

				}

				var m=0;
				for(var i=0;i<userList.length;i++){
					var name=userList[i].uname;
					var obj2={
						table:'Table_File',
						column:'BasicInformation:File_Type',
						startRow:name+'-',
						endRow:name+'.',
					};

					hbase.queryRowKeyAndRecord(obj2,function(err,value){
						if(err)
							console.log(err);
						else{
							//console.log(value);
							//判断返回的文件数据属于哪个用户
							for(var n=0;n<userList.length;n++){
								var getName=userList[n].uname+'-';
								if(getName==value[0].key){
									userList[n].fileNum=value.length-1;//有一个是索引
									break;
								}
							}

							//当获取到一个数据m增加，直到所有用户的文件数量都获取到
							m++;
							if(m==userList.length){
								console.log("查询成功");

								res.json({userList:userList});
							}

						}
					});
				}
				//console.log(value);
			}
		});
});

/*管理员修改用户等级
req.body:{
		userName 用户名
		level   需要设置的等级
		} 
res:{
    status:0   状态码0为成功，1为系统错误
}
*/
router.post('/adminLevel',function(req,res,next){
	
	var userName=req.body.userName;
	var level=req.body.level;
		//console.log(userName);



		var obj={
		table:'Table_User',
		columnFamily:'BasicInformation',
		rowKey:userName,
		column:'BasicInformation:UserLevel',
		columnValue:level
	};

		hbase.insertRecord(obj,function(err,value){
			if(err)
			{
				console.log(err);
				res.json({status:1})
			}else{
				console.log("修改用户等级成功");

				res.json({status:0});

				
			}
		});

	
	

});

/*管理员禁用用户
req.body:{
		userName 用户名
		} 
res:{
    status:0   状态码0为成功，1为系统错误
}
*/
router.post('/adminForbidden',function(req,res,next){

	var userName=req.body.userName;
	
	var obj={
		table:'Table_User',
		columnFamily:'BasicInformation',
		rowKey:userName,
		column:'BasicInformation:UserState',
		columnValue:'1'  //0为未被禁用，1为禁用
	};

	hbase.insertRecord(obj,function(err,value){
		if(err){
			console.log(err);
			res.json({status:1});
		}else{
			console.log("用户禁用成功");
			res.json({status:0});
		}
	});

});

/*管理员取消禁用用户
req.body:{
		userName 用户名
		} 
res:{
    status:0   状态码0为成功，1为系统错误
}
*/
router.post('/adminCancelForbidden',function(req,res,next){

	var userName=req.body.userName;
	
	var obj={
		table:'Table_User',
		columnFamily:'BasicInformation',
		rowKey:userName,
		column:'BasicInformation:UserState',
		columnValue:'0'  //0为未被禁用，1为禁用
	};

	hbase.insertRecord(obj,function(err,value){
		if(err){
			console.log(err);
			res.json({status:1});
		}else{
			console.log("用户禁用成功");
			res.json({status:0});
		}
	});

});
/*管理员删除用户
req.body:{
		userName 用户名
		} 
res:{
    status:0   状态码0为成功，1为系统错误
}
*/
router.post('/adminDelete',function(req,res,next){


	var userName=req.body.userName;
	
		var obj={
		table:'Table_User',
		rowKey:userName,
		};

		hbase.deleteRecord(obj,function(err,value){
			if(err){
				console.log(err);
				res.json({status:1});
			}else{
				console.log('删除用户成功');
				res.json({status:0});
			}
		});

});

/*管理员获得所有的视频列表
res:{
	videoList视频列表
	{
		uname 用户名
		folder 用户文件路径
		videoName 视频名
		videoMD5 视频的MD5
		videoState  视频是否共享。0为未共享，1为已共享
		videoResolution 视频分辨率
		videoSize 视频大小
		videoTimeLength 视频长度
		videoType 视频类型
	}
}
*/
/*
router.post('/adminGetVideo',function(req,res,next){
		var obj={
			table:'Table_VideoIndex',
			startRow:' ',//从数据库第一条数据开始查询
			columnFamily:'IndexInformation',
		};

		hbase.queryRowKeyAndRecord(obj,function(err,value){
			
			if(err){
				console.log(err);
			}else{
				//console.log(value);
				var videoList=new Array;
				for(var i=1;i<value.length;i++){
					var firstBar=value[i].key.indexOf('-');
					var lastBar=value[i].key.indexOf('-',value[i].key.indexOf('-')+1);

					var userName=value[i].key.substring(0,firstBar);
					var folder=value[i].key.substring(firstBar+1,lastBar);
					var videoName=value[i].key.substring(lastBar+1);
					i++;
					var videoLabel=value[i++].$;
					var videoMD5=value[i++].$;
					var videoState=value[i].$;
					var eachVideo={
						uname:userName,
						videoLabel:videoLabel,
						folder:folder,
						videoName:videoName,
						videoMD5:videoMD5,
						videoState:videoState
					}
					videoList.push(eachVideo);
					
				}

			
				var obj2={
			    	table:'Table_Video',
			        columnFamily:'MetaInformation',
			        startRow:" "
			    }

			    hbase.queryRowKeyAndRecord(obj2,function(err,value){
			    	if(err){
			    		console.log(err);
			    	}else{
			    		//console.log(value);
			    		var videoInfList=new Array;
			    		for(var j=1;j<value.length;j++){
			    			var eachVideoInf={
			    				videoMD5:value[++j].key,
								videoResolution:value[++j].$,
								videoSize:value[++j].$,
								videoTimeLength:value[++j].$,
								videoType:value[++j].$,
							}

						videoInfList.push(eachVideoInf);
			    		}
			    		console.log(videoInfList);

			    		for(var m=0;m<videoList.length;m++){

			    			for(var n=0;n<videoInfList.length;n++){
			    				if(videoList[m].videoMD5==videoInfList[n].videoMD5){
			    					videoList[m].videoResolution=videoInfList[n].videoResolution;
			    					videoList[m].videoSize=videoInfList[n].videoSize;
			    					videoList[m].videoTimeLength=videoInfList[n].videoTimeLength;
			    					videoList[m].videoType=videoInfList[n].videoType;
			    					break;
			    				}

			    				if(n==videoInfList.length-1&&videoList[m].videoMD5!=videoInfList[n].videoMD5){
			    					videoList[m].videoResolution="暂无数据";
			    					videoList[m].videoSize="暂无数据";
			    					videoList[m].videoTimeLength="暂无数据";
			    					videoList[m].videoType="暂无数据";
			    					
			    				}
			    			}
			    		}

			    		res.json({videoList:videoList});
			    	}
			    });
				


			//	res.json({videoList:videoList});
			}
		});
});
*/

/*管理员获取文件列表
res:{
	videoList 文件数组
	{
	videoMD5  视频MD5码
	videoResolution 视频分辨率
	videoSize 视频大小
	videoTimeLength 视频时间长度
	videoType 视频类型
	}
}

 */
router.post('/adminGetVideo',function(req,res,next){

		var obj={
			    	table:'Table_Video',
			        columnFamily:'MetaInformation',
			        startRow:" "
			    }

			    hbase.queryRowKeyAndRecord(obj,function(err,value){
			    	if(err){
			    		console.log(err);
			    	}else{
			    	//	console.log(value);
			    		var videoList=new Array;
			    		for(var j=1;j<value.length;j++){
			    			var eachVideoInf={
			    				videoMD5:value[++j].key,
								videoResolution:value[++j].$,
								videoSize:value[++j].$,
								videoTimeLength:value[++j].$,
								videoType:value[++j].$,
							}

						videoList.push(eachVideoInf);
			    		}

			    		res.json({videoList:videoList});
			   		 }
				});
});

/*
	管理员通过文件列表查看该文件所对应拥有的用户以及视频名
	req.body:{
	videoMD5  视频MD5码
	}

	res:{
		FileInf 文件信息数组
		{
			userName 用户名
			videoName 视频名
			videoState 用户共享状态 0为没有共享，1为共享
		}
	}
 */
router.post('/adminGetFileInf',function(req,res,next){
		var videoMD5=req.body.videoMD5;
		hbase.queryRowKeyByMD5(videoMD5,function(err,value){
			if(err)
				console.log(err);
			else{
				var FileInf=new Array;
				//console.log(value.length);
				if(value.length==0){
					res.json({
						FileInf:FileInf
					});
				}else{
					
					var m=0;
					var dataLength=value.length;
					for(var i=0;i<value.length;i++){
						var eachFile=new Array;
						var firstBar=value[i].key.indexOf('-');
						var lastBar=value[i].key.indexOf('-',value[i].key.indexOf('-')+1);

						var userName=value[i].key.substring(0,firstBar);
						var videoName=value[i].key.substring(lastBar+1);
						eachFile={
							userName:userName,
							videoName:videoName,
							key:value[i].key
						}
						FileInf.push(eachFile);

						var obj={
					        table:'Table_VideoIndex',
					        columnFamily:'IndexInformation',
					        column:'IndexInformation:VideoState',
					        rowKey:value[i].key,
				   		};

				   		hbase.queryRecord(obj,function(err,value){
				   			if(err)
				   				console.log(err);
				   			else{

				   				for(var j=0;j<dataLength;j++){
				   					if(value[0].key==FileInf[j].key){
				   						FileInf[j].videoState=value[0].$;
				   						break;
				   					}
				   				}

				   				m++;
				   				if(m==dataLength){

				   					res.json({
										FileInf:FileInf
									});
				   				}

				   			}
				   		});
					}

				}


			}
		});
});


/*管理员查看标签
req.body:{
	videoMD5  视频的md5码
}
res:{
	labelListUnique   标签数组
}
 */

router.post('/adminFileInf',function(req,res,next){
	var videoMD5=req.body.videoMD5;
	//var videoMD5='a440bb63830c6ecb40ad9f61db53ace2';

	var labelList=new Array;
    var labelListUnique=new Array;
    hbase.queryRowKeyByMD5(videoMD5,function(err,value){
    	if(err){
    		console.log(err);
    	}else{
    		if(value.length==0)
    		{
    			res.json({
    				labelListUnique:labelListUnique
    			});
    		}else{
		    		var m=0;

		    		var listLength=value.length;
		    		for(var i=0;i<listLength;i++){
		    			
		    			var obj={
					        table:'Table_VideoIndex',
					        columnFamily:'IndexInformation',
					        column:'IndexInformation:VideoLabel',
					        rowKey:value[i].key,
					    };
		    			
		    			hbase.queryRecord(obj,function(err,value){
		    				if(err){
		    					console.log(err);
		    				}else{
		    					//console.log(value);
		    					var label=value[0].$.split(",");
		    					for(var j=0;j<label.length;j++){
		    						if(label[j]!=""&&label[j]!=" "){
		    							labelList.push(label[j]);
		    						}
		    						
		    					}
		    					m++;
		    					if(m==listLength){
		    						
		    						//去重
		    						for(var x=0;x<labelList.length;x++){
		    							if(labelListUnique.indexOf(labelList[x])==-1){
		    								labelListUnique.push(labelList[x]);
		    							}else{
		    								continue;
		    							}
		    						}
		    						console.log(labelListUnique);
		    						res.json({labelListUnique:labelListUnique});
		    					}
		    				}
		    			})
		    		}

    		}
    		
    	}
    });
});

router.post('/adminStatistics',function(req,res,next){
	var totalMeomory='6750000000000000';
		var obj={
			table:'Table_Video',
			startRow:' ',//从数据库第一条数据开始查询
			columnFamily:'MetaInformation',
			column:'MetaInformation:VideoSize'
		};

		hbase.queryRowKeyAndRecord(obj,function(err,value){
			if(err){
				console.log(err);
			}else{
				console.log(value);
				var fileUseMemory=0;
				var fileCount=value.length-1;
				var fileTotalMemory=totalMeomory;
				for(var i=0;i<value.length;i++){
					fileUseMemory+=parseInt(value[i].$);
				}
				res.json({
					fileUseMemory:fileUseMemory,
					fileCount:fileCount,
					fileTotalMemory:fileTotalMemory
				});

			}
		});

});


/*管理员获取日志列表
res:{
	videoList视频列表
	{
	uname  用户名
	videoName 文件名
	status 状态码,0代表下载,1代表上传
	time 时间
	}
}
*/
router.post('/adminLog',function(req,res,next){
		var obj={
			table:'Table_VideoInteractionLog',
			startRow:' ',//从数据库第一条数据开始查询
			columnFamily:'LogBasicInformation',
		};

		hbase.queryRowKeyAndRecord(obj,function(err,value){
			if(err){
				console.log(err);
			}else{
				//console.log(value);
				var videoList=new Array;
				for(var i=0;i<value.length;i++){
					var key=value[i].key.substr(value[i].key.length-1,1);
					if(key=='-'||key=='.'){
						continue;
					}else{
						var uname=value[i].key.substring(0,value[i].key.indexOf('-'));
						var time=value[i].key.substring(value[i].key.indexOf('-')+1);
						var videoName=value[i++].$;
						var status=value[i].$;

						var eachVideo={
							uname:uname,
							videoName:videoName,
							status:status,
							time:time
						};
						videoList.push(eachVideo);
					}


				}

				res.json({
					videoList:videoList
				});
			}
		});
});


/*
管理员对日志进行模糊搜索，不可输入"+"和"."
 */
router.post('/adminSearch',function(req,res,next){
		
		var video=req.body.video;
		hbase.fuzzquery(video,function(err,value){
			if(err){
				console.log(err);
			}else{
				console.log(value);
				if(value.length==0){
					res.json({
						status:1
					})
				}
				var m=0;
				var searchList=new Array;
				for(var i=0;i<value.length;i++){


				    var uname=value[i].key.substring(0,value[i].key.indexOf('-'));
					var time=value[i].key.substring(value[i].key.indexOf('-')+1);
					var videoName=value[i].$;

				    var each={
					    uname:uname,
						videoName:videoName,
						time:time
				    }

				    searchList.push(each);

					var obj={
				        table:'Table_VideoInteractionLog',
				        columnFamily:'LogBasicInformation',
				        rowKey:value[i].key,
				    };

				    hbase.queryAllRecord(obj,function(err,value){
				    	if(err){
				    		console.log(err);
				    	}else{
				    		console.log(value);

							var status=value[1].$;

				    		searchList[m++].status=status;
				    		if(m==searchList.length){
				    			res.json({
				    				status:0,
				    				searchList:searchList
				    			});
				    		}
				    	}
				    });
				}
			}
		})
});

/*管理员查看目前等级所对应内存空间大小
res:{levelList  等级-空间数组
	{
		level:等级
		storage：空间
	}

 */

router.post('/adminGetLevel',function(req,res,next){
		var obj={
			table:'Table_UserLevel',
			columnFamily:'BasicInformation',
		};
		hbase.queryRowKeyAndRecord(obj,function(err,value){
			if(err){
				console.log(err);
			}else{
				var levelList=new Array;
				for(var i=0;i<value.length;i++){
					var eachLevel=new Array;
					eachLevel={
						level:value[i].key,
						storage:value[i].$
					}
					levelList.push(eachLevel);
				}
				res.json({levelList:levelList});
			}
		});
});

/*
	管理员设置某个等级的存储空间
	req.body:{
		level 等级
		storage 空间
	}
	res:{
		status 状态码 0为成功，1为失败
	}
 */
router.post('/adminSetLevel',function(req,res,next){
	var level=req.body.level;
	var storage=req.body.storage;

	/*var level='2';
	var storage='300000000';*/

	var obj={
		table:'Table_UserLevel',
		columnFamily:'BasicInformation',
		rowKey:level,
		column:'BasicInformation:LevelStorage',
		columnValue:storage
	};

	hbase.insertRecord(obj,function(err,value){
		if(err){
			console.log(err);
			res.json({status:1});
		}else{
				console.log('修改等级所对应的内存大小成功');
				res.json({status:0});
			
		}
	});

});

/*
用户获取当前所拥有的存储空间
req.body:{
	user(session)
	}
res:{
	storage 用户存储空间
}
 */

router.post('/userGetStorage',function(req,res,next){
	 var userName=req.session.user;
	
		var obj={
			table:'Table_User',
			columnFamily:'BasicInformation',
			column:'BasicInformation:UserLevel',
			rowKey:userName,
		}

		hbase.queryRecord(obj,function(err,value){
			if(err){
				console.log(err)
			}else{
			//	console.log(value);
				var userLevel=value[0].$
				var obj2={
					table:'Table_UserLevel',
					columnFamily:'BasicInformation',
					column:'BasicInformation:LevelStorage',
					rowKey:userLevel,
				}

				hbase.queryRecord(obj2,function(err,value){
					if(err){
						console.log(err);
					}else{

						res.json({
							storage:value[0].$
						})
					}
				});
			}
		});
});

	//登录路由
	router.get('/adminLogin',function(req,res,next){		
		res.sendFile(dir + "/views/" + "adminLogin.html");
	});


	//修改密码路由
	router.get('/adminChangePW',function(req,res,next){
		
		if(!req.session.adminName)
		{
			res.redirect('/adminLogin');
		}
		else{
			res.sendFile(dir + "/views/" + "adminChangePW.html");
		}
		
	});


	//管理员主页路由
	router.get('/admin',function(req,res,next){
		
		if(!req.session.adminName)
		{
			res.redirect('/adminLogin');
		}
		else{
			res.sendFile(dir + "/views/" + "admin.html");
		}
		
	});



module.exports = router;
