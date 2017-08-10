/**
 * Created by #赵堃圻# on 2017/7/6.
 */

$(function () {
    getFileList();
});

/*---------------------------------------------------------获得文件列表------------------------------------------------------*/
function getFileList() {
    $.ajax({
        url: "/adminGetVideo",
        type: "POST",
        beforeSend: function () {

            $("#wait").css({"display": "block"})
        },
        success: function (res) {
            var share;
            /*var labelMD5=new Array();*/
            console.log("获取文件列表成功")
            $('#fileList').html("");
            for (var i = 0; i < res.videoList.length; i++) {
                if (res.videoList[i].videoState == '0') {
                    share = "未共享";
                } else {
                    share = "已共享";
                }
                /*   labelMD5.push(res.videoList[i].videoMD5);*/

                //将字节转换成MB单位
              /*  var Storage=(res.videoList[i].videoSize)/(1024*1024);
                Storage=Storage.toString();
                Storage=Storage.substring(0,Storage.indexOf(".") + 3);

                var time=(res.videoList[i].videoTimeLength)/60;
                time=time.toString();
                time=time.substring(0,time.indexOf(".") + 3);*/

                var Storage=bytesToSize(res.videoList[i].videoSize);
                var time=formatSeconds(res.videoList[i].videoTimeLength);
                $("#fileList").append(
                    '<tr>' + '<td><input type="checkbox" name="videoselect"></td>'
                    + '<td>' + res.videoList[i].videoName + '</td>'
                    + '<td>' + res.videoList[i].videoResolution + '</td>'
                    + '<td>' + Storage  + '</td>'
                    + '<td>' + time  + '</td>'
                    + '<td>' + res.videoList[i].videoType + '</td>'
                    + '<td>' + res.videoList[i].uname + '</td>'
                    + '<td>' + share + '</td>'
                    + '<td style="display: none">' +res.videoList[i].videoMD5 + '</td>'
                    + '<td>' + '<button class="btn btn-default labelbtn" id="">查看标签</button>' + '</td>'

                    + '</tr>'
                )
            }

            /*  $(".videoInf").click(function () {
             var tb = document.getElementById("vinf");
             var td1 = tb.rows[1].cells[0];
             var td2 = tb.rows[1].cells[1];
             var td3 = tb.rows[1].cells[2];
             var td4 = tb.rows[1].cells[3];
             document.getElementById("vInftable").style.opacity="1";
             td1.innerHTML="11";
             td2.innerHTML="22";
             td3.innerHTML="33";
             td4.innerHTML="44";


             })*/
            /*-------------------------------------------------------------查看标签---------------------------------------------------------*/
            $(".labelbtn").click(function () {

                var labelmd5 = $(this).parent().prev().text();//获得文件MD5
                $('#labP').html("");
                $.ajax({
                 url:"/adminFileInf",
                 type:"POST",
                 data:{
                 "videoMD5":labelmd5
                 },
                 success:function (res) {

                     if(res.labelListUnique[0]==""){
                        $("#labP").append("暂无标签");
                     }else{
                        for(var i=0;i<res.labelListUnique.length;i++){
                         $("#labP").append(res.labelListUnique[i]);
                         $("#labP").append(" ");
                        }

                    }
                 }


                  
                 });
                $("#label").show();

            })
        },
        complete: function () {

            $('#wait').css({"display": "none"})
        }
    })


}
$("#labclose").click(function () {
    $("#label").hide();
})
/*----------------------------------------------------------统计信息--------------------------------------------------------------------*/
$("#totalInfbtn").click(function () {
    $("#totalInf").show();
    showTotalInf();

})

$("#infclose").click(function () {
    $("#totalInf").hide();
})

function showTotalInf() {


    /*  var obj = document.getElementById("fileList");
     var i = 0;
     var storage = 0;
     while (i < obj.rows.length) {
     i++;
     var storage = parseInt(storage) + parseInt((obj.rows[i - 1].cells[3]).innerHTML);

     }
     $("#totalInfTable tr:eq(0) td:eq(1)").text(i);
     console.log("文件个数：" + $("#totalInfTable tr:eq(0) td:eq(1)").text())//获得文件数量
     $("#totalInfTable tr:eq(1) td:eq(1)").text(storage);
     console.log("已用空间大小：" + storage);
     $("#totalInfTable tr:eq(2) td:eq(1)").text(670000000 - storage);*/
    $.ajax({
        url: "/adminStatistics",
        type: "POST",
        success: function (res) {

            var userStorage = (res.fileUseMemory) / (1024 * 1024);
            userStorage = userStorage.toString();
            userStorage = userStorage.substring(0, userStorage.indexOf(".") + 3);

            var totalStorage = (res.fileTotalMemory) / (1024 * 1024);
            totalStorage = totalStorage.toString();
            totalStorage = totalStorage.substring(0, totalStorage.indexOf(".") + 3);

            $("#totalInfTable tr:eq(0) td:eq(1)").text(res.fileCount);

            $("#totalInfTable tr:eq(1) td:eq(1)").text(userStorage + 'MB');

            $("#totalInfTable tr:eq(2) td:eq(1)").text((totalStorage - userStorage) + 'MB');
        }
    })

}

