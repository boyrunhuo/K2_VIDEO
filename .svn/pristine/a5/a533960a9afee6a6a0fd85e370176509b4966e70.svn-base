/**
 * Created by gem-kerion on 2017/6/20.
 */
$(document).ready(function(){


    //在线播放页面的下载按钮
    $('#onlineDownloadVideo').click(function(){
         onlineDownloading();/*按钮显示下载中*/
         downloadOnline();
    });

    /*$('.onlineVideo').attr("src",'../movie.ogg');*/
    $('#downloadVideo').click(function(){
        downloading();/*按钮显示下载中*/
        downloadVideo();/*下载视频*/
    });


//点击视频右侧的下载按钮
    $('body').on('click','.each-download',function(e){
        var videoName=$(this).parent().parent().parent().prev().find('a').text();
       console.log(videoName);
	   getVideo(videoName,"home");
    });

});


function downloadVideo(){
    var id_array=new Array();  
    $('input[name="select"]:checked').each(function(){  
    id_array.push($(this).parent().next().text());//向数组中添加元素  
    });  

    if(id_array.length==0)
    {
        alert("请选择视频进行下载");
        endDownload();
        return false;
    }
    else
    {   //循环获取所选视频的下载链接
         for(var i=0;i<id_array.length;i++)
        {
            getVideo(id_array[i],"home");
        }

    }

}

function downloadOnline()
{
    var videoName = $("#videoName").text();
    //解析路径与视频名，将最后一个/改为-
    videoName=replacePos(videoName,videoName.lastIndexOf("/")+1,"-");
    if(videoName=='')
    {
        alert("视频不存在");
    }
    else{
        getVideo(videoName,"online");
    }
}



function getVideo(videoName,type)
{           
    if(type=='home'){
            $.ajax({
            url: '/downloadVideo',
            type: 'POST',
            data:{videoName:"-/root-"+videoName},
            success: function (res) {
                if(res.status==0){
                    
                        $('#excute-download').attr("href", res.url);
                        $('#excute-download').attr("download",res.videoName);
                        $('#excute').click();
                      
                            endDownload();   
                     
                                         
                    }
                    else if(res.status==1){
                    alert("视频在服务器上不存在");
                    endDownload();

                 }else if(res.status==2){
                    alert("服务器错误");
                    endDownload();
                 }

              },
              error:function(){
                alert("获取视频文件下载链接失败！");
                endDownload();
                }
           });
        }else if(type=="online"){
            videoName="-"+videoName;
			console.log(videoName);
            $.ajax({
            url: '/downloadVideo',
            type: 'POST',
            data:{videoName:videoName},
            success: function (res) {
                if(res.status==0){
                    
                        $('#online-excute-download').attr("href", res.url);
                        $('#online-excute-download').attr("download",res.videoName);
                        $('#online-excute').click();
                      
                            onlineEndDownload();   
                     
                                         
                    }
                    else if(res.status==1){
                    alert("视频在服务器上不存在");
                    onlineEndDownload();

                 }else if(res.status==2){
                    alert("服务器错误");
                    onlineEndDownload();
                 }

              },
              error:function(){
                alert("获取视频文件下载链接失败！");
                onlineEndDownload();
                }
           });
        }

}



function downloading(){

     document.getElementById("downloadVideo").innerHTML = "下载中";
     document.getElementById("downloadVideo").style.color="#3399ff";
}

function endDownload(){

    document.getElementById("downloadVideo").innerHTML = "下载";
    document.getElementById("downloadVideo").style.color="#4F4F4F";

}

function onlineDownloading(){
    document.getElementById("onlineDownloadVideo").innerHTML = "下载中";
    document.getElementById("onlineDownloadVideo").style.color="#3399ff";
}

function onlineEndDownload(){
    document.getElementById("onlineDownloadVideo").innerHTML = "下载";
    document.getElementById("onlineDownloadVideo").style.color="#4F4F4F";
}

function replacePos(strObj, pos, replacetext)
{
var str = strObj.substr(0, pos-1) + replacetext + strObj.substring(pos, strObj.length);
return str;
}

function jump_userChangePW(){
    window.location.href = "/changePwd";
}
function jump_login(){
    window.location.href = "/login";
}