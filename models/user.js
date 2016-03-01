/**
* User Model
*
* User model has defined. The user or admin authetications are performed with passport local and linkedin. 
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Model
* @subpackage model_user
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/


// setup mongoose and db variable 
var dbvar = global.dbconnect;
var mongo = dbvar.mongoose;
var Schema   = dbvar.Schema; 

/*
 * Module Dependencies
*/
var https = require('https'),
    async = require('async'),
    AWS = require('aws-sdk');

/*
 *  Set s3 bucket configuration
*/
var bucketName = global.config.s3.bucketName,
    accessKeyId = global.config.s3.accessKeyId,
    secretAccessKey = global.config.s3.secretAccessKey,
    region = global.config.s3.region;   
    
var gapi_key = global.config.google_apikey;

/*
 * 
 * Define schema of user collection 
 * Lineup schema 
 */
/*
 * User Labels Schema
 */
var labelSchema = new Schema({     
    labelName: {
        type: String,
        default: '',
        trim: true
    },
    lineups: [{ type: Schema.Types.ObjectId, ref: 'apartments' }],
    lastUpdate : {
        type: Date,
        default: Date.now
    }
});

/*
 * 
 * User schema
 */
var UserSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    last_login: {
        type: Date,
        default: Date.now
    },
/*    linkedinId: {
        type: String,
        default: '',
        trim: true
    },*/
    email: {
        type: String,
        default: '',
        trim: true
    },
    name: {
        type: String,
        default: '',
        trim: true
    },
    password: {
        type: String,
        default: '',
        trim: true
    },
    user_type: {
        type: String,
        default: 'admin'
    },
    account_status:{
        type: String,
        default: 'active'
    },
    /*current_position:{
        type: String,
        default: '',
        trim: true
    },
    proimage:{
        type: String,
        default: '',
        trim: true
    },
    headline: {
        type: String,
        default: '',
        trim: true
    },*/
    account_url: {
        type: String,
        default: '',
        trim: true
    },
    labels: [labelSchema]    
});

/*
 * define model of user schema
 */
var UserModel = mongo.model('users', UserSchema);

