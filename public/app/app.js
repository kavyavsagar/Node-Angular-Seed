'use strict';
/**
* Declare app level module which depends on filters, and services
* 
* Declaration of angular app and its routing. Include all services and other module that are used for angular
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Angular App
* @subpackage app
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

var app = angular.module('applineup', ['ngMap','ngRoute', 'ngSanitize', 'ngCookies', 'ui.bootstrap', 'ui.select']); 
    
app.config(function($routeProvider, $locationProvider) {
    $routeProvider.
            when('/search', {
                templateUrl: 'partials/search',
                controller: searchCtrl, 
                isSearch  : true            
            }).  
            when('/aboutus', {
                templateUrl: 'partials/aboutus',
                controller: aboutusCtrl             
            }). 
            when('/privacy', {
                templateUrl: 'partials/privacy',
                controller: privacyCtrl             
            }). 
            when('/terms-of-use', {
                templateUrl: 'partials/terms-of-use',
                controller: termsOfUseCtrl
            }).
            when('/contact', {
                templateUrl: 'partials/contact',
                controller: contactCtrl             
            }). 
             when('/mylineups', {
                templateUrl: 'partials/mylineups',
                controller: mylineupCtrl             
            }).            
            when('/browse', {
                templateUrl: 'partials/index',
                controller: indexCtrl             
            }).
            when('/', {
                templateUrl: 'partials/landing',
                controller: landingCtrl,
                isLanding:true             
            }).
            when('/account', {                           
                controller: accountCtrl,
                templateUrl: 'partials/index' 
            }).                    
            when('/500', {                           
                controller: serverErrorCtrl,
                templateUrl: 'partials/500'                   
            }).
            otherwise({
                controller: notFoundCtrl,
                templateUrl: 'partials/404'
            });
    $locationProvider.html5Mode(true).hashPrefix('!');
   
});


app.run(function(Auth, LineStorageService, $rootScope) { 
        Auth.get();
          
        $rootScope.baseUrl = "http://"+ window.location.host;        

        $rootScope.$on('$routeChangeStart', function(event, next,current) {

            $rootScope.searchFooter = false;

            if(next.isSearch && next.isSearch === true){ 
                $rootScope.searchFooter = true;
            }
            $rootScope.isLand = false;

            if(next.isLanding && next.isLanding === true){ 
                $rootScope.isLand = true;
            }
            
        /*$rootScope.showNoimage = false; $rootScope.viewLineupDetails = '';
           
           if($rootScope.viewLinesPop){
                $rootScope.viewLineupDetails  = JSON.parse(LineStorageService.getLineupDetails());

                if(!$rootScope.viewLineupDetails.smallpicture && $rootScope.viewLineupDetails.smallpicture == ''){
                    $rootScope.showNoimage = true; 
                }
                // show modal             
                setTimeout(function(){    
                    $('#detailapart').modal({show: true});  
                   
                },800);
             
           }*/
           
        });
});