// ==UserScript==
// @version         0.3.0
// @name            最代码自动签到
// @namespace       https://github.com/zhangsean/userscripts/
// @description     最代码首页自动随机心情签到领牛币，下载开源代码。
// @author          zhangsean
// @icon            http://www.zuidaima.com/favicon.ico
// @run-at          document-idle
// @match           http://www.zuidaima.com/
// ==/UserScript==

// 显示一个Toast，提示消息
var toast = (content,time) => {
  	return new Promise((resolve,reject) => {
        let elAlertMsg = document.querySelector("#fehelper_alertmsg");
        if (!elAlertMsg) {
            let elWrapper = document.createElement('div');
            elWrapper.innerHTML = '<div id="fehelper_alertmsg" style="position:fixed;top:5px;right:10px;z-index:99999">' +
                '<p style="background:#000;display:inline-block;color:#fff;text-align:center;' +
                'padding:10px 10px;margin:0 auto;font-size:14px;border-radius:4px;">' + content + '</p></div>';
            elAlertMsg = elWrapper.childNodes[0];
            document.body.appendChild(elAlertMsg);
        } else {
            elAlertMsg.querySelector('p').innerHTML = content;
            elAlertMsg.style.display = 'block';
        }

      	window.setTimeout(function () {
            elAlertMsg.style.display = 'none';
          	resolve && resolve();
        }, time || 1000);
    });
};

// 简单的sleep实现
var sleep = ms => new Promise((resolve,reject) => setTimeout(resolve,ms));

// 随机生成心情
function getMood() {
  let weeks = ["周日","周一","周二","周三","周四","周五","周六"];
  let moods = ["奋斗ing。。。","开工咯。。。","好累呀( ⊙ o ⊙ )！","开心O(∩_∩)O~~","好困呀(￣o￣) . z Z","难受(╯﹏╰)","想哭/(ㄒoㄒ)/~~","(ˇˍˇ) 想你了～","加油\(^o^)/~","期待(*^▽^*)"];
  let now = new Date(),
      day = now.getDay(),
      hour = now.getHours();
  let mood = (hour < 12 ? weeks[day] + "咯，" : "") + moods[parseInt(Math.random(6) * 10)];
  console.log(mood);
  return mood;
}

// 游猴脚本
(() => {
  // 先判断是否刚刚签到成功
  let myName = 'zxf2342';
  let names = $('.datas .name');
  for (let i in names) {
    if ($(names[i]).text() == myName) {
      toast('签到成功!');
      return;
    }
    // 数组循环完就退出，不循环jq属性
    if (i == names.length - 1) {
      break;
    }
  }
  // 再判断是否有签到时间限制
  let $input = $('#mood_input');
  let tips = $input.val();
  console.log(tips);
  console.log(tips.length);
  if (tips.length > 22) {
    toast('签到时间限制还没解除。。。', 2000);
    return;
  }
  toast('自动签到。。。')
    .then(() => $input.val(getMood()))
  	.then(() => sleep(500))
    .then(() => {
      console.log($('#mood_publish'));
        $('#mood_publish').click();
    });
})();
