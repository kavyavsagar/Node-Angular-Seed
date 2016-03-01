'use strict';

/**
* Setup db Configurations 
*
* The db connections are setup here .Also schema & general functions used in models are declared. 
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Model
* @subpackage model_config
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

var mongoose = require( 'mongoose' );

mongoose.connect(global.config.db); 

var Schema   = mongoose.Schema; 

//declare general functions
var general = require('./general.js');

module.exports = {
            Schema: Schema,
            mongoose: mongoose,
            general : general
         };