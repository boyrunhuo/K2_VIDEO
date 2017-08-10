/**
 * Created by #赵堃圻# on 2017/7/6.
 */
/**
 * Created by #赵堃圻# on 2017/6/14.
 */

$("#login-button").click(function () {
    var uname = $("#admin_id").val();
    var password = $("#admin_password").val();
    if (uname == "" || uname == null) {
        alert("管理员账号不能为空");
        return false;
    } else if (password == "" || password == null) {
        alert("密码不能为空");
        return false;
    }

    $.ajax({
        url: '/adminLogin',
        type: 'POST',
        dataType: "json",
        data: {
            'adminName': $('#admin_id').val(),
            'adminPassword': $('#admin_password').val()
        },

        beforeSend:function () {

            $("#wait").css({"display":"block"})
        },

        success: function (data) {

            if (data.status == 0) {

               window.location.href = "/admin";
               
            } else if (data.status == 1) {
                alert("密码错误");
                return false;
            } else if (data.status == 2) {
                alert("管理员账号不存在");

                return false;
            } else if (data.status == 3) {
                alert("系统错误");
            } else {
                alert("服务器开小差");
            }
        },

        complete:function () {

            $('#wait').css({"display":"none"})
        }

    });


});


