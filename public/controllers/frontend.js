'use strict';
/**
 * Frontend controllers 
 *
 * LICENSE: Some license information
 *
 * @category Node Angular Seed
 * @package Angular Controller
 * @subpackage controller_frontend
 * @version  $Id:$v.1.0
 * @date 29-09-2014
 * @author debugger@hotmail.co.uk
 */


/**
 * @ngdoc function
 * @name IndexCtrl
 * @function
 *
 * @description index/ browse page of frontend of the site
 * @param {string} scope, rootscope, services objects, location redirect, modal, http 
 * @returns {string} null
 * @author kavya Sagar
 * @date 29-09-2014
 */
function indexCtrl($scope, pinService, Auth, $location, $http,$timeout, $modal, $rootScope, LineStorageService) {
    
    $scope.arrlineups = [];
    $scope.args = {};
    $scope.page_limit = 9;
    $scope.next = 0; 
    $scope.loadmore = true;
    $scope.loading = false;
    $scope.lastCard = false;   
    $scope.gindx = 0;      
    $scope.args.sort = 'mylineup_count';
    /*
    *  Load lineups initially
    */ 
    $scope.initLineups = function(){  
        
        $scope.next += $scope.page_limit;
        $scope.loading = true;
        $scope.args.limit = $scope.next;

        pinService.findLineups($scope.args, function(resp) { 

            if(resp.totalcount < $scope.next){
                $scope.loadmore = false;
            } 
            // check for result exists based on cookie
            var resCnt = resp.apart;
            if(resCnt.length >0){
                angular.forEach(resp.apart, function(value, key) {                           
                    $scope.arrlineups.push(value);                  
                });
               
                $scope.loading = false; 
            }else{ 
                $scope.lastCard = true;   
                $scope.loading  = false;  
                $scope.loadmore = false;
            }
            
        });  
    };   
    //define initially
    $scope.initLineups();
                    
    /*
    *  Filter most popular lineups
    */ 
    $scope.mostPopular = function() { 
        $scope.page_limit = 9;
        $scope.args.sort = 'mylineup_count';
        
        pinService.resetSearchCookie(function(res){
            if(res){
                $scope.selectedAddress = '';
                $scope.arrlineups = [];  
                $scope.next = 0;
                $scope.loadmore = true;
                $scope.lastCard = false;  
                $scope.initLineups();
            }
        });
    };


    /*
    *  Search Typehead of apartment address
    */   
    $scope.disabled = undefined;

    $scope.enable = function() {
        $scope.disabled = false;
    };

    $scope.disable = function() {
        $scope.disabled = true;
    };

    $scope.clear = function() {  
        $scope.city.selected = undefined;    
    };

    $scope.city = {};

    pinService.getLocations(function(res){
        // to request another city
        $scope.region = res.concat({name : ""});        
    });

    /*
    *  filter search result with search keyword
    */ 
    $scope.selectedAddress = '';
    $scope.searchLineups = function(item){  
        console.log(item);
        //$scope.selectedAddress = ($scope.selectedAddress)? $scope.selectedAddress: item;

        $scope.selectedAddress = item;
        if(!$scope.selectedAddress){return false;}
        
        $scope.loadmore = false;
        $scope.lastCard = true; 
        
        pinService.nearbyLocations({address : $scope.selectedAddress}).then(function(resp) { 
            $scope.arrlineups = resp.apart;
        });
        
    };
      
    /*
     *  Load lineups section
     */
    $scope.loader = false;
    $scope.loadLineUps = function(place){      

        $scope.lineuplabel = '';  $scope.uLineups = [];
        $scope.loader = true;
        $("#add-lineups").find('.alert').hide();
        
        //check if the user is login 
        Auth.requireLogin(function(res) { 
            
            $("#add-lineups").modal('show'); 
            $("#hide-opt").show(); 
            $(".aprt-line").hide();            

            Auth.userLineups(function(result) {  
                if(result.lineups){   
                    angular.forEach(result.lineups, function(value, key) {                           
                        if(key === 'labels'){              
                           $scope.uLineups = value;
                           $scope.loader = false;
                        }                         
                    });                  
                } else{$scope.loader = false;} 
            });  

        });

        // add it to global variable
        pinService.addPin(place);  
    };
    /*
     * create label and assigned lineup into it
     */
    $scope.saveLineup = function(){

        $rootScope.$broadcast("handleCreateLineup", {'lineuplabel': $scope.lineuplabel});
        
    };
    /*
     * Select existing label and assigned selected lineup into it
     */
    $scope.selRow = function(labelId, rindex){
        if(!labelId)return false;
        
        $('#radio' + rindex).prop("checked", true); 
        $rootScope.$broadcast("handleSaveExistLineup", {'labelId': labelId});
    };
    /*
     * View the details of lineup
     */
    $scope.viewLineUp = function(lineupId){
        $rootScope.$broadcast("handleViewLineup", {'lineupId': lineupId});

    };
    
    $scope.viewScreenshots = function(lines){ 
        $("#screenshot-"+ lines).modal('show'); 
    };

    /*angular.element(document).ready(function () {
            
         $("#screenshot-"+ lines).on('hidden.bs.modal', function (e) { 
                $('body').addClass('modal-open');
          });
    });
*/

}
/**
 * @ngdoc function
 * @name MylineupCtrl
 * @function
 *
 * @description Mylineup page of frontend of the site
 * @param {string} scope and services
 * @returns {string} null
 * @author kavya Sagar
 * @date 29-09-2014
 */
