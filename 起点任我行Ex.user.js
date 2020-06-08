// ==UserScript==
// @name         起点任我行Ex
// @namespace    https://github.com/WankkoRee/qidianEx
// @version      3.0.3
// @description  基于“起点任我行”的修复版本
// @icon         https://qidian.gtimg.com/qdp/img/favicon.c443c.ico
// @author       Wankko Ree
// @mainpage     https://github.com/WankkoRee/qidianEx
// @supportURL   https://github.com/WankkoRee/qidianEx/issues
// @updateURL    https://raw.githubusercontent.com/WankkoRee/qidianEx/master/qidianEx.js
// @downloadURL  https://raw.githubusercontent.com/WankkoRee/qidianEx/master/qidianEx.js
// @license      MIT
// @modified	 2020.06.04
// @match        https://my.qidian.com/level*
// @match        https://my.qidian.com
// @require      https://cdn.bootcss.com/jquery/2.1.4/jquery.min.js
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function(){
    'use strict';
    //var bookCommented = "我当动漫女主不可能这么可爱"; //书评区书名，书名最好一字不差，则我也不知道在哪发表（现在只能手机上发书评了，这个参数没用了）
    var booksVoted = ["废土修真的日常", "修真世界的老虎", "神医弃女", "锦绣农女种田忙", "龙族Ⅴ：悼亡者的归来"]; //推荐票书名，书本数最多不超过等级所拥有的推荐票数*3类书，分别为男频类、女频类、文学类，示例为1本男频 2本女频 1本文学，书名最好一字不差，否则我也不知道给谁投推荐票
    var recomsCnt = [1, 1, 1, 1, 2]; //每本的推荐票数量，顺序须于上行书名对应，每类书的推荐票数不超过等级所拥有的推荐票数
    //var comment = "每日一贴，希望书越写越好（滑稽）"; //（现在只能手机上发书评了，这个参数没用了）

    var regex = /^[0-9]+.?[0-9]*$/; //正则表达式，判断字符串是否为数字

//Begin 获取token
    var _csrfToken;
    var arrCookie = document.cookie.split(";");
    for(var i = 0; i < arrCookie.length; i++){
        var c = arrCookie[i].split("=");
        if(c[0].trim() == "_csrfToken"){
            _csrfToken = c[1];
        }
    }
//End 获取token

//Begin 定时领在线经验
    var interval = setInterval(function(){
        if($('.elGetExp').length > 0){
            $('.elGetExp')[0].click();
        }else if($('.elIsCurrent').length === 0){
            clearInterval(interval);
        }
    },2000);
//End 定时领在线经验

//Begin 每日定时刷新
    var date = new Date();
    function reload(){
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var nowSecond =minute * 60 + second;
        var leftTime_ms = (3600 - nowSecond) * 1000;
        setTimeout(function(){
            window.location = window.location.href;
        }, leftTime_ms);
    }
    reload();
//End 每日定时刷新

//Begin 判断是否新登录
    if(window.location.href == "https://my.qidian.com/")
        setTimeout(function(){
            window.location = "https://my.qidian.com/level";
        }, 60 * 1000);
//End 判断是否新登录

/*
//Begin 每日活跃度领取
    ajaxGet("https://my.qidian.com/ajax/userActivity/mission?_csrfToken=" + _csrfToken, receivingActivity);
    function receivingActivity(result){
        var data = result.data.bagList;
        for(var i = 0; i < data.length; i++){
            if(data[i].status === 1){
                ajaxPost("https://my.qidian.com/ajax/userActivity/take", {"_csrfToken": _csrfToken, "bagId": data[i].bagId});
            }
        }
    }
//End 每日活跃度领取
*/

//Begin 每日登录、互访、投推荐票任务
    /*
	ajaxGet("https://my.qidian.com/ajax/userActivity/missionList?_csrfToken=" + _csrfToken + "&pageIndex=1&pageSize=20", executeTask);
    function executeTask(result){
        var data = result.data.listInfo;
        //登录奖励
        if(data[0].status === 0){
            document.body.innerHTML += '<iframe name="xxx" id="a_iframe"  src="https://my.qidian.com/" marginwidth="0" marginheight="0" scrolling="no"  frameborder="0" WIDTH="100%" height="100%"></iframe>';
        }
        //访客
        if(data[1].status === 0){
            $.ajax({
                url:"https://my.qidian.com/ajax/follow/myFollow?_csrfToken="+_csrfToken+"&pageIndex=1&pageSize=20",
                type: "GET",
                xhrFields: {
                    withCredentials: true
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                },
                success: function(result, status){
                    var firend = result.data.listInfo;
                    for(var j = 0; j < 5; j++){
                        var friendUrl = "https:" + firend[j].linkUrl+"?targetTab=0";
                        var name = "iframe"+j;
                        document.body.innerHTML += '<iframe name="'+name+'" id="a_iframe"  src="'+friendUrl+'" marginwidth="0" marginheight="0" scrolling="no"  frameborder="0" WIDTH="100%" height="100%"></iframe>';
                    }
                }
            });
        }
        */
        //投推荐票
    !function(){
        for(var i = 0; i < booksVoted.length; i++){
            GMGet("https://www.qidian.com/search?kw=" + booksVoted[i], search, recomsCnt[i]);
        }
    }()
    //获取书ID
    function search(result, url, value1){
        var bookId = $(result).find('#result-list > div > ul > li > div.book-img-box > a').eq(0).attr("data-bid");
        if(regex.test(bookId)){
            GMGet("https://book.qidian.com/ajax/userInfo/GetUserFansInfo?_csrfToken=" + _csrfToken + "&bookId=" + bookId, GetUserRecomTicket, value1);
        }
    }
    function GetUserRecomTicket(result, url, value1){
        var userLevel = result.data.userLevel;
        var bookId = url.match(/\d{4,}/)[0];
        GMGet("https://book.qidian.com/ajax/book/GetUserRecomTicket?_csrfToken=" + _csrfToken + "&bookId=" + bookId + "&userLevel=" + userLevel, VoteRecomTicket, value1);
    }
    //获取用户推荐票并投推荐票
    function VoteRecomTicket(result, url, value1){
        var enableCnt = result.data.enableCnt;
        var bookId = url.match(/\d{4,}/)[0];
        if(enableCnt > 0 && enableCnt >= value1){
            ajaxPost("https://vipreader.qidian.com/ajax/book/VoteRecomTicket", {"_csrfToken" : _csrfToken, "bookId" : bookId, "cnt" : value1, "enableCnt" : enableCnt});
        }
    }
//End 每日登录、互访、投推荐票任务

//Begin 每日书评区发帖任务
    // 这个任务现在只能手机上完成了。
/*     ajaxGet("https://my.qidian.com/ajax/bookReview/myTopics?_csrfToken=" + _csrfToken + "&pageIndex=1&pageSize=20&_=" + date.getTime(), myTopics);
    function myTopics(result){
        var listInfo = result.data.listInfo;
        //判断是否需要发帖
        if(listInfo.length === 0 || listInfo[0].lastReplyTime.indexOf('今天') == -1){
            ajaxGet("https://my.qidian.com/ajax/bookReview/myFavForum?_csrfToken=" + _csrfToken, publishTopic);
        }
        //添加删除编辑按钮
        addEditAndDel(result);
    }
    //发帖
    function publishTopic(result){
        GMGet("https://www.qidian.com/search?kw=" + bookCommented, searchForum);
    }
    //获取书ID
    function searchForum(result){
        var bookId = $(result).find('#result-list > div > ul > li > div.book-img-box > a').eq(0).attr("data-bid");
        if(regex.test(bookId)){
            GMGet("https://book.qidian.com/ajax/book/GetBookForum?_csrfToken=" + _csrfToken + "&bookId="+bookId+"&chanId=0", getBookForum);
        }
    }
    //发布
    function getBookForum(result){
        var forumId = result.data.forumId;
        ajaxPost("https://forum.qidian.com/ajax/my/BookForum/publishTopic",{"_csrfToken":_csrfToken,"forumId":forumId,"topicId":"","content": comment});
    }
    //添加编辑和删除按钮
    function addEditAndDel(result){
        var url = window.location.href;
        if(url.indexOf('comment')>-1){
            var interval = setInterval(function(){
                var trs = $('#tableTarget1 > div.table-size.ui-loading-animation > table > tbody > tr');
                if(trs.length>0){
                    clearInterval(interval);
                    $('.table-size').css('height','');
                    var data = result.data.listInfo;
                    for(var i=0;i<data.length;i++){
                        var forumId = data[i].forumId;
                        var topicId = data[i].id;
                        var edit = $('<li><a target="_blank" href="//forum.qidian.com/send/'+forumId+'?topicId='+topicId+'">编辑</a></li>');
                        var del = $('<li><a href="javascript:;" data-forumId="'+forumId+'" data-topicId="'+topicId+'" class="del">删除</a></li>');
                        var ul = $('<ul style="font-weight: 600;"></ul>');
                        ul.append(edit);
                        ul.append(del);
                        var div = $('<div class="tools fr mr20"></div>');
                        div.append(ul);
                        var td = $('<td></td>');
                        td.append(div);
                        trs.eq(i).append(td);
                    }
                    $('.del').bind('click', function (e) {deleteComment(this);});
                }
            },100);
        }
    }
    //删除评论
    function deleteComment(e){
        var forumId = $(e).attr('data-forumId');
        var topicList = $(e).attr('data-topicId');
        ajaxPost("https://forum.qidian.com/ajax/my/BookForumManage/updateTopicStatus",{"_csrfToken":_csrfToken,"forumId":forumId,"action":"delete","confirm":"1","topicList":topicList});
        console.log($(e).parents('tr').hide(300));
    } */
//End 每日书评区发帖任务

//Begin 基础函数
    function ajaxGet(url,functionName){
        $.ajax({
            url:url,
            type: "GET",
            xhrFields: {
                withCredentials: true
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            success: function (result, status) {
                if(functionName !== undefined){
                    functionName(result);
                }
            }
        });
    }
    function ajaxPost(url,data){
        $.ajax({
            url: url,
            type: "POST",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            dataType:"text",//返回参数的类型 text/html
            data: data,
            success: function(result, status){
                console.log(result);
            }
        });
    }
    function GMGet(url, functionName, value1){
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            onload: response => {
                if(response.status == 200){
                    if(functionName !== undefined){
                        functionName(parse(response.responseText), url, value1);
                    }
                }
            }
        });
    }
    function parse(str){
        if(typeof str == 'string'){
            try{
                var obj = JSON.parse(str);
                return obj;
            }catch(e){
                return str;
            }
        }
    }
//End 基础函数
})();