/*--------------------------------------------------------------日志信息------------------------------------------------------------------*/
$("#logbtn").click(function () {
    $("#Log").show();

    showLog();

})
$("#logclose").click(function () {
    $("#Log").hide();
})


function showLog() {
    $('#logTable').html("");
    $.ajax({
        url: "/adminLog",
        type: "POST",
        beforeSend: function () {

            $("#wait").css({"display": "block"})
        },
        success: function (res) {
            var state;
            console.log("获取日志成功")

            for (var i = 0; i < res.videoList.length; i++) {
                if (res.videoList[i].status == 0) {
                    state = '下载';
                } else if (res.videoList[i].status == 1) {
                    state = '上传';
                }
                var videoName = res.videoList[i].videoName.substring(res.videoList[i].videoName.lastIndexOf('/') + 1);
                $("#logTable").append(
                    '<tr>'
                    + '<td>' + res.videoList[i].uname + '</td>'
                    + '<td>' + videoName + '</td>'
                    + '<td>' + state + '</td>'
                    + '<td>' + res.videoList[i].time + '</td>'
                    + '</tr>'
                )
            }
        },
        complete: function () {

            $('#wait').css({"display": "none"})
        }
    })
}

/*$('#search-content').change(function(){
 console.log($('#search-content').val());
 if($('#search-content').val()==''){
 showLog();
 }
 });*/

$("#search-content").bind('input porpertychange', function () {

    if ($('#search-content').val() == '') {
        showLog();
    }
});

$('#search-button').click(function () {
    var searchName = $('#search-content').val();
    $.ajax({
        url: "/adminSearch",
        type: "POST",
        beforeSend: function () {

            $("#wait").css({"display": "block"})
        },
        data: {
            video: searchName
        },
        success: function (res) {

            console.log("查询日志成功")
            $('#logTable').html("");

            if (res.status == 1) {
                $("#logTable").append(
                    '<tr>'
                    + '<td>' + '查询的视频日志不存在' + '</td>'
                    + '<td>' + '</td>'
                    + '<td>' + '</td>'
                    + '<td>' + '</td>'
                    + '</tr>'
                )
            }
            else if (res.status == 0) {
                for (var i = 0; i < res.searchList.length; i++) {
                    if (res.searchList[i].status == 0) {
                        state = '下载';
                    } else if (res.searchList[i].status == 1) {
                        state = '上传';
                    }
                    var videoName = res.searchList[i].videoName.substring(res.searchList[i].videoName.lastIndexOf('/') + 1);
                    $("#logTable").append(
                        '<tr>'
                        + '<td>' + res.searchList[i].uname + '</td>'
                        + '<td>' + videoName + '</td>'
                        + '<td>' + state + '</td>'
                        + '<td>' + res.searchList[i].time + '</td>'
                        + '</tr>'
                    )
                }
            }

        },
        complete: function () {

            $('#wait').css({"display": "none"})
        }
    });
});
/*--------------------------------------------------选择文件-------------------------------------------------*/
function checkFile() {

    var file_Arr = new Array();
    $('input[name="videoselect"]:checked').each(function () {

        file_Arr.push($(this).parent().next().text());

    });
}
/*-----------------------------------------------------------删除视频----------------------------------------------------------------*/

$("#deleteVideobtn").click(function () {
    deleteFile();
});

function deleteFile(videoname) {
    videoname = checkFile();
    console.log(videoname);

    $.ajax({
        url: "/",
        type: "POST",
        data: {
            "filename": videoname
        },

        beforeSend: function () {

            $("#wait").css({"display": "block"})
        },
        success: function (res) {
            if (res.status == 0) {
                console.log("删除成功");
                getFileList()
            } else if (res.status == 1) {
                alert("系统错误");
            }
        },
        complete: function () {

            $('#wait').css({"display": "none"})
        }
    })

};



function bytesToSize(bytes) { /*字节换算*/
    if (bytes === 0) return '0 B';
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


