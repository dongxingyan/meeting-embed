declare let require: any;
import * as angualr from 'angular';


export let name = 'nuts.picker';
require('./picker.styl')

angualr.module(name, [])
    .directive('nutPicker', [
        function() {
            return {
                template: require('./picker.tmpl.html'),
                controller: [function() { }],
                scope: {
                    nutData: '<',
                    nutIndex: '='
                },
                link: function(scope, elem, attrs) {
                    let outerEl = <HTMLDivElement>elem[0].getElementsByClassName('nut-picker-container')[0];
                    let innerEl = <HTMLDivElement>elem[0].getElementsByClassName('nut-picker-scrollview')[0];
                    let contentHeight = innerEl.offsetHeight;
                    let containerHeight = outerEl.offsetHeight;

                    outerEl.addEventListener('touchend', x => {
                        // console.log(outerEl.scrollTop);
                    })


                }
            }
        }
    ]);