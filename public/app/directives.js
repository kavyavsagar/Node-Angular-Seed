'use strict';
/**
* Demonstrate how to use app directives 
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Angular Directives
* @subpackage directives
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

angular.module('applineup.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  });
  
var editer = angular.module('editer', []);
//Credit for ngBlur and ngFocus to https://github.com/addyosmani/todomvc/blob/master/architecture-examples/angularjs/js/directives/
editer.directive('ngBlur', function() {
  return function( scope, elem, attrs ) {
    elem.bind('blur', function() {
      scope.$apply(attrs.ngBlur);
    });
  };
});

editer.directive('ngFocus', function( $timeout ) {
  return function( scope, elem, attrs ) {
    scope.$watch(attrs.ngFocus, function( newval ) {
      if ( newval ) {
        $timeout(function() {
          elem[0].focus();
        }, 0, false);
      }
    });
  };
});
// If the image path is broken, it would replace with no image path
app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {        
      element.bind('error', function() { 
            element.attr('src', attrs.errSrc);          
      });
    }
  }
});

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {   
        element.bind("keydown keypress", function (event) {            
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});