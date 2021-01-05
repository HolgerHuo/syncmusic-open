// 配置
var ws_hostname = 'wss://radio.dragon-fly.club/api';

// 初始化变量
var websocket;
var lrcObj = {};
var ws_connected = false;
var last_lrc;
var next_lrc;
var rotate = 0;
var paused = false;
var lastVol = 0;
var last_input = "";
var inputGroupCss = "position: fixed;width:100%;bottom: 0px;left: 0px;padding-bottom:12px;padding-left: 12px;padding-right:12px;background:rgba(39,50,56,0.85);box-shadow: 0px 0px 8px rgba(0,0,0,0.5);";

function getRandIP() {
    var ip = []
    for (var i = 0; i < 4; i++) {
        ip = ip + Math.floor(Math.random() * 256) + "."
    }
    return ip
}

var id = window.localStorage.getItem("id");
if (id != null && id != undefined) {
    var id = id
} else {
    var id = getRandIP()
    id = id.substr(0, id.length - 1);
    window.localStorage.setItem("id", id);
}

// 搜索功能

var scrollHandlerSearch = function(){
    searchScroll = $(search).fadeOut();
    $(window).off("scroll", scrollHandlerSearch);
}

function checkInput() {
    var userInput = $("#msginput").val();
    userInput = userInput.replace(/点歌 /g, "");
    if (userInput != "") {
        search.src = "/search.php?s=" + encodeURIComponent(userInput);
        setTimeout(function(){
            $(search).fadeIn();
            var mql = window.matchMedia("(orientation: portrait)");
            if(mql.matches) {
                offset = window.screen.height * 0.5 - 229.4
                $('html, body').animate({  
                    scrollTop: $("#search").offset().top - offset
                }, 2000);  
            }
            setTimeout(function(){
                $(window).scroll(scrollHandlerSearch);
            }, 3000);
          }, 500);
    }
}

var scrollHandlerPlaylist = function(){
    playlistScroll = $(playlist_search).fadeOut();
    $(window).off("scroll", scrollHandlerPlaylist);
}

function checkPlaylist() {
    var playlistInput = $("#msginput").val();
    playlistInput = playlistInput.replace(/歌单 /g, "");
    if (playlistInput != "") {
        playlist_search.src = "/playlist.php?s=" + encodeURIComponent(playlistInput);
        setTimeout(function(){
            $(playlist_search).fadeIn();
            var mql = window.matchMedia("(orientation: portrait)");
            if(mql.matches) {
                offset = window.screen.height * 0.5 - 609.4
                $('html, body').animate({  
                    scrollTop: $("#playlist").offset().top - offset
                }, 2000);  
            }
            setTimeout(function(){
                $(window).scroll(scrollHandlerPlaylist);
            }, 3000);
          }, 500);
    }
}

// 暂停音乐
function setPause() {
    if (paused) {
        musicControl.volume = lastVol;
        paused = false;
    } else {
        lastVol = musicControl.volume;
        musicControl.volume = 0;
        paused = true;
    }
}

// 关闭窗口
function checkElement(event) {
    if (event.target != search && event.target != opensearch) {
        $(search).fadeOut();
        $(window).off("scroll", scrollHandlerSearch);
        $(window).off("scroll", scrollHandlerPlaylist);
    }
    if (event.target != playlist_search && event.target != openplaylist) {
        $(playlist_search).fadeOut();
        $(window).off("scroll", scrollHandlerSearch);
        $(window).off("scroll", scrollHandlerPlaylist);
    }
}

// 系统消息
function print(msg) {
    $("#chatdata").append("<center><span class='sysmsg'>" + msg + "</span></center>");
    chatdata.scrollTop = chatdata.scrollHeight;
}

// 解析 Lrc 格式歌词
function parseLyric(text) {
    var lyrics = text.split("\n");
    var lrcObj = {};
    for (var i = 0; i < lyrics.length; i++) {
        var lyric = decodeURIComponent(lyrics[i]);
        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
        var timeRegExpArr = lyric.match(timeReg);
        if (!timeRegExpArr) continue;
        var clause = lyric.replace(timeReg, '');
        for (var k = 0, h = timeRegExpArr.length; k < h; k++) {
            var t = timeRegExpArr[k];
            var min = Number(String(t.match(/\[\d*/i)).slice(1)),
                sec = Number(String(t.match(/\:\d*/i)).slice(1));
            var time = min * 60 + sec;
            lrcObj[time] = clause;
        }
    }
    return lrcObj;
}

// 聊天内容
function chat(data) {
    var randid = Math.floor(Math.random() * 10000000);
    $("#chatdata").append("<div class='chat chat-" + randid + " hidechat'><div class='msgbox'><small class='name'>" + data.user + "</small><div class='msg' title='" + data.time + "'>" + data.data + "</div></div></div>");
    $(".chat-" + randid).fadeIn();
    chatdata.scrollTop = chatdata.scrollHeight;
}

// 读取音乐
function music(data) {
    let music_title = data.name + " - " + data.artists;
    if (!paused) {
        let setVolume = localStorage.getItem("volume");
        musicControl.volume = (setVolume == null || setVolume == undefined) ? 1 : setVolume;
    }
    document.title = music_title + " | 669点歌台";
    musicControl.src = data.file;
    musicControl.pause();
    musicname.innerHTML = music_title;
    musicpic.src = data.image;
    // 加入 Media Session API
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: data.name,
            artist: data.artists,
            album: data.album,
            artwork: [
                { src: musicpic.src, sizes: '300x300', type: 'image/png' },
            ]
        });
        navigator.mediaSession.setActionHandler('play', function() {
            setPause();
        });

        navigator.mediaSession.setActionHandler('pause', function() {
            setPause();
        });

        navigator.mediaSession.setActionHandler('nexttrack', function() {
            msginput.value = '投票切歌';
            sendmsg();
        });
    }
    rotate = 0;
    $("#blurimgsrc").attr("xlink:href", data.image);
    $(musicpic).fadeIn();
    lrcObj = parseLyric(data.lrcs);
    setTimeout(function() {
        if (data.current != undefined) {
            musicControl.currentTime = data.current + 1;
        }
        musicControl.play();
    }, 1000);
}

