"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var angualr = require("angular");
var page = require("./nut-page");
var actionSheet = require("./nut-action-sheet");
var alert = require("./nut-alert");
var msg = require("./nut-msg");
var picker = require("./nut-picker");
exports.name = 'nuts';
exports.module = angualr.module(exports.name, [
    page.name,
    actionSheet.name,
    alert.name,
    msg.name,
    picker.name // 暂未完成
]);
//# sourceMappingURL=nuts.js.map