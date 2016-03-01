'use strict';
/**
* Demonstrate how to register services
*
* Services that persists and retrieves values from localStorage
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Angular Servicess
* @subpackage services_admin
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

var modulefactory = angular.module('applineup');

/**
 * @ngdoc function
 * @name Auth
 * @function
 *
 * @description Manage user authentication with cookie variable. The lineups relation with a user are belongs to this service
 * @param {string} user credentials, rootscope, location redirect
 * @returns {string} success with responds or failure
 * @author kavya Sagar
 * @date 24-10-2014
 */
modulefactory.factory('Auth', function ($http, $cookies, $location, $rootScope) {  
    return {      
        get: function (credentials) {
            if($cookies.user){ 
              var userData = JSON.parse($cookies.user);         
              $rootScope.userLog = userData.id;
            }
        },
        getUser: function(userId, callback){   
            $http.get('/userDetails/' + userId).
               success(function(response) {
               callback(response);
           }).error(function (res, status) {                  
               if(status == '500'){                  
                   $location.path('/500');
               }               
           });
        },
        logout: function (callback) { 
           $http.get('/api/logout').success(function(){ 
                callback();
           }).error(function (res, status) {                  
               if(status == '500'){                    
                   $location.path('/500');
               }               
           });
        },
        requireLogin: function (callback) {
            if(!$rootScope.userLog){ //not loggedin
                window.location = "/login"
               // $("#myModal").modal('show');
            }else{// already login
                callback();
            }
        },
        userLineups: function(callback){   
            $http.get('/userLineups').
               success(function(response) {
                console.log(response);
               callback(response);
           }).error(function (res, status) {                  
               if(status == '500'){                  
                   $location.path('/500');
               }               
           });
        },
        limtedLineups: function(callback){   
            $http.get('/limtedLineups/').
               success(function(response) {

               callback(processDatas(response));
           }).error(function (res, status) {                  
               if(status == '500'){                  
                   $location.path('/500');
               }               
           });
        },
        delLineups: function(args, callback){   
            $http.post('/delLineups', args).success(function(response) {            
               callback(response);
           }).error(function (res, status) {                  
               if(status == '500'){                  
                   $location.path('/500');
               }               
           });
        }
    };  
});
/**
 * @ngdoc function
 * @name pinService
 * @function
 *
 * @description All Node Angular Seeds are managed with this service
 * @param {string} location redirect, rootscope as global variable
 * @returns {string} success with responds  or failure
 * @author kavya Sagar
 * @date 24-10-2014
 */
