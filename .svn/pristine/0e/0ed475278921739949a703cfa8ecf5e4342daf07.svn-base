var hbaseHandler = require('./hbaseInterface');
var handler = new hbaseHandler();

var obj = {table:'Table_User',columnFamily:'BasicInformation',column:'BasicInformation:Userpassword'};
var obj1 = {table:'Table_User',rowKey:'aa'};


handler.deleteRecord(obj1,function(value){
	console.log(value);
});
