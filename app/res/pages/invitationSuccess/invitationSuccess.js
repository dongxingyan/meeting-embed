// var _origin = 'https://api.cloudp.cc';
var _origin = 'https://api-dev.cloudp.cc';
var _params = getRequest();
var schema = '';
var timer;


//电信通昵称
console.log(location.search)
var nickName=_params.nickName;
console.log(nickName)
//被邀请人的手机号
var number=_params.number;
console.log(number)
document.getElementById("nickName").innerHTML=nickName;
document.getElementById('invited-number').innerHTML=number;
document.getElementById("download").addEventListener("touchend",function(){
    location.href="http://t.cn/RcZeMRd";
})
function getRequest() {
    var url = decodeURI(location.search); //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        str = str.split("&");
        for (var i = 0; i < str.length; i++) {
            theRequest[str[i].split("=")[0]] = unescape(str[i].split("=")[1]);
        }
    }
    return theRequest;
}