app.service('pinService', function($http, $location, $rootScope) {
  var pinDetails = []; 

  var addPin = function(newObj) {    
   
    pinDetails = newObj;
  }

  var getPin = function(){
    return pinDetails;
  }

  var getLocations = function(callback){ 
     $http.get('/app/location.json')
      .then(function(res){
         if(res.data) callback(res.data);
      }); 
  }
  
  var savePin = function(lineup, callback){
      var pinArr = new Array();      
      if(pinDetails){ 
            pinArr = pinDetails;
      }

     if($rootScope.userLog){  
        pinArr.userId = $rootScope.userLog;
        
        if(lineup.labName){
           pinArr.lineupname = lineup.labName;
        }
        if(lineup.labId){
           pinArr.labelId = lineup.labId;
        }      
       
        pinArr.lat = pinArr.geometry.location.lat();
        pinArr.lng = pinArr.geometry.location.lng();

        if(pinArr.photos){
            pinArr.pics = pinArr.photos[0].getUrl({'maxWidth': 35, 'maxHeight': 35});
            //Get photo details of place 
            var photos = pinArr.photos,
                arphotos = [],
                url;

            angular.forEach(photos, function(value, key) {                           
                url = value.getUrl({ 'maxWidth': value.width, 'maxHeight': value.height});
                arphotos.push({width: value.width, height: value.height, photourl: url});
            });

            if(arphotos.length >0){
                pinArr.photos = arphotos;
            }            
        }         

        $http.post('/api/addLineUp', pinArr).success(function(response) {
                callback(response);
        }).error(function (res, status) {                  
            if(status == '500'){                   
                $location.path('/500');
            }               
        });
     }
  }
  var saveApartToUser = function(lineup, callback){
      var pinArr = new Array();
      if(pinDetails){ 
            pinArr = pinDetails;
      }

     if($rootScope.userLog){
        pinArr.userId = $rootScope.userLog;
        
        if(lineup.labName){
           pinArr.lineupname = lineup.labName;
        }
        if(lineup.labId){
           pinArr.labelId = lineup.labId;
        }

        $http.post('/addToUserLineUp', pinArr).success(function(response) {
                callback(response);
        }).error(function (res, status) {                  
            if(status == '500'){                   
                $location.path('/500');
            }               
        });
     }
  }
  var updateLineup = function(place, callback){      
        $http.post('/api/updateLineup', {place_id :place}).success(function(response) {
                callback(response);
        }).error(function (res, status) {                  
            if(status == '500'){                   
                $location.path('/500');
            }               
        });
  }
  
  var findLineups = function(args, callback){
      
        $http.post('/api/findLineups', args).success(function(response) {
                  callback(response);
            }).error(function (res, status) {                  
                if(status == '500'){                   
                    $location.path('/500');
            }               
        });
  }
  var loadLocations = function(args){
      
        return $http.post('/api/loadLocations', args).then(function(resp) {
            return resp.data; // success callback returns this        
        });
  }
  var resetSearchCookie = function(callback){
      
        $http.get('/api/resetSearch').success(function(){ 
              callback(true);
           }).error(function (res, status) {                  
               if(status == '500'){                    
                   $location.path('/500');
               }               
        });
  }
  
  var nearbyLocations = function(args){
      
        return $http.post('/api/nearbylocations', args).then(function(resp) {
            return resp.data; // success callback returns this        
        });
  }

  var getalineup = function(args, callback){
      
        $http.post('/api/getalineup', args).success(function(response) {
                
                callback(processGoogle(response));
                  
            }).error(function (res, status) {                  
                if(status == '500'){                   
                    $location.path('/500');
                }               
        });
  }

  return {
    addPin: addPin,
    getPin: getPin,
    savePin: savePin,
    getLocations: getLocations,
    findLineups: findLineups,
    loadLocations: loadLocations,
    saveApartToUser: saveApartToUser,
    getalineup : getalineup,
    updateLineup : updateLineup,
    nearbyLocations : nearbyLocations,
    resetSearchCookie : resetSearchCookie
  };

});
/**
 * @ngdoc function
 * @name contactService
 * @function
 *
 * @description The contact serivices are managed here
 * @param {string} location redirect
 * @returns {string} success with responds  or failure
 * @author kavya Sagar
 * @date 24-11-2014
 */
modulefactory.factory('contactService', function ($http, $location) {  
    return {      
        postContact: function(args, callback){ 
            $http.post('/postContact', args).success(function(response) {            
               callback(response);
           }).error(function (res, status) {                  
               if(status == '500'){                  
                   $location.path('/500');
               }               
           });
       },  
    };
});
/**
 * @ngdoc function
 * @name LineStorageService
 * @function
 *
 * @description Set, get and remove lineup details to local storage
 * @param {string} 
 * @returns {string} responds
 * @author kavya Sagar
 * @date 8-12-2014
 */
