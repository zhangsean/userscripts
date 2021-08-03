// ==UserScript==
// @name         bilibili-game-guess-analyse
// @namespace    https://github.com/zhangsean/userscripts/
// @version      2.0
// @description  分析B站游戏竞猜历史，看看你的竞猜回报率。
// @author       ZhangSean
// @icon         https://static.hdslb.com/images/favicon.ico
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @match        https://www.bilibili.com/v/game/match/competition
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.core.min.js
// ==/UserScript==

(function () {
    'use strict';

    const $ = (selector, el) => (el || document).querySelector(selector);
    const $$ = (selector, el) => [...(el || document).querySelectorAll(selector)];

    const gm = (u, f) => GM_xmlhttpRequest({url: u, onload: (xhr) => {f(eval('(' + xhr.responseText + ')'))}});

    const until = (c, f, t) => {t=t||100;let tid = setInterval(()=>{if(eval(c)){clearInterval(tid);f();}},t);}

    const sleep=(t)=>new Promise(f=>setTimeout(f,t));

    Number.prototype.fixed=function(n){n=n||0;return Math.round(this*Math.pow(10,n))/Math.pow(10,n)};

    function exportXlsx(array, fileName) {
        var workbook = {
            SheetNames: ['sheet1'],
            Sheets: {'sheet1': XLSX.utils.aoa_to_sheet(array)}
        };
        XLSX.writeFile(workbook, fileName);
    }

    function waitRecord(n) {
        sleep(n).then(()=>{
            if (pn == dataPn) {
                getRecord(++pn);
            }
            if (hasMore) {
                waitRecord(n);
            }
        });
    }

    function getRecord(pn) {
        let recordUrl = 'https://api.bilibili.com/x/esports/guess/collection/record?type=2&ps=50&pn=';
        let matchUrl = 'https://api.bilibili.com/x/esports/guess?cid=';
        gm(recordUrl + pn, (json) => {
            hasMore = !!json.data.record;
            if (!hasMore) {
                return;
            } else {
                dataPn++;
            }
            records += json.data.record.length;
            for (var i in json.data.record) {
                let g = json.data.record[i].guess[0];
                let info = [g.title.replace(' 的胜者是？', ''), new Date(g.stime * 1000)];
                gm(`${matchUrl}${g.oid}`, (matchJson) => {
                    let bigOdds = 0, smallOdds = 0, winOdds = 0, smallWin = 0;
                    if (!!matchJson.data) {
                        let details = matchJson.data.guess[0].details;
                        winOdds = details[g.title.indexOf(g.right_option) == 0 ? 0 : 1].odds;
                        bigOdds = details[0].odds > details[1].odds ? details[0].odds : details[1].odds;
                        smallOdds = details[0].odds < details[1].odds ? details[0].odds : details[1].odds;
                        smallWin = smallOdds == winOdds ? 1 : 0;
                        info.push(details[0].odds);
                        info.push(details[1].odds);
                        info.push(g.right_option);
                        info.push(winOdds);
                        info.push(g.option);
                        info.push(details[g.title.indexOf(g.option) == 0 ? 0 : 1].odds);
                        info = info.concat(g.stake, g.income);
                    } else {
                        info = info.concat([0, 0, '流局', 1, g.option, g.odds, g.stake, g.stake]);
                        smallWin = 1;
                    }
                    info.push(smallOdds == 0 ? 0 : (bigOdds/smallOdds).fixed(1), smallWin, smallWin ? winOdds : 0, smallWin ? 0 : bigOdds);
                    data.push(info);
                });
            }
        });
    }

    var data, records, pn, dataPn, hasMore;
    function analyse() {
        data = [];
        records = 0;
        pn = 0;
        dataPn = 0;
        hasMore = true;
        waitRecord(50);
        until('!hasMore && records > 0 && data.length == records', ()=>{
            data.unshift(['队伍','时间','赔率1','赔率2','胜利队伍','胜利赔率','投注队伍','投注赔率','投注','收入','赔率倍数','是否优胜','优胜赔率','非优胜赔率']);
            let count = data.length - 1, allWinOdds = 0, myWin = 0, allStake = 0, allIncome = 0, goodWin = 0, allGoodOdds = 0, allBadOdds = 0;
            for (let i=1,len = data.length; i < len; i++) {
                allWinOdds += data[i][5];
                myWin += data[i][9] == 0 ? 0 : 1;
                allStake += data[i][8];
                allIncome += data[i][9];
                goodWin += data[i][12] <= 0 ? 0 : 1;
                allGoodOdds += data[i][12];
                allBadOdds += data[i][13];
            }
            data.unshift([count, '', '', '', '', (allWinOdds/count).fixed(2), (myWin/count).fixed(2), allStake, allIncome, (allIncome - allStake).fixed(1), (allIncome/allStake).fixed(2), (goodWin/count).fixed(2), (allGoodOdds/count).fixed(2), (allBadOdds/count).fixed(2)]);
            data.unshift(['已结束场次','','','','','全胜赔率','投注胜率','总投入','总收入','总盈收','回本率','优胜盈率','全优胜回本率','全非优胜回本率']);
            exportXlsx(data, 'bili-guess.xlsx');
        });
    }

    function init() {
        // 投注列表显示下载链接
        let div = $('.part-title .clear-fix > div');
        let a = document.createElement("a");
        a.innerText = '下载投注分析 ';
        a.addEventListener('click', analyse);
        div.insertBefore(a, div.childNodes[0]);

        // 竞赛列表显示赔率倍数
        until("$$('.competition-list > li').length > 0", ()=>{
            let lis = $$('.competition-list > li');
            for (let i in lis) {
                let li = lis[i],
                    title = $('.part-title > h3', li),
                    dvs = $$('.competition-ul > div', li),
                    pay1 = parseFloat($('.how-pay', dvs[0]).innerText.replace('奖励率: ', '')),
                    pay2 = parseFloat($('.how-pay', dvs[1]).innerText.replace('奖励率: ', '')),
                    rate = pay1 > pay2 ? (pay1 / pay2).toFixed(1) : (-1 * pay2 / pay1).toFixed(1);
                title.innerText = title.innerText.replace('胜者是？', '赔率倍数是 ' + rate);
            }
        });
    }

    init();
})();