// 转换时间格式
function formatSeconds(value) {
    if (value == null || value == undefined) value = 0;
    var secondTime = parseInt(value);
    var minuteTime = 0;
    var hourTime = 0;
    if (secondTime > 60) {
        minuteTime = parseInt(secondTime / 60);
        secondTime = parseInt(secondTime % 60);
        if (minuteTime > 60) {
            hourTime = parseInt(minuteTime / 60);
            minuteTime = parseInt(minuteTime % 60);
        }
    }
    secondTime = parseInt(secondTime);
    minuteTime = parseInt(minuteTime);
    hourTime = parseInt(hourTime);
    if (secondTime < 10) secondTime = "0" + parseInt(secondTime);
    if (minuteTime < 10) minuteTime = "0" + parseInt(minuteTime);
    if (hourTime < 10) hourTime = "0" + parseInt(hourTime);
    return hourTime + ":" + minuteTime + ":" + secondTime;
}

// 发送聊天消息
function sendmsg() {
    var message = msginput.value;
    if (message == "") {
        alert("消息不能为空");
        return;
    }
    if (!ws_connected) {
        alert("请等待服务器连接");
        return;
    }
    var wait_send = {
        type: "msg",
        data: message
    };
    websocket.send(JSON.stringify(wait_send));
    msginput.value = "";
    sendmsgbtn.disabled = true;
    setTimeout(function() {
        sendmsgbtn.disabled = false;
        //$(msginput).focus();
    }, 100);
}

// 连接服务器
function connect() {

    websocket = new WebSocket(ws_hostname + "/?" + id);
    websocket.onopen = function(event) {
        $("#chatdata").html("");
        ws_connected = true;
        var userNick = window.localStorage.getItem("username");
        if (userNick != null && userNick != undefined) {
            websocket.send('{"type":"msg","data":"设置昵称 ' + userNick + '"}');
        }
    };
    websocket.onclose = function(event) {
        ws_connected = false;
        setTimeout("connect()", 5000);
    };
    websocket.onmessage = function(event) {
        handle(event.data);
    };
    websocket.onerror = function(event, e) {
        ws_connected = false;
    };
}

// 处理消息
function handle(data) {
    try {
        var json = JSON.parse(data);
        if (json.type != undefined) {
            switch (json.type) {
                case "msg":
                    print(json.data);
                    break;
                case "chat":
                    chat(json);
                    break;
                case "music":
                    music(json);
                    break;
                case "list":
                    musicList.innerHTML = json.data;
                    break;
                case "online":
                    $("#online-user").html(json.data);
                    break;
                case "setname":
                    window.localStorage.setItem("username", json.data);
                    break;
                default:
                    print("Unknown message type: " + json.type);
            }
        }
    } catch (e) {
        print(e.getMessage());
    }
}

// 网页加载完毕
document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        $('.sidenav').sidenav();
        $("#msginput").keydown(function(e) {
            if (e.keyCode == 13) {
                sendmsg();
            }
        });
        setInterval(function() {
            var curTime = musicControl.currentTime.toFixed();
            if (lrcObj[curTime] != undefined && lrcObj[curTime] != "") {
                musiclrc.innerText = lrcObj[curTime];
            }
        }, 1000);
        setInterval(function() {
            played.style.width = ((musicControl.currentTime / musicControl.duration) * 100) + "%";
            usedtime.innerText = formatSeconds(musicControl.currentTime);
            endtime.innerText = formatSeconds(musicControl.duration - musicControl.currentTime);
        }, 100);
        setInterval(function() {
            if (ws_connected) {
                websocket.send('{"type":"heartbeat"}');
            }
        }, 5000);
        setInterval(function() {
            if (!paused) {
                rotate = rotate + 1;
                musicpic.style.transform = "rotate(" + rotate + "deg)";
            }
            if (document.body.clientWidth <= 600) {
                $(".input-group").attr("style", inputGroupCss);
            } else {
                $(".input-group").attr("style", "");
            }
        }, 100);
    }
}

var options = {
    strings: ["点歌 认真的雪", "设置昵称 Holger", "投票切歌", "输入歌单ID（ 5436660157）后点击“歌单”打开播放列表", "这首歌超好听~", "输入歌曲名后点击“搜索”来查找歌曲"],
    typeSpeed: 100,
    backSpeed: 50,
    shuffle: true,
    backDelay: 2000,
    loop: true,
    loopCount: Infinity,
    attr: 'placeholder',
    showCursor: true,
    cursorChar: '|',
    autoInsertCss: true,
};

var typed = new Typed('#msginput', options);