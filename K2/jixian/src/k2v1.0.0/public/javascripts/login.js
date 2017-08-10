/**
 * Created by #赵堃圻# on 2017/6/14.
 */

$("#login-button").click(function () {
    var uname = $("#user_id").val();
    var password = $("#user_password").val();
    if (uname == "" || uname == null) {
        alert("用户名不能为空");
        return false;
    } else if (password == "" || password == null) {
        alert("密码不能为空");
        return false;
    }

    $.ajax({
        url: '/login',
        type: 'POST',
        dataType: "json",
        data: {
            'uname': $('#user_id').val(),
            'password': $('#user_password').val()
        },

        beforeSend:function () {

            $("#wait").css({"display":"block"})
        },

        success: function (data) {

            if (data.status == 0) {
           
                window.location.href = "/home"
            } else if (data.status == 1) {
                alert("密码错误");
                return false;
            } else if (data.status == 2) {
                alert("账号不存在");

                return false;
            } else if (data.status == 3) {
                alert("系统错误");
            } else if(data.status==4){
                alert("账号已被禁用");
            }
        },

        complete:function () {

            $('#wait').css({"display":"none"})
        }

    });


});


