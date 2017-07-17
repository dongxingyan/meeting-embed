// var _origin = 'https://api-dxt.cloudp.cc';
var _origin = 'https://api-dxt-sit.cloudp.cc';
var _params = getRequest();
var schema = '';
var timer;

//邀请id
var cloudpId = _params.cloudpId;
// var cloudpId=16353;
// 电信通昵称
var nickName = _params.nickName;
// console.log(nickName)
// var nickName="小明"
if(cloudpId==null||nickName==null){
    console.log("没有参数")
    location.href="http://t.cn/RcZeMRd"
}
else{
    document.getElementsByClassName("nickName")[0].innerHTML=nickName;

    console.log(nickName)
//领取积分操作
    document.getElementById('receiveBtn').addEventListener('touchend', function (){
        getReceive()
    })
    function getReceive() {
        var mobile=document.getElementById("number").value;
        var fixCode="0086";
        var url = _origin + '/cloudp/v3/users/invite-user?' + 'cloudpId=' + cloudpId+"&nationPrefixCode="+fixCode+"&mobile="+mobile;
        var xhr = new XMLHttpRequest();
        xhr.open("post", url);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = JSON.parse(xhr.responseText);
                    if (data.code == 507) {
                        console.log("请求成功")
                        var url="../invitationSuccess/invitationSuccess.html?number="+mobile+"&nickName="+nickName;
                        location.href=encodeURI(url)
                    }
                    else if(data.code==509){
                        document.getElementById("content").innerHTML="手机格式错误，请重新输入"
                        console.log("手机格式错误")
                        // setTimeout(function(){
                        getMes();
                    }
                    else if(data.code==506){
                        document.getElementById("content").innerHTML="您已接受过邀请了，快去登录吧。"
                        console.log("已经注册过了")
                        getMes();
                    }
                    else if(data.code==508){
                        document.getElementById("content").innerHTML="您已经是我们的老朋友啦，积分奖励仅限新用户领取。"
                        console.log("已经注册过了")
                        getMes();
                    }
                    else if(data.code==105){
                        document.getElementById("content").innerHTML="服务器内部错误"
                        getMes();

                    }
                }
            }
        }
    }
    //弹框的显示和消失
    function getMes(){
        document.getElementById("error").style.visibility="visible";
        setTimeout(function () {
            document.getElementById("error").style.visibility="hidden";
        },2000)
    }
}

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

//加入会议操作



var APPCommon = {
    iphoneSchema: schema,
    iphoneDownUrl: 'http://t.cn/RcZeMRd',
    androidSchema: schema,
    androidDownUrl: 'http://t.cn/RcZeMRd',
    openApp: function () {
        var this_ = this;
        //微信
        if (this_.isWeixin()) {
            document.getElementById('top-hid').style.display = 'block';
        } else {//非微信浏览器
            if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {
                var loadDateTime = new Date();
                timer = window.setTimeout(function () {
                    var timeOutDateTime = new Date();
                    if (timeOutDateTime - loadDateTime < 7000) {
                        window.location = this_.iphoneDownUrl;//ios下载地址
                    } else {
                        window.close();
                    }
                }, 5000);
                window.location = this.iphoneSchema;
            } else if (navigator.userAgent.match(/android/i)) {
                try {
                    window.location = this_.androidSchema;
                    timer = setTimeout(function () {
                        window.location = this_.androidDownUrl; //android下载地址
                    }, 500);
                } catch (e) {
                }
            }
        }
    },
    isWeixin: function () { //判断是否是微信
        var ua = navigator.userAgent.toLowerCase();
        if (navigator.userAgent.indexOf("MQQBrowser") > -1 && navigator.userAgent.indexOf('Android') > -1 && navigator.userAgent.indexOf('SQ') > -1) {
            return true;
        }

        if ((navigator.userAgent.indexOf("QQ") > -1) && (navigator.userAgent.indexOf("UIWebView") > -1)) {
            return true;
        }

        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    },
};

//页面隐藏  清除定时器
document.addEventListener('visibilitychange webkitvisibilitychange', function () {
    var tag = document.hidden || document.webkitHidden;
    if (tag) {
        clearTimeout(timer);
    }
})

window.addEventListener('pagehide', function () {
    clearTimeout(timer);
})