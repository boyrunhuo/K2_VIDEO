var express = require('express');
var router = express.Router();
var path = require('path');

var DB = require('../database/hbaseInterface');
var userDB = new DB();

// 邮件模块初始化
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: '163',
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
        user: 'orz_register@163.com',
        // smtp密码
        pass: 'register123'
    }
});

var dir = path.resolve(__dirname, '..');//返回上一层目录


//登录路由
//输入参数为用户名uname和用户密码password
//密码匹配成功返回0并设置session，密码错误返回1
//账号不存在返回2，系统错误返回3
router.post('/login', function (req, res, next) {
    console.log('................./login post start.');

    var obj = {
        table: 'Table_User',
        columnFamily: 'BasicInformation',
        column: 'BasicInformation:Userpassword',
        rowKey: req.body.uname
    };


    userDB.queryRecord(obj, function (err, value) {
        console.log(value);
        if (err) {
            console.log(err);
            res.json({status: 3});
        }
        else {

            if (value == null) {
                res.json({status: 2});
            }
            else {

                if (value[0].$ == req.body.password) {
                    obj.column = 'BasicInformation:UserState';
                    console.log(obj);
                    userDB.queryRecord(obj, function (err, value) {
                        console.log(value);
                        if (err) {
                            console.log(err);
                            res.json({status: 3});
                        } else {
                            if (value[0].$ == '0') {
                                console.log("用户可以正常使用");
                                req.session.user = req.body.uname;
                                res.json({status: 0});
                            } else if (value[0].$ == '1') {
                                console.log("用户被禁用");
                                res.json({status: 4});
                            }
                        }
                    });

                }
                else {
                    res.json({status: 1});
                }
            }
        }


    });

});

//注册路由
//输入参数为用户名uname,用户密码password
//注册成功返回0，账号已存在返回1，系统错误返回2
router.route('/register').post(function(req, res) {
    // 查询用户表，检查用户名是否存在
    // 若用户名存在，返回状态码1，用户名已存在
    // 若用户名不存在，返回状态码0，提醒邮箱激活
    userDB.queryRecord({
        table: 'Table_User',
        columnFamily: 'BasicInformation',
        rowKey: req.body.uname,
        column: 'BasicInformation:Userpassword'
    }, function(err, value) {
        if(err) {
            console.log(err);
            res.json({
                status: 2
            });
        } else {
            if(value == null) {
                // 生成验证token
                var token = req.body.uname + Math.floor(Math.random()*10);
                // session保存注册激活需要信息
                req.session.register = req.body.uname;
                req.session.password = req.body.password;
                req.session.token = token;
                req.session.tokenTime = Date.now();
                req.session.flag = 0;

                console.dir(req.session);

                // 激活链接和邮件内容
                var jihuoLink = 'http://116.56.129.93:3002/validation?token=' + token;
                var mailMsg = '<p>' + req.body.uname + ',</p>' + '<p style="text-indent: 2em">欢迎注册K2视频管理系统，请点击链接激活账号' +
                    '<a style="font-size: 22px" href= " '+jihuoLink+'">' + jihuoLink + '</a></p>';

                // 设置邮件选项
                var mailOptions = {
                    from: 'orz_register@163.com',   // 发件地址
                    to: req.body.uname,             // 收件列表
                    subject: 'K2账户激活',          // 标题
                    html: mailMsg                   // html 内容
                };

                // 发送邮件
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);

                        res.json({
                            status: 2
                        });
                    } else {
                        console.log('Message sent: ' + info.response);

                        res.json({
                            status: 0
                        });
                    }
                });
            } else {
                res.json({
                    status: 1
                });
            }
        }
    });
});
/*router.post('/register', function (req, res, next) {
    var cell = [{
        column: 'BasicInformation:Userpassword',
        timestamp: Date.now(),
        $: req.body.password
    },
        {
            column: 'BasicInformation:UsedStorage',
            timestamp: Date.now(),
            $: '0'
        },
        {
            column: 'BasicInformation:UserState',
            timestamp: Date.now(),
            $: '0'
        },
        {
            column: 'BasicInformation:UserLevel',
            timestamp: Date.now(),
            $: '0'
        }
    ];
    var obj = {
        table: 'Table_User',
        columnFamily: 'BasicInformation',
        rowKey: req.body.uname,
        column: 'BasicInformation:Userpassword',
        cells: cell
    };

    var obj2 = {
        table: 'Table_File',
        columnFamily: 'BasicInformation',
        column: 'BasicInformation:File_Type',
        rowKey: req.body.uname + "-",
        columnValue: "Index"
    };

    var obj3 = {
        table: 'Table_File',
        columnFamily: 'BasicInformation',
        column: 'BasicInformation:File_Type',
        rowKey: req.body.uname + ".",
        columnValue: "endIndex"
    };

    var obj4 = {
        table: 'Table_VideoInteractionLog',
        columnFamily: 'LogBasicInformation',
        column: 'LogBasicInformation:CatalogueVideoName',
        rowKey: req.body.uname + "-",
        columnValue: "Index"
    };

    var obj5 = {
        table: 'Table_VideoInteractionLog',
        columnFamily: 'LogBasicInformation',
        column: 'LogBasicInformation:CatalogueVideoName',
        rowKey: req.body.uname + ".",
        columnValue: "Index"
    };


    userDB.queryRecord(obj, function (err, value) {
        if (err) {
            console.log(err);
            res.json({status: 2});
        }
        else {
            if (value == null) {
                userDB.insertAllRecord(obj, function (err, value) {
                    if (err) {

                        res.json({status: 2});
                    }
                    else {
                        userDB.insertRecord(obj2, function (err, value) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("插入用户文件列表索引成功");

                                userDB.insertRecord(obj3, function (err, value) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("插入用户文件列表结束索引成功");
                                        userDB.insertRecord(obj4, function (err, value) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("插入日志表开始索引成功");
                                                userDB.insertRecord(obj5, function (err, value) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log("插入日志表结束索引成功");
                                                        if (status == 1)
                                                            res.json({status: 0});
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
            else {
                res.json({status: 1});
            }
        }
    });
});*/

