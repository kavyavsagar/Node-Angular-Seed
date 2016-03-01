'use strict';
var path = require('path');
/**
* Declare configurations for production enviornment
*
* The configuration variables are declared and set values into it based on production enviornment
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Config
* @subpackage Env
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

module.exports = {
	root: path.join(__dirname, '../../'),
	port:  process.env.PORT || 5000,
	host: process.env.HOST,
	db: process.env.MONGOHQ_URL,
	template_engine : 'html',
	environment : 'production',
    google_apikey : process.env.GOOGLE_API ,
    madrill_api : 	process.env.MADRILL_API,
    strompath: {
        apiKeyFile: path.join(__dirname, '../../')+process.env.STORM_APIFILE,
        application: process.env.STORM_APPLICATION,
        secretKey: process.env.STORM_SECRETKEY,
        social: {
            google: {
              clientId: process.env.STORM_GOOGLE_CLIENTID,
              clientSecret: process.env.STORM_GOOGLE_CLIENTSECRET
            },
            facebook: {
              appId: process.env.STORM_FB_APPID,
              appSecret: process.env.STORM_FB_APPSECRET
            }
        }
    },
    s3 :{
        bucketName : process.env.S3_BUCKETNAME,
        accessKeyId : process.env.S3_ACCESSKEY,
        secretAccessKey : process.env.S3_SECRETKEY,
        region : ''//process.env.S3_REGION
    },
    urlbox : {
        apikey : process.env.URLBOX_API,
        secret : process.env.URLBOX_SECRET
    }
};