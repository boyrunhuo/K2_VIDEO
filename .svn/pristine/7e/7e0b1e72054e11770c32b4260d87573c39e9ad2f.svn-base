var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var http = require('http');
var path=require('path');
var ffmpeg = require('fluent-ffmpeg');
var command = ffmpeg();

var hdfsHandler = require('../hdfs/hdfs.js');
var hdfs = new hdfsHandler();

var hbaseHandler = require('../database/hbaseInterface.js');
var hbase = new hbaseHandler();


var dir=path.resolve(__dirname, '..');//返回上一层目录

/*跳转到播放视频页面,req.session.video保存需要播放的视频的信息
 req.body：null,
 res: userPlayVideo.html*/
router.route('/userPlayVideo').get(function (req, res) {
    if(!req.session.video) {
        res.redirect('/home');
    } else {
        console.log('.................../userPlayVideo  req.session.video: ' + req.session.video);
        // 返回视频播放页面

        var video = req.session.video;
        var index1 = video.indexOf('-');
        var index2 = video.indexOf('-', index1+1);
        var filename = req.session.video.substring(index1+1, index2) + '/'+req.session.video.substring(index2+1);

        res.render('userPlayVideo', {
            'filename': filename,
            'username': req.session.user
        });
    }
    //res.render('userPlayVideo');
});

/* 获取用户信息页面
 * req.param: null
 * res: userViewInformation.html
 */
router.route('/userViewInformation').get(function(req, res){
    if(!req.session.user)
        res.redirect('/login');
    else
        res.render('userViewInformation', {
            username: req.session.user
        });
});

/* 共享空间页面
 * req.body: null
 * res: userShareRoom.html
 */
router.route('/userShareRoom').get(function(req, res) {
    if(!req.session.user)
        res.redirect('/login');
    else
        res.render('userShareRoom', {
            'username': req.session.user
        });
});

/*返回用户视频表 
 req.body：null
 res: {
    status: 0,      // 0代表失败，1代表成功
    err：'',        // 错误信息，当失败时返回错误信息
    data: videoList // 返回Array对象，存放文件名的数组
 }*/
router.route('/getVideoList').get(function(req, res) {
    // 通过用户名在文件表查询用户的所有文件并解析传给前端
    var row = req.session.user + '-';
    var endRow=req.session.user+'.';
    hbase.queryRowKeyAndRecord({
        table: 'Table_File',
        startRow: row,
        endRow:endRow,
        column:'BasicInformation:File_Type'
    }, function(err,rows) {
        if(err) {
            res.json({
                status: 0,
                err: err,
                data: null
            });
        } else {
            console.log('.........................../getVideoList rows:' +JSON.stringify(rows));
            // 提取行健的文件名
            var videoList = new Array();

            for(var i = 1; i < rows.length; i++) {
                videoList.push(rows[i].key.substring(rows[i].key.indexOf('-', rows[i].key.indexOf('-')+1)+1));
            }

            res.json({
                status: 1,
                err: null,
                data: videoList
            });
        }
    });
});


/*在线播放,req.session.video保存需要播放的视频的信息
 req.body：{
    catalogue: '/root',
    filename: 'a.mp4'
 }
 res: null*/
router.route('/onlineVideo').post(function (req, res) {
    console.log('.........................../onlineVideo  req.body:  ' + JSON.stringify(req.body));
    // 保存需要播放视频的信息
    req.session.video = req.session.user + '-' + req.body.catalogue + '-' + req.body.filename;
    console.log('.........................../onlineVideo  req.session.video: ' + req.session.video);

    res.json({
        status: 1
    });
    // 返回视频播放页面
    //res.redirect('/userPlayVideo');
});



router.route('/playTest').get(function(req, res){
    var fread = fs.createReadStream('/home/b8311/orz/k2v1.0.0/public/videos/2bd70568451f7d24b03458bbf5d77cf0.webm');

    res.set({
        'Content-type': 'application/octet-stream',
		'Content-length':56479615
        //"Content-Disposition": "attachment;filename=" + encodeURI('2.jpg')
    });

    fread.on('data', function(chunk){
        res.write(chunk)
    });
    fread.on('end', function() {
        res.end();
    });
});

/*通过req.session.video的信息获取视频源，返回视频的数据流
 req.body: null
 res: data*/
router.route('/playVideo').get(function (req, res) {console.log('......................./playVideo  start');
    if (!req.session.video) {
        // req.session.video不存在,重定向到首页
        res.redirect('/');
    } else {
        // 通过用户视频信息查询得到视频的md5码
        var md5 = null;
        var video = req.session.video;
        console.log('...................../playVideo req.session.video: ' + video);
        hbase.queryRecord({
            table: 'Table_VideoIndex',
            rowKey: video,
            columnFamily: 'IndexInformation',
            column: 'IndexInformation:VideoMD5'
        }, function (err, value) {
            if (err) {
                console.log(err);
            } else {
                md5 = value[0].$;   console.log('........................../playVideo queryRecord  md5: ' + md5);

                // 通过视频的md5得到视频文件的数据
                var fileUrl = null;

                hbase.queryRecord({
                    table: 'Table_Video',
                    rowKey: md5,
                    columnFamily: 'MetaIndentification',
                    column: 'MetaIndentification:VideoUrl'
                }, function (err, value) {
                    if (err) {
                        console.log(err);
                    } else {
                        fileUrl = value[0].$;   console.log('....................../playVideo queryRecord fileUrl: ' + fileUrl);
							
							res.set({
                                'Content-type': 'application/octet-stream'
                            });
                        // 访问hdfs的视频文件,得到视频流
                        hdfs.play(fileUrl, function (stream) {
                            // 给客户端发送数据流
                            /*stream.on('data',function(chunk){
								res.write(chunk);
							});

							stream.on('end',function(){
								res.end();
							});*/
							stream.pipe(res);
                        });
                        //res.end();
                    }
                });
            }
        });
    }
});

/*router.route('/playVideo').get(function(req,res){
	
	var fread = fs.createReadStream('./public/videos/11.mp4');

	fread.on('data',function(chunk){
		res.write(chunk);
	});

	fread.on('end',function(){
		res.end();
	});

});*/

/*获取用户已用空间
 req.body: null
 res: {
    status: 0,
    err; '',
    usedStorage: 2323
 }*/
router.route('/getUsedStorage').get(function (req, res) {
    hbase.queryRecord({
        table: 'Table_User',
        rowKey: req.session.user,
        columnFamily: 'BasicInformation',
        column: 'BasicInformation:UsedStorage'
    }, function (err, value) {
        if (err) {
            console.log(err);
        } else { console.log('..................../getUsedStorage queryRecord success usedStorage: ' + value[0].$);
            res.json({
                usedStorage: value[0].$
            });
        }
    });
});

/*检查hdfs上是否存在该视频文件
 req.body: {
    usedStorage: '12313',
    md5: 'md5',
    location: '/root',
    filename: 'a.mp4'
 }
 res: {
    status: 0;
 }*/
router.route('/checkVideo').post(function (req, res) {
    var md5 = req.body.md5;
    var video = req.session.user + '-' + req.body.location + '-' + req.body.filename;
	console.log('................../checkVideo  md5: '+md5);
    // 数据库通过md5查询视频文件
    hbase.queryRecord({
        table: 'Table_Video',
        rowKey: md5,
        columnFamily: 'MetaIndentification',
        column: 'MetaIndentification:VideoUrl'
    }, function (err, value) {console.log(err);
        // 数据库不存在该视频文件，则将视频信息保存在session里面，上传时调用，返回文件不存在状态码
        // 数据库存在该视频文件，则在数据库中添加记录，返回文件存在状态码
        if (value == null) {console.log('................................./checkVideo not exists');
            // session保存视频文件信息
            req.session.md5 = md5;
            req.session.video = video; console.log('............../checkVideo req.session.video: ' + req.session.video);
            req.session.usedStorage = req.body.usedStorage;

            // 返回状态码1，表示文件不存在
            res.json({
                status: 1
            });
        } else {console.log('................................./checkVideo exists');
            // 数据库添加记录
            var data = {
                uploadType: 0,
                md5: md5,
                video: video,
                videoUrl: '/orz/' + md5 + video.substring(video.lastIndexOf('.')),
                usedStorage: req.body.usedStorage
            };
            console.log('......................./ checkVideo data: ' + JSON.stringify(data));
            uploadHbase(data, function (status) {
                if (status == 1) {
                    console.log('.....................hbase success');
                    // 返回状态码0，表示文件已存在
                    res.json({
                        status: 0
                    });
                }
            });
        }
    });
});

/*上传视频文件
 req.body: null
 res:res: {
    status: 0;
 }*/
