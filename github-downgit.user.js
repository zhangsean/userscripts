// ==UserScript==
// @name         Github - DownGit
// @namespace    https://github.com/zhangsean/userscripts/
// @version      2.0
// @description  Add DownGit button in Github for downloading current directory.
// @author       Zhang Sean
// @match        https://github.com/*
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @updateURL    https://github.com/zhangsean/userscripts/raw/master/github-downgit.user.js
// @downloadURL  https://github.com/zhangsean/userscripts/raw/master/github-downgit.user.js
// @require      https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const log = console.log;

    const _ = (selector, el) => (el || document).querySelector(selector);

    const until = (c, f, ms) => {ms=ms||100;var tid = setInterval(()=>{if(c()){clearInterval(tid);f();}},ms)};

    const downUrl = 'https://minhaskamal.github.io/DownGit/#/home?url=';

    const btnGoCss = '.btn.d-none.d-md-block[data-hotkey="t"]';
    const btnDownCss = '.btn.d-none.d-md-block[target="_blank"]';

    log('DownGit load');

    var checkUrl = (url) => (!url.includes('/topics/') && (/^https:\/\/github\.com(\/[0-9a-zA-Z_-]+){2}(#[0-9a-zA-Z_-]+)?$/.test(url) || url.includes('/tree/') || url.includes('/blob/')));

    $("body").on("click","a", function(a, b, c){
        let aimUrl = this.href;
        if (!checkUrl(aimUrl)) return;
        until(()=>{
            //log('click until', aimUrl, document.location.href, _(btnDownCss), _(btnGoCss));
            return aimUrl == document.location.href && !_(btnDownCss) && _(btnGoCss)
        }, ()=>{
            addBtn()
        })
    });

    if (checkUrl(location.href)) {
        until(()=>{
            //log('load until', _(btnGoCss));
            return _(btnGoCss)
        }, ()=>{
            addBtn()
        })
    }

    var addBtn = () => {
        let btnGo = _(btnGoCss);
        let btnDown = document.createElement('a');
        btnDown.className = btnGo.className;
        btnDown.innerText = 'DownGit';
        btnDown.target = '_blank';
        btnDown.href = downUrl + encodeURIComponent(location.href);
        btnGo.parentNode.insertBefore(btnDown, btnGo);
        log(btnDown, btnGo);
    };
})();
