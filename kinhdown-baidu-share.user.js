// ==UserScript==
// @name        BaiduYun KinhDown
// @namespace   ZhangSean Scripts
// @description KinhDown Script for baidu yun share.
// @match       https://pan.baidu.com/share/init*
// @icon        https://cdn.jsdelivr.net/gh/UallenQbit/Static/Kinh-Logo.png
// @updateURL   https://github.com/zhangsean/userscripts/raw/master/kinhdown-baidu-share.user.js
// @downloadURL https://github.com/zhangsean/userscripts/raw/master/kinhdown-baidu-share.user.js
// @supportURL  https://github.com/zhangsean/userscripts/issues
// @grant       none
// @version     1.1
// @author      zhangsean
// ==/UserScript==

(function () {
    'use strict';

    const $ = (selector, el) => (el || document).querySelector(selector);

    const log = console.log;

    function init() {
        let url = location.href;
        if (url.indexOf('surl=') != -1) {
            url = url.replace(/surl=/,'surl=1')
        }

        var key = url.match(/surl=([A-Za-z0-9-_]+)/);
        if (!!key && key.length == 2) {
            key = key[1]
        } else {
            key = url.match(/1[A-Za-z0-9-_]+/);
            if (!!key && key.length == 1) {
                key = key[0]
            } else {
                key = url
            }
        }

        log('share key', key)

        let ipt = $('#accessCode')
        ipt.style.width = '200px'

        let btn = $('.submit-a')
        $('.text', btn).innerText += ' & KinhDown'
        btn.onclick = function() {
            let code = ipt.value
            if (!!code && code.length == 4) {
                let txt = key + ',提取码' + code
                ipt.value = txt
                ipt.select()
                if(!document.execCommand("copy")) {
                  alert('自动复制失败，请手工复制')
                }
                ipt.value = code
                let aim = 'https://baidu.kinh.cc/?s=' + txt
                window.open(aim)
            }
        }
    }

    init();
})();
