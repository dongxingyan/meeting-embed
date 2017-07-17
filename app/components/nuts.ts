import * as angualr from 'angular';
import * as page from './nut-page';
import * as actionSheet from './nut-action-sheet';
import * as alert from './nut-alert';
import * as msg from './nut-msg';
import * as picker from './nut-picker'

export let name = 'nuts';
export let module = angualr.module(name, [
    page.name,
    actionSheet.name,
    alert.name,
    msg.name,
    picker.name // 暂未完成
]);