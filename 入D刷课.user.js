// ==UserScript==
// @name         入D刷课
// @namespace    https://tampermonkey.net/
// @version      1.4.0
// @description  防弹窗
// @author       1.3.6before:Onion   1.4:ly61
// @include      */jjfz/play*
// @require      https://cdn.staticfile.org/jquery/3.4.0/jquery.min.js
// @require      https://cdn.staticfile.org/jquery-cookie/1.4.1/jquery.cookie.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jlu.edu.cn
// @grant        GM_notification
// @license      MIT

// ==/UserScript==

//先前作者地址：https://scriptcat.org/zh-CN/script-show-page/707

//1.0 demo版本，还没学会用cookies，因为不想默认开启，所以没办法在重新定向网页的时候，保留用户按下按钮事件的value，过几天修复这个问题（大饼
//本站只匹配了UESTC的党旗飘飘网站，有需要的可以自行修改includ为自家网站
//用法：点开始，就开刷
//停止，就不执行脚本

//1.1更新，更新了cookies，增加连续播放功能

//1.2更新，更新了用户名，发现了因为增加了cookies功能所以导致的几个bug：
//（1）进去太快了可能要按两次"开刷"按钮
//（2）停止按钮有时候停不下来，（累了，今天不修了，刷新网页重定向一下就能解决大多问题
// PS：如果想要改名的话请打开开发者选项（谷歌：ctrl+shift+I），在控制台（console）里面输入：$.removeCookie('username')，以此来清除一下cookies

//1.3更新 bugfix ，以及发现火狐浏览器没法正常运作并且也不会想去修复，大家用Chrome吧球球了


//1.4更新cookie识别提醒,网页静音,每章学习过后下一章提醒
//注：下一章提醒使用Notification API，其不支持http
//故需要在 chrome://flags/  中的Insecure origins treated as secure添加网站的IP地址