router.route('/uploadVideo').post(function (req, res) {
    console.log('........................./uploadVideo post ');
    if (!req.session.video || !req.session.md5) {
        console.log('......................./uploadVideo req.session.video and req.session.video not exists....');
    } else {
        var video = req.session.video;
        var md5 = req.session.md5;
        var usedStorage = req.session.usedStorage;
        console.log('......................../uploadVideo   video: ' + video + ' md5: ' + md5 + ' usedStorage: ' + usedStorage);

        // 接受上传表单视频文件临时保存到/public/videos/目录下，文件名为md5.mp4
        var form = new formidable.IncomingForm();   //创建上传表单
        form.encoding = 'utf-8';		//设置编辑
        form.uploadDir = './public/videos/';	 //设置上传目录
        form.keepExtensions = true;	 //保留后缀

        form.parse(req, function (err, fields, files) {
            if (err) {
                //res.locals.error = err;
                console.log('...........err: ' + err);
                //res.render('login', {title: '111'});
            } else {
                //var md5 = 'md5';
                var oldPath = files.file.path.toString();
                var extra = path.extname(oldPath);
                var newPath = oldPath.substring(0, oldPath.lastIndexOf('\\')) + '\\' + md5 + extra;

                // 文件重命名
                fs.rename(oldPath, newPath, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('................/uploadVideo rename success');

                        // 提取视频元信息
                        ffmpeg.ffprobe(newPath, function(err, metadata) {
                            //console.dir(metadata);

                            if(metadata.streams[0].width) {
                                var videoInfo = {
                                    resolution: metadata.streams[0].width + '*' + metadata.streams[0].height,
                                    size: '' + metadata.format.size,
                                    timeLength: '' + metadata.format.duration,
                                    type: extra.substring(1)
                                };
                            } else {
                                var videoInfo = {
                                    resolution: metadata.streams[1].width + '*' + metadata.streams[1].height,
                                    size: '' + metadata.format.size,
                                    timeLength: '' + metadata.format.duration,
                                    type: extra.substring(1)
                                };
                            }

                            console.log('......................../uploadVideo videoInfo: ' + JSON.stringify(videoInfo));

                            // 提交视频文件到hdfs
                            console.log(video);
                            var hdfsPath = '/orz/' + md5 + video.substring(video.lastIndexOf('.'));
                            hdfs.upload(newPath, hdfsPath, function (error) {
                                if (error == null) {
                                    console.log('................/uploadVideo  hdfs upload success');
                                    // 删除临时视频文件
                                    fs.exists(newPath, function (exists) {
                                        if (exists) {
                                            console.log('.................../uploadVideo  md5.mp4 exists');
                                            fs.unlink(newPath, function (err) {
                                                if (err)
                                                    console.log('............../uploadVideo  delete ' + newPath + ' failed');
                                                else {
                                                    console.log('............../uploadVideo  delete ' + newPath + ' success');

                                                    // 数据库添加记录
                                                    var data = {
                                                        uploadType: 1,
                                                        'md5': md5,
                                                        'video': video,
                                                        'videoUrl': hdfsPath,
                                                        'usedStorage': usedStorage,
                                                        'videoInfo': videoInfo
                                                    };
                                                    console.log('........................./ uploadVideo data: ' + JSON.stringify(data));
                                                    uploadHbase(data, function (status) {
                                                        if (status == 1) {
                                                            console.log('...................../uploadVideo  hbase success');
                                                            // 返回状态码1，表示上传成功
                                                            res.json({
                                                                status: 1
                                                            });
                                                            //res.redirect('/home');
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        else
                                            console.log('.................../uploadVideo  ' + newPath + ' not exists');
                                    });
                                } else {
                                    console.log('................/uploadVideo  hdfs upload failed');
                                    /*res.json({
                                     status: 1,
                                     err: error
                                     });*/
                                }
                            });
                        });
                    }
                });
            }
        });
    }
});

/*hdfs检查视频文件存在后向数据库添加记录
 obj: {
 md5: 'md5',
 video: '1-/root-1.mp4',
 videoUrl: '/orz/md5.mp4',
 usedStorage: 124568
 }*/
function upload1Hbase(obj, callback) {
    var flag = 1; // 数据库修改状态，1代表成功，0代表失败

    // 文件表添加记录
    hbase.insertRecord({
        table: 'Table_File',
        rowKey: obj.video,
        columnFamily: 'BasicInformation',
        column: 'BasicInformation:File_Type',
        columnValue: 'file'
    }, function (err, status) {
        if (err) {
            console.log(err);
            flag = 0;
            callback &&callback(flag);
        } else{
            // 视频索引表添加记录
            insertVideoIndex({
                type: '0',
                video: obj.video,
                SharedFilename: '',
                VideoLabel: '',
                VideoMD5: obj.md5,
                VideoState: '0'
            }, function(status) {
                if (status == 0) {
                    //console.log(err);
                    flag = 0;
                    callback &&callback(flag);
                } else {
                    console.log('...............upload1Video insert Table_VideoIndex success... status: ' + status);

                    // 用户表修改用户已用空间
                    hbase.insertRecord({
                        table: 'Table_User',
                        rowKey: obj.video.substring(0, obj.video.indexOf('-')),
                        columnFamily: 'BasicInformation',
                        column: 'BasicInformation:UsedStorage',
                        columnValue: obj.usedStorage
                    }, function (err, status) {
                        if (err) {
                            console.log(err);
                            flag = 0;
                            callback &&callback(flag);
                        }

                        // 向日志表中添加记录
                        var user = obj.video.substring(0, obj.video.indexOf('-')+1);
                        var date = new Date();
                        var rowKeyValue = user + date.toLocaleString();
                        //var catalogueName = obj.video.substring(obj.video.indexOf('-')+1).substring(0,obj.video.indexOf('-', obj.indexOf('-')+1))+ '/' +
                        //   obj.video.substring(obj.video.indexOf('-')+1).substring(obj.video.indexOf('-', obj.indexOf('-')+1)+1);
                        var catalogueName = obj.video.substring(obj.video.indexOf('-')+1).replace('-','/');
                        console.log('........................./uploadHbase logRowKey: ' + rowKeyValue + ' catalogueName: ' + catalogueName);
                        hbase.insertAllRecord({
                            table: 'Table_VideoInteractionLog',
                            rowKey: rowKeyValue,
                            columnFamily: 'LogBasicInformation',
                            cells: [{
                                column:'LogBasicInformation:CatalogueVideoName',
                                timestamp:Date.now(),
                                $:catalogueName
                            },{
                                column:'LogBasicInformation:VideoInteractionType',
                                timestamp:Date.now(),
                                $:'1'
                            }]
                        }, function(err, status) {
                            if(err) {
                                console.log(err);
                                flag = 0;
                                callback &&callback(flag);
                            }

                            console.log('................................. upload1Hbase flag: ' + flag);

                            callback &&callback(flag);
                        })
                    });
                }
            });
        }
    });
}

/*向用户索引表插入一行记录
 obj: {
    type : 0,
    video: 'l-/root-1.mp4',
    SharedFilename: '',
    VideoLabel: '',
    VideoMD5: 'safsaf',
    VideoState: '0'
 }
 }*/
function insertVideoIndex(obj, callback) {
    console.log('............................insertVideoIndex obj: ' + JSON.stringify(obj));

    if(obj.type == '0'){
        hbase.insertRecord({
            table: 'Table_VideoIndex',
            rowKey: obj.video,
            columnFamily: 'IndexInformation',
            column: 'IndexInformation:SharedFilename',
            columnValue: obj.SharedFilename
        }, function (err, status) {
            if (err) {
                console.log(err);

                callback &&callback(0);
            } else {
                hbase.insertRecord({
                    table: 'Table_VideoIndex',
                    rowKey: obj.video,
                    columnFamily: 'IndexInformation',
                    column: 'IndexInformation:VideoLabel',
                    columnValue: obj.VideoLabel
                }, function (err, status) {
                    if (err) {
                        console.log(err);

                        callback &&callback(0);
                    } else {
                        hbase.insertRecord({
                            table: 'Table_VideoIndex',
                            rowKey: obj.video,
                            columnFamily: 'IndexInformation',
                            column: 'IndexInformation:VideoMD5',
                            columnValue: obj.VideoMD5
                        }, function (err, status) {
                            if (err) {
                                console.log(err);

                                callback &&callback(0);
                            } else {
                                hbase.insertRecord({
                                    table: 'Table_VideoIndex',
                                    rowKey: obj.video,
                                    columnFamily: 'IndexInformation',
                                    column: 'IndexInformation:VideoState',
                                    columnValue: obj.VideoState
                                }, function (err, status) {
                                    if (err) {
                                        console.log(err);

                                        callback &&callback(0);
                                    } else {
                                        console.log('.....................insert Table_VideoIndex success');

                                        callback &&callback(1);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        hbase.insertRecord({
            table: 'Table_VideoIndex',
            rowKey: obj.video,
            columnFamily: 'IndexInformation',
            column: 'IndexInformation:SharedFilename',
            columnValue: obj.SharedFilename
        }, function (err, status) {
            if (err) {
                console.log(err);

                callback &&callback(0);
            } else {
                hbase.insertRecord({
                    table: 'Table_VideoIndex',
                    rowKey: obj.video,
                    columnFamily: 'IndexInformation',
                    column: 'IndexInformation:VideoState',
                    columnValue: obj.VideoState
                }, function (err, status) {
                    if (err) {
                        console.log(err);

                        callback &&callback(0);
                    } else {
                        console.log('.....................insert Table_VideoIndex success');

                        callback &&callback(1);
                    }
                });
            }
        });
    }
}

/*上传视频文件后向数据库添加记录
 obj: {
    md5: 'md5',
    video: '1tr-/root-1.mp4',
    videoUrl: '/orz/md5.mp4',
    usedStorage: 124568,
    videoInfo': {
        uploadType: 1
        resolution: '1920*1080',
        size: '10000000',
        timeLength: '56.23232',
        type: 'mp4'
    }
 }*/
function uploadHbase(obj, callback) {
    var flag = 1; // 数据库修改状态，1代表成功，0代表失败
    /*var videoInfo = {
        resolution: '1920*1080',
        size: '10000000',
        timeLength: '1:12',
        type: 'mp4'
    };*/
    if(obj.uploadType == '0') {
        // 视频表中查询视频引用次数
        hbase.queryRecord({
            table: 'Table_Video',
            rowKey: obj.md5,
            columnFamily: 'MetaIndentification',
            column: 'MetaIndentification:RefNumber'
        }, function(err, value) {
            if(err) {
                flag = 0;
                callback &&callback(flag);
            } else {
                if(value == null) {
                    console.log(err);
                    flag = 0;
                    callback &&callback(flag);
                } else {
                    var refNumber = '' + (parseInt(value[0].$)+1);
                    console.log('..........................uploadHbase query Table_Video RefNumber:' + value[0].$ + '  refNumber: ' + refNumber);

                    // 视频表中引用次数加1
                    hbase.insertRecord({
                        table: 'Table_Video',
                        rowKey: obj.md5,
                        columnFamily: 'MetaIndentification',
                        column: 'MetaIndentification:RefNumber',
                        columnValue: refNumber
                    }, function(err, status){
                        if(err) {
                            console.log(err);
                            flag = 0;
                            callback &&callback(flag);
                        } else{
                            console.log('.....................uploadHbase insert Table_Video success.');

                            // 向文件表和其他表添加记录
                            upload1Hbase({
                                md5: obj.md5,
                                video: obj.video,
                                videoUrl: obj.videoUrl,
                                usedStorage: obj.usedStorage
                            }, function(status) {
                                console.log('........................../upload1Hbase status: ' + status);

                                callback &&callback(status);
                            });
                        }
                    });
                }
            }
        });
    } else {
        // 视频表添加视频url信息和引用次数
        hbase.insertAllRecord({
            table: 'Table_Video',
            rowKey: obj.md5,
            columnFamily: 'MetaIndentification',
            cells: [{
                column: 'MetaIndentification:VideoUrl',
                timestamp:Date.now(),
                $: obj.videoUrl
            }, {
                column: 'MetaIndentification:RefNumber',
                timestamp:Date.now(),
                $: '1'
            }]

        }, function(err, status){
            if(err) {
                console.log(err);
                flag = 0;
                callback &&callback(flag);
            } else{
                // 视频表添加视频元信息
                hbase.insertAllRecord({
                    table: 'Table_Video',
                    rowKey: obj.md5,
                    columnFamily: 'MetaInformation',
                    cells: [{
                        column:'MetaInformation:VideoResolution',
                        timestamp:Date.now(),
                        $:obj.videoInfo.resolution
                    },{
                        column:'MetaInformation:VideoSize',
                        timestamp:Date.now(),
                        $:obj.videoInfo.size
                    },{
                        column:'MetaInformation:VideoTimeLength',
                        timestamp:Date.now(),
                        $:obj.videoInfo.timeLength
                    },{column:'MetaInformation:VideoType',
                        timestamp:Date.now(),
                        $:obj.videoInfo.type
                    }]
                }, function (err, status) {
                    if (err) {
                        console.log(err);
                        flag = 0;
                        callback &&callback(flag);
                    } else {
                        console.log('..................../upload  insert Table_Video success');

                        // 向视频表和其他表添加记录
                        upload1Hbase({
                            md5: obj.md5,
                            video: obj.video,
                            videoUrl: obj.videoUrl,
                            usedStorage: obj.usedStorage
                        }, function(status) {
                            console.log('........................../upload1Hbase status: ' + status);

                            callback &&callback(flag);
                        });
                    }
                });
            }
        });
    }
}

/*
下载视频
req.body:VideoName 格式 "路径-视频名称"
res:{
    status:0   状态码0为成功，1为服务器不存在该视频，2为服务器错误
    url:url    缓存在服务器上的视频连接
}
 */
router.post('/downloadVideo',function(req,res,next){
    var videoMD5;
    var videoUrl;
    var userName=req.session.user;
    //var userName='ltr';
    //获取"用户名-视频用户路径-视频名"
    var key=userName+req.body.videoName;

    var returnName=key.substring(key.lastIndexOf('-')+1);
    console.log(key + ' ' + key.length);
    var obj={
        table:'Table_VideoIndex',
        columnFamily:'IndexInformation',
        column:'IndexInformation:VideoMD5',
        rowKey:key,
    };

    //根据“用户名-视频用户路径-视频名”在数据库搜索视频的md5码
    hbase.queryRecord(obj,function(err,value){
        if(err){
            console.log(err);
            res.json({status:2});
        }
        else{
            if(value==null)
            {
                console.log("不存在该视频的md5码");
                res.json({status:1});
            }
            else{
                videoMD5=value[0].$;

                console.log(value);
                var obj2={
                    table:'Table_Video',
                    columnFamily:'MetaIndentification',
                    column:'MetaIndentification:VideoUrl',
                    rowKey:videoMD5,
                }

                //根据数据库返回的md5码获取在hdfs服务器上的路径
                hbase.queryRecord(obj2,function(err,value){
                    if(err){

                        console.log(err);
                        res.json({status:1});
                    }
                    else{
                        if(value==null)
                        {
                            console.log("不存在该视频在hdfs上的路径");
                            res.json({status:1});
                        }
                        else
                        {
                            videoUrl=value[0].$;
                            var VideoName=videoUrl.replace('/orz/','');
                            console.log(VideoName);
                            var videoDir="./public/videos/"+VideoName;
                            console.log(videoDir);
                            var url="/videos/"+VideoName;

                            console.log(value);
                            //判断nodejs服务器上是否已存在该视频，若存在，直接返回路径
                            //否则从hdfs服务器上将视频复制到nodejs服务器
                            fs.exists(videoDir,function(exists){
                                var catalogueName=req.body.videoName.substring(1);
                                catalogueName=catalogueName.replace('-','/');


                                //获取当前时间
                                var myDate = new Date();
                                myDate=myDate.toLocaleString();
                                var logKey=userName+'-'+myDate;

                                var cell=[{
                                    column:'LogBasicInformation:CatalogueVideoName',
                                    timestamp:Date.now(),
                                    $:catalogueName
                                },
                                    {
                                        column:'LogBasicInformation:VideoInteractionType',
                                        timestamp:Date.now(),
                                        $:'0'//0代表下载，1代表上传
                                    }];

                                var obj3={
                                    table:'Table_VideoInteractionLog',
                                    columnFamily:'LogBasicInformation',
                                    rowKey:logKey,
                                    cells:cell
                                };

                                if(exists)
                                {
                                    //将下载记录写入管理员日志
                                    hbase.insertAllRecord(obj3,function(err,value){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            console.log("插入下载记录成功");
                                        }
                                    });
                                    console.log("下载成功");
                                    res.json({
                                        status:0,
                                        url:url,
                                        videoName:returnName
                                    });
                                }
                                else
                                {
                                    //从hdfs服务器上获取视频并保存在nodejs服务器上
                                    hdfs.download(videoUrl,videoDir,function(error){
                                        if(error){

                                            console.log(error);
                                            res.json({
                                                status:1,
                                            });
                                        }
                                        else
                                        {
                                            //将下载记录写入管理员日志
                                            hbase.insertAllRecord(obj3,function(err,value){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    console.log("插入下载记录成功");
                                                }
                                            });
                                            console.log("下载成功");
                                            res.json({
                                                status:0,
                                                url:url,
                                                videoName:returnName
                                            });

                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

/*
 共享空间下载视频
 req.body:videoName 视频名称
 res:{
 status:0   状态码0为成功，1为服务器不存在该视频，2为服务器错误
 url:url    缓存在服务器上的视频连接
 }

 */
router.post('/shareDownload',function(req,res,next){

    var videoName=req.body.videoName;
    var userName=req.session.user;

    var obj={
        table:'Table_SharedSpaceMap',
        columnFamily:'BasicInformation',
        column:'BasicInformation:Filemap',
        rowKey:videoName,
    };

    hbase.queryRecord(obj,function(err,value){
        if(err){
            console.log(err);
        }else{
            if(value == null) {
                res.json({
                    status: 1
                });
            } else {
                var key=value[0].$;

                var obj1={
                    table:'Table_VideoIndex',
                    columnFamily:'IndexInformation',
                    column:'IndexInformation:VideoMD5',
                    rowKey:key,
                };

                var returnName=key.substring(key.lastIndexOf('-')+1);
                //根据“用户名-视频用户路径-视频名”在数据库搜索视频的md5码
                hbase.queryRecord(obj1,function(err,value){
                    if(err){
                        console.log(err);
                        res.json({status:2});
                    }
                    else{
                        if(value==null)
                        {
                            console.log("不存在该视频的md5码");
                            res.json({status:1});
                        }
                        else{
                            videoMD5=value[0].$;

                            //  console.log(value);
                            var obj2={
                                table:'Table_Video',
                                columnFamily:'MetaIndentification',
                                column:'MetaIndentification:VideoUrl',
                                rowKey:videoMD5,
                            }

                            //根据数据库返回的md5码获取在hdfs服务器上的路径
                            hbase.queryRecord(obj2,function(err,value){
                                if(err){

                                    console.log(err);
                                    res.json({status:1});
                                }
                                else{
                                    if(value==null)
                                    {
                                        console.log("不存在该视频在hdfs上的路径");
                                        res.json({status:1});
                                    }
                                    else
                                    {
                                        videoUrl=value[0].$;

                                        var VideoName=videoUrl.replace('/orz/','');
                                        var videoDir="./public/videos/"+VideoName;
                                        console.log(videoDir);
                                        var url="/videos/"+VideoName;



                                        //判断nodejs服务器上是否已存在该视频，若存在，直接返回路径
                                        //否则从hdfs服务器上将视频复制到nodejs服务器
                                        fs.exists(videoDir,function(exists){
                                            //var catalogueName=req.body.videoName.substring(1);
                                            // catalogueName=catalogueName.replace('-','/');
                                            var catalogueName=key.substring(key.indexOf('-')+1);
                                            catalogueName=catalogueName.replace('-','/');

                                            //获取当前时间
                                            var myDate = new Date();
                                            myDate=myDate.toLocaleString();
                                            var logKey=userName+'-'+myDate;

                                            var cell=[{
                                                column:'LogBasicInformation:CatalogueVideoName',
                                                timestamp:Date.now(),
                                                $:catalogueName
                                            },
                                                {
                                                    column:'LogBasicInformation:VideoInteractionType',
                                                    timestamp:Date.now(),
                                                    $:'0'//0代表下载，1代表上传
                                                }];

                                            var obj3={
                                                table:'Table_VideoInteractionLog',
                                                columnFamily:'LogBasicInformation',
                                                rowKey:logKey,
                                                cells:cell
                                            };

                                            if(exists)
                                            {
                                                //将下载记录写入管理员日志
                                                hbase.insertAllRecord(obj3,function(err,value){
                                                    if(err){
                                                        console.log(err);
                                                    }else{
                                                        console.log("插入下载记录成功");
                                                    }
                                                });
                                                console.log("下载成功");
                                                res.json({
                                                    status:0,
                                                    url:url,
                                                    videoName:returnName
                                                });
                                            }
                                            else
                                            {
                                                //从hdfs服务器上获取视频并保存在nodejs服务器上
                                                hdfs.download(videoUrl,videoDir,function(error){
                                                    if(error){

                                                        console.log(error);
                                                        res.json({
                                                            status:1,
                                                        });
                                                    }
                                                    else
                                                    {
                                                        //将下载记录写入管理员日志
                                                        hbase.insertAllRecord(obj3,function(err,value){
                                                            if(err){
                                                                console.log(err);
                                                            }else{
                                                                console.log("插入下载记录成功");
                                                            }
                                                        });
                                                        console.log("下载成功");
                                                        res.json({
                                                            status:0,
                                                            url:url,
                                                            videoName:returnName
                                                        });

                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    })
});

/* 获取视频元信息
 * req.param: {
 *  catalogue: '/root',
 *  filename: 'a.mp4'
 * }
 * res: {
 *  status: 1,
 *  resolution: '1920*1080',
 *  size: 2323424,
 *  timeLength: '11:11',
 *  type: 'mp4',
 *  SharedFilename: '',
 *  VideoLabel: 'aaa,bbb',
 *  VideoMD5: 'safsaf',
 *  VideoState: '0'
 * }
 */
router.route('/videoInfo').get(function(req, res){
    console.log('....................../videoInfo get start');
    var video = req.session.user + '-' + req.query.catalogue + '-' + req.query.filename;
    console.log('....................../videoInfo video: ' + video);

    // 查询视频索引表获得视频md5码
    var videoInfo = {};
    hbase.queryAllRecord({
        table: 'Table_VideoIndex',
        rowKey: video,
        columnFamily: 'IndexInformation'
    }, function (err, value) {
        if (err) {
            console.log(err);
            res.json({
                status: 0
            });
        } else {
            console.log('.........................../viewInfo videoIndex: ' + JSON.stringify(value));

            value.forEach(function(item, index) {
                videoInfo[item.column.substring(item.column.indexOf(':')+1)] = value[index].$;
            });

            // 查询视频表获得视频元信息
            hbase.queryAllRecord({
                table: 'Table_Video',
                rowKey: videoInfo.VideoMD5,
                columnFamily: 'MetaInformation'
            }, function(err, value) {
                if(err) {
                    console.log(err);
                    res.json({
                        status: 0
                    });
                } else {
                    console.log(value);

                    videoInfo['status'] = 1;
                    videoInfo['resolution'] = value[0].$;
                    videoInfo['size'] = value[1].$;
                    videoInfo['timeLength'] = value[2].$;
                    videoInfo['type'] = value[3].$;

                    console.log('........................./videoInfo    videoInfo: ' + JSON.stringify(videoInfo));
                    res.json(videoInfo);
                }
            });
        }
    });
});

/* 获取用户信息
 * req.param: null
 * res: {
 *  status: 1,
 *  UserLevel: '0',
 *  UsedStorage: 2323424,
 *  storage: '11:11',
 *  log: [{
 *      CatalogueVideoName: '/root/orz/1.mp4',
 *      type: 0,
 *      time: '20171010101010'
 *  }, {..}]
 * }
 */
router.route('/viewUserInfo').get(function(req, res){
    console.log('........................../viewUserInfo get start');

    var userLevel = null;
    var usedStorage = null;
    var Storage = null;
    var logs = new Array();

    // 在用户表中查询用户级别和已用空间
    hbase.queryAllRecord({
        table: 'Table_User',
        rowKey: req.session.user,
        columnFamily: 'BasicInformation'
    }, function(err, value) {
        if(err) {
            // 查询出错，返回状态码0
            console.log(err);
            res.json({
                status: 0
            });
        } else {
            usedStorage = value[0].$;
            userLevel = value[1].$;
            console.log('..................................../viewUserInfo usedStorage: ' + usedStorage + ' userLevel: ' + userLevel);

            // 在用户级别表中查询用户可用空间
            hbase.queryRecord({
                table: 'Table_UserLevel',
                rowKey: userLevel,
                columnFamily: 'BasicInformation',
                column: 'BasicInformation:LevelStorage'
            },function(err,value){
                if(err) {
                    // 查询出错，返回状态码0
                    console.log(err);
                    res.json({
                        status: 0
                    });
                } else {
                    Storage = value[0].$;

                    // 在视频日志表中查询日志
                    var sRow = req.session.user + '-';
                    var eRow = req.session.user + '.';
                    hbase.queryRowKeyAndRecord({
                        table: 'Table_VideoInteractionLog',
                        startRow: sRow,
                        endRow: eRow
                    }, function(err,value) {
                        if(err) {
                            // 查询出错，返回状态码0
                            console.log(err);
                            res.json({
                                status: 0
                            });
                        } else {
                            console.log('........................./getUserInfo  logs: ' + JSON.stringify(value));

                            if(value.length == 1) {
                                // 返回用户信息
                                res.json({
                                    status: 1,
                                    UserLevel: userLevel,
                                    UsedStorage: usedStorage,
                                    storage: Storage,
                                    log: null
                                });
                            } else {
                                for(var i = 1;i < value.length-1; i+=2) {
                                    (function(i){
                                        logs.push({
                                            CatalogueVideoName: value[i].$,
                                            type: value[i+1].$,
                                            time: value[i].key.substring(value[i].key.indexOf('-')+1)
                                        });

                                        console.log('............................/viewUserInfo i：' + i + ' logs: '+ JSON.stringify(logs[0]));

                                        if(i == value.length-2) {

                                            // 返回用户信息
                                            res.json({
                                                status: 1,
                                                UserLevel: userLevel,
                                                UsedStorage: usedStorage,
                                                storage: Storage,
                                                log: logs
                                            });
                                        }
                                    })(i)
                                }
                            }
                        }
                    });
                }
            });
        }
    });
});

router.route('/changePwdTest').post(function(req, res) {
    console.log('.................../changePwdTest req.body.oldPassword: ' + req.body.oldPassword);
    res.json({
        status: 0
    });
});

/* 修改密码
 * req.body: {
 *  oldPassword: '',
 *  newPassword: ''
 * }
 * res: {
 *  status: 0
 * }
 */
router.route('/changePwd').get(function(req, res){
    if(!req.session.user)
        res.redirect('/login');
    else
        res.render('userChangePW', {
            username: req.session.user
        });
}).post(function(req, res) {
    console.log('............................../changePwd post start');

    // 在用户表中查询密码
    hbase.queryRecord({
        table: 'Table_User',
        rowKey: req.session.user,
        columnFamily: 'BasicInformation',
        column: 'BasicInformation:Userpassword'
    },function(err,value){
        if(err) {
            console.log(err);
            res.json({
                status: 1
            });
        } else {
            var password = value[0].$;  console.log('....................../changePwd password: ' + password);

            // 判断输入的密码和原密码是否相同
            if(req.body.oldPassword != password) {
                console.log('................./changePwd oldPassword != password');
                res.json({
                    status: 0
                });
            } else {
                console.log('................./changePwd oldPassword == password');
                // 在用户表中更新新密码
                hbase.insertRecord({
                    table: 'Table_User',
                    rowKey: req.session.user,
                    columnFamily: 'BasicInformation',
                    column: 'BasicInformation:Userpassword',
                    columnValue: req.body.newPassword
                }, function(err, value) {
                    if(err) {
                        console.log(err);
                        res.json({
                            status: 1
                        });
                    } else {
                        console.log('................./changePwd hbase.insertRecord success');
                        res.json({
                            status: 2
                        });
                    }
                });
            }
        }
    });
});

/* 获得共享空间视频表
 * req.body: null
 * res: {
 *  status: 0
 *  videoList: ['1.mp4','2.mp4']
 * }
 */
router.route('/getSharedVideo').get(function(req, res) {
    console.log('................../getSharedVideo get start.');
    hbase.queryRowKeyAndRecord({
        table: 'Table_SharedSpaceMap'
    }, function(err, rows) {
        if(err) {
            res.json({
                status: 0
            });
        } else {
            console.log('................../getSharedVideo   rows: ' + JSON.stringify(rows));
            var videoList = new Array();

            for(var i = 0; i < rows.length; i++) {
                videoList.push(rows[i].key.substring(rows[i].key.indexOf('-', rows[i].key.indexOf('-')+1)+1));
            }

            res.json({
                status: 1,
                data: videoList
            });
        }
    });
});

/* 共享视频
 * req.body: {
 *  catalogue: '/root',
 *  filename: '1.mp4'
 * }
 * res: {
 *  status: 0
 * }
 */
router.route('/shareVideo').post(function(req, res){
    // 共享视频状态，共享文件名
    var video = req.session.user + '-' + req.body.catalogue + '-' + req.body.filename;
    //var shareVideo = shareUser + '-' + req.body.catalogue +　'-' + req.body.filename;

    console.log('............................../shareVideo video:' + video);

    hbase.queryAllRecord({
        table: 'Table_VideoIndex',
        rowKey: video,
        columnFamily: 'IndexInformation'
    }, function(err, value) {
        if(err){
            res.json({
                status: 0
            });
        } else {
            if(value == null){
                res.json({
                    status: 0
                });
            } else {
                console.log('............................../shareVideo query Table_VideoIndex value:' + JSON.stringify(value));

                var videoInfo = {
                    sharedFilename: value[0].$,
                    //label: value[1].$,
                    //md5: value[2].$,
                    state: value[3].$
                };
                console.log('....................../shareVideo videoInfo: ' + JSON.stringify(videoInfo));

                // 判断文件是否已共享
                if(videoInfo.state == '1') {
                    // 文件已共享，判断共享空间文件名和文件名是否一致，
                    // 若一致，返回状态码2，共享成功；若不一致，查询共享空间是否存在同名文件，
                    // 若不存在，更新视频索引表共享空间名为当前名和共享空间视频文件名;若存在，返回状态码1，共享失败，存在同名文件
                    if(videoInfo.sharedFilename == req.body.filename) {
                        res.json({
                            status: 2
                        });
                    } else {
                        console.log('....................../shareVideo videoInfo.state: ' + videoInfo.state);

                        hbase.queryRecord({
                            table: 'Table_SharedSpaceMap',
                            rowKey: req.body.filename,
                            columnFamily: 'BasicInformation',
                            column: 'BasicInformation:Filemap'
                        }, function(err, value) {
                            if(err) {
                                res.json({
                                    status: 0
                                });
                            } else {
                                if(value == null) {
                                    // 更新视频索引表共享文件名为当前文件名
                                    hbase.insertRecord({
                                        table: 'Table_VideoIndex',
                                        rowKey: video,
                                        columnFamily: 'IndexInformation',
                                        column: 'IndexInformation:SharedFilename',
                                        columnValue: req.body.filename
                                    }, function(err, value) {
                                        if(err) {
                                            res.json({
                                                status: 0
                                            });
                                        } else {
                                            // 删除原共享文件信息
                                            hbase.deleteRecord({
                                                table: 'Table_SharedSpaceMap',
                                                rowKey: videoInfo.sharedFilename
                                            }, function(err, value) {
                                                if(err) {
                                                    res.json({
                                                        status: 0
                                                    });
                                                } else {
                                                    // 插入新的共享文件信息
                                                    hbase.insertRecord({
                                                        table: 'Table_SharedSpaceMap',
                                                        rowKey: req.body.filename,
                                                        columnFamily: 'BasicInformation',
                                                        column: 'BasicInformation:Filemap',
                                                        columnValue: video
                                                    }, function(err, value) {
                                                        if(err) {
                                                            res.json({
                                                                status: 0
                                                            });
                                                        } else {
                                                            // 返回状态码2，共享成功
                                                            res.json({
                                                                status: 2
                                                            });
                                                        }
                                                    });
                                                }
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
                    }
                } else {
                    console.log('....................../shareVideo videoInfo.state: ' + videoInfo.state);

                    // 文件未共享，查询共享空间是否存在同名视频文件，
                    // 若不存在，添加视频索引表共享文件名和共享空间视频记录；若存在，返回状态码1，共享失败，存在同名文件
                    hbase.queryRecord({
                        table: 'Table_SharedSpaceMap',
                        rowKey: req.body.filename,
                        columnFamily: 'BasicInformation',
                        column: 'BasicInformation:Filemap'
                    }, function(err, value) {
                        if(err) {
                            res.json({
                                status: 0
                            });
                        } else {
                            console.log('........................./shareVideo query Table_SharedSpaceMap success. value: ' + JSON.stringify(value));

                            if(value == null) {
                                // 更新视频索引表共享文件名为当前文件名,共享状态设置为1
                                /*hbase.insertAllRecord({
                                    table: 'Table_VideoIndex',
                                    rowKey: video,
                                    columnFamily: 'IndexInformation',
                                    cells: [{
                                        column: 'IndexInformation:SharedFilename',
                                        timestamp: Date.now(),
                                        $: req.body.filename
                                    }, {
                                        column: 'IndexInformation:VideoState',
                                        timestamp: Date.now(),
                                        $: '1'
                                    }   ]
                                }, function(err, value) {
                                    if(err) {
                                        res.json({
                                            status: 0
                                        });*/
                                insertVideoIndex({
                                    type: '1',
                                    video: video,
                                    SharedFilename: req.body.filename,
                                    VideoState: '1'
                                }, function(status){
                                    if(status == 0) {
                                        res.json({
                                            status: 0
                                        });
                                    } else {
                                        console.log('........................./shareVideo insert Table_VideoIndex success.');

                                        // 插入共享文件信息
                                        hbase.insertRecord({
                                            table: 'Table_SharedSpaceMap',
                                            rowKey: req.body.filename,
                                            columnFamily: 'BasicInformation',
                                            column: 'BasicInformation:Filemap',
                                            columnValue: video
                                        }, function(err, value) {
                                            if(err) {
                                                res.json({
                                                    status: 0
                                                });
                                            } else {
                                                console.log('........................./shareVideo insert Table_SharedSpaceMap success.');

                                                // 返回状态码2，共享成功
                                                res.json({
                                                    status: 2
                                                });
                                            }
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
                }
            }
        }
    });
});

/* 取消共享视频
 * req.body: {
 *  catalogue: '/root',
 *  filename: '1.mp4'
 * }
 * res: {
 *  status: 0
 * }
 */
router.route('/unshareVideo').post(function(req, res){
    // 查询视频共享状态，共享文件名
    var video = req.session.user + '-' + req.body.catalogue + '-' + req.body.filename;

    hbase.queryAllRecord({
        table: 'Table_VideoIndex',
        rowKey: video,
        columnFamily: 'IndexInformation'
    }, function(err, value) {
        if (err) {
            res.json({
                status: 0
            });
        } else {
            var videoInfo = {
                sharedFilename: value[0].$,
                //label: value[1].$,
                //md5: value[2].$,
                state: value[3].$
            };
            console.log('....................../unshareVideo videoInfo: ' + JSON.stringify(videoInfo));

            // 判断文件是否共享
            // 若文件未共享，返回状态码1，取消共享成功；若文件已共享，共享状态设置为0，共享表删除文件信息
            if(videoInfo.state == 0) {
                res.json({
                    status: 1
                });
            } else {
                // 视频索引表设置共享状态为0
                hbase.insertRecord({
                    table: 'Table_VideoIndex',
                    rowKey: video,
                    columnFamily: 'IndexInformation',
                    column: 'IndexInformation:VideoState',
                    columnValue: '0'
                }, function(err, value) {
                    if (err) {
                        res.json({
                            status: 0
                        });
                    } else {
                        // 共享表删除文件信息
                        hbase.deleteRecord({
                            table: 'Table_SharedSpaceMap',
                            rowKey: videoInfo.sharedFilename
                        }, function(err, status) {
                            if (err) {
                                res.json({
                                    status: 0
                                });
                            } else {
                                // 取消共享成功，返回状态码1
                                res.json({
                                    status: 1
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});

/* 重命名视频
 * req.body: {
 *  catalogue: '/root',
 *  oldName: '1.mp4',
 *  newName; '2.mp4'
 * }
 * res: {
 *  status: 0
 * }
 */
router.route('/renameVideo').post(function (req, res) {
    if (!req.session.user) {
        console.log('...................../renameVideo req.session.user not exists');
    } else {
        var video = req.session.user + '-' + req.body.catalogue + '-' + req.body.oldName;
        var newVideo = req.session.user + '-' + req.body.catalogue + '-' + req.body.newName;

        // 查询视频索引表是否存在与新文件名同名的文件
        // 若不存在同名的文件，更新相关信息；若存在，返回状态码1，重命名失败，目录下存在同名文件
        hbase.queryRecord({
            table: 'Table_VideoIndex',
            rowKey: newVideo,
            columnFamily: 'IndexInformation',
            column: 'IndexInformation:VideoMD5'
        }, function(err, value) {
            if (err) {
                console.log(err);
                res.json({
                    status: 0
                });
            } else {
                if(value != null) {
                    res.json({
                        status: 1
                    });
                } else {
                    // 查询视频文件信息
                    hbase.queryAllRecord({
                        table: 'Table_VideoIndex',
                        rowKey: video,
                        columnFamily: 'IndexInformation'
                    }, function (err, value) {
                        if (err) {
                            console.log(err);
                            res.json({
                                status: 0
                            });
                        } else {
                            console.log('............................./renameVideo queryAllRecord Table_VideoIndex success ');

                            if(value == null){
                                res.json({
                                    status: 0
                                });
                            } else {
                                var videoInfo = {
                                    sharedFilename: value[0].$,
                                    label: value[1].$,
                                    md5: value[2].$,
                                    state: value[3].$
                                };

                                console.log('....................../renameVideo label: ' + videoInfo.label + ' md5: ' + videoInfo.md5 + ' state: ' + videoInfo.state);

                                // 向视频索引表插入新的视频信息
                               /* hbase.insertAllRecord({
                                    table: 'Table_VideoIndex',
                                    rowKey: newVideo,
                                    columnFamily: 'IndexInformation',
                                    cells: [{
                                        column: 'IndexInformation:SharedFilename',
                                        timestamp: Date.now(),
                                        $: videoInfo.sharedFilename
                                    }, {
                                        column: 'IndexInformation:VideoLabel',
                                        timestamp: Date.now(),
                                        $: videoInfo.label
                                    }, {
                                        column: 'IndexInformation:VideoMD5',
                                        timestamp: Date.now(),
                                        $: videoInfo.md5
                                    }, {
                                        column: 'IndexInformation:VideoState',
                                        timestamp: Date.now(),
                                        $: videoInfo.state
                                    }]
                                }, function (err, status) {
                                    if (err) {
                                        console.log(err);
                                        res.json({
                                            status: 0
                                        });*/
                                insertVideoIndex({
                                    type: '0',
                                    video: newVideo,
                                    SharedFilename: videoInfo.sharedFilename,
                                    VideoLabel: videoInfo.label,
                                    VideoMD5: videoInfo.md5,
                                    VideoState: videoInfo.state
                                }, function(status){
                                    if(status == 0) {
                                        res.json({
                                            status: 0
                                        });
                                    } else {
                                        console.log('............................./renameVideo insertRecord Table_VideoIndex success');

                                        // 向文件表插入新的视频信息
                                        hbase.insertRecord({
                                            table: 'Table_File',
                                            rowKey: newVideo,
                                            columnFamily: 'BasicInformation',
                                            column: 'BasicInformation:File_Type',
                                            columnValue: 'file'
                                        }, function (err, status) {
                                            if (err) {
                                                console.log(err);
                                                res.json({
                                                    status: 0
                                                });
                                            } else {
                                                console.log('............................./renameVideo insertRecord Table_File success');

                                                // 向标签表中插入新的信息
                                                // 删除旧的视频索引表信息
                                                hbase.deleteRecord({
                                                    table: 'Table_VideoIndex',
                                                    rowKey: video
                                                }, function (err, status) {
                                                    if (err) {
                                                        console.log(err);
                                                        res.json({
                                                            status: 0
                                                        });
                                                    } else {
                                                        console.log('............................./renameVideo deleteRecord Table_VideoIndex success');

                                                        // 删除旧的文件表信息
                                                        hbase.deleteRecord({
                                                            table: 'Table_File',
                                                            rowKey: video
                                                        }, function (err, status) {
                                                            if (err) {
                                                                console.log(err);
                                                                res.json({
                                                                    status: 0
                                                                });
                                                            } else {
                                                                console.log('............................./renameVideo deleteRecord Table_File success');

                                                                // 判断文件是否需要更新共享空间信息
                                                                if(videoInfo.sharedFilename == '') {
                                                                    // 判断文件标签
                                                                    // 若标签为''，说明文件没有标签，结束；若标签不为'',说明有标签，添加新的标签记录，删除旧的标签记录
                                                                    if(videoInfo.label == '') {
                                                                        // 返回状态码2,重命名成功
                                                                        res.json({
                                                                            status: 2
                                                                        });
                                                                    } else {
                                                                        /*addTag({
                                                                            tag: videoInfo.label,
                                                                            video: newVideo
                                                                        }, function(status) {
                                                                            if(status == 0) {
                                                                                res.json({
                                                                                    status: status
                                                                                });
                                                                            } else {
                                                                                deleteTag({
                                                                                    tag: videoInfo.label,
                                                                                    video: video
                                                                                }, function(status) {
                                                                                    if(status == 0) {
                                                                                        res.json({
                                                                                            status: status
                                                                                        });
                                                                                    } else {
                                                                                        res.json({
                                                                                            status: 2
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });*/
                                                                        deleteTag({
                                                                            tag: videoInfo.label,
                                                                            video: video
                                                                        }, function(status) {
                                                                            if(status == 0) {
                                                                                res.json({
                                                                                    status: status
                                                                                });
                                                                            } else {
                                                                                addTag({
                                                                                    tag: videoInfo.label,
                                                                                    video: newVideo
                                                                                }, function(status) {
                                                                                    if(status == 0) {
                                                                                        res.json({
                                                                                            status: status
                                                                                        });
                                                                                    } else {
                                                                                        res.json({
                                                                                            status: 2
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                } else {
                                                                    // 更新共享文件信息
                                                                    hbase.insertRecord({
                                                                        table: 'Table_SharedSpaceMap',
                                                                        rowKey: videoInfo.sharedFilename,
                                                                        columnFamily: 'BasicInformation',
                                                                        column: 'BasicInformation:Filemap',
                                                                        columnValue: newVideo
                                                                    }, function(err, value) {
                                                                        if(err) {
                                                                            res.json({
                                                                                status: 0
                                                                            });
                                                                        } else {
                                                                            console.log('........................./renameVideo insert Table_SharedSpaceMap success.');

                                                                            // 判断文件标签
                                                                            // 若标签为''，说明文件没有标签，结束；若标签不为'',说明有标签，添加新的标签记录，删除旧的标签记录
                                                                            if(videoInfo.label == '') {
                                                                                // 返回状态码2,重命名成功
                                                                                res.json({
                                                                                    status: 2
                                                                                });
                                                                            } else {
                                                                                /*addTag({
                                                                                    tag: videoInfo.label,
                                                                                    video: newVideo
                                                                                }, function(status) {
                                                                                    if(status == 0) {
                                                                                        res.json({
                                                                                            status: status
                                                                                        });
                                                                                    } else {
                                                                                        deleteTag({
                                                                                            tag: videoInfo.label,
                                                                                            video: video
                                                                                        }, function(status) {
                                                                                            if(status == 0) {
                                                                                                res.json({
                                                                                                    status: status
                                                                                                });
                                                                                            } else {
                                                                                                res.json({
                                                                                                    status: 2
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });*/
                                                                                deleteTagaddTag({
                                                                                    tag: videoInfo.label,
                                                                                    video: video
                                                                                }, function(status) {
                                                                                    if(status == 0) {
                                                                                        res.json({
                                                                                            status: status
                                                                                        });
                                                                                    } else {
                                                                                        addTag({
                                                                                            tag: videoInfo.label,
                                                                                            video: newVideo
                                                                                        }, function(status) {
                                                                                            if(status == 0) {
                                                                                                res.json({
                                                                                                    status: status
                                                                                                });
                                                                                            } else {
                                                                                                res.json({
                                                                                                    status: 2
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            }

                                                            /*// 添加新的标签记录，删除旧的标签记录
                                                             addTag({
                                                             tag: videoInfo.label,
                                                             video: newVideo
                                                             }, function(status) {
                                                             if(status == 0) {
                                                             res.json({
                                                             status: status
                                                             });
                                                             } else {
                                                             deleteTag({
                                                             tag: videoInfo.label,
                                                             video: video
                                                             }, function(status) {
                                                             if(status == 0) {
                                                             res.json({
                                                             status: status
                                                             });
                                                             } else {
                                                             res.json({
                                                             status: 2
                                                             });
                                                             }
                                                             });
                                                             }
                                                             });*/
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
});

/* 删除视频
 * req.body: {
 *  catalogue: '/root',
 *  filename: '1.mp4'
 * }
 * res: {
 *  status: 0
 * }
 */
router.route('/deleteVideo').post(function(req, res){
    var video = req.session.user + '-' + req.body.catalogue + '-' + req.body.filename;
    var sharedFilename = null;
    var label = null;
    var md5 = null;
    var size = 0;
    var usedStorage = 0;
    console.log('........................./deleteVideo video: ' + video);

    // 视频索引表查询共享文件名，标签，md5
    hbase.queryAllRecord({
        table: 'Table_VideoIndex',
        rowKey: video,
        columnFamily: 'IndexInformation'
    }, function(err, value) {
        if(err) {
            console.log(err);
            res.json({
                status: 0
            });
        } else {
            if(value == null) {
                res.json({
                    status: 0
                });
            }
            console.log('....................../deleteVideo queryAllRecord Table_VideoIndex value: ' + JSON.stringify(value));
            sharedFilename = value[0].$;
            label = value[1].$;
            md5 = value[2].$;
            console.log('........................../deleteVideo queryAllRecord Table_VideoIndex success. sharedFilename' +
                sharedFilename + ' label: ' + label + ' md5: ' + md5);

            // 查询视频表视频文件引用次数
            hbase.queryRecord({
                table: 'Table_Video',
                rowKey: md5,
                columnFamily: 'MetaIndentification',
                column: 'MetaIndentification:RefNumber'
            }, function(err, value) {
                if(err) {
                    res.json({
                        status: 0
                    });
                } else {
                    if(value == null) {
                        res.json({
                            status: 0
                        });
                    } else {
                        var refNumber = value[0].$;
                        console.log('....................../deleteVideo queryRecord Table_Video refNumber: ' + refNumber);

                        // 判断引用次数
                        // 若引用次数为1，说明只有该用户引用该视频文件，hdfs删除视频文件,删除视频表记录
                        // 若引用次数部位1，说明还有其他用户引用该视频文件，将引用次数-1，插入到视频表中
                        if(refNumber == 1) {
                            var filename = md5 + req.body.filename.substring(req.body.filename.lastIndexOf('.'));
                            console.log('....................../deleteVideo deleteVideo filename: ' + filename);

                            hdfs.deleteVideo(filename, function(status) {
                                if(status == '0') {
                                    res.json({
                                        status: 0
                                    });
                                } else {
                                    console.log('....................../deleteVideo deleteVideo success.');

                                    // 查询视频大小
                                    hbase.queryRecord({
                                        table: 'Table_Video',
                                        rowKey: md5,
                                        columnFamily: 'MetaInformation',
                                        column: 'MetaInformation:VideoSize'
                                    }, function(err, value) {
                                        if(err) {
                                            console.log(err);
                                            res.json({
                                                status: 0
                                            });
                                        } else {
                                            size = value[0].$;
                                            console.log('........................../deleteVideo deleteRecord Table_File success. size: ' + size);

                                            // 删除视频索引表
                                            hbase.deleteRecord({
                                                table: 'Table_VideoIndex',
                                                rowKey: video
                                            }, function(err, status) {
                                                if(err) {
                                                    console.log(err);
                                                    res.json({
                                                        status: 0
                                                    });
                                                } else {
                                                    console.log('....................../deleteVideo deleteRecord Table_VideoIndex success');

                                                    // 删除文件表
                                                    hbase.deleteRecord({
                                                        table: 'Table_File',
                                                        rowKey: video
                                                    }, function(err, status) {
                                                        if(err) {
                                                            console.log(err);
                                                            res.json({
                                                                status: 0
                                                            });
                                                        } else {
                                                            console.log('....................../deleteVideo deleteRecord Table_File success');

                                                            // 用户表查询已用空间
                                                            hbase.queryRecord({
                                                                table: 'Table_User',
                                                                rowKey: req.session.user,
                                                                columnFamily: 'BasicInformation',
                                                                column: 'BasicInformation:UsedStorage'
                                                            }, function(err, value) {
                                                                if(err) {
                                                                    console.log(err);
                                                                    res.json({
                                                                        status: 0
                                                                    });
                                                                } else {
                                                                    usedStorage = value[0].$;
                                                                    var newUsedStorage = '' + (parseInt(usedStorage)-parseInt(size));
                                                                    console.log('................................./deleteVideo queryRecord Table_User usedStorage: ' + usedStorage);
                                                                    // 修改用户已用空间
                                                                    hbase.insertRecord({
                                                                        table: 'Table_User',
                                                                        rowKey: req.session.user,
                                                                        columnFamily: 'BasicInformation',
                                                                        column: 'BasicInformation:UsedStorage',
                                                                        columnValue: newUsedStorage
                                                                    }, function(err, status) {
                                                                        if(err) {
                                                                            console.log(err);
                                                                            res.json({
                                                                                status: 0
                                                                            });
                                                                        } else {
                                                                            console.log('....................../deleteVideo insert Table_User success. newUsedStorage: ' + newUsedStorage);

                                                                            // 删除视频表记录
                                                                            hbase.deleteRecord({
                                                                                table: 'Table_Video',
                                                                                rowKey: md5
                                                                            }, function(err, status) {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                    res.json({
                                                                                        status: 0
                                                                                    });
                                                                                } else {
                                                                                    console.log('....................../deleteVideo deleteRecord Table_Video success');

                                                                                    // 删除共享空间记录
                                                                                    if(sharedFilename == '') {
                                                                                        // 删除标签索引表记录
                                                                                        if(label == '') {
                                                                                            // 删除文件成功，返回状态码1
                                                                                            res.json({
                                                                                                status: 1
                                                                                            });
                                                                                        } else {
                                                                                            // 删除标签索引表
                                                                                            deleteTag({
                                                                                                tag: label,
                                                                                                video: video
                                                                                            }, function(status) {
                                                                                                res.json({
                                                                                                    status: status
                                                                                                });
                                                                                            });
                                                                                        }
                                                                                    } else {
                                                                                        // 删除共享空间记录
                                                                                        hbase.deleteRecord({
                                                                                            table: 'Table_SharedSpaceMap',
                                                                                            rowKey: sharedFilename
                                                                                        }, function(err, status) {
                                                                                            if(err) {
                                                                                                res.json({
                                                                                                    status: 0
                                                                                                });
                                                                                            } else {
                                                                                                console.log('...................../deleteVideo delete Table_SharedSpaceMap success. sharedFilename:' + sharedFilename);

                                                                                                // 删除标签索引表记录
                                                                                                if(label == '') {
                                                                                                    // 删除文件成功，返回状态码1
                                                                                                    res.json({
                                                                                                        status: 1
                                                                                                    });
                                                                                                } else {
                                                                                                    // 删除标签索引表
                                                                                                    deleteTag({
                                                                                                        tag: label,
                                                                                                        video: video
                                                                                                    }, function(status) {
                                                                                                        res.json({
                                                                                                            status: status
                                                                                                        });
                                                                                                    });
                                                                                                    /*// 删除标签索引表
                                                                                                     deleteTag({
                                                                                                     tag: label,
                                                                                                     video: video
                                                                                                     }, function(status) {
                                                                                                     res.json({
                                                                                                     status: status
                                                                                                     });
                                                                                                     });*/
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                    }
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
                                    });
                                }
                            });
                        } else {
                            refNumber = '' + (parseInt(refNumber)-1);
                            console.log('..........................uploadHbase insert Table_Video refNumber:' + refNumber);

                            // 视频表中引用次数加1
                            hbase.insertRecord({
                                table: 'Table_Video',
                                rowKey: md5,
                                columnFamily: 'MetaIndentification',
                                column: 'MetaIndentification:RefNumber',
                                columnValue: refNumber
                            }, function(err, status){
                                if(err) {
                                    console.log(err);
                                    flag = 0;
                                    callback &&callback(flag);
                                } else {
                                    console.log('.....................uploadHbase insert Table_Video success.');

                                    // 查询视频大小
                                    hbase.queryRecord({
                                        table: 'Table_Video',
                                        rowKey: md5,
                                        columnFamily: 'MetaInformation',
                                        column: 'MetaInformation:VideoSize'
                                    }, function(err, value) {
                                        if(err) {
                                            console.log(err);
                                            res.json({
                                                status: 0
                                            });
                                        } else {
                                            size = value[0].$;
                                            console.log('........................../deleteVideo deleteRecord Table_File success. size: ' + size);

                                            // 删除视频索引表
                                            hbase.deleteRecord({
                                                table: 'Table_VideoIndex',
                                                rowKey: video
                                            }, function(err, status) {
                                                if(err) {
                                                    console.log(err);
                                                    res.json({
                                                        status: 0
                                                    });
                                                } else {
                                                    console.log('....................../deleteVideo deleteRecord Table_VideoIndex success');

                                                    // 删除文件表
                                                    hbase.deleteRecord({
                                                        table: 'Table_File',
                                                        rowKey: video
                                                    }, function(err, status) {
                                                        if(err) {
                                                            console.log(err);
                                                            res.json({
                                                                status: 0
                                                            });
                                                        } else {
                                                            console.log('....................../deleteVideo deleteRecord Table_File success');

                                                            // 用户表查询已用空间
                                                            hbase.queryRecord({
                                                                table: 'Table_User',
                                                                rowKey: req.session.user,
                                                                columnFamily: 'BasicInformation',
                                                                column: 'BasicInformation:UsedStorage'
                                                            }, function(err, value) {
                                                                if(err) {
                                                                    console.log(err);
                                                                    res.json({
                                                                        status: 0
                                                                    });
                                                                } else {
                                                                    usedStorage = value[0].$;
                                                                    var newUsedStorage = '' + (parseInt(usedStorage)-parseInt(size));
                                                                    console.log('................................./deleteVideo queryRecord Table_User usedStorage: ' + usedStorage);
                                                                    // 修改用户已用空间
                                                                    hbase.insertRecord({
                                                                        table: 'Table_User',
                                                                        rowKey: req.session.user,
                                                                        columnFamily: 'BasicInformation',
                                                                        column: 'BasicInformation:UsedStorage',
                                                                        columnValue: newUsedStorage
                                                                    }, function(err, status) {
                                                                        if(err) {
                                                                            console.log(err);
                                                                            res.json({
                                                                                status: 0
                                                                            });
                                                                        } else {
                                                                            console.log('....................../deleteVideo insert Table_User success. newUsedStorage: ' + newUsedStorage);

                                                                            // 删除共享空间记录
                                                                            if(sharedFilename == '') {
                                                                                // 删除标签索引表记录
                                                                                if(label == '') {
                                                                                    // 删除文件成功，返回状态码1
                                                                                    res.json({
                                                                                        status: 1
                                                                                    });
                                                                                } else {
                                                                                    // 删除标签索引表
                                                                                    deleteTag({
                                                                                        tag: label,
                                                                                        video: video
                                                                                    }, function(status) {
                                                                                        res.json({
                                                                                            status: status
                                                                                        });
                                                                                    });
                                                                                }
                                                                            } else {
                                                                                // 删除共享空间记录
                                                                                hbase.deleteRecord({
                                                                                    table: 'Table_SharedSpaceMap',
                                                                                    rowKey: sharedFilename
                                                                                }, function(err, status) {
                                                                                    if(err) {
                                                                                        res.json({
                                                                                            status: 0
                                                                                        });
                                                                                    } else {
                                                                                        console.log('...................../deleteVideo delete Table_SharedSpaceMap success. sharedFilename:' + sharedFilename);
                                                                                        // 删除标签索引表记录
                                                                                        if(label == '') {
                                                                                            // 删除文件成功，返回状态码1
                                                                                            res.json({
                                                                                                status: 1
                                                                                            });
                                                                                        } else {
                                                                                            // 删除标签索引表
                                                                                            deleteTag({
                                                                                                tag: label,
                                                                                                video: video
                                                                                            }, function(status) {
                                                                                                res.json({
                                                                                                    status: status
                                                                                                });
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }

                                                                            /*// 删除标签索引表
                                                                             deleteTag({
                                                                             tag: label,
                                                                             video: video
                                                                             }, function(status) {
                                                                             res.json({
                                                                             status: status
                                                                             });
                                                                             });*/
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
                            });
                        }
                    }
                }
            });
        }
    });
});

/* 视频打标签
 * req.body: {
 *  catalogue: '/root',
 *  filename: '1.mp4',
 *  tag: '剧情，悬疑'
 * }
 * res: {
 *  status: 0
 * }
 */
router.route('/setTag').post(function (req, res) {
    console.log('..................../setTag post start');

    var videoRowKey = req.session.user + '-' + req.body.catalogue + '-' + req.body.filename;
    var tag = req.body.tag;
    console.log('........................./setTag videoRowKey: ' + videoRowKey + ' tag: ' + tag);

    // 查询视频标签
    // 若不存在标签，新增标签；若已存在标签，删除原有标签，添加新的标签
    hbase.queryRecord({
        table: 'Table_VideoIndex',
        rowKey: videoRowKey,
        columnFamily: 'IndexInformation',
        column: 'IndexInformation:VideoLabel'
    }, function(err, value) {
        if(err) {
            res.json({
                status: 0
            });
        } else {
            console.log('............................./setTag queryRecord Table_VideoIndex success. Table_VideoIndex: ' + value[0].$);

            // 设置视频索引表里文件的标签
            hbase.insertRecord({
                table: 'Table_VideoIndex',
                rowKey: videoRowKey,
                columnFamily: 'IndexInformation',
                column: 'IndexInformation:VideoLabel',
                columnValue: tag
            }, function (err, status) {
                if (err) {
                    console.log(err);
                    res.json({
                        status: 0
                    });
                } else {

                    if(value[0].$ == '') {
                        // 解析标签字符串，向标签索引表添加记录
                        addTag({
                            tag: tag,
                            video: videoRowKey
                        }, function(status) {
                            res.json({
                                status: status
                            });
                        });
                    } else {
                        // 删除标签表的信息
                        deleteTag({
                            tag: value[0].$,
                            video: videoRowKey
                        }, function(status) {
                            if(status == 0) {
                                res.json({
                                    status: status
                                });
                            } else {
                                // 解析标签字符串，向标签索引表添加记录
                                addTag({
                                    tag: tag,
                                    video: videoRowKey
                                }, function(status) {
                                    res.json({
                                        status: status
                                    });
                                });
                            }
                        });
                    }
                }
            });
        }
    });

    /*// 查询视频标签,删除原有标签，添加新的标签
     hbase.queryRecord({
     table: 'Table_VideoIndex',
     rowKey: videoRowKey,
     columnFamily: 'IndexInformation',
     column: 'IndexInformation:VideoLabel'
     }, function(err, value) {
     if (err) {
     res.json({
     status: 0
     });
     } else {
     console.log('............................./setTag queryRecord Table_VideoIndex success. Table_VideoIndex: ' + value[0].$);

     if(value[0].$ == obj.tag) {
     res.json({
     status: 1
     });
     } else {
     // 设置视频索引表里文件的标签
     hbase.insertRecord({
     table: 'Table_VideoIndex',
     rowKey: videoRowKey,
     columnFamily: 'IndexInformation',
     column: 'IndexInformation:VideoLabel',
     columnValue: tag
     }, function (err, status) {
     if (err) {
     console.log(err);
     res.json({
     status: 0
     });
     } else {
     // 删除旧的标签
     deleteTag({
     tag: value[0].$,
     video: videoRowKey
     }, function(status) {
     if(status == 0) {
     res.json({
     status: status
     });
     } else {
     // 解析标签字符串，向标签索引表添加记录
     addTag({
     tag: tag,
     video: videoRowKey
     }, function(status) {
     res.json({
     status: status
     });
     });
     }
     });
     }
     });
     }
     }
     });*/
});

/* 搜索视频
 * req.body: {
 *  type: 'filename',
 *  content: '11',
 *  label: 0
 * }
 * res: {
 *  status: 0,
 *  err: '',
 *  data: ['1.mp4', '']
 * }
 */
router.route('/searchVideo').post(function(req, res){
    var videoList = new Array();

    if(req.body.label == 0) {
        // 在用户视频中搜索
        if(req.body.type == 'filename') {
            // 根据文件名在视频索引表中搜索
            var video = req.session.user + '-/root-' + req.body.content;
            console.log('......................./searchVideo video: ' + video);

            /*hbase.queryRowKeyAndRecord({
             table: 'Table_VideoIndex',
             startRow: video,
             column:'IndexInformation:VideoState'
             }, function(err,rows) {
             if(err) {
             console.log(err);
             res.json({
             status: 0,
             err: err,
             data: null
             });
             } else {
             console.log('......................./searchVideo rows: ' + JSON.stringify(rows));

             for(var i = 0; i < rows.length; i++) {
             videoList.push(rows[i].key.substring(rows[i].key.indexOf('-', rows[i].key.indexOf('-')+1)+1));
             }

             res.json({
             status: 1,
             err: null,
             data: videoList
             });
             }
             });*/
            hbase.queryRecord({
                table: 'Table_VideoIndex',
                rowKey: video,
                columnFamily: 'IndexInformation',
                column:'IndexInformation:VideoState'
            }, function(err,rows) {
                if(err) {
                    console.log(err);
                    res.json({
                        status: 0,
                        err: err,
                        data: null
                    });
                } else {
                    console.log('......................./searchVideo rows: ' + JSON.stringify(rows));

                    if(rows == null) {
                        res.json({
                            status: 1,
                            err: null,
                            data: null
                        });
                    } else {
                        /*for(var i = 0; i < rows.length; i++) {
                         videoList.push(rows[i].key.substring(rows[i].key.indexOf('-', rows[i].key.indexOf('-')+1)+1));
                         }

                         res.json({
                         status: 1,
                         err: null,
                         data: videoList
                         });*/
                        videoList.push(req.body.content);

                        res.json({
                            status: 1,
                            err: null,
                            data: videoList
                        });
                    }
                }
            });
        } else {
            // 根据标签名在视频标签表中搜索
            var startLabel = req.body.content + '-' + req.session.user + '-/root-';
            var endLabel = req.body.content + '-' + req.session.user + '-/root.';

            hbase.queryRowKeyAndRecord({
                table: 'Table_VideoLabel',
                startRow: startLabel,
                endRow: endLabel,
                column: 'BasicMap:map'
            }, function(err,rows) {
                if(err) {
                    res.json({
                        status: 0,
                        err: err,
                        data: null
                    });
                } else {
                    console.log('......................./searchVideo rows: ' + JSON.stringify(rows));

                    // 提取行健的文件名
                    var videoList = new Array();

                    for(var i = 1; i < rows.length; i++) {
                        //videoList.push((rows[i].key.substring(rows[i].key.indexOf('-',rows[i].key.indexOf('-')+1)+1)).replace('-', '/'));
                        videoList.push(rows[i].key.substring(rows[i].key.indexOf('-',rows[i].key.indexOf('-',rows[i].key.indexOf('-')+1)+1)+1));
                    }

                    res.json({
                        status: 1,
                        err: null,
                        data: videoList
                    });
                }
            });
        }
    } else  {
        // 在共享空间视频中搜索
        if(req.body.type == 'filename') {
            // 根据文件名在视频索引表中搜索
            //var video = shareUser + '-/root-' + req.body.content;
            console.log('......................./searchVideo video: ' + req.body.content);

            /*hbase.queryRowKeyAndRecord({
             table: 'Table_VideoIndex',
             startRow: video,
             column:'IndexInformation:VideoState'
             }, function(err,rows) {
             if(err) {
             console.log(err);
             res.json({
             status: 0,
             err: err,
             data: null
             });
             } else {
             console.log('......................./searchVideo rows: ' + JSON.stringify(rows));

             for(var i = 0; i < rows.length; i++) {
             videoList.push(rows[i].key.substring(rows[i].key.indexOf('-', rows[i].key.indexOf('-')+1)+1));
             }

             res.json({
             status: 1,
             err: null,
             data: videoList
             });
             }
             });*/

            hbase.queryRecord({
                table: 'Table_SharedSpaceMap',
                rowKey: req.body.content,
                columnFamily: 'BasicInformation',
                column: 'BasicInformation:Filemap'
            }, function(err,rows) {
                if(err) {
                    res.json({
                        status: 0,
                        err: err,
                        data: null
                    });
                } else {
                    if(rows == null) {
                        res.json({
                            status: 1,
                            err: null,
                            data: null
                        });
                    } else {
                        console.log('......................./searchVideo rows: ' + JSON.stringify(rows));

                        /*// 提取行健的文件名
                         var videoList = new Array();

                         for(var i = 1; i < rows.length; i++) {
                         videoList.push((rows[i].key.substring(rows[i].key.indexOf('-',rows[i].key.indexOf('-')+1)+1)).replace('-', '/'));
                         }

                         res.json({
                         status: 1,
                         err: null,
                         data: videoList
                         });*/
                        videoList.push(req.body.content);
                        console.log('......................./searchVideo rows: ' + JSON.stringify(videoList));

                        res.json({
                            status: 1,
                            err: null,
                            data: videoList
                        });
                    }
                }
            });
        } else {
            res.json({
                status: 0
            });
            /*// 根据标签名在视频标签表中搜索
             var startLabel = req.body.content + '-' + shareUser + '-/root-';
             var endLabel = req.body.content + '-' + shareUser + '-/root.';

             hbase.queryRowKeyAndRecord({
             table: 'Table_VideoLabel',
             startRow: startLabel,
             endRow: endLabel
             }, function(err,rows) {
             if(err) {
             res.json({
             status: 0,
             err: err,
             data: null
             });
             } else {
             // 提取行健的文件名
             var videoList = new Array();

             for(var i = 1; i < rows.length; i++) {
             videoList.push(rows[i].key.substring(rows[i].key.indexOf(rows[i].key.indexOf('-', rows[i].key.indexOf('-')+1)+1)+1));
             }

             res.json({
             status: 1,
             err: null,
             data: videoList
             });
             }
             });*/
        }
    }
});

/* 获取共享视频元信息
 * req.param: {
 *  filename: 'a.mp4'
 * }
 * res: {
 *  status: 1,
 *  resolution: '1920*1080',
 *  size: 2323424,
 *  timeLength: '11:11',
 *  type: 'mp4'
 * }
 */
router.route('/sharedVideoInfo').get(function(req, res) {
    var filename = req.query.filename;
    console.log('..................../sharedVideoInfo get start. filename: ' + filename);
    // 查询用户视频文件
    hbase.queryRecord({
        table: 'Table_SharedSpaceMap',
        rowKey: filename,
        columnFamily: 'BasicInformation',
        column: 'BasicInformation:Filemap'
    }, function(err, value) {
        if(err) {
            res.json({
                status: 0
            });
        } else {
            if(value == null){
                res.json({
                    status: 0
                });
            } else {
                var video = value[0].$;
                console.log('........................./shareVideo query Table_SharedSpaceMap success. video: ' + value[0].$);

                // 查询视频索引表获得视频md5码
                var videoInfo = {};
                hbase.queryAllRecord({
                    table: 'Table_VideoIndex',
                    rowKey: video,
                    columnFamily: 'IndexInformation'
                }, function (err, value) {
                    if (err) {
                        console.log(err);
                        res.json({
                            status: 0
                        });
                    } else {
                        console.log('.........................../viewInfo videoIndex: ' + JSON.stringify(value));

                        value.forEach(function(item, index) {
                            videoInfo[item.column.substring(item.column.indexOf(':')+1)] = value[index].$;
                        });

                        // 查询视频表获得视频元信息
                        hbase.queryAllRecord({
                            table: 'Table_Video',
                            rowKey: videoInfo.VideoMD5,
                            columnFamily: 'MetaInformation'
                        }, function(err, value) {
                            if(err) {
                                console.log(err);
                                res.json({
                                    status: 0
                                });
                            } else {
                                console.log(value);

                                videoInfo['status'] = 1;
                                videoInfo['resolution'] = value[0].$;
                                videoInfo['size'] = value[1].$;
                                videoInfo['timeLength'] = value[2].$;
                                videoInfo['type'] = value[3].$;

                                console.log('........................./videoInfo    videoInfo: ' + JSON.stringify(videoInfo));
                                res.json(videoInfo);
                            }
                        });
                    }
                });
                /*// 查询视频索引表获得视频md5码
                var md5 = null;
                hbase.queryRecord({
                    table: 'Table_VideoIndex',
                    rowKey: video,
                    columnFamily: 'IndexInformation',
                    column: 'IndexInformation:VideoMD5'
                }, function (err, value) {
                    if (err) {
                        console.log(err);
                        res.json({
                            status: 0
                        });
                    } else {
                        md5 = value[0].$;   console.log('.........................../viewInfo md5: ' + md5);

                        // 查询视频表获得视频元信息
                        hbase.queryAllRecord({
                            table: 'Table_Video',
                            rowKey: md5,
                            columnFamily: 'MetaInformation'
                        }, function(err, value) {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log(value);
                                res.json({
                                    status: 1,
                                    resolution: value[0].$,
                                    size: value[1].$,
                                    timeLength: value[2].$,
                                    type: value[3].$
                                });
                            }
                        });
                    }
                });*/
            }
        }
    })
});

/*在线播放共享文件,req.session.video保存需要播放的视频的信息
 req.body：{
 filename: 'a.mp4'
 }
 res: {
 status: 1
 }*/
router.route('/onlineSharedVideo').post(function (req, res) {
    console.log('.........................../onlineVideo  req.body:  ' + JSON.stringify(req.body));

    // 共享表查询用户视频文件信息
    hbase.queryRecord({
        table: 'Table_SharedSpaceMap',
        rowKey: req.body.filename,
        columnFamily: 'BasicInformation',
        column: 'BasicInformation:Filemap'
    }, function(err, value) {
        if(err) {
            res.json({
                status: 0
            });
        } else {
            if(value == null) {
                res.json({
                    status: 0
                });
            } else {
                // 保存需要播放视频的信息
                req.session.video = value[0].$;
                console.log('.........................../onlineVideo  req.session.video: ' + req.session.video);

                res.json({
                    status: 1
                });
            }
        }
    });

    // 返回视频播放页面
    //res.redirect('/userPlayVideo');
});

/* 标签表中添加标签信息
 * obj: {
 *  tag: '剧情，悬疑',
 *  video: 'ltr-/root-1.mp4'
 * }
 * callback: status （0表示添加成功，1表示添加失败）
 */
function addTag(obj, callback) {
    var tags = obj.tag.split(',');
    //var tagRowKey = null;
    console.log('..........................addTag  tags: ' + tags + ' length: ' + tags.length + 'video: ' + obj.video);

    for (var i = 0; i < tags.length; i++) {
        (function(i) {
            var tagRowKey = tags[i] + '-' + obj.video;

            if (i != tags.length - 1) {
                hbase.insertRecord({
                    table: 'Table_VideoLabel',
                    rowKey: tagRowKey,
                    columnFamily: 'BasicMap',
                    column: 'BasicMap:map',
                    columnValue: '0'
                }, function (err, status) {
                    if (err) {
                        console.log(err);

                        callback && callback(0);
                    } else {
                        console.log('.....................addTag insert Table_VideoLabel success i: ' + i);

                        var startRowKey = tagRowKey.substring(0,tagRowKey.indexOf('-', tagRowKey.indexOf('-', tagRowKey.indexOf('-')+1)+1)) + '-';
                        console.log('......................addTag startRowKey: ' + startRowKey);

                        hbase.insertRecord({
                            table: 'Table_VideoLabel',
                            rowKey: startRowKey,
                            columnFamily: 'BasicMap',
                            column: 'BasicMap:map',
                            columnValue: '0'
                        }, function (err, status) {
                            if (err) {
                                console.log(err);

                                callback && callback(0);
                            } else {
                                var endRowKey = tagRowKey.substring(0,tagRowKey.indexOf('-', tagRowKey.indexOf('-', tagRowKey.indexOf('-')+1)+1)) + '.';
                                console.log('......................addTag endRowKey: ' + endRowKey);

                                hbase.insertRecord({
                                    table: 'Table_VideoLabel',
                                    rowKey: endRowKey,
                                    columnFamily: 'BasicMap',
                                    column: 'BasicMap:map',
                                    columnValue: '0'
                                }, function (err, status) {
                                    if (err) {
                                        console.log(err);

                                        callback && callback(0);
                                    } else {
                                        console.log('.....................addTag insert Table_VideoLabel success tagRowKey: ' + tagRowKey);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                hbase.insertRecord({
                    table: 'Table_VideoLabel',
                    rowKey: tagRowKey,
                    columnFamily: 'BasicMap',
                    column: 'BasicMap:map',
                    columnValue: '0'
                }, function (err, status) {
                    if (err) {
                        console.log(err);

                        callback && callback(0);
                    } else {
                        console.log('...................../setTag insert Table_VideoLabel success last tag');

                        var startRowKey = tagRowKey.substring(0,tagRowKey.indexOf('-', tagRowKey.indexOf('-', tagRowKey.indexOf('-')+1)+1)) + '-';
                        console.log('......................addTag startRowKey: ' + startRowKey);

                        hbase.insertRecord({
                            table: 'Table_VideoLabel',
                            rowKey: startRowKey,
                            columnFamily: 'BasicMap',
                            column: 'BasicMap:map',
                            columnValue: '0'
                        }, function (err, status) {
                            if (err) {
                                console.log(err);

                                callback && callback(0);
                            } else {
                                var endRowKey = tagRowKey.substring(0,tagRowKey.indexOf('-', tagRowKey.indexOf('-', tagRowKey.indexOf('-')+1)+1)) + '.';
                                console.log('......................addTag endRowKey: ' + endRowKey);

                                hbase.insertRecord({
                                    table: 'Table_VideoLabel',
                                    rowKey: endRowKey,
                                    columnFamily: 'BasicMap',
                                    column: 'BasicMap:map',
                                    columnValue: '0'
                                }, function (err, status) {
                                    if (err) {
                                        console.log(err);

                                        callback && callback(0);
                                    } else {
                                        console.log('.....................addTag insert Table_VideoLabel success tagRowKey: ' + tagRowKey);

                                        callback && callback(1);
                                    }
                                });
                            }
                        });

                    }
                });
            }
        })(i)
    }
}

/* 标签表中删除标签信息
 * obj: {
 *  tag: '剧情，悬疑',
 *  video: 'ltr-/root-1.mp4'
 * }
 * callback: status （0表示删除成功，1表示删除失败）
 */
function deleteTag(obj, callback) {
    var tags = obj.tag.split(',');
    console.log('..........................addTag  tags: ' + tags);

    // 删除标签索引表
    tags.forEach(function(l, index) {
        if (index != tags.length - 1) {
            hbase.deleteRecord({
                table: 'Table_VideoLabel',
                rowKey: l + '-' + obj.video
            }, function (err, status) {
                if (err) {
                    console.log(err);

                    callback && callback(0);
                } else {
                    console.log('......................deleteTag delete Table_VideoLabel success label: ' + l);

                    hbase.deleteRecord({
                        table: 'Table_VideoLabel',
                        rowKey: l + '-' + obj.video.substring(0, obj.video.indexOf('-', obj.video.indexOf('-')+1)) + '-'
                    }, function (err, status) {
                        if (err) {
                            console.log(err);

                            callback && callback(0);
                        } else {
                            console.log('......................deleteTag delete Table_VideoLabel success label: ' +
                                l + '-' + obj.video.substring(0, obj.video.indexOf('-', obj.video.indexOf('-')+1)) + '-');

                            hbase.deleteRecord({
                                table: 'Table_VideoLabel',
                                rowKey: l + '-' + obj.video.substring(0, obj.video.indexOf('-', obj.video.indexOf('-')+1)) + '.'
                            }, function (err, status) {
                                if (err) {
                                    console.log(err);

                                    callback && callback(0);
                                } else {
                                    console.log('......................deleteTag delete Table_VideoLabel success label: ' +
                                        l + '-' + obj.video.substring(0, obj.video.indexOf('-', obj.video.indexOf('-')+1)) + '.');
                                }
                            });
                        }
                    });
                }
            });
        } else {
            hbase.deleteRecord({
                table: 'Table_VideoLabel',
                rowKey: l + '-' + obj.video
            }, function (err, status) {
                if (err) {
                    console.log(err);

                    callback && callback(0);
                } else {
                    console.log('...................../deleteTag delete Table_VideoLabel success last tag');

                    hbase.deleteRecord({
                        table: 'Table_VideoLabel',
                        rowKey: l + '-' + obj.video.substring(0, obj.video.indexOf('-', obj.video.indexOf('-')+1)) + '-'
                    }, function (err, status) {
                        if (err) {
                            console.log(err);

                            callback && callback(0);
                        } else {
                            console.log('......................deleteTag delete Table_VideoLabel success label: ' +
                                l + '-' + obj.video.substring(0, obj.video.indexOf('-', obj.video.indexOf('-')+1)) + '-');

                            hbase.deleteRecord({
                                table: 'Table_VideoLabel',
                                rowKey: l + '-' + obj.video.substring(0, obj.video.indexOf('-', obj.video.indexOf('-')+1)) + '.'
                            }, function (err, status) {
                                if (err) {
                                    console.log(err);

                                    callback && callback(0);
                                } else {
                                    console.log('......................deleteTag delete Table_VideoLabel success label: ' +
                                        l + '-' + obj.video.substring(0, obj.video.indexOf('-', obj.video.indexOf('-')+1)) + '.');

                                    callback && callback(1);
                                }
                            });
                        }
                    });
                }
            });
        }
    })
}

module.exports = router;
