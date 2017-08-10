/**
 * Created by gem-kerion on 2017/7/5.
 */
$(document).ready(function(){
    $.ajax({
        url: '/viewUserInfo',
        type: "GET",
        success: function (res) {
            if (res.status == 0) {
                alert("返回视频日志列表失败");
            } else if (res.status == 1) {
                res.UsedStorage = bytesToSize(res.UsedStorage);/*字节转换*/
                res.storage = bytesToSize(res.storage);
                
                document.getElementById("userLevel").innerHTML = res.UserLevel;
                document.getElementById("usedStorage").innerHTML = res.UsedStorage;
                document.getElementById("storage").innerHTML = res.storage;
                for (var i = 0; i < res.log.length; i++) {
                    var numberType; 
                    if(res.log[i].type == 0){
                        numberType = "下载";
                    }else if(res.log[i].type==1){
                        numberType = "上传";
                    }
                    
                    $("#logList").append(
                        '<tr >'
                        + '<td >' + res.log[i].CatalogueVideoName + '</td >'
                        + '<td >' + numberType + '</td>'
                        + '<td >' + res.log[i].time + '</td>' +
                        '</tr>'
                    )
                }
            }
        }
    })

   /*测试数据
    document.getElementById("userLevel").innerHTML = "UserLevel";
    document.getElementById("usedStorage").innerHTML = "UsedStorage";
    document.getElementById("storage").innerHTML = "storage";

    var china= [
         {name: "北京", area: "0", time: "123"},
        {name: "海淀区", area: "1", time: "123"},
         {name: "上海", area: "0", time: "123"},
        {name: "闵行区", area: "1", time: "360"}
    ];

    for (var i = 0; i < china.length; i++) {
     var numberType; 
     if(china[i].area == 0){
     numberType = "下载";
     }else if(china[i].area==1){
     numberType = "上传";
     }
        $("#logList").append(
            '<tr >'
            + '<td >' + china[i].name + '</td >'
            + '<td >' + numberType + '</td>'
            + '<td >' + china[i].time + '</td>' +
            '</tr>'
        );
    }*/


});

function jump_home(){
    window.location.href="/home";
}
function jump_changePW(){
    window.location.href="/changePwd";
}
function jump_login(){
    window.location.href="/login";
}
function jump_userShareRoom(){
    window.location.href="/userShareRoom";
}
function bytesToSize(bytes) { /*字节换算*/
    if (bytes == 0) return '0 B';
    var k = 1024;
    sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(4) + ' ' + sizes[i];
}
