/**
 * Created by #赵堃圻# on 2017/6/21.
 */


function checkUpload() {


    var file = document.getElementById("uploadbtn").files[0];
    console.log(file);
    if (file == null) {
        alert("没有选择文件");
    } else {
        /*  var ajaxFlag = true;*/
        /*var file = $('#uploadbtn')*/
        /* if(file.length!=0){}*/
        var name = file.name;//文件名
        var size = file.size;//大小

        var ext = name.lastIndexOf(".");
        var fileTye = name.substring(ext, name.length);
        fileTye = fileTye.toLocaleLowerCase();
        console.log(fileTye);

        if (fileTye != ".mp4" && fileTye != ".ogg" && fileTye != ".webm") {
            alert("只能上传mp4、ogg、webm类型")
        } else {



                    $.ajax({
                        url: "/getUsedStorage",
                        type: "GET",
                       // dataType: "application/json",
                        //async: false,//设置同步方式，非异步！
                        /*   cache:false,//严格禁止缓存！*/
                        success: function (data) {
							console.log(storage);
                            var storage = size + parseInt(data.usedStorage);//size+可用空间
                            if (storage > 6442450944) {
                                alert("可用空间不足，无法上传");
								return false;
                                /* ajaxFlag = false;*/
                            } else {
                                browserMD5File(file, function (err, md5) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log(md5);
                                        console.log(name);

                                $.ajax({
                                    url: "/checkVideo",
                                    type: "POST",
                                    dataType: "json",
                                   // async: false,//设置同步方式，非异步！
                                    /*cache:false,//严格禁止缓存！*/
                                    data: {
                                        'usedStorage': storage,
                                        'md5': md5,
                                        'location': '/root',
                                        'filename': name,
                                    },

                                    success: function (data) {


                                        /* if (data.status == 1) {

                                         $.ajax({
                                         url: "/uploadVideo",
                                         type: "POST",
                                         success: function (res) {
                                         console.log(res.status);

                                         }
                                         })
                                         return true;
                                         }*/
                                        if (data.status == 0) {
                                            /*  ajaxFlag = false;//上传失败*/
                                            alert("上传成功");
                                            return false;
                                        } else if (data.status == 1) {
                                            showUploading();
                                            $('#videoForm').submit();

                                            /*    $("#excute-upload").css({color:"red"});
                                             $("#excute-upload").innerHTML="上传中";*/


                                            // ajaxFlag=true;

                                        }


                                    },
                                    complete: function () {
                                        endUploadShow();
                                    }
                                })
                                    }
                                })
                            }
                        }
                    })

        }
    }


    /* if (!ajaxFlag) {
     return false;
     } else {
     return true;//返回true，提交form
     }*/


}

function showUploading() {
    document.getElementById("excute-upload").innerHTML = "上传中";
    document.getElementById("excute-upload").style.color = "#3399ff";
}

function endUploadShow() {
    document.getElementById("excute-upload").innerHTML = "上传";
    document.getElementById("excute-upload").style.color = "#4F4F4F";
}

/*
 $("#uploadbtn").on('change', function (e) {
 var file = e.target.files;
 var len = file.length;

 for (var i = 0; i <= len; i++) {
 var md5 = hex_md5(file[i]);//md5
 var name = file[i].name;//文件名
 var size = file[i].size;//大小
 var path//路径
 console.log(md5)

 $.ajax({
 url: "/getUsedStorage",
 type: "GET",

 success: function (data) {
 var storage = size + data.usedStorage;//size+可用空间
 if (storage > 6442450944) {
 alert("可用空间不足，无法上传");
 } else {
 $.ajax({
 url: "/checkVideo",
 type: "POST",
 dataType:"json",
 data: {
 'usedStorage': storage,
 'md5': md5,
 'location': '/root',
 'filename': name,
 },
 success: function (data) {
 if (data.status == 1) {
 $.ajax({
 url: "/uploadVideo",
 type: "POST",
 success: function (res) {
 alert(res.status);
 }
 })
 } else if (data.status == 0) {
 return true;
 } else {
 alert("服务器开小差");
 }
 }
 })
 }
 }
 })
 }
 })
 */