// 注册邮箱验证
router.route('/validation').get(function(req, res) {
    // 返回信息及激活有效时间
    var msg = 'error';
    var validTime = 300 * 1000;

    console.dir(req.session);

    if(req.query.token == null || req.session.token == null || req.session.tokenTime == null ||
        req.session.flag == null || req.session.register == null || req.session.password == null) {
        msg = '链接已失效，请重新注册';

        res.render('validation', {
            username: '用户',
            message: msg
        });
    } else {
        if(req.session.flag == 1) {
            msg = '账号已激活';

            res.render('validation', {
                username: req.session.register,
                message: msg
            });
        } else {
            if(Date.now()-req.session.tokenTime > validTime) {
                msg = '链接已失效,请重新注册';

                res.render('validation', {
                    username: req.session.register,
                    message: msg
                });
            } else {
                if(req.session.token == req.query.token) {
                    var cell = [
                        {
                            column: 'BasicInformation:Userpassword',
                            timestamp: Date.now(),
                            $: req.session.password
                        },
                        {
                            column: 'BasicInformation:UsedStorage',
                            timestamp: Date.now(),
                            $: '0'
                        },
                        {
                            column: 'BasicInformation:UserState',
                            timestamp: Date.now(),
                            $: '0'
                        },
                        {
                            column: 'BasicInformation:UserLevel',
                            timestamp: Date.now(),
                            $: '0'
                        }
                    ];

                    var obj = {
                        table: 'Table_User',
                        columnFamily: 'BasicInformation',
                        rowKey: req.session.register,
                        column: 'BasicInformation:Userpassword',
                        cells: cell
                    };

                    var obj2 = {
                        table: 'Table_File',
                        columnFamily: 'BasicInformation',
                        column: 'BasicInformation:File_Type',
                        rowKey: req.session.register + "-",
                        columnValue: "Index"
                    };

                    var obj3 = {
                        table: 'Table_File',
                        columnFamily: 'BasicInformation',
                        column: 'BasicInformation:File_Type',
                        rowKey: req.session.register + ".",
                        columnValue: "endIndex"
                    };

                    var obj4 = {
                        table: 'Table_VideoInteractionLog',
                        columnFamily: 'LogBasicInformation',
                        column: 'LogBasicInformation:CatalogueVideoName',
                        rowKey: req.session.register + "-",
                        columnValue: "Index"
                    };

                    var obj5 = {
                        table: 'Table_VideoInteractionLog',
                        columnFamily: 'LogBasicInformation',
                        column: 'LogBasicInformation:CatalogueVideoName',
                        rowKey: req.session.register + ".",
                        columnValue: "Index"
                    };

                    userDB.insertAllRecord(obj, function (err, value) {
                        if (err) {
                            msg = '服务器错误，激活失败，请重新激活';

                            res.render('validation', {
                                username: req.session.register,
                                message: msg
                            });
                        }
                        else {
                            userDB.insertRecord(obj2, function (err, value) {
                                if (err) {
                                    msg = '服务器错误，激活失败，请重新激活';

                                    res.render('validation', {
                                        username: req.session.register,
                                        message: msg
                                    });
                                } else {
                                    console.log("插入用户文件列表索引成功");

                                    userDB.insertRecord(obj3, function (err, value) {
                                        if (err) {
                                            msg = '服务器错误，激活失败，请重新激活';

                                            res.render('validation', {
                                                username: req.session.register,
                                                message: msg
                                            });
                                        } else {
                                            console.log("插入用户文件列表结束索引成功");

                                            userDB.insertRecord(obj4, function (err, value) {
                                                if (err) {
                                                    msg = '服务器错误，激活失败，请重新激活';

                                                    res.render('validation', {
                                                        username: req.session.register,
                                                        message: msg
                                                    });
                                                } else {
                                                    console.log("插入日志表开始索引成功");

                                                    userDB.insertRecord(obj5, function (err, status) {
                                                        if (err) {
                                                            msg = '服务器错误，激活失败，请重新激活';

                                                            res.render('validation', {
                                                                username: req.session.register,
                                                                message: msg
                                                            });
                                                        } else {
                                                            console.log("插入日志表结束索引成功");

                                                            req.session.flag = 1;
                                                            msg = '激活成功';

                                                            res.render('validation', {
                                                                username: req.session.register,
                                                                message: msg
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
                    });
                } else {
                    msg = '验证错误,激活失败，请重新注册';

                    res.render('validation', {
                        username: req.session.register,
                        message: msg
                    });
                }
            }
        }
    }
    
    
});

//对登录页面响应Get请求
router.get('/login', function (req, res, next) {
    res.sendFile(dir + "/views/" + "login.html");
});

//对注册页面响应get请求
router.get('/register', function (req, res, next) {
    res.sendFile(dir + "/views/" + "register.html");
});

/*router.post('/sess',function(req,res,next){
 res.json({session:req.session.loginUser});
 });*/

//主页路由
router.get('/', function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    }
    else {
        res.redirect('/home');
    }
});
//主页路由
router.get('/home', function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    }
    else {
        res.render('home', {
            'username': req.session.user
        });
    }
});

module.exports = router;