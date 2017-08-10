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
	var name=req.session.adminName;
	var password=req.body.oldPassword;
	//var password='admin';

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
			startRow:'1',
			columnFamily:'BasicInformation',
		};
		hbase.queryRowKeyAndRecord(obj,function(err,value){
			if(err){
				console.log(err);
			}else{
				var userList=new Array();
				for(var i=4;i<value.length;i++){
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

							//判断返回的文件数据属于哪个用户
							for(var n=0;n<userList.length;n++){
								var getName=userList[n].uname+'-';
								if(getName==value[0].key){
									userList[n].fileNum=value.length-1;
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
				console.log(value);
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
	}
}
*/
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
				var videoList=new Array;
				for(var i=1;i<value.length;i++){
					var firstBar=value[i].key.indexOf('-');
					var lastBar=value[i].key.lastIndexOf('-');

					var userName=value[i].key.substring(0,firstBar);
					var folder=value[i].key.substring(firstBar+1,lastBar);
					var videoName=value[i].key.substring(lastBar+1);

					var eachVideo={
						uname:userName,
						folder:folder,
						videoName:videoName
					}
					videoList.push(eachVideo);
				
				}

				res.json({videoList:videoList});
			}
		});
});

/*尚未测试完毕*/
/*管理员获取视频元信息
  req.body:{
  		videoName 用户名+视频路径+名字
  }
  res:{
	videoResolution 分辨率
	videoSize 大小
	videoLength 时长
	videoType 格式

  }
 */
router.get('/adminVideoInf',function(req,res,next){
	var videoName='aaaaab-/root-第06话+最后的授课…!!.webm';

	var obj={
        table:'Table_VideoIndex',
        columnFamily:'IndexInformation',
        column:'IndexInformation:VideoMD5',
        rowKey:videoName,
    };

    //查询该视频的md5码
    hbase.queryRecord(obj,function(err,value){
    	if(err){
    		console.log(err);
    	}else{
    		console.log("查询该视频的md5码成功");
    		videoMD5=value[0].$;

    		var obj2={
    		    table:'Table_Video',
                columnFamily:'MetaInformation',
                rowKey:videoMD5,
    		}

    		hbase.queryAllRecord(obj2,function(err,value){
    			if(err){
    				console.log(err);
    			}else{
    				console.log(value);
    			}
    		});
    	}
    });

});


router.get('/adminFileInf',function(req,res,next){
	//var videoName=req.body.videoName;
	var videoName='aaaaab-/root-第06话+最后的授课…!!.webm';

	var obj={
        table:'Table_VideoIndex',
        columnFamily:'IndexInformation',
        rowKey:videoName,
    };
    hbase.queryAllRecord(obj,function(err,value){
    	if(err){
    		console.log(err);
    	}else{
    		console.log(value);

    	}
    });
});

router.get('/adminStatistics',function(req,res,next){
	var totalMeomory='6750000000000000';
		var obj={
			table:'Table_Video',
			startRow:' ',//从数据库第一条数据开始查询
			columnFamily:'MetaInformation',
			column:'VideoSize'
		};

		hbase.queryRowKeyAndRecord(obj,function(err,value){
			if(err){
				console.log(err);
			}else{
				console.log(value);
			}
		});

});


/*管理员获取日志列表
res:{
	videoList视频列表
	{
	videoName 文件名
	status 状态码,0代表上传,1代表下载
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
				console.log(value);
				var videoList=new Array;
				for(var i=1;i<value.length;i++){
					var time=value[i].key.substring(value[i].key.indexOf('-')+1);
					var videoName=value[i++].$;
					var status=value[i].$;

					var eachVideo={
						videoName:videoName,
						status:status,
						time:time
					};
					videoList.push(eachVideo);

				}

				res.json({
					videoList:videoList
				});
			}
		});
});


module.exports = router;
