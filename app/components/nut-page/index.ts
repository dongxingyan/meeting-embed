declare let require;
require('./page.styl')

let tmpl = require('./page.tmpl.html');
import { module } from 'angular';
import * as m_native from '../../common/nativeApi';

export let name = 'nut.page';
module(name, [])
    .component('nutPage', {
        template: tmpl,
        transclude: true,
        bindings: { title: '@', icon: '@', extCallback: "&", hideTitle: '<' },
        controllerAs: 'vm',
        controller: ['$scope', '$state', 'RouteControl', m_native.servName,
            function ($scope, $state, RouteControl, native: m_native.NativeApiService) {
                let styleConfig = this.styleConfig = {};
                this.hasBackBtn = () => RouteControl.stateStack.length > 1;
                setTimeout(() => {
                    try {
                        console.debug(`尝试设置标题：native.setBrowserTitle({ title: ${this.title} ,hideTitle:${!!this.hideTitle}});`, this)
                        native.setBrowserTitle({ title: this.title, hideTitle: !!this.hideTitle });
                    } catch (err) {
                        console.debug('尝试设置标题时出错', err)
                    }
                })

                /**
                 * 按钮的样式设置
                 */
                styleConfig[this.icon] = true;
                this.goBack = () => {
                    RouteControl.goBack();
                }
            }]
    })