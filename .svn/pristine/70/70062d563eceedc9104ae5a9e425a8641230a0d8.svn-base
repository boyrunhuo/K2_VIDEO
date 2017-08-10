/**
 * Created by gem-kerion on 2017/7/8.
 */

function jump_userChangePW(){
    window.location.href = "/changePwd";
}
function jump_userViewInformation(){
    window.location.href = "/userViewInformation";
}
function jump_login(){
    window.location.href = "/login";
}
function jump_home(){
    window.location.href = "/home";
}
function bytesToSize(bytes) { /*字节换算*/
    if (bytes == 0) return '0 B';
    var k = 1024;
    sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(4) + ' ' + sizes[i];
}
function formatSeconds(a) { /*时间转换*/
    var hh = parseInt(a/3600);
    if(hh<10) hh = "0" + hh;
    var mm = parseInt((a-hh*3600)/60);
    if(mm<10) mm = "0" + mm;
    var ss = parseInt((a-hh*3600)%60);
    if(ss<10) ss = "0" + ss;
    var length = hh + ":" + mm + ":" + ss;
    if(a>0){
        return length;
    }else{
        return "NaN";
    }
}

$(document).ready(function(){
    getVideoList();/*获取列表*/

     $("#videoInforConfirmBtn").bind('click',function(){
         $(".videoInfor").slideToggle();
     });

    $('#searchVideoBtn').click(function(){ /*搜索文件*/
        /*检测搜索框是否为空*/
        var search_content = $('input#searchContent').val();

        if(search_content==''||search_content==null){
            alert("搜索内容不能为空！");
        }else{
            searchVideo();
        }
    });

    /*------------------------------------------点击获取文件名从而在线播放------------------------------------------*/
    $('body').on("click",'.Vname',function (e) {
        var filename=$(this).text();
        console.log(filename);

        $.ajax({
            url: "/onlineSharedVideo",
            type: "POST",
            dataType: "json",
            data:{
                'catalogue':'/root',
                'filename':filename
            },
            success: function (res) {
                if(res.status == 0){
                    alert("播放失败！");
                }else if(res.status==1){
                    window.location.href = '/userPlayVideo';
                }
            }
        })
    })

});

/*var videoName=new Array;*///用于记录视频列表的名字，判断上传的文件是否重名

/*--------------------------------------------------获取列表-------------------------------------------------------*/
function getVideoList(){
    /*videoName.splice(0,videoName.length);*///先进行数组清空
    $('#videolist').html("");
    $.ajax({
        url: '/getSharedVideo',
        type: "GET",
        success: function (result) {
            console.log("----------- success-------------");
            if (result.status == 0) {
                alert("返回列表失败");
            } else if (result.status == 1) {

                for(var i=0;i<result.data.length;i++)
                {
                    /*videoName.push(result.data[i]);*/
                    $("#videolist").append(
                        '<tr >' +
                        '<td ><input type="checkbox" name="select"></td >'+
                         '<td class="videoname" align="center"  >' + '<a class="Vname" href="javascript:void(0)" style="text-decoration: none">'+result.data[i]+'</a>' +
                        '</td>'+
                         '<td class="videooption"> <ul  ><li><a class="each-download" href="javascript:void(0)">下载</a> </li>' +
                        ' <li><a href="javascript:void(0)" id="checkVideoInfor" onclick="getVideoInfor(this)">查看</a></li> ' +
                        '</ul> ' +
                        '</td>' +
                        '</tr>'
                    )
                }
            }


            /*-----------------------隐藏显示列表-----------------------------*/
            var rows = document.getElementsByClassName("videooption");
            for (var i = 0, len = rows.length; i < len; i++) {
                rows[i].onmouseover = function () {
                    this.style.opacity = "1";
                    /* this.className += 'hilite';*/
                };
                rows[i].onmouseout = function () {
                    this.style.opacity = "0";

                }
            }
        }
    });
}

