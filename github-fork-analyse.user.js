// ==UserScript==
// @name        GitHub forks analyse
// @version     0.4.1
// @description A userscript that analyzes GitHub forks, shows compare info between fork repos and parent repo, helps you to find out the worthiest fork.
// @license     MIT
// @author      Sean Zhang
// @namespace   https://github.com/zhangsean
// @include     https://github.com/*/network/members
// @run-at      document-idle
// @grant       GM_xmlhttpRequest
// @icon        https://github.githubassets.com/pinned-octocat.svg
// @updateURL   https://github.com/zhangsean/userscripts/raw/master/github-fork-analyse.user.js
// @downloadURL https://github.com/zhangsean/userscripts/raw/master/github-fork-analyse.user.js
// @supportURL  https://github.com/zhangsean/GitHub-userscripts/issues
// ==/UserScript==

(function() {
    'use strict';

    const $ = (selector, el) => (el || document).querySelector(selector);
    const $$ = (selector, el) => [...(el || document).querySelectorAll(selector)];

    Date.prototype.format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"H+":this.getHours(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var s in/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t};

    const sleep=(t)=>new Promise(f=>setTimeout(f,t));

    const gm=(u,f)=>GM_xmlhttpRequest({url:u,onload:(xhr)=>{let h=xhr.responseText,e=h.indexOf('Whoa there!');f(e==-1?h:'Whoa Github limits!');}});

    const show=(el,html)=>{el.innerHTML+=", "+html};

    const color=(msg,type=0)=>(", <b"+(0==type?"":' style="color:'+(type>0?"red":"#01cc1b")+';"')+">"+msg+"</b>");

    var myDt = 0; // Latest commit time of current repo
    var parentRepo = ''; // Parent repo
    var limitError = 'Whoa there!';

    function analyseDate (el, ix, html) {
        let i = html.indexOf('datetime');
        if (i > -1) {
            let dt = html.substring(i + 10, html.indexOf('"', i + 10));
            dt = new Date(dt);
            el.latestDate = dt.format('yyyy-MM-dd HH:mm:ss');
            if (ix == 0) {
                myDt = dt
                show(el, el.latestDate);
            } else {
                let df = Math.round((dt - myDt) / 86400000, 0);
                el.analyseDate = color((df == 0 ? 'same day' : (Math.abs(df) + ' day' + (Math.abs(df) > 1 ? 's' : '') + (df > 0 ? ' ahead' : ' behind'))), df);
                show(el, el.latestDate + el.analyseDate + el.analyseCommit);
            }
        }
    }

    function analyse(el, ix) {
        if(!myDt && ix > 0) {
            sleep(200).then(()=>analyse(el, ix));
            return;
        }
        // Get fork repo info
        let repo = $('a:last-child', el).attributes.href.nodeValue.substr(1);
        gm(`https://github.com/${repo}`, (html)=>{
            // Meet Github limits
            let e = html.indexOf(limitError);
            if (e > -1) {
                console.log(limitError, html);
                show(el, color(limitError, -1), 1);
                return;
            }
            // Get fork compare info
            let i = html.indexOf('This branch is');
            if (i > -1) {
                let compare = html.substring(i + 12, html.indexOf('.', i)),
                    branch = compare.split(':')[1];
                compare = compare.substring(0, compare.lastIndexOf(' '));
                let e = compare.indexOf('up to date');
                if (e > -1) {
                    compare = compare.replace('up to date with', '<b>even commit</b>');
                }
                let a = compare.indexOf('ahead');
                if (a > -1) {
                    let num = compare.substring(compare.lastIndexOf('is', a) + 3, a + 5);
                    compare = compare.replace(num, '<b style="color:red;"> ' + num + ' </b>');
                }
                let b = compare.indexOf('behind');
                if (b > -1) {
                    let d = compare.lastIndexOf(',', b);
                    if (d == -1) {
                        d = compare.lastIndexOf('is', b) + 1;
                    }
                    let num = compare.substring(d + 2, b + 6);
                    compare = compare.replace(num, '<b style="color:#01cc1b;"> ' + num + ' </b>');
                }
                let user = repo.split('/')[0];
                el.analyseCommit = ', ' + compare.replace('is', '') + ' ' + `<a target=_blank href="https://github.com/${parentRepo}/compare/${branch}...${user}:${branch}">Compare</a>`;
            }
            // Get latest commit time
            i = html.indexOf('tree-commit');
            if (i > -1) {
                let link = html.substring(html.lastIndexOf('"', i) + 1, html.indexOf('"', i));
                gm(`https://github.com${link}`, (html)=>{
                    analyseDate (el, ix, html);
                });
            } else {
                analyseDate (el, ix, html);
            }
        });
    }

    function init() {
        const root = $(".network");
        const repos = $$(".network .repo");
        if (root && repos.length > 0) {
            console.log('Fork repos', repos.length);
            parentRepo = $('a:last-child', repos[0]).attributes.href.nodeValue.substr(1);

            repos.forEach((el, i)=>{
                // Delay 1 minute every 100 requests to avoid Github limits
                sleep(i + (Math.floor(i / 100) * 60000)).then(()=>analyse(el, i));
            });

        }
    }

    init();

})();
