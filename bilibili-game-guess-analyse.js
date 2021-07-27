// ==UserScript==
// @name         bilibili-game-guess-analyse
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Analyse bilibili game match history!
// @author       ZhangSean
// @icon         https://static.hdslb.com/images/favicon.ico
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @match        https://www.bilibili.com/v/game/match/competition
// @icon         https://www.google.com/s2/favicons?domain=bilibili.com
// ==/UserScript==

(function() {
    'use strict';

    const $ = (selector, el) => (el || document).querySelector(selector);
    const $$ = (selector, el) => [...(el || document).querySelectorAll(selector)];

    Date.prototype.format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"H+":this.getHours(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var s in/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t};

    const sleep=(t)=>new Promise(f=>setTimeout(f,t));

    const gm=(u,f)=>GM_xmlhttpRequest({url:u,onload:(xhr)=>{let h=xhr.responseText,e=h.indexOf('Whoa there!');f(e==-1?h:'Whoa Github limits!');}});

    const show=(e,b,c=0)=>{e.innerHTML+=" <b"+(0==c?"":' style="color:'+(c>0?"red":"#01cc1b")+';"')+">"+b+"</b>"};

	function init() {

        var recordUrl = 'https://api.bilibili.com/x/esports/guess/collection/record?type=2&pn=1&ps=100';
        let matchUrl = 'https://api.bilibili.com/x/esports/guess?cid=';
        gm(recordUrl, (resp)=>{
            let json = eval('(' + resp + ')');
            console.log(json.data);
            console.log('title|odds1|odds2|right_option|right_odds|my_option|my_odds|stake|income');
            console.log('-|-|-|-|-|-|-|-|-');
            for(var i in json.data.record){
                let g = json.data.record[i].guess[0];
                let info = g.title.replace(' 的胜者是？','') + '|';
                gm(`${matchUrl}${g.oid}`, (resp)=>{
                    let json = eval('(' + resp + ')');
                    if (!!json.data) {
                        let details = json.data.guess[0].details;
                        info += details[0].odds + '|';
                        info += details[1].odds + '|';
                        info += g.right_option+'|';
                        info += details[g.title.indexOf(g.right_option) == 0 ? 0 : 1].odds + '|';
                        info += g.option+'|';
                        info += details[g.title.indexOf(g.option) == 0 ? 0 : 1].odds + '|';
                        info += g.stake+'|'+g.income;
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
