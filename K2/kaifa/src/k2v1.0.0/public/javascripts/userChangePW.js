/**
 * Created by gem-kerion on 2017/7/5.
 */
$(document).ready(function(){
   $('#submitChangePwBtn').click(function(){
       userChangePw();
   })
});
function jump_home(){
    window.location.href="/home";
}
function jump_userViewInformation(){
    window.location.href="/userViewInformation";
}
function jump_userChangePW(){
    window.location.href = "/changePwd";
}
function jump_login(){
    window.location.href="/login";
}
function jump_userShareRoom(){
    window.location.href="/userShareRoom";
}

function userChangePw(){
    var originalPW = $('#userOriginalPw').val();
    var newPW = $('#userNewPw').val();
    var confirmNewPW = $('#userConfirmNewPw').val();
    var reg = /^[0-9a-zA-Z]+$/;

    if (originalPW == "" || originalPW == null) {
        alert("原密码不能为空！");
        return false;
    } else if (newPW == "" || newPW == null) {
        alert("新密码不能为空！");
        return false;
    }else if(confirmNewPW==""||confirmNewPW==null){
        alert("重复新密码不能为空！");
    }

    if (newPW.length < 6 || newPW.length > 12) {
        alert("用户新密码必须为6-12位！");
        return false;
    } else if (!reg.test(newPW)) {
        alert("用户密码只能包含字母或者数字！");
        return false;
    }

    if (newPW == originalPW) {
        alert("新密码与原密码一致！");
        return false;
    }
    
    if (newPW != confirmNewPW) {
        alert("新密码与重复密码不一致！");
        return false;
    }
    
    $.ajax({
        url: '/changePwd',
        type: 'POST',
        dataType: "json",
        data: {
            'oldPassword': originalPW,
            'newPassword': newPW
        },
        success: function (res) {
            if (res.status == 2) {
                alert("修改密码成功！");
                window.location.href = "/home";
            } else if (res.status == 0) {
                alert("原密码错误！");
                return false;
            } else if (res.status == 1) {
                alert("修改密码失败！");
                return false;
            }
        }

    });
}