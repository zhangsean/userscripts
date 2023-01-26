// ==UserScript==
// @name        GitHub forks analyse
// @version     0.5.1
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
// @supportURL  https://github.com/zhangsean/userscripts/issues
// @testURL     https://github.com/zhangsean/docker-frp/network/members
// ==/UserScript==

(function() {
    'use strict';

    const $ = (selector, el) => (el || document).querySelector(selector);
    const $$ = (selector, el) => [...(el || document).querySelectorAll(selector)];

    Date.prototype.format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"H+":this.getHours(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var s in/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t};

    const sleep=(t)=>new Promise(f=>setTimeout(f,t));

    const gm=(u,f)=>GM_xmlhttpRequest({url:u,onload:(xhr)=>{let h=xhr.responseText,e=h.indexOf('Whoa there!');f(e==-1?h:'Whoa Github limits!');}});

    const show=(el,html)=>{el.innerHTML+=", "+html};

    const color=(msg,type=0)=>(", <span"+(0==type?"":' style="color:'+(type>0?"red":"#01cc1b")+';"')+">"+msg+"</span>");

    const log=console.log;

    var myDt = 0; // Latest commit time of current repo
    var parentRepo = ''; // Parent repo
    var limitError = 'Whoa there!';

    function analyseDate (el, ix, html) {
        // Get latest commit time
        let i = html.indexOf('datetime'),
            t = html.indexOf('tree-commit');
        if (i > -1) {
            let dt = html.substring(i + 10, html.indexOf('"', i + 10));
            dt = new Date(dt);
            el.latestDate = dt.format('yyyy-MM-dd HH:mm:ss');
            if (ix == 0) {
                myDt = dt
                show(el, el.latestDate);
            } else {
                let df = Math.round((dt - myDt) / 86400000, 0);
                el.analyseDate = color((df == 0 ? 'up to date' : (Math.abs(df) + ' day' + (Math.abs(df) > 1 ? 's' : '') + (df > 0 ? ' ahead' : ' behind'))), df);
                show(el, el.latestDate + el.analyseDate + el.compareLink);
            }
        } else if (t > -1) {
            let link = html.substring(html.lastIndexOf('"', t) + 1, html.indexOf('"', t));
            gm(`https://github.com${link}`, (html)=>{
                analyseDate (el, ix, html);
            });
        }
    }

    function analyse(el, ix) {
        if(!myDt && ix > 0) {
            sleep(100).then(()=>analyse(el, ix));
            return;
        }
        // Get fork repo info
        let repo = $('a:last-child', el).attributes.href.nodeValue.substr(1);
        let info = repo.split('/'),
            user = info[0],
            proj = info[1];
        //if (user != 'zhangsean' && user != 'jayagami' && user != 'adminidor') return;
        gm(`https://github.com/${repo}`, (html)=>{
            log(user, proj)
            // Meet Github limits
            let e = html.indexOf(limitError);
            if (e > -1) {
                log(limitError, html);
                show(el, color(limitError, -1), 1);
                return;
            }
            // Get fork compare info
            let i = html.indexOf('This branch is');
            log('i=', i);
            if (i == -1) {
                // The root repo
                analyseDate (el, ix, html);
            } else {
                let e = html.indexOf('up to date');
                if (e > -1) {
                    el.compareLink = ', even commit';
                    analyseDate (el, ix, html);
                } else {
                    let compareLink = '';
                    let compare = html.substring(html.indexOf('href', i), html.indexOf('>.', i)),
                        branch = compare.substring(compare.lastIndexOf(' '), compare.indexOf('</span')).split(':')[1];
                    compare = compare.substring(0, compare.lastIndexOf(' '));
                    log('compare=', compare)
                    log('branch=', branch)
                    let b = compare.indexOf('behind');
                    if (b > -1) {
                        let d = compare.lastIndexOf('">', b);
                        if (d == -1) {
                            d = compare.lastIndexOf('is', b) + 1;
                        }
                        let link = compare.substring(compare.lastIndexOf('href', b), compare.indexOf('</a>', b) + 4),
                            num = link.substring(link.indexOf('">') + 2, b + 6);
                        compareLink = ', <a target=_blank style="color:#01cc1b;" ' + link;
                    }
                    let a = compare.indexOf('ahead');
                    if (a > -1) {
                        let link = compare.substring(compare.lastIndexOf('href', a), compare.indexOf('</a>', a) + 4),
                            num = link.substring(link.indexOf('">') + 2, a + 5),
                            href = link.substring(link.indexOf('"') + 1, link.lastIndexOf('"'));
                        log('ahead num=', num)
                        log('href=', href)
                        gm(`https://github.com${href}`, (cHtml)=>{
                            let f = cHtml.indexOf('changed</'),
                                f2 = cHtml.indexOf('Files changed'),
                                files = 0;
                            log('f=', f)
                            if (f > -1) {
                                files = cHtml.substring(cHtml.lastIndexOf('text-emphasized', f) + 17, cHtml.lastIndexOf('</span>', f) - 3).trim()
                            } else if (f2 > -1) {
                                files = cHtml.substring(cHtml.indexOf('>', f2) + 1, cHtml.indexOf('</', f2))
                            }
                            log('files=', files, user)
                            compareLink += ', <a target=_blank ' + link.replace(num, '<b style="color:red;"> ' + num + ` ( ${files} files changed)` + '</b>');
                            el.compareLink = compareLink;
                            log('compareLink=', el.compareLink)
                            analyseDate (el, ix, html);
                        });
                    } else {
                        el.compareLink = compareLink;
                        log('compareLink=', el.compareLink)
                        analyseDate (el, ix, html);
                    }
                }
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
                // Delay 1 minute every 60 requests to avoid Github limits
                sleep(i + (Math.floor(i / 60) * 60000)).then(()=>analyse(el, i));
            });

        }
    }

    init();

})();