(function() {
    'use strict';

    const alertDiv = document.createElement('div');
    alertDiv.id = 'autoAlert';
    alertDiv.style.cssText = `
        position: fixed; top: 20px; left: 50%;
        background: #fff; border: 1px solid #ccc; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 15px; border-radius: 5px; z-index: 1000;
        opacity: 0; visibility: hidden;
        transition: opacity 0.5s, visibility 0.5s;
    `;
    const alertMessage = document.createElement('p');
    alertMessage.id = 'alertMessage';
    alertDiv.appendChild(alertMessage);
    document.body.appendChild(alertDiv);

    function showAlert(message, duration = 3000) {
        alertMessage.textContent = message;
        alertDiv.style.opacity = '1';
        alertDiv.style.visibility = 'visible';
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.visibility = 'hidden';
            setTimeout(() => document.body.removeChild(alertDiv), 500);
        }, duration);
    }


    function setCookie(cname,cvalue,exdays){
        var d = new Date();
        d.setTime(d.getTime()+(exdays*24*60*60*1000));
        var expires = "expires="+d.toGMTString();
        document.cookie = cname+"="+cvalue+"; "+expires;
    }
    function getCookie(cname){
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name)==0) { return c.substring(name.length,c.length); }
        }
        return "";
    }
    function checkCookie(){
        var user=getCookie("username");
        if (user!=""){
            showAlert("已识别：" + user , 4000);
        }
        else {
            GM_notification({
                text: '刷课系统已经就绪！',
                timeout: 3000,
            });
            user = prompt("请输入刷课名:","用于保存进度");
            if (user!="" && user!=null){
                setCookie("username",user,30);
            }
        }
    }


    function alert_user(){
        document.getElementsByClassName("video_cont")[0].children[2].innerText='PS:自动刷课系统已就绪';
    }

    function random_Times(){
        var times= Math.floor((Math.random())+0.5) //随机1-2
        return times;
    }

    var video = document.querySelector("video");


    var button_1 = document.createElement("button"); //创建一个按钮
    button_1.textContent = "开始"; //按钮内容
    button_1.style.width = "109px"; //按钮宽度
    button_1.style.height = "22px"; //按钮高度
    button_1.style.align = "center"; //居中
    button_1.style.color = "black"; //按钮文字颜色
    // button_1.style.background = "E0E0E0"; //按钮底色
    button_1.addEventListener("click", clickButton_1)


    var button_2 = document.createElement("button"); //创建一个按钮
    button_2.textContent = "不刷了"; //按钮内容
    button_2.style.width = "109px"; //按钮宽度
    button_2.style.height = "22px"; //按钮高度
    button_2.style.align = "center"; //居中
    button_2.style.color = "black"; //按钮文字颜色
    // button_2.style.background = "E0E0E0"; //按钮底色
    button_2.addEventListener("click", clickbutton_2)//祖传按钮

    var times= random_Times();
    function clickButton_1(){
        starting();
        console.log("开刷")
        var times= random_Times();
        $.cookie('do_it', 1);
        location.reload();
    }

    function clickbutton_2(){
        clearInterval(window.start);
        console.log("停止")
        video.pause();
        $.cookie('do_it', 0);
        location.reload();
        return;
    }

 

    var i=0; // 拦截次数
    var toolbox = document.getElementsByClassName('video_tab')[0];
    toolbox.appendChild(button_1);
    toolbox.appendChild(button_2);
    var para= document.createElement("p")
    document.getElementsByClassName("video_cont")[0].appendChild(para);
    checkCookie();
    alert_user();

    setTimeout(function(){
        if($.cookie('do_it')==1){
            starting();
        }
    },1000)
    //主函数：

    function starting(){
        if($.cookie('do_it')==1){
            window.start=setInterval(function(){ //循环开始

                if (document.getElementsByClassName("video_red1")[0].children[0].style.color==="red" && document.getElementsByClassName("video_red1")[0].nextSibling.nextSibling!==null){

                    document.getElementsByClassName("video_red1")[0].nextSibling.nextSibling.children[0].click();
                }
                else{
                    if(document.getElementsByClassName("video_red1")[0].children[0].style.color==="red" && document.getElementsByClassName("video_red1")[0].nextSibling.nextSibling===null){
                        
                        
                        if ("Notification" in window && Notification.permission !== "denied") {
                            // 如果已经授予了权限，或者尚未请求过权限，则请求权限
                            if (Notification.permission === "granted") {
                                showNotification();
                            } else {
                                Notification.requestPermission().then(function(permission) {
                                    if (permission === "granted") {
                                        showNotification();
                                    }
                                });
                            }
                        }

                         function showNotification() {
                            var notification = new Notification("已学完该章", {
                                body: "请返回google进行下一章的学习",
                                icon: " https://www.google.com/s2/favicons?sz=64&domain=jlu.edu.cn" // 可选：设置通知的图标
                            });
                    
                            // 你可以添加事件监听器来处理通知的点击或关闭事件
                            notification.onclick = function() {
                                window.focus(); // 例如，当点击通知时，将浏览器窗口置于前台
                            };
                    
                            notification.onclose = function() {
                                console.log("通知已关闭。");
                            };
                        }
                        
                        
                        alert("这章已学完")
                        console.log("下一章")
                        //window.clearInterval(start);
                        clearInterval(window.start);


                    }
                    else{ 
                        var video = document.querySelector("video");
                        video.muted=true;
                        if(video.paused){
                            video.play();
                        }

                        if(document.getElementsByClassName("public_cancel")[0]===undefined){
                            //console.log("我刷")
                        }

                        else{
                            document.getElementsByClassName("public_cancel")[0].click();
                            i=i+1;
                            //console.log("拦截成功")

                        }
                        if (document.getElementsByClassName("public_submit")[0]===undefined){
                            //console.log("我刷")
                        }
                        else{
                            document.getElementsByClassName("public_submit")[0].click();
                            //     document.getElementsByClassName("plyr__control")[0].click();
                            //console.log("拦截成功")
                            i=i+1;
                        }
                    }
                }


                document.getElementsByClassName("video_cont")[0].children[2].innerText='欢迎 \''+$.cookie("username")+'\' \n已经拦截了'+i+'次弹窗\nPS:点了开始没反应的请多按几次！';
            } ,times*1000)
        }

    }

    //  starting();

})();