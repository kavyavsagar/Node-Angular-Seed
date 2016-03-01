'use strict';
/**
* Declare routing
*
* Routing makes different HTTP requests, point at different parts of the code (especially to server side)
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Config
* @subpackage Server_Config
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

// Model files included
var routes = require(global.config.root+'/models'),  
    apartment = require(global.config.root+'/models/apartment'), 
    contact   = require(global.config.root+'/models/contact'),  
    auth      = require(global.config.root+'/models/user');
    
/**
* Routing declaration
*/
  module.exports = function(app,stormpath, ensureLoggedIn){
      
    // serve index and view partials
    app.get('/', routes.index);
    app.get('/partials/:name', routes.partials);
    
    // Request to server api call
    app.post('/postContact', contact.sendContact); 
 
    app.post('/api/addLineUp',stormpath.loginRequired, apartment.addLineUp);
    app.post('/api/findLineups', apartment.findallLineups);
    app.post('/api/loadLocations', apartment.findLocations);
    app.post('/api/nearbylocations', apartment.getGeoLocations);
    app.post('/api/getalineup', apartment.getSingleLineup);    
    app.get('/api/resetSearch', function(req, res){
        res.clearCookie('adress');   
        res.send(true);
    }); 
    app.post('/api/updateLineup', apartment.updateLineupDetails);

    app.post('/addToUserLineUp',stormpath.loginRequired, auth.addApartToUser);
    app.get('/userLineups', auth.getUserLineUps);
    app.get('/limtedLineups/', auth.lineupsWithLimit); 
    app.post('/delLineups',stormpath.loginRequired,  auth.delLineups);    
    app.get('/api/logout', stormpath.loginRequired, auth.logout); 
    app.get('/userDetails/:id', auth.userDetails);
    app.get('/userdist/', apartment.distinct);
   
    // user authentication
    app.get('/userAuth', function(req, res){
     
        auth.userAuth(req.user, function(data){
            //set cookies           
            var retrn = (req.cookies.returnPath)? req.cookies.returnPath : '/';
            //returnPath
            res.cookie('user', JSON.stringify({'id': data}), { expires: 0, httpOnly: false });

            res.clearCookie('returnPath');   
            res.redirect(retrn);
        });
    });

    app.get('/admin', stormpath.groupsRequired(['admins']), function(req, res) {
      res.send('<div style="margin: 20px;"><h3>You are an admin!</h3><br><a href="/">Back To Home</a></div>');
    });

 
    app.get('/*', function(req, res, next){ 
        if(req.user) { 
            /*role = req.user.role;
            username = req.user.username;
            res.cookie('user', JSON.stringify({'id': req.user.id}), { httpOnly: false } );*/
        } 
        next();
    }, routes.index, ensureLoggedIn('/login'));
    
};