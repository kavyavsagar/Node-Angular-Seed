'use strict';

/**
* Server Configurations
*
* Declare application and its use, include module dependencies, server, routing, db and other config files here 
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

/*
 * Module Dependencies
 */
var express = require('express'), 
  stormpath = require('express-stormpath'),      
  session = require('express-session'),
  bodyParser = require('body-parser'),
  favicon = require('serve-favicon'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  http = require('http'),
  path = require('path'),
  fs = require('fs'),
  compression = require('compression'),
  ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
  mongoose = require( 'mongoose' ),
  mongoStore = require('connect-mongo')(session);

/*
 * System configuration files included and declare system variables globally
 */
global.config = {};
global.config = require('./config.js');

/*
 * DB configuration files included and declare db variables globally
 */
global.dbconnect = {}
global.dbconnect = require(global.config.root+'/models/dbconnect.js');

// Config variable for using URLBOX api
global.urlbox = {}
global.urlbox.apikey = global.config.urlbox.apikey;
global.urlbox.secret = global.config.urlbox.secret;

/*
 * Define apps and its use
 */
var app = express();

// set all environments
app.set('port', global.config.port);
app.set('host', global.config.host);

// We keep the same public path so we can make use of the bootstrap assets
app.use(express.static(path.join(global.config.root, 'public')));

// Set views path, template engine and default layout
app.set('views', global.config.root + 'views');

 // set .html as the default extension
app.set('view engine', global.config.template_engine);

// assign the template engine to .html files
app.engine(global.config.template_engine, function(path, options, cb) {
    fs.readFile(path, 'utf-8', cb);
});

// compress all requests & responses
app.use(compression());
// We override this file to allow us to swap themes
// We keep the same public path so we can make use of the bootstrap assets
app.use(methodOverride());
//app.use(express.static(path.join(global.config.root, 'public')));

// Setting the fav icon and static folder
app.use(favicon(path.join(global.config.root, 'public/assets/images/favicon.ico')));

//register new middleware
var sessionMiddleware = session({
    secret: 'apartmentLineup',
    store: new mongoStore({
        url : global.config.db
    }),
    saveUninitialized: true,
    resave: false    
});
app.use(sessionMiddleware);

// import and initialize the Stormpath middleware
// Initialize Stormpath, and have it use your session middleware instead of
// it's own.
var stormvars = global.config.strompath_api;

app.use(stormpath.init(app, {
    apiKeyFile: stormvars.apiKeyFile,
    application: stormvars.application,
    secretKey: stormvars.secretKey,
    sessionMiddleware: sessionMiddleware,
    redirectUrl: '/userAuth',
    enableForgotPassword: true,
    enableGoogle: true,
    enableFacebook: true,
    social: stormvars.social
}));

// parsing format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Only use logger for development environment
var env = global.config.environment;

if (env === 'development') { 
  // development only
  app.use(errorHandler());
}
if (env === 'production') {
    // production only    
}

// Setup all the routing 
require('./routes')(app, stormpath, ensureLoggedIn);

module.exports = app;