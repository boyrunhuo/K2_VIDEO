$(document).ready(function(){

	$('#submitChangePwBtn').click(function(){
		changePass();
	});

	
});



function changePass(){
	var originalPW = $('#adminOriginalPw').val();
    var newPW = $('#adminNewPw').val();
    var confirmNewPW = $('#adminConfirmNewPw').val();
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

    if ( newPW.length > 12) {
        alert("用户新密码必须为12位之内！");
        return false;
    } else if (!reg.test(newPW)) {
        alert("用户密码只能包含字母或者数字！");
        return false;
    }

    if (newPW != confirmNewPW) {
        alert("新密码与重复密码不一致！");
        return false;
    }
    if(originalPW==newPW){
    	alert("新密码与原密码相同");
    	return false;
    }


    $.ajax({
        url: '/adminCheckPass',
        type: 'POST',
        dataType: "json",
        data: {
            'oldPassword': originalPW,
        },
        success: function (data) {
            if (data.status == 0) {
            	console.log("原密码正确")

            	$.ajax({
            		url:'/adminChangePass',
            		type:'POST',
            		dataType:"json",
            		data:{
            			newPassword:newPW
            		},
            		success:function(data){
            			if(data.status==0){
            				alert("修改密码成功");

            			}else if(data.status==1){
            				alert("系统错误");
            				return false;
            			}
            		}
            	});
            } else if (data.status == 1) {
                alert("原密码错误！");
                return false;
            } else if (data.status == 2) {
                alert("系统错误");
                return false;
            }
        }

    });
}