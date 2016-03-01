/**
* 
* Newsletter
* 
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Model
* @subpackage model_contact
* @version  $Id:$v.1.0
* @date 10-03-2015
* @author debugger@hotmail.co.uk
*/

// setup mongoose and db variable 
var dbvar = global.dbconnect;
var mongo 	= dbvar.mongoose;
var Schema  = dbvar.Schema; 

/*
 * 
 * Define schema of user collection
 */
var newsletterSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },   
    email: {
        type: String,
        default: '',
        trim: true
    },   
    subscription: {
        type: Boolean,
        default: true
    },    
    frequency: {
        type: String,
        default: 'monthly'
    }
});

/*
 * define model of newsletter schema
 */
var newsletterModel = mongo.model('newsletter', newsletterSchema );  

//mongo.set('debug', true);
/**
 *
 * Subscribe email 
 *
 * @param {String} get contact details and responds
 * @return {Boolean} success or failed
 * @author debugger@hotmail.co.uk
 * @date 10-10-2014
*/
exports.subscription = function (req, res) {

    var newsletter = req.body;   
   

    newsletterModel.find({email: newsletter.email}, function (err, count) {             
      	if(err) { res.send({err : true, msg :err}); }

      	if(count.length >0){ 		
            res.send({err : true, msg :"Email already subscribed"}); 
      	}else{

  		    // save data to the collection
            newsletter = new newsletterModel({email: newsletter.email});

            newsletter.save(function (err, todo) { 
            	if(err) {res.send({err : true, msg :err});}

            	res.send({msg :"Newsletter subscription successfully"}); 
            });
      	}

    });
};