function mylineupCtrl($scope, Auth, $rootScope, $location){
    
    $scope.myitems = [];
    $scope.itemsPerPage = [];
    var itemsPerPage = 3;
    $scope.currentPage = [];
    var currentPage = 0;
    $scope.loading = true;
  
    if(!$rootScope.userLog){
        $location.path('/');
    }
    
    //check if the user is login 
    Auth.requireLogin(function(res) { 
        // fetch all my lineups
         Auth.limtedLineups(function(result) { 
            if(result.err === false){               
                angular.forEach(result.items, function(value, key) {                     
                    $scope.myitems.push(value);
                    $scope.itemsPerPage[key] = itemsPerPage;
                    $scope.currentPage[key] = currentPage;
                });                   
            }
            $scope.loading = false; 
        });
    }); 

    //for pagination 
    $scope.pageCount = function(indx) {      
        var aitem = $scope.myitems[indx].lineups;    
        
        var len = (parseInt(aitem.length) / parseInt($scope.itemsPerPage[indx]) );
        if(len % 1 != 0){len = parseInt(len)+1; }// 23.5 % 1 = 0.5
       
        return len;        
    };
    // for next page
    $scope.nextPage = function(ind) {
        if ($scope.currentPage[ind] < $scope.pageCount(ind)) { 
           $scope.currentPage[ind]++;
           $scope.itemsPerPage[ind] += itemsPerPage;  
       }else{
           $scope.nextPageDisabled(ind);
       }
    };
    // disable pagination if there is no more page left
    $scope.nextPageDisabled = function(ind) { 
        
        var tot = $scope.pageCount(ind);
        if(tot == 1){
            return "loaddisabled";
        }
        return $scope.currentPage[ind] === $scope.pageCount(ind) ? "loaddisabled" : "";
    };
    
    //remove lineups
    $scope.delLineup = function(lineid, labelid){  
      
        Auth.delLineups({lineId : lineid, labelId : labelid}, function(resp) { 
             if(resp){ 
                $scope.myitems = [];
                angular.forEach(resp.lineups, function(value, key) { 
                   $scope.myitems.push(value);
                });             
            }
           
        });
    };
    // view screenshots on modal window
    $scope.viewScreenshots = function(lines){
        $("#screenshot-"+ lines).modal('show'); 
    };

}

/**
 * @ngdoc function
 * @name LandingCtrl
 * @function
 *
 * @description Landing page of the site
 * @param {string} scope and services
 * @returns {string} null
 * @author kavya Sagar
 * @date 26-03-2015
 */
function landingCtrl($scope, $cookies, $location){
    var input, autocomplete;

    // google.maps.event.addDomListener(window, 'load', $scope.initialize);

    $scope.showAddress = function() {       
      console.log('dfdfefad')
       google.maps.event.addListener(autocomplete, 'place_changed', function() {

            var place = autocomplete.getPlace();          
            if (!place.geometry) {
                return;
            }         
            $cookies.placelocation = place.geometry.location.lat()+','+ place.geometry.location.lng();
        
            $location.path('/search');
        });  
    };
    
    $scope.initialize = function() {       
        input = document.getElementById('searchTextField');
        autocomplete = new google.maps.places.Autocomplete(input);
        
        $scope.showAddress(); 
    }

    $scope.redirectLocn = function(){

    $location.path('/browse');
   }
}