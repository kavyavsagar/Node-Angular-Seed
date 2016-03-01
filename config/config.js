'use strict';

/**
* Setup Configurations
*
* All the site configuration are setup depend on system's enviornment and declare generally used variables as global
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

var  fs = require('fs'),
     path = require('path');

/* 
 * Load enviornment configurations
 * Set the node environment variable if not set before
 * specific configuration
 **/
var local_env = require('./env/local');//process.env.NODE_ENV);

// Load generally used configs to the entire site 
module.exports = {
	root: local_env.root,
	port:  local_env.port,
	host: local_env.host,
	db: local_env.db,
    template_engine : local_env.template_engine,
    environment : local_env.environment,
    google_apikey : local_env.google_apikey,
    madrill_api : local_env.madrill_api,
    strompath_api : local_env.strompath,
    s3 : {
			bucketName: local_env.s3.bucketName,
			accessKeyId: local_env.s3.accessKeyId,
			secretAccessKey: local_env.s3.secretAccessKey,
            region: local_env.s3.region
	    },
	urlbox : {
        apikey : local_env.urlbox.apikey,
        secret : local_env.urlbox.secret
    },
    yelp :{
        consumer_key: local_env.yelp.consumer_key, 
        consumer_secret: local_env.yelp.consumer_secret, 
        token: local_env.yelp.token, 
        token_secret:local_env.yelp.token_secret
    }
};