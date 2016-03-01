/**
* Common controller 
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Angular Controller
* @subpackage controller_common
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

/**
 * @ngdoc function
 * @name HeaderCtrl
 * @function
 *
 * @description Setup header at frontend module. It includes login and logout, user data, initialize root scope functions 
 * @param {string} services, scope, location and http
 * @returns {string} redirection / user data
 * @author kavya Sagar
 * @date 29-09-2014
 */
function HeaderCtrl($scope, $http, $location, $rootScope, Auth, pinService, LineStorageService, $cookies) { 
    /* 
    * Set login data 
    */
    if($rootScope.userLog){
        

        Auth.getUser($rootScope.userLog, function(data) {
              $scope.userdata = data;
              // To create list for user lineups
              $rootScope.$broadcast("handleLoadLineups");        
       });
    }
    /* 
    * Logout 
    */
    $scope.logout = function(){ 
        Auth.logout(function() {
             delete $rootScope.userLog;
             $location.path( "/" );
        });
    };
    /*
    *  Load Existing lineups
    */   
    $rootScope.$on('handleLoadLineups', function(ev) { 
        $rootScope.userLineups = [];
              
        //check if the user is login 
        if($rootScope.userLog){ 
            Auth.userLineups(function(result) {  
                if(result.lineups){   
                    angular.forEach(result.lineups, function(value, key) {                           
                        if(key === 'labels'){              
                            $rootScope.userLineups = value; 
                        }                          
                    });
                  
                }  
            });  
        };

    });
    /*
    *  Get apartment details
    */ 
    $rootScope.$on('handleViewLineup', function(ev, args) {
      
        $rootScope.showNoimage = false; $rootScope.viewLineupDetails = '';               
        // get apart details
        pinService.getalineup({lineid : args.lineupId}, function(resp) {                        
            console.log(resp);
            if(resp){      

                $rootScope.viewLineupDetails  = resp;
                if(!resp.smallpicture && resp.smallpicture == ''){
                    $rootScope.showNoimage = true; 
                }
                // show modal 
                $('#detailapart').modal({show: true});
            }
        });
    });
    
    /*
    *  Create Node Angular Seed
    */ 
    $rootScope.$on('handleCreateLineup', function(ev, args) { 
        $("#add-lineups").find('.alert').removeClass('alert-danger');
        $("#add-lineups").find('.alert').removeClass('alert-success');
        if(!args.lineuplabel){            
            $("#add-lineups").find('.alert').addClass('alert-danger').show().html('Enter lineup label');          
            return false;
        }
    
        pinService.saveApartToUser({labName : args.lineuplabel}, function(data) {
            if(data.errors){                              
               $("#add-lineups").find('.alert').addClass('alert-danger').show().html(data.errors);   
               return false;
            }else{
                var obj = $rootScope.uLineups;
                
                if(!obj){ 
                    $rootScope.uLineups = angular.copy(data);
                }else{ 
                    $rootScope.uLineups.push(angular.copy(data)); 
                }
                $("#add-lineups").modal('hide');
            }                  
        }); 
    });
    /*
    *  Save to existing Node Angular Seed
    */ 
    $rootScope.$on('handleSaveExistLineup', function(ev, args) { 
        $("#add-lineups").find('.alert').removeClass('alert-danger');
        $("#add-lineups").find('.alert').removeClass('alert-success');
        if(!args.labelId){            
            $("#add-lineups").find('.alert').addClass('alert-danger').show().html('Choose an exiting lineup ');          
            return false;
        }
        
        pinService.saveApartToUser({labId : args.labelId}, function(data) {
            if(data.errors){                              
               $("#add-lineups").find('.alert').addClass('alert-danger').show().html(data.errors);   
               return false;
            }else{
               angular.forEach($scope.uLineups, function(value, key) {
                   if(value._id == args.labelId){
                       $rootScope.uLineups[key] = data;
                   }
               });
               $("#add-lineups").modal('hide'); 
               
            }                  
        }); 
    });

    /**** Login  ****/
    $scope.getLogin = function(){

        $cookies.returnPath = $location.path();
        window.location.href='/login';
    }

     /**** Register  ****/
    $scope.getJoin = function(){

        $cookies.returnPath  = $location.path();
        
        window.location.href = '/register';
    }
    
}
/**
 * @ngdoc function
 * @name NewsletterCtrl
 * @function
 *
 * @description Newsletter Subscription 
 * @param {string}  scope
 * @returns {string} 
 * @author kavya Sagar
 * @date 10-03-2015
 */
function NewsletterCtrl($scope) {     

}
/**
 * @ngdoc function
 * @name notFoundCtrl
 * @function
 *
 * @description Page Not Found - 404 template
 * @param {string}  scope
 * @returns {string} 
 * @author kavya Sagar
 * @date 29-09-2014
 */
function notFoundCtrl($scope) { 
    
    $scope.errors = {title : '404', message : 'THIS FILE MAY HAVE BEEN MOVED OR DELETED. BE SURE TO CHECK YOUR SPELLING'};
}

/**
 * @ngdoc function
 * @name serverErrorCtrl
 * @function
 *
 * @description Internel server error - 500 template
 * @param {string}  scope
 * @returns {string} 
 * @author kavya Sagar
 * @date 29-09-2014
 */
function serverErrorCtrl($scope) { 
    
    $scope.errors = {title : '500', message : 'INTERNAL SERVER ERROR'};
}

/**
 * @ngdoc function
 * @name accountCtrl
 * @function
 *
 * @description user account page after authetication 
 * @param {string} services, scope, location and http
 * @returns {string} null
 * @author kavya Sagar
 * @date 10-07-2014
 */
function accountCtrl($scope) {      
    $('#myModal').modal('hide');
    window.opener.location.reload(); 
    self.close();        
}

/**
 * @ngdoc function
 * @name aboutusCtrl
 * @function
 *
 * @description For about us static page
 * @param {string}  scope
 * @returns {string} 
 * @author kavya Sagar
 * @date 29-09-2014
 */
function aboutusCtrl($scope) { 
        
}
/**
 * @ngdoc function
 * @name termsOfUseCtrl
 * @function
 *
 * @description For Terms Of Use static page
 * @param {string}  scope
 * @returns {string}
 * @author philip meyer
 * @date 01-11-2015
 */
function termsOfUseCtrl($scope) {

}
/**
 * @ngdoc function
 * @name privacyCtrl
 * @function
 *
 * @description For privacy policy static page
 * @param {string}  scope
 * @returns {string} 
 * @author kavya Sagar
 * @date 29-09-2014
 */
function privacyCtrl($scope) { 
        
}
/**
 * @ngdoc function
 * @name contactCtrl
 * @function
 *
 * @description Post contact us data and send mail to admin
 * @param {string}  scope
 * @returns {string} 
 * @author kavya Sagar
 * @date 29-09-2014
 */
function contactCtrl($scope, contactService) {
    $scope.form = {};
    
    $scope.submitContact = function () {
        contactService.postContact($scope.form, function(data) {                   
            if(data.err){
                $scope.conterror = data.msg;
            }else{
                $scope.contsucc = data.msg;        
            }  
            $scope.form = {};
        });  
    };     
    
}