/*--------------------------------------------------------------共享空间的搜索文件--------------------------------------------*/
function searchVideo(){
    var search_content = $('input#searchContent').val(); /*搜索内容*/

    /*videoName.splice(0,videoName.length);*///先进行数组清空
    $('#videolist').html("");

    $.ajax({
        url: '/searchVideo',
        type: 'POST',
        data: {"content": search_content, "type": "filename", "label": 1},
        dataType: 'json',
        success: function (res) {
            if(res.data==''||res.data==null){
                alert("没有相关视频符合搜索要求！");
            }else if (res.status == 0) {
                alert("搜索视频失败!");
            } else if (res.status == 1) {
                alert("搜索视频成功！");
                for(var i=0;i<res.data.length;i++)
                {
                    /*videoName.push(res.data[i]);*/
                    $("#videolist").append(
                        '<tr >' + '<td ><input type="checkbox" name="select"></td >'+
                        '<td class="videoname" align="center"  >'+
                        '<a class="Vname" href="javascript:void(0)" style="text-decoration: none">'+res.data[i]+'</a>'+
                        '</td>'+
                        '<td class="videooption"> ' +
                        '<ul  >' +
                        '<li><a class="each-download" href="javascript:void(0)">下载</a> </li>' +
                        ' <li><a href="javascript:void(0)" id="checkVideoInfor" onclick="getVideoInfor(this)">查看</a></li>' +
                        ' </ul>' +
                        ' </td>' +
                        '</tr>'
                    )
                }

            }

            /*-----------------------隐藏显示列表-----------------------------*/
            var rows = document.getElementsByClassName("videooption");
            for (var i = 0, len = rows.length; i < len; i++) {
                rows[i].onmouseover = function () {
                    this.style.opacity = "1";
                    /* this.className += 'hilite';*/
                };
                rows[i].onmouseout = function () {
                    this.style.opacity = "0";
                }
            }
        },
        error: function () {
            alert("搜索视频不成功!");
        }
    })
}

/*-----------------------查看视频元信息-----------------------*/
/*var checkVideoInfor = document.getElementById("checkVideoInfor");
 checkVideoInfor.attachEvent("onclick",getVideoInfor());*/
function getVideoInfor(elem){
    var getFilename = $(elem).parent().parent().parent().siblings().text();/*通过节点获取文件名*/
    $.ajax({
        url:'/sharedVideoInfo',
        type:'GET',
        data:{"filename":getFilename},
        success:function(res){
            if(res.status==1) {
                /*var obj=eval("("+res+")");*/
                res.size = bytesToSize(res.size);/*字节转换*/
                res.timeLength = formatSeconds(res.timeLength);/*时间转换*/
                document.getElementById('videoSize').innerHTML = res.size;
                document.getElementById('videoType').innerHTML = res.type;
                document.getElementById('videoTimeLength').innerHTML = res.timeLength;
                document.getElementById('videoResolution').innerHTML = res.resolution;
                $('.videoInfor').show();/*显示视频元信息表*/
            }else {
                alert("获取视频元信息失败！");
            }
        },
        error:function(){
            alert("查看视频元信息失败!");
        }
    })
}

/*-----------------------下载视频----------------------*/
$('#downloadVideo').click(function(){
   /* downloading();*//*按钮显示下载中*/
    downloadVideo();/*下载视频*/
});
//点击视频右侧的下载按钮
$('body').on('click','.each-download',function(e){
    var videoName=$(this).parent().parent().parent().prev().find('a').text();
    console.log(videoName);
    getVideo(videoName);
});

function downloadVideo(){
    var id_array=new Array();
    $('input[name="select"]:checked').each(function(){
        id_array.push($(this).parent().next().text());//向数组中添加元素  
    });

    if(id_array.length==0)
    {
        alert("请选择视频进行下载");
        /*endDownload();*/
        return false;
    }
    else
    {   //循环获取所选视频的下载链接
        for(var i=0;i<id_array.length;i++)
        {
            getVideo(id_array[i]);
        }
    }
}
function getVideo(videoName)
{
        $.ajax({
            url: '/shareDownload',
            type: 'POST',
            data:{videoName:videoName},
            success: function (res) {
                if(res.status==0){

                    $('#excute-download').attr("href", res.url);
                    $('#excute-download').attr("download",res.videoName);
                    $('#excute').click();
                  /*  endDownload();*/
                }
                else if(res.status==1){
                    alert("视频在服务器上不存在");
                    /*endDownload();*/
                }else if(res.status==2){
                    alert("服务器错误");
                   /* endDownload();*/
                }
            },
            error:function(){
                alert("获取视频文件下载链接失败！");
              /* endDownload();*/
            }
        });

}
