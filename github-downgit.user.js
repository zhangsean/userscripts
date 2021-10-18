// ==UserScript==
// @name         Github - DownGit
// @namespace    https://github.com/zhangsean/userscripts/
// @version      1.0
// @description  Add DownGit button in Github for downloading current directory.
// @author       Zhang Sean
// @match        https://github.com/*
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @updateURL   https://github.com/zhangsean/userscripts/raw/master/github-downgit.user.js
// @downloadURL https://github.com/zhangsean/userscripts/raw/master/github-downgit.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const log = console.log;

    const $ = (selector, el) => (el || document).querySelector(selector);

    const until = (c, f, ms) => {ms=ms||10;let tid = setInterval(()=>{if(c()){clearInterval(tid);f();}},ms)};

    const downUrl = 'https://minhaskamal.github.io/DownGit/#/home?url=';

    const btnGoCss = '.btn.d-none.d-md-block';

    until(()=>$(btnGoCss), () => {
        let btnGo = $(btnGoCss);
        let btnDown = document.createElement('a');
        btnDown.className = btnGo.className;
        btnDown.innerText = 'DownGit';
        btnDown.target = '_blank';
        btnDown.href = downUrl + encodeURIComponent(location.href);
        btnGo.parentNode.insertBefore(btnDown, btnGo);
        log(btnDown);
    });
})();
