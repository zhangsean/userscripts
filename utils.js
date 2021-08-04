/**
 * user script utils
 * v0.2.1
 * Copyright © 2021 Sean Zhang
 */
'use strict';

/**
 * 控制台打印日志
 */
const log = console.log;

/**
 * 返回指定表达式的首个DOM元素
 * @param {string} selector 元素选择器表达式
 * @param {element} el 搜索范围根元素，默认document整个页面
 * @returns 返回选择到的首个元素
 */
const $ = (selector, el) => (el || document).querySelector(selector);

/**
 * 返回符合指定表达式的所有DOM元素数组
 * @param {string} selector 元素选择器表达式
 * @param {element} el 搜索范围根元素，默认document整个页面
 * @returns 返回选择到的所有元素数组
 */
const $$ = (selector, el) => [...(el || document).querySelectorAll(selector)];

/**
 * 执行GM异步请求，返回Json内容回调指定函数
 * @param {string} u 请求的URL
 * @param {function} f 请求完成后的处理逻辑，参数 responseJson || responseBody
 * @returns ajaxRequest
 */
const gm = (u, f) => GM_xmlhttpRequest({url: u, onload: (xhr) => {let t=xhr.responseText, j=eval('('+t+')'); f(j||t)}});

/**
 * 循环定时判断，直到满足指定条件后执行任务
 * @example until(()=>$$(".list").length > 0, ()=>{console.log('ajax list ok')});
 * @param {function} c 返回判断结果的函数
 * @param {function} f 条件满足后执行的函数
 * @param {int} ms 循环判断间隔，默认10毫秒
 */
const until = (c, f, ms) => {ms=ms||10;let tid = setInterval(()=>{if(c()){clearInterval(tid);f();}},ms)};

/**
 * 定时 n 毫秒后执行任务
 * @example sleep(1000).then(()=>{console.log(1)});
 * @param {int} ms 毫秒数
 * @returns n 毫秒后执行后续
 */
const timer = ms => new Promise(f => setTimeout(f, ms));

/**
 * 数字保留n位小数位
 * @param {int} n 小数位数
 * @returns 返回保留n位小数的数字
 */
Number.prototype.fixed=function(n){n=n||0;return Math.round(this*Math.pow(10,n))/Math.pow(10,n)};

/**
 * 日期格式化成指定格式
 * @example new Date().format('yyyy-MM-dd HH:mm:ss')
 * @param {string} t 时间格式
 * @returns 格式化后的字符串
 */
Date.prototype.format=function(t){var e={"M+":this.getMonth()+1,"d+":this.getDate(),"H+":this.getHours(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),S:this.getMilliseconds()};for(var s in/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))),e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t};
