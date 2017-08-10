/**
 * Created by #赵堃圻# on 2017/6/26.
 */
$(document).ready(function () {
    /*var rows=document.getElementsByClassName("videoname");

     for (var i=0;i<rows.length;i++){
     var filename=$(rows[i]).text();

     };*/
    /*------------------------------------------点击获取文件名------------------------------------------*/
$('body').on("click",'.Vname',function (e) {
    var filename=$(this).text();
    console.log(filename);

    $.ajax({
        url: "/onlineVideo",
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
});
/*
    $('#videolist').on('click', '.videoname', function (e) {
        $(function () {
            var f = $("td[class=Vname]");
            f.each(function () {

                $(this).click(function () {
                    var tr = this.innerHTML;
                    var filename = tr;
                    console.log(filename);

                    $.ajax({
                        url: "/onlineVideo",
                        type: "POST",
                        dataType: "json",
                        data:{
                            'location':'/root',
                            'filename':filename
                        },
                        success: function (res) {
                            window.location.href = '/userPlayVideo';
                        }
                    })
                });
            });
        })
    });*/

});