app.service('LineStorageService', function(){
    
    this.setLineupDetails = function(value){ 
        if(value) window.localStorage.setItem('c_lineups', value);
    };

    this.getLineupDetails = function(){
        return window.localStorage.getItem('c_lineups');
    };

    this.removeLineupDetails = function(){
        window.localStorage.removeItem('c_lineups');
    };
});
function processDatas(response){
    var result = response;
    
    angular.forEach(response.items, function(adata, akey) { 
      angular.forEach(adata.lineups, function(bdata, bkey) {
          result.items[akey].lineups[bkey] =  processGoogle(bdata);          
      });       
       
    }); 

    return result;
}
function processGoogle(datas){

  var openhrs  ={}, open = {};
  var jsonData = datas.google;

  //open hours processing
  if(typeof jsonData == "object" && jsonData.opening_hours){
      openhrs = jsonData.opening_hours;   

      if(openhrs.length <= 0){ 
          return datas;
      }              
      open.open_now = (typeof openhrs[0] == "object" && openhrs[0].open_now)? openhrs[0].open_now :false;
      var periods  = [];
      periods  = (typeof openhrs[0] == "object" && openhrs[0].periods)? openhrs[0].periods : {};
      var working_text = (typeof openhrs[0] == "object" && openhrs[0].weekday_text)?openhrs[0].weekday_text : {};

      var timelog  = [];
      var totalhrs = 0;            
      var indx = 0;

      angular.forEach(working_text, function(works, key) {
        var datetmp = {};
        var daysFormat = splitWorkingDays(works);
        
        //closed days
        if(daysFormat.time == 0){

            datetmp.time =  '--';  
            datetmp.days = daysFormat.days;              
            this.push(datetmp);

        }else if(typeof periods[indx] == "object"){//Working days

            var start = 0,end = 0, res = 0;
           
            //working hours calculate
            if (typeof periods[indx].close == "object" && typeof periods[indx].open == "object"){                    

                start = iterate(periods[indx].open, 'time'); 
                start = start? start : 0;

                end = iterate(periods[indx].close, 'time');                       
                end = end? end : 0;

                res = TimeDiff(start, end);

            }else if(typeof periods[indx].open == "object"){
                start = iterate(periods[indx].open, 'hours');                         
                res = (start == 0)? 24 : 0;                        
            }
            
            totalhrs += parseFloat(res);
            datetmp.time =  res +' hrs';  
            datetmp.days = daysFormat.days; 
            this.push(datetmp);
        }
       
      }, timelog);
      
      open.periods = timelog; 
      open.totalhrs = totalhrs; 
      
      jsonData.opening_hours = open? open : null;
      datas.google = jsonData;
      
      return datas; 
  }else{  
      return datas;
  }    

}

function splitWorkingDays(works){        
  var substr = works.split(":"); 

  var caseltr = substr[1].trim();
  caseltr = caseltr.toLowerCase();        
  
  var working = {};
  working.days = substr[0].trim();

  switch(caseltr){
      case "closed":                
          working.time = 0;
          break;
      case "opened":
          console.log("WORKING DAY OPENED");
          working.time = 0;
          break;
      default:
         working.time = 1;
         break;
  }
  
  return working;
}

function  iterate(obj, doIndent) { 

  for (var property in obj) {
    if (obj.hasOwnProperty(property)){
        if (obj[property].constructor === Object) {            
           iterate(obj[property]);  
        } else {
            if(property == doIndent) return obj[property];
        }
    }
  }  
}

function TimeDiff(start, end){

  var ahr = start.substr(0, 2),
  amin = start.substr(2);

  var bhr = end.substr(0, 2),
  bmin = end.substr(2);

  //today
  var d = new Date();
  var da = d.getDate();
      var m = d.getMonth() + 1;
  var y = d.getFullYear();
   
  var timeStart = new Date(y, m, da,  ahr, amin);
  var timeEnd = new Date(y, m, da,  bhr, bmin);
   
  var diff = timeEnd - timeStart;

  diff = msToTime(diff);

  return diff;
  
}

/*
 * private class for hour convertion
 */
function msToTime(duration) {
    var  minutes = parseInt((duration/(1000*60))%60)
        ,hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;

    return hours + "." + minutes;
}