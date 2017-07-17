/**
 * 项目中通用的库的引入，会打包到util.js
 */

declare let require;
import * as angular from 'angular'
import * as uiRouter from 'angular-ui-router'

let ngswiper = require('angular-swiper/dist/angular-swiper');
let swiper = require('swiper');


let requires = window['requires'] = [angular, uiRouter, swiper,ngswiper];