// ==UserScript==
// @name         KinhDown Auto Refresh
// @namespace    https://github.com/zhangsean/userscripts/
// @version      0.4.3
// @description  Auto refresh page to get valid download link.
// @author       zhangsean
// @match        https://baidu.kinh.cc/*
// @match        http://pan.akcsss.cn/*
// @match        https://kinhbaiducloudweb.zerun.asia/*
// @icon         https://api.kinh.cc/HtmlStatic/Kinh-Logo.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const $ = (selector, el) => (el || document).querySelector(selector);

    const sleep = (t) => new Promise(f => setTimeout(f, t));

    function init() {
        const btn = $(".btn-primary");
        if (btn && btn.innerText == '立即刷新') {
            sleep(1000).then(() => {
                window.location.reload();
            });
        }
        let swal = $('.swal2-container');
        if (swal) {
          swal.remove(swal.selectedIndex);
        }
    }

    init();
})();
