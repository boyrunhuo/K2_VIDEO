/**
 * Created by #赵堃圻# on 2017/7/4.
 */
$(function () {
    getUserList();
})

$(function () {
    $('#myTab li:eq(1) a').tab('show');
});

/*
 -----------------------------------------------------获取用户列表------------------------------------------------------*/
function getUserList() {

    $.ajax({
        url: "adminGetUser",
        type: "POST",
        success: function (res) {
            var state;
            var level;
            console.log("获取用户列表成功");
            $('#userList').html("");

            for (var i = 0; i < res.userList.length; i++) {
                if (res.userList[i].userState == 0) {
                    state = '正常';
                } else if (res.userList[i].userState == 1) {
                    state = '禁用';
                }

                if(res.userList[i].userLevel==0){
                    level='低';
                }else if(res.userList[i].userLevel==1){
                    level='中';
                }else if(res.userList[i].userLevel==2){
                    level='高'
                }

                //将字节转换成MB单位
                var userStorage=(res.userList[i].userStorage)/(1024*1024);
                userStorage=userStorage.toString();
                userStorage=userStorage.substring(0,userStorage.indexOf(".") + 3);
                $("#userList").append(
                    '<tr>' + '<td><input type="checkbox" name="userselect"></td>' + '<td>' + res.userList[i].uname
                    + '</td>' + '<td class="ss">' + level + '</td>'
                    + '<td>' + userStorage + '</td>'
                    + '<td>' + res.userList[i].fileNum + '</td>'
                    + '<td>' + state + '</td>'
                    + '</tr>'
                )
            }

        }

    });
}


/*--------------------------------------------------------------判断被选中---------------------------------------------*/
function check() {

    var user_Arr = new Array();
    $('input[name="userselect"]:checked').each(function () {

        user_Arr.push($(this).parent().next().text());

    });


   /* if (user_Arr.length == 0) {
        alert("没有选择用户");
        return false;
    }
    else {*/
        for (var i = 0; i < user_Arr.length; i++) {

            return user_Arr;


      /*  }*/
    }
}
/*--------------------------------------------------删除-----------------------------------------------------*/
$("#delete").click(function () {
    deleteUser();
});



function deleteUser(username) {
    username = check();

    console.log(username);

    for(var i=0;i<username.length;i++){
         $.ajax({
            url: "/adminDelete",
            type: "POST",
            data: {
                "userName": username[i]
            },

            beforeSend: function () {

                $("#wait").css({"display": "block"})
            },
            success: function (res) {
                if (res.status == 0) {
                    console.log("删除成功");
                    getUserList();
                } else if (res.status == 1) {
                    alert("系统错误");
                }
            },
            complete: function () {

                $('#wait').css({"display": "none"})
            }
        });
    }
       

}


/*----------------------------------------------------------------禁用——————————————————————————————*/
$("#forbidden").click(function () {
    forbidden();
})

function forbidden(username) {
    username = check();
    console.log(username);

    for(var i=0;i<username.length;i++){
         $.ajax({
            url: "/adminForbidden",
            type: "POST",
            data: {
                "userName": username[i]
            },
            beforeSend: function () {

                $("#wait").css({"display": "block"})
            },
            success: function (res) {
                if (res.status == 0) {
                    console.log("禁用成功");
                    getUserList();
                } else if (res.status == 1) {
                    alert("系统错误");
                }
            },
            complete: function () {

                $('#wait').css({"display": "none"})
            }
        });
    }
       

}

$('#cancelForbidden').click(function(){
    cancelForbidden();
});

function cancelForbidden(){
    username = check();
    console.log(username);

    for(var i=0;i<username.length;i++){
         $.ajax({
            url: "/adminCancelForbidden",
            type: "POST",
            data: {
                "userName": username[i]
            },
            beforeSend: function () {

                $("#wait").css({"display": "block"})
            },
            success: function (res) {
                if (res.status == 0) {
                    console.log("取消禁用成功");
                    getUserList();
                } else if (res.status == 1) {
                    alert("系统错误");
                }
            },
            complete: function () {

                $('#wait').css({"display": "none"})
            }
        });
    }
}

/*----------------------------------------------设置级别--------------------------------------------------------*/

$("#level").on("change",function () {

    level();
})

function level(username) {

    username=check();
    console.log(username);

     var option= $('#level option:selected') .val();
    if(option=="L"){
        option='0';
    }else if(option=="M"){
        option='1';
    }else  if(option=="H"){
        option='2';
    }else if(option==null){
        return false;
    }
    console.log(option)//获取设置的等级

    for(var i=0;i<username.length;i++){
             $.ajax({
            url: "/adminLevel",
            type: "POST",
            data: {

                "userName": username[i],
                "level":option
            },
            beforeSend: function () {

                $("#wait").css({"display": "block"})
            },
            success: function (res) {
                if(res.status==0){
                    console.log("设置等级成功");
                   
                }else if(res.status==1){
                    alert("系统错误");
                }
            },
            complete: function () {
                 getUserList();
                $('#wait').css({"display": "none"})
            }
         })
    }



   

}



/*---------------------------------------------------------修改密码-------------------------------------------------------*/
$("#changePW").click(function () {
    window.location.href = "adminChangePW";
})

/*-----------------------------------------------------退出---------------------------------------------------------*/
$("#exit").click(function () {
    window.location.href = "adminLogin";
})