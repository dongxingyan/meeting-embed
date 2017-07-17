// var _origin = 'https://api.cloudp.cc';
var _origin = 'https://api-dev.cloudp.cc';
var _params = getRequest();
var schema = '';
var timer;

//邀请id
var invitationId = _params.invitationId;
// var invitationId = 611;
//会议室名称
var meetingName = _params.meetingName;
// var invitationId = 1;
// var meetingName = '会议室名称';
var endTime=_params.mEndTime;
// var endTime = 1490600079;

console.log(endTime)
getInvitationDetail();

function getInvitationDetail() {
    if (!invitationId)return;
    var url = _origin + '/cloudpServer/v1/mmr/invitationDetail?' + 'invitationId=' + invitationId;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                if (data.code == 0) {
                    if (data.data.status == 0) {
                        var el = document.createElement('style');
                        el.innerHTML = '.hide-when-cancel{display:none}'
                        console.log("这个弹框1")
                        document.head.appendChild(el);
                    } else {
                        var el = document.createElement('style');
                        el.innerHTML = '.show-when-cancel{display:none}'
                        console.log("这个是弹框2")
                        document.head.appendChild(el);
                    }
                    data = data.data;
                    data.theme = data.theme ? data.theme : '无会议主题';
                    meetingName = data.theme;
                    insertMsg(data);
                    schema = 'lulutone://native?cmd=joinConference&conference_no=' + data.meetingRoomNum + '&password=' + data.guestPassword;
                    APPCommon.iphoneSchema = schema;
                    APPCommon.androidSchema = schema;
                }
            }
        }
    }
}

function insertMsg(data) {
    document.getElementById('meetingRoomNum').innerHTML = data.meetingRoomNum;
    document.getElementById('guestPassword').innerHTML = data.guestPassword;
    document.getElementById('theme').innerHTML = data.theme;

    var fixNum = function (number) {
        return (number < 10 && number >= 0) ? '0' + number : number + '';
    }
    var getDateByServerString = function (dateStr) {
        // console.log(dateStr);
        if (/^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/.test(dateStr)) {
            return new Date(dateStr.replace(/[-]/g, '/') + ' GMT');
        } else {
            return new Date(dateStr);
        }
    };

    var startTime = getDateByServerString(data.startTime);
    var endTime = getDateByServerString(data.endTime);
    var meetingTime = startTime.getFullYear() + '-'
        + fixNum((startTime.getMonth()) + 1) + '-'
        + fixNum(startTime.getDate()) + ' '
        + fixNum(startTime.getHours()) + ':'
        + fixNum(startTime.getMinutes()) + '-'
        + fixNum(endTime.getHours()) + ':'
        + fixNum(endTime.getMinutes());
    document.getElementById('meetingTime').innerHTML = meetingTime;
    document.getElementById('meetingName').innerHTML = meetingName;
}
function getRequest() {
    var url = location.search; //获取url中"?"符后的字串
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
document.getElementById('goMeeting').addEventListener('touchend', function (){
    var nowTime
    nowTime = (new Date().getTime())/1000;
    console.log(nowTime)
    if (nowTime < endTime) {
        console.log("可以入会")
            APPCommon.openApp();
    }
    else {
        var btn = document.getElementById("enter-meeting-btn")
        btn.style.opacity = "0.4"
        btn.innerText = "已结束"
    }
})


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