var Authentication = { 
    /*
    * Return the apartment Model
    */   
    apartModel :function(){
      var apartmentModel  = require(global.config.root+'/models/apartment');        
      return apartmentModel;
    },
    /**
    *
    * user logout process
    *
    * @param {String} get request & responds 
    * @return {Boolean} clear cookie & redirect to login
    * @author debugger@hotmail.co.uk
    * @date 10-07-2014
   */
    logout: function (req, res) {  
        
        res.clearCookie("user");
        res.redirect('/logout');

    },   
    /**
    *
    * Get user details
    *
    * @param {String} get request & responds 
    * @return {Boolean} user data
    * @author debugger@hotmail.co.uk
    * @date 10-07-2014
   */
    userDetails: function (req, res) { 
      var  id = req.params.id;       
      if(!id)return res.send(200);
       
      UserModel.findOne({'_id': id}, function (err, item) {             
           if(err) console.log(err);
           return res.send(item);
      });
    },    
    /*
     * Get all lineups of users
     * @param {type} req
     * @param {type} res
     * @returns {undefined}
     */
    getUserLineUps: function (req, res) {
      console.log('here');
       var users = req.cookies.user;
       var userId = JSON.parse(users, function (k, v) {
           if(v){return v;}
       });   
       if(!userId.id){
            return res.send(200);
       }
       
       UserModel.findById(userId.id).populate('labels.lineups').exec(function(err, udetails) {
            if (err) {
                console.log(err);
                return res.json(err);
            } else {    
                
              if(udetails == null){return res.json(false);}
                
              if('labels' in udetails && udetails.labels.length == 0){return res.json(false);}
              var arrLineup = []; 
              var docs = udetails.toObject();           
             console.log(docs);
             console.log('--->')
              async.eachSeries(docs.labels, function(doc, acallback) {
                 
                  var ardoc = doc.lineups;

                  var subdoc = {};
                  subdoc._id = doc._id;
                  subdoc.labelName = doc.labelName;
                  
                  Authentication.lineupsProcessing(ardoc, function(result){

                      subdoc.lineups = result; 
      
                      arrLineup.push(subdoc);
                      acallback();
                  });
                
              }, function(err) {  
                  if (err) return next(err);
                  
                  var user_lineups = docs;            
                  user_lineups.labels = arrLineup;

                  //Tell the user about the great success
                  console.log(user_lineups);
                  console.log('jtru')
                  res.json({ lineups: user_lineups});
              });

            }
       }); 
    },
    
    /*
     * 
     * add lineups to user accout
     */
    addUserLineUps : function (req, res) { 
        var  apart = req;
        var aprtdata = {};

        UserModel.findOne({_id: apart.userId}, function (err, item) {  
            //convert to plain object
           // item = item.toObject();

            // labelname
            if(apart.lineupname){                      
                item.labels.push({labelName: apart.lineupname, lineups : [apart.lineups]});               
            }
            // labelid
            if(apart.labelId){
                item.labels.filter(function (lab) {                    
                    if(lab._id == apart.labelId) {
                        return lab.lineups.push(apart.lineups);
                    }
                });               
            }

            item.save(function ( err, rep, count ){
                var lastId;
                             
                if (err) {
                    return res(err);
                }else{
                   
                    if(apart.lineupname){  
                        lastId = item.labels[item.labels.length-1].id;
                    }
                    
                    if(apart.labelId){
                        lastId = apart.labelId;
                    }
                    
                    var labeltmp = rep.labels.filter(function (label) {
                          if(label._id == lastId)  return label;
                    }).pop();

                    return res(labeltmp);
                }           
            });
        });
    },
     /*
     * 
     * delete lineups from user accout and updated the lineup popularity count to apartment collection
     */
    delLineups : function (req, res) { 
          
       var users = req.cookies.user;
       var userId = JSON.parse(users, function (k, v) {
           if(v){return v;}
       }); 
       if(!userId){return res.json(200);}
       
       var args = req.body;      
       
       if(!args.lineId){return res.json(200);}
       
       var apartmentModel = Authentication.apartModel();

       UserModel.findById(userId.id, function (err, docs) {  
        if(err){ return res.json(err); }
           
         async.forEach(docs.labels, function(doc, acallback) {  
            
             // deletion and update count
             for(var i =0; i < doc.lineups.length; i++ ) {
                if(doc.lineups[i] == args.lineId && args.labelId == doc._id){               
                    // del from user collection
                    if(doc.lineups[i] == args.lineId){doc.lineups.remove(doc.lineups[i].toString());}
                     // decrement mylineup 
                    apartmentModel.updateLineupCount({apartId : args.lineId, increment : false}, function(val){
                         if(!val){res.json(false);}                       
                    });
                   
                }                    
            }
            
            acallback(); 
         }, function(err) { 
            if (err) return res.json(err);
                    
            // save result and return new result
            docs.save(function(err2, details){
                if(err2){return res.json(err2); }
            
                UserModel.populate(details,  {path:"labels.lineups"} , function(aerr, resp) {
                    resp = resp.toObject();

                    var resData = [];
                    resp.labels.forEach(function(lab, index){
                        var darr =  [];
                        lab.lineups.forEach(function(line, ind2){

                            var tempdata = {};                    
                            tempdata = line;                    
                           // tempdata = tempdata.toObject();

                            //Authentication.getParse(line, function(dat){
                            apartmentModel.parsingData(line, function(dat){                               
                                tempdata.screen_captures.fullPic = dat.screen_captures.fullPic; 
                                tempdata.screen_captures.mediumPic = dat.screen_captures.mediumPic;
                                tempdata.screen_captures.smallPic = dat.screen_captures.smallPic;
                                tempdata.screen_captures.thumbPic = dat.screen_captures.thumbPic;
                                tempdata.screen_captures.mobPic = dat.screen_captures.mobPic; 

                                tempdata.google = dat.google;
                                darr.push(tempdata);
                            }); 

                        });
                        var subdoc = {};
                        subdoc._id = lab._id;
                        subdoc.labelName = lab.labelName;
                        subdoc.lineups = darr; 

                        resData.push(subdoc); 
                    });
                    return res.json({'lineups' : resData});  
                });
                   
               });

            });
            
        });
    },
    /*
    * Get the user lineups with limit. 
    */
    lineupsWithLimit : function (req, res, next) { 
    console.log(123)
      // var limit = req.params.id? req.params.id: 2;  
       //limit = parseInt(limit);
       var users = req.cookies.user;
       var userId = JSON.parse(users, function (k, v) {
           if(v){return v;}
       }); 
       if(!userId){return res.json({'err' : true});}
       
       var arrLineup = [];
       
       //For labels pagination   
       UserModel.findById(userId.id).populate('labels.lineups').exec(function(err, docs) { 
            if(err){return res.json({'err' : true, 'msg' : err});}
            
            if(docs.length == 0){return res.json({'err' : true});}
           
            docs = docs.toObject();           
            
            async.eachSeries(docs.labels, function(doc, acallback) {
               
                var ardoc = doc.lineups;

                var subdoc = {};
                subdoc._id = doc._id;
                subdoc.labelName = doc.labelName;
                
                Authentication.lineupsProcessing(ardoc, function(result){

                    subdoc.lineups = result; 
    
                    arrLineup.push(subdoc);
                    acallback();
                });
              
            }, function(err) {  
                if (err) return next(err);
               
                //Tell the user about the great success
                res.json({'err' : false, 'items' : arrLineup});
            });
            
       });
          
    },
    // process lineups of a label
    lineupsProcessing : function(req, res){
console.log(124);
        var len = (req.length > 3)? 3 : req.length;
        var local = [];
        var apartmentModel = Authentication.apartModel();
        async.eachLimit(req, len, function(line, bcallback) {
            var subset = {}; 

            apartmentModel.parsingData(line, function(dat){                  
                subset = dat;
                local.push(subset);

                bcallback(null); 
            });
             
        }, function(err) {
            if (err) return next(err);
            
            res(local);
        });
    },
    /*
    * Check whether the lineup exists in a label community of user
    *
    */
    isApartExistInUser : function (req, res) { 
       
        UserModel.findOne(
                 { '_id': req.userId },         
                 {labels: {$elemMatch: {_id: req.labelId, lineups : { $in: [req.lineups] }}} }
                , function (err, output) {   
                    
           if(err){return res(err);}

            if(output.length <= 0){return res(0);}

            var labels = output.labels;
            if(labels.length == 0){return res(0);}
                    
            res(labels.length);   
           
        });
       
    },  

    /*
    * Add the lineup to the label community of user
    */
    addApartToUser : function(req, res){
        var apart = req.body;
        var errMsg = {};

        Authentication.isApartExistInUser({'userId' :  apart.userId, 'lineups' : apart._id,  'labelId' : apart.labelId}, function(rescheck){        

            if(rescheck >0){
                errMsg = {errors : "Lineup already exist in this community"}; 
                return res.json(errMsg);              
            }else{  
                //insert to user collection
                if(apart.userId){
                    var apartmentModel = Authentication.apartModel();
                    
                    var apartUser = {};
                    apartUser.userId = apart.userId;              
                  
                    apartUser.lineups =  apart._id;

                    if(apart.lineupname){
                         apartUser.lineupname =  apart.lineupname;
                    }
                    if(apart.labelId){
                         apartUser.labelId =  apart.labelId;
                    }
                    //update mylineup count to apartment collection 
                   
                    apartmentModel.updateLineupCount({apartId : apart._id, increment : true}, function(val){
                        if(!val){res.json(false);}
                        
                        Authentication.addUserLineUps(apartUser, function(uresp){                               
                            return res.json(uresp); 
                        });
                    });
                    
                      
                }else{
                    errMsg = {errors : "User authentication failed"}; 
                    return res.json(errMsg);    
                }  
            }
            
        });
    }, 
    /*
    * The reviews & open hours are parsed from the json result. Fetched image urls from s3 bucket. 
    */   
    getParse : function(jsonData, callback){ 
    
/*       var jsonData1 = {},open = {};
       var img_ext = '.png',
           imagename,
           params,largeurl,mobile, mediumurl, smallurl, thumburl; 
        
        
        //open hours processing
       if('opening_hours' in jsonData){
           
        var jlen = jsonData.opening_hours;           
        if(jlen.length >0){
           jsonData1 = jsonData.opening_hours[0];    
           
           open.open_now = ('open_now' in jsonData1)? jsonData1.open_now :false;
         
           var periods = ('periods' in jsonData1)? jsonData1.periods : {};
           var timelog = [];
           var totalhrs = 0;
           var working_text = ('weekday_text' in jsonData1)?jsonData1.weekday_text : {};
           var arIndex = [];

          var fulltime = false;
           periods.forEach(function(perd, index){  
                var datetmp = {};
                var start = 0,end = 0, res = 0;

                switch(perd.open.day){
                  case 0:// sunday
                      datetmp.working =  working_text[6];
                      break;
                  default : // other
                    var j = perd.open.day - 1;
                    datetmp.working =  working_text[j];
                    break;
                }
                if('close' in perd && 'open' in perd){
                    start = ('time' in perd.open)? perd.open.time : 0;
                    end = ('time' in perd.close)? perd.close.time : 0;

                    res = dbvar.general.TimeDiff(start, end);
                }else if('open' in perd){
                    res = (perd.open.hours == 0)? 24 : 0;
                    fulltime = true;
                }
                
                totalhrs += parseFloat(res);
                datetmp.time =  res+' hrs';                
                timelog.push(datetmp);

                arIndex.push(perd.open.day);
           });
          
          if(arIndex.length < 7){
              var sund = {} 
              //if the non working days
              for(var i=0; i <= 6; i++){
                var tmp = {};
                if(!dbvar.general.in_array(i, arIndex))
                {   

                  switch(i){
                    case 0:// sunday
                        sund.working =  working_text[6];
                        sund.time =  (fulltime)? 24+' hrs' : '--'; 
                        if(fulltime) totalhrs += parseFloat(24); 
                        break;
                    default : // other
                        var j = i - 1;
                        tmp.working =  working_text[j];
                        tmp.time =  (fulltime)? 24+' hrs' : '--'; 
                        if(fulltime) totalhrs += parseFloat(24);  
                        timelog.push(tmp)
                        break;
                  }
                }                
              }
              if(sund){ timelog.push(sund)}
          }       
         
          open.periods = timelog; 
          open.totalhrs = totalhrs; 
       }
   }
       /*
        * s3 bucket configuration to get the screenshot images from there
        */  
       /* AWS.config.update({accessKeyId: accessKeyId , secretAccessKey: secretAccessKey, region: region});   
        var s3 = new AWS.S3();
        
        imagename = jsonData.place_id + img_ext;

        if(jsonData.picture != ''){             
            params = {Bucket: bucketName, Key: 'large/'+ imagename}; //Expires: 60
            largeurl = s3.getSignedUrl('getObject', params);           
        }
        if(jsonData.mediumpicture != ''){             
            params = {Bucket: bucketName, Key: 'medium/'+ imagename};
            mediumurl = s3.getSignedUrl('getObject', params);           
        }
        if(jsonData.smallpicture != ''){             
            params = {Bucket: bucketName, Key: 'small/'+ imagename};
            smallurl = s3.getSignedUrl('getObject', params);  
        }
        if(jsonData.thumbpicture != ''){             
            params = {Bucket: bucketName, Key: 'thumb/'+ imagename};
            thumburl = s3.getSignedUrl('getObject', params);           
        } 
        if(jsonData.mobileurl != ''){            
            params = {Bucket: bucketName, Key: 'mobile/'+imagename};
            mobile = s3.getSignedUrl('getObject', params); 
        }

        apartmentModel.processAparts(jsonData, function(ares){
          
              res.json({'totalcount' : totalCount, 'apart' : ares}); 
        });        

        var local = {'reviews' : jsonData.reviews? jsonData.reviews : null, 
                    'opening_hours':open? open : null ,
                    'rating':jsonData.rating? jsonData.rating : 0 ,
                    'fullPic': largeurl,
                    'mobPic' : mobile,
                    'mediumPic':mediumurl,
                    'smallPic':smallurl,
                    'thumbPic':thumburl
                   };       
     
       callback(local);*/
    },
    /*
    * User authetication and account creation has been done 
    *
    */
    userAuth : function(req, res){
      var user = req;
      var unixTimeStamp = new Date().getTime();

      // check whether profile exists or not
      UserModel.findOne({email: user.email}, function (err, item) {              
          if(err){console.log(err);}
         
          if(item === null){   
               // user data inserted to collection if not exist               
                var userInsert = new UserModel({                                   
                   email:user.email,
                   name: user.fullName,
                   account_url :user.href,               
                   user_type : 'general'
                }); 
                userInsert.save(function (err,todo) {
                    if (err) {
                        console.log(err);
                    }
                   res(todo._id);
                });

          }else{ 
                // update user data
              //item.updated    = unixTimeStamp;
              item.last_login = unixTimeStamp;

              item.save( function ( err, todo, count ){
                  if (err) {
                      console.log(err);
                  }
                
                  res(todo._id);
               });
          }          
      });
    }
};  
module.exports = Authentication;  

/**
 *
 * Get user details from google plus using API
 *
 * @param {String} id & callback function 
 * @return {Boolean} user data
 * @author debugger@hotmail.co.uk
 * @date 10-07-2014
*/
function gPlusProfilePic(userid){
    
      https.get('https://www.googleapis.com/plus/v1/people/'+userid+'?fields=image&key='+gapi_key, function(res) {
       
        res.setEncoding('utf8');
        
        var body = '';
        res.on('data', function(chunk) {
          body += chunk;
        });
        
        res.on('end', function() {
            callback(body);                            
        });

    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
    /*
        {
         "image": {
          "url": "https://lh4.googleusercontent.com/-4iJ3wCBPAwo/AAAAAAAAAAI/AAAAAAAAAB0/hQBQLRc1woU/photo.jpg?sz=50",
          "isDefault": false
         }
        }
    */
}

