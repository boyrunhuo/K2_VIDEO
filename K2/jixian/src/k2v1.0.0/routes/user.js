	var DB=require('../database/hbaseInterface');
	var userDB=new DB();


	var express=require('express');
	var router=express.Router();
	var path=require('path');


	var dir=path.resolve(__dirname, '..');//返回上一层目录

		


	//登录路由
	//输入参数为用户名uname和用户密码password
	//密码匹配成功返回0并设置session，密码错误返回1
	//账号不存在返回2，系统错误返回3
	router.post('/login',function(req,res,next){
		var obj={
			table:'Table_User',
			columnFamily:'BasicInformation',
			column:'BasicInformation:Userpassword',
			rowKey:req.body.uname,
		}


		userDB.queryRecord(obj,function(err,value){
			console.log(value);
			if(err)
			{
				console.log(err);
				 res.json({status:3});
			}
			else
			{

				if(value==null)
				{
					 res.json({status:2});
				}
				else{

					if(value[0].$==req.body.password)
					{
						obj.column='BasicInformation:UserState';
						console.log(obj);
						userDB.queryRecord(obj,function(err,value){
							console.log(value);
							if(err)
							{
								console.log(err);
								 res.json({status:3});
							}else{
								if(value[0].$=='0')
								{
									console.log("用户可以正常使用");
									req.session.user=req.body.uname;
									res.json({status:0});
								}else if(value[0].$=='1'){
									console.log("用户被禁用");
									res.json({status:4});
								}
							}
						});

					}
					else
					{
						res.json({status:1});
					}
				}
			}

				
			 });

	});

	//注册路由
	//输入参数为用户名uname,用户密码password
	//注册成功返回0，账号已存在返回1，系统错误返回2


	router.post('/register',function(req,res,next){
		var cell=[{column:'BasicInformation:Userpassword',
			timestamp:Date.now(),
			$:req.body.password
			},
			{column:'BasicInformation:UsedStorage',
			timestamp:Date.now(),
			$:'0'
			},
			{
			column:'BasicInformation:UserState',
			timestamp:Date.now(),
			$:'0'
			},
			{
			column:'BasicInformation:UserLevel',
			timestamp:Date.now(),
			$:'0',
			}
			];
		var obj={
		table:'Table_User',
		columnFamily:'BasicInformation',
		rowKey:req.body.uname,
		column:'BasicInformation:Userpassword',
		cells:cell
		};

		var obj2={
		table:'Table_File',
		columnFamily:'BasicInformation',
		column:'BasicInformation:File_Type',
		rowKey:req.body.uname+"-",
		columnValue:"Index"
		}

		var obj3={
		table:'Table_File',
		columnFamily:'BasicInformation',
		column:'BasicInformation:File_Type',
		rowKey:req.body.uname+".",
		columnValue:"endIndex"
		}

		var obj4={
			table:'Table_VideoInteractionLog',
			columnFamily:'LogBasicInformation',
			column:'LogBasicInformation:CatalogueVideoName',
			rowKey:req.body.uname+"-",
			columnValue:"Index",

		}

		var obj5={
			table:'Table_VideoInteractionLog',
			columnFamily:'LogBasicInformation',
			column:'LogBasicInformation:CatalogueVideoName',
			rowKey:req.body.uname+".",
			columnValue:"Index",
		}


		userDB.queryRecord(obj,function(err,value){
			if(err)
			{
				console.log(err);
				res.json({status:2});
			}
			else
			{
				if(value==null)
				{		
					userDB.insertAllRecord(obj,function(err,value){
						if(err)
						{	

							res.json({status:2});
						}
						else{

							userDB.insertRecord(obj2,function(err,value){
								if(err)
								{
									console.log(err);
								}else{
									console.log("插入用户文件列表索引成功");

									userDB.insertRecord(obj3,function(err,value){
									if(err)
									{
										console.log(err);
									}else{
										console.log("插入用户文件列表结束索引成功");
											userDB.insertRecord(obj4,function(err,value){
											if(err)
											{
												console.log(err);
											}else{
												console.log("插入日志表开始索引成功");
												userDB.insertRecord(obj5,function(err,value){
												if(err)
												{
													console.log(err);
												}else{
													console.log("插入日志表结束索引成功");
														if(status==1)
														res.json({status:0});
								
												}
												});	
											}
										});
									}
									});
								}
							});
							
							}
						});

						

						
						
						
				}
				else
				{
					res.json({status:1});
				}
			}

			});
					

	});


	//对登录页面响应Get请求
	router.get('/login',function(req,res,next){		
		res.sendFile(dir + "/views/" + "login.html");
	});

	//对注册页面响应get请求
	router.get('/register',function(req,res,next){
		res.sendFile(dir + "/views/" + "register.html");
	});

		/*router.post('/sess',function(req,res,next){
			res.json({session:req.session.loginUser});
		});*/
		
	//主页路由
	router.get('/',function(req,res,next){
		if(!req.session.user)
		{
			res.redirect('/login');
		}
		else{
			res.sendFile(dir + "/views/" + "home.html");
		}
		
	});
	//主页路由
	router.get('/home',function(req,res,next){
		
		if(!req.session.user)
		{
			res.redirect('/login');
		}
		else{
			res.sendFile(dir + "/views/" + "home.html");
		}
		
	});

	module.exports = router;