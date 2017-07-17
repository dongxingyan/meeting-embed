import { module } from 'angular';

declare let require;
require('./msg.styl');
let tmpl = require('./msg.tmpl.html');

export let name = 'nut.msg';

module(name, [])
    .component('nutMsg', {
        template: tmpl,
        transclude: true,
        bindings: { show: '=', modalId: '@' },
        controllerAs: 'vm',
        controller: ['$scope','NutModal','$timeout',
            function ($scope,NutModal,$timeout) {
                NutModal.register(this.modalId, () => {
                    this.show = true;
                    $timeout(function(){
						this.show = false;
					},2000);
                    return () => {
                        this.show = false;
                    }
                })
            }]
    });