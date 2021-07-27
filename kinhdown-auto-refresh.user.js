// ==UserScript==
// @name         KinhDown Auto Refresh
// @namespace    http://pan.akcsss.cn/
// @version      0.1
// @description  Auto refresh page to get valid download link.
// @author       You
// @match        http://pan.akcsss.cn/?download
// @match        https://kinhbaiducloudweb.zerun.asia/?download
// @icon         https://api.kinh.cc/HtmlStatic/Kinh-Logo.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const $ = (selector, el) => (el || document).querySelector(selector);
    const $$ = (selector, el) => [...(el || document).querySelectorAll(selector)];

    const sleep=(t)=>new Promise(f=>setTimeout(f,t));

    function init() {
        const btn = $(".btn-primary");
        if (btn && btn.innerText == '立即刷新') {
            sleep(1000).then(()=>{
                window.location.reload();
            });
        }
    }

    init();
})();