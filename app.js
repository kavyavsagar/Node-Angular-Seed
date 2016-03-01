/**
* Start up 
* 
* app starts with creating server for specified port
*
* LICENSE: Some license information
*
* @category Angular-Node Seed
* @package App
* @subpackage app
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/


/**
 * Module dependencies
 */
    
var http = require('http');

var app = require(__dirname+'/config/server.js');


/**
 * Start Server
 */
http.createServer(app).listen(global.config.port, function () {
  console.log('Express server listening on port '+global.config.host+":" + global.config.port);
});
