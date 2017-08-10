$('#reg-button').click(function () {
    var uname = $('#user_id').val();
    var password = $('#user_password').val();
    var repassword = $('#user_rp').val();
    var reg = /^[0-9a-zA-Z]+$/;
    if (uname.length < 6 || uname.length > 12) {
        alert("用户账号为6-12位");
        return false;
    } else if (!reg.test(uname)) {
        alert("用户名只能包含字母或者数字");
        return false;
    }

    if (password.length < 6 || password.length > 12) {
        alert("用户密码为6-12位");
        return false;
    } else if (!reg.test(password)) {
        alert("用户名只能包含字母或者数字");
        return false;
    }

    if (password != repassword) {
        alert("两次输入的密码不一致")
        return false;
    }
    $.ajax({
        url: '/register',
        type: 'post',
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

                window.location.href = "login"
            }
            else if (data.status == 1) {
                alert("账号已存在");
            } else if (data.status == 2) {
                alert("系统错误");
            } else {
                alert("注册失败");
            }
        },
        complete:function () {

            $('#wait').css({"display":"none"})
        }

    });

});