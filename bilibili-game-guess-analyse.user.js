// ==UserScript==
// @name         bilibili-game-guess-analyse
// @namespace    https://github.com/zhangsean/userscripts/
// @version      0.2
// @description  分析B站游戏竞猜历史，看看你的竞猜回报率。
// @author       ZhangSean
// @icon         https://static.hdslb.com/images/favicon.ico
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @match        https://www.bilibili.com/v/game/match/competition
// ==/UserScript==

(function () {
    'use strict';

    const gm = (u, f) => GM_xmlhttpRequest({url: u, onload: (xhr) => {f(xhr.responseText)}});

    function init() {

        var recordUrl = 'https://api.bilibili.com/x/esports/guess/collection/record?type=2&pn=1&ps=100';
        let matchUrl = 'https://api.bilibili.com/x/esports/guess?cid=';
        gm(recordUrl, (resp) => {
            let json = eval('(' + resp + ')');
            console.log('title|odds1|odds2|right_option|right_odds|my_option|my_odds|stake|income');
            console.log('-|-|-|-|-|-|-|-|-');
            for (var i in json.data.record) {
                let g = json.data.record[i].guess[0];
                let info = g.title.replace(' 的胜者是？', '') + '|';
                gm(`${matchUrl}${g.oid}`, (resp) => {
                    let matchJson = eval('(' + resp + ')');
                    if (!!matchJson.data) {
                        let details = matchJson.data.guess[0].details;
                        info += details[0].odds + '|';
                        info += details[1].odds + '|';
                        info += g.right_option + '|';
                        info += details[g.title.indexOf(g.right_option) == 0 ? 0 : 1].odds + '|';
                        info += g.option + '|';
                        info += details[g.title.indexOf(g.option) == 0 ? 0 : 1].odds + '|';
                        info += g.stake + '|' + g.income;
                    } else {
                        info += '0|0||0|' + g.option + '|' + g.odds + '|';
                        info += g.stake + '|' + g.stake;
                    }
                    console.log(info);
                });
            }
        });
    }

    init();
})();