$(function () {
    verfication();

})

$('#reg-button').click(function () {
    var uname = $('#user_id').val();
    var password = $('#user_password').val();
    var repassword = $('#user_rp').val();
    var verNum=$("#verCode").val().toUpperCase();
    var code=$("#verPhoto").val().toUpperCase();
    var reg = /^[0-9a-zA-Z]+$/;
    var regm=/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
   /* if (uname.length < 6 || uname.length > 12) {
        alert("用户账号为6-12位");
        return false;
    } else if (!reg.test(uname)) {
        alert("用户名只能包含字母或者数字");
        return false;
    }*/
   if(!regm.test(uname)){
       alert("请输入合法的邮箱地址")；
	   return false;
   }

    if (password.length < 6 || password.length > 12) {
        alert("用户密码为6-12位");
        return false;
    } else if (!reg.test(password)) {
        alert("用户名只能包含字母或者数字");
        return false;
    }

    else  if (password != repassword) {
        alert("两次输入的密码不一致")
        return false;
    }else if (verNum==""||verNum==null){
        alert("验证码不能为空");
        return false;
    }else if(verNum!=code){
        console.log(code);
        console.log(verNum)
        alert("验证码错误");
        return false;
    }else {

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
                  //发送激活邮件
                alert("激活邮件已经发送到你的邮箱,请进入激活");

             /*   window.location.href = "login"*/
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
   }
});


$("#verPhoto").click(function () {

    verfication();
})

function verfication() {
    var codeChars=new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t',
        'u','v','w','x','y','z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
        'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z')

    var code="";
    for(var i=0;i<4;i++){
        var charNum=Math.floor(Math.random()*62);
        code=code+codeChars[charNum]
    }
    document.getElementById("verPhoto").value=code;



}