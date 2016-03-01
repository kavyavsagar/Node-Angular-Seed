/**
* Apartment Model
*
* Apartment model has defined. The apartment collection has managed. Add, edit, delete and fetch apartments based on geolocation can be done.
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Model
* @subpackage model_apartment
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/


// setup mongoose and db variable 
var dbvar = global.dbconnect;
var mongo = dbvar.mongoose;
var Schema   = dbvar.Schema; 

/*
 * Set s3 bucket configuration
*/
var bucketName = global.config.s3.bucketName,
    accessKeyId = global.config.s3.accessKeyId,
    secretAccessKey = global.config.s3.secretAccessKey,
    region = global.config.s3.region;


// module dependencies
var AWS     = require('aws-sdk'),
    crypto  = require('crypto'),
    async   = require('async'),
    https   = require('https'),
    http    = require('http-request'),
    fs      = require('fs'),
    uniqueValidator = require('mongoose-unique-validator'),
    yelp    = require("yelp").createClient({
                consumer_key: global.config.yelp.consumer_key,
                consumer_secret: global.config.yelp.consumer_secret,
                token: global.config.yelp.token,
                token_secret: global.config.yelp.token_secret
            });

var gapi_key    = global.config.google_apikey;

var userModel  = require(global.config.root+'/models/user');

/*
* Google schema defined
*/
var googleSchema = new Schema({        
    apart_name: {
        type: String,
        default: '',
        trim: true
    },
    address: {
        type: String,
        default: '',
        trim: true
    },
    place_id: {
        type: String,
        default: '',
        trim: true,
        unique: true
    },
    lat: {
        type: String,
        default: '',
        trim: true
    },
    lng: {
        type: String,
        default: '',
        trim: true
    },
    website: {
        type: String,
        default: '',
        trim: true
    },
    city: {
        type: String,
        default: '',
        trim: true,
        index:true
    },
    state: {
        type: String,
        default: '',
        trim: true,
        index:true
    },
    country: {
        type: String,
        default: '',
        trim: true
    },
    zipcode: {
        type: String,
        default: '',
        trim: true
    },
    gplus: {
        type: String,
        default: '',
        trim: true
    },
    rating: {
        type: String,
        default: 0
    },
    photos: {
        type: Array,
        default: []
    },
    opening_hours: {
        type: Array,
        default: []
    },   
    reviews: {
        type: Array,
        default: []
    },
    total_reviews:{
        type: Number,
        default: 0
    }
});
/*
* Screenshot schema defined
*/
var screenshotSchema = new Schema({ 
    date_captured : {
        type: Date,
        default: Date.now
    },
    mobpicture : {
        type: String,
        default: ''
    },
    thumbpicture : {
        type: String,
        default: ''
    },
    smallpicture : {
        type: String,
        default: ''
    },
    mediumpicture : {
        type: String,
        default: ''
    },
    largepicture : {
        type: String,
        default: ''
    }
});
/*
* Yelp Schema
*/   
var yelpSchema = new Schema({ 
    uniqid : {
       type: String
    },
    name : {
        type: String,
        default: ''
    },
    is_claimed : {
        type: Boolean
    },
    is_closed : {
        type: Boolean
    },    
    rating : {
        type: String,
        default: 0
    },
    reviews : {
        type: Array,
        default: []
    },
    review_count : {
        type: String,
        default: 0
    },
    url : {
        type: String,
        default: '',
    },
    image_url : {
        type: String,
        default: ''
    },
    mobile_url : {
        type: String,
        default: ''
    },
    rating_img_url : {
        type: String,
        default: ''
    },
    rating_img_url_small : {
        type: String,
        default: ''
    },
    rating_img_url_large : {
        type: String,
        default: ''
    },
    snippet_image_url : {
        type: String,
        default: ''
    },
    snippet_text : {
        type: String,
        default: '',
    },
    categories : {
        type: Array,
        default: []
    },
    phone : {
        type: String,
        default: ''
    },
    display_phone : {
        type: String,
        default: ''
    },
    location : {
        type: Object,
        default:{}
    }
});
/*
 * 
 * Define schema of apartment collection
 */
var apartmentSchema = new Schema({        
    position: {
        type: {},
        index:'2d' ,
        sparse: true
    },
    mylineup_count :{
        type: Number,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now
    },
    lastupdates: {
        type: Date,
        default: Date.now
    }, 
    screen_captures: [screenshotSchema],    
    google: [googleSchema],
    yelp: [yelpSchema]     
});

/*
 * Extend apartment schema with feature of unique field validator
 */
apartmentSchema.plugin(uniqueValidator, { message: 'Error, expected name to be unique.' });
/*
* define model of user schema
*/
var apartmentModel = mongo.model('apartments', apartmentSchema );  
var apartment = new apartmentModel();
//mongo.set('debug', true);


var ApartmentData = {

     distinct :  function(){
      console.log(1);
      apartmentModel.aggregate(
       { $group: 
       { _id: '$mylineup_count', total_count: { $sum: 1 },
            aparts: { $push:  { item: "$google.apart_name"} }
        } 
       },
       function (err, res) {
       if (err) return handleError(err);
          console.log(res);
       }
      );
    },
    /**
    *
    * Add lineup to apartment collection. The lineup added to user collection if they selected it.
    *
    * @param {String} get apartment details & responds
    * @return {Boolean} success
    * @author debugger@hotmail.co.uk
    * @date 10-10-2014
    */
    addLineUp: function (req, res) {  
   console.log(2);
        var apart = req.body,
            city, region, country;

        var errMsg = {};
  
        apartmentModel.findOne({google: {$elemMatch: {place_id: apart.place_id}}}, function(err, copy){
            if(err) {return res.status(500).send(err);}

            if(isEmpty(copy)){// INSERT
               
                ApartmentData.preInsert(apart, function(status){

                    if(!status){ return res.status(500).send('Data invalid');}
                   
                    /* SAVE DATA */
                    ApartmentData.insertApart(apart, function(result){
                        if(!result) {return res.status(500).send('Cannot Save');}
                        
                        res.send(result)
                    });  

                });

            }else{// UPDATE 
               
                var param = {'userId' :  apart.userId, 'lineups' : copy._id, 'labelId' : apart.labelId};
                 
                userModel.isApartExistInUser(param, function(rescheck){  

                    if(rescheck >0){ // already exists
                        return res.json({errors : "Lineup already exist in this community"});              
                    }
                    
                    //increment mylineup count
                    copy.mylineup_count = copy.mylineup_count + 1;
                    copy.save();
                                                                           
                    //RESULT SAVED TO USER COLLECTION
                    ApartmentData.saveToUser({'apartData' : apart, 'aId' : copy._id}, function(result){                        
                        if(!result) {                            
                            return res.json({errors : "Cannot save details to user collection"});
                        }

                        return res.json(result);
                    });// 

                });

            }

        });
    },
    /*
    * Save Apartment
    */
    insertApart : function(apart, res){
        console.log(3);
        // Save data        
        apartment.save(function (err1, todo) {                       
                      
            if(err1) {console.log(err1); res(false);}

            async.waterfall([
                function(acallback){
                    //RESULT SAVED TO USER COLLECTION
                    ApartmentData.saveToUser({'apartData' : apart, 'aId' : todo._id}, function(result){
                        
                        if(!result) {
                            console.log('Cannot save details to user collection'); 
                            res(false);
                        }
                        
                    }); 
                    // save yelp data
                    apart.toid = todo._id;
                    ApartmentData.setYelpData(apart);

                    acallback(null, true);
                },
                function(status, bcallback){                                                        
                    // Download screenshots from URLBOX.IO 
                    var len = todo.screen_captures;
                    if(len.length >0)
                        ApartmentData.downloadScreenshot(todo); 

                    bcallback(null, true);
                }
            ], function (error) {
                if (error) {               
                    return res.status(500).send(error);
                }

                //complete process
                res(todo); 
            });            

        });//

    },
    /*
    * Set up all the variable which are needed to insert
    */
    preInsert : function(apart, res){      
        console.log(4);
        // setup apartment data
        apartment = new apartmentModel({ position :[apart.lng, apart.lat], mylineup_count :1});

        async.waterfall([
            function(acallback){
                //call screencapture 
                ApartmentData.setScreenCapture(apart);  

                acallback(null, true);
            },
            function(status, bcallback){
                //call google                
                ApartmentData.setGoogleData(apart);                

                bcallback(null, true);
            }
        ], function (error) {
            if (error) {               
                return res.status(500).send(error);
            }
            //complete
            res(true);
        });
      
    },
    setScreenCapture : function(apart, res){

        //setup website screenshot and other variables                 
        if('website' in apart && apart.website != ''){
            ApartmentData.takeScreenshot(apart.website, function(ares){   
                if(ares){
                    apartment.screen_captures.push({ 
                        largepicture  : ares['desktop_large'],
                        mediumpicture : ares['desktop_medium'],
                        smallpicture  : ares['desktop_small'],
                        thumbpicture  : ares['desktop_thumb'],
                        mobpicture    : ares['mobile']
                    });
                }
            });
        }

    },
    /*
    * Search yelp for the apartment using the following parms: 
    * term: "sample", location:"address, city, zip", category_filter:"apartments"
    */
    setYelpData : function(apart){   
    console.log(5); 
        //search yelp data          
        var param = {
                      term: apart.name, 
                      location: apart.vicinity, 
                      category_filter:"apartments",
                      cll : apart.lat + "," + apart.lng
                    };

        yelp.search(param, function(error, data) {            
            if(error){ console.log('Yelp search error.'); return;}
        
          var busln = data.businesses;
          busln = busln.length;
          var yitems = {};
         
          if(busln > 0){
   
           var busId = data.businesses[0].id;

            yelp.business(busId, function(err, bdata) {
                if(err){ console.log('Yelp business error.'); return;}

                yitems = bdata; 
                yitems.uniqid = bdata.id;
 
                // SAVE HERE
                apartmentModel.findOne({_id: apart.toid}, function (aerr, item) {
                    if(aerr){return res.json(aerr);}

                    item.yelp.push(yitems); 
                    item.save();
                    
                    //console.log('Saved Yelp');
                });                
            });
          } 
            
        });

    },
    /*
    * set google data
    */
    setGoogleData : function(apart, res){
        console.log(6);
        var apartArr = {};
 
        apartArr = {             
            apart_name : apart.name,           
            place_id   : apart.place_id,
            lat        : apart.lat,
            lng        : apart.lng,    
            website    : apart.website,
            gplus      : apart.url           
        };
        // setup google details      
        if('photos' in apart){
            apartArr.photos = [];  
            apart.photos.forEach(function(photos, index){
                apartArr.photos.push(photos);
            });
        }   
        if('reviews' in apart){
            apartArr.reviews = [];  
            apart.reviews.forEach(function(review, index){
                apartArr.reviews.push(review);
            });
        }    
        if('opening_hours' in apart){
           apartArr.opening_hours = [];           
           apartArr.opening_hours.push(apart.opening_hours);
        }   
        if('rating' in apart ){                   
            apartArr.rating =  apart.rating? apart.rating: 0;
        }
        if('user_ratings_total' in apart){
            apartArr.total_reviews =  apart.user_ratings_total? apart.user_ratings_total: 0;
        }

        ApartmentData.stripStreetAddress(apart, function(resaddr){
           if(resaddr){
                apartArr.address   = resaddr['street-address']? resaddr['street-address'] : '';
                apartArr.city      = resaddr['locality']? resaddr['locality'] : '';
                apartArr.state     = resaddr['region']? resaddr['region'] : '';
                apartArr.country   = resaddr['country-name']? resaddr['country-name'] : '';
                apartArr.zipcode   = resaddr['postal-code']? resaddr['postal-code'] : '';
           }
        });
        
        apartment.google.push(apartArr);
       
    },
    /*
     * Take the screenshot of websites in various formats
     * 
     * @param {type} website url
     * @param {type} res
     * @returns {array for screenshot urls in various format}
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
     */
    takeScreenshot : function(website, res) {
        console.log(7);
        if(website === ''){
            res(false);
        }
        
        var img_ext = 'png', 
            webUrls = new Array(),
            urlenc = encodeURIComponent(website);      
        
        /******  START URL GENERATION ******/  

        //For Desktop full screen Large images (960 * full)
        var query_full_string = new Array(
            'url='+urlenc,            
            'thumb_width='+960,    
            'full_page='+true,
            'force='+true,
            'delay=10000'
        );
        //Creating Large image (960 * full) URL
        var sha1sumfullpage = crypto.createHmac('sha1',urlbox.secret);
        sha1sumfullpage.update(query_full_string.join('&'));
        var token = sha1sumfullpage.digest('hex');
        var webFullURL = 'https://api.urlbox.io/v1/'+urlbox.apikey+'/'+token+'/png?'+query_full_string.join('&');
        
        //For Desktop Medium images (800 * 495)
        var query_medium_string = new Array(
            'url='+urlenc,
            'thumb_width='+800,           
            //'height='+495,      
            'full_page='+false,
            'force='+true,
            'delay=10000'
        );
        ///Creating  Medium image (800 * 495) URL
        var sha1sum_mediumpage = crypto.createHmac('sha1',urlbox.secret);
        sha1sum_mediumpage.update(query_medium_string.join('&'));
        var token = sha1sum_mediumpage.digest('hex');
        var webMediumURL = 'https://api.urlbox.io/v1/'+urlbox.apikey+'/'+token+'/png?'+query_medium_string.join('&');

        //For Desktop Small images(340 * 230)
        var query_small_string = new Array(
            'url='+urlenc,  
            'thumb_width='+340,        
            //'height='+230,        
            'full_page='+false,
            'force='+true,
            'delay=10000'
        );
        //Creating Desktop Small image (340 * 230) URL
        var sha1sumsmallpage = crypto.createHmac('sha1',urlbox.secret);
        sha1sumsmallpage.update(query_small_string.join('&'));
        var token = sha1sumsmallpage.digest('hex');
        var webSmallURL = 'https://api.urlbox.io/v1/'+urlbox.apikey+'/'+token+'/png?'+query_small_string.join('&');


        //For Desktop Thumbnail images(70x56)
        var query_thumb_string = new Array(
            'url='+urlenc,  
            'thumb_width='+70,        
            //'height='+56,       
            'full_page='+false,
            'force='+true,
            'delay=10000'
        );
        //Creating Desktop Thumbnail image (70 * 56) URL
        var sha1sumthumbpage = crypto.createHmac('sha1',urlbox.secret);
        sha1sumthumbpage.update(query_thumb_string.join('&'));
        var token = sha1sumthumbpage.digest('hex');
        var webThumbURL = 'https://api.urlbox.io/v1/'+urlbox.apikey+'/'+token+'/png?'+query_thumb_string.join('&');

        //For Mobile Large images (360 * full-screen)
        var query_mobile_string = new Array(
            'url='+urlenc,  
            'width='+360,       
            'thumb_width='+360,       
            'full_page='+true,
            'force='+true,
            'delay=10000'
        ); 
        //Creating Mobile Large (360 * full-screen) URL
        var sha1summobpage = crypto.createHmac('sha1',urlbox.secret);
        sha1summobpage.update(query_mobile_string.join('&'));
        var token = sha1summobpage.digest('hex');
        var webMobileURL = 'https://api.urlbox.io/v1/'+urlbox.apikey+'/'+token+'/png?'+query_mobile_string.join('&');

        /******  END URL GENERATION ******/  
        webUrls['desktop_large'] = webFullURL;
        webUrls['desktop_medium'] = webMediumURL;   
        webUrls['desktop_small'] = webSmallURL;   
        webUrls['desktop_thumb'] = webThumbURL;
        webUrls['mobile'] = webMobileURL;
        
        res(webUrls);
    },

    /*
     * Parse address from json result which are provided by google.
     * 
     * @param {type} address from place details of google map
     * @param {type} callback which return the address 
     * @returns {array which formated address}
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
     */
    stripStreetAddress : function(address, callback){
        console.log(8);
        if(!address) callback(false);
       
        var str = address.adr_address,    
            $ = require('cheerio'),
            parseHtml = $.load(str),
            addr = [];
          
        parseHtml('span').map(function(i, foo) {
            // the foo html element into a cheerio object (same pattern as jQuery)
            var key = $(foo).attr('class');     
            var val = $(foo).text();
            addr[key] = val;       
            //console.log($(foo).attr('class') +':' + $(foo).text());
        });
    
        var arrPre = new Array('street-address', 'locality', 'region', 'postal-code', 'country-name'),
            foraddr = address.formatted_address,
            aSplit = foraddr.split(','), tmp = {};
    
        if(addr.length != arrPre.length){
            var i = 0;
            arrPre.forEach(function(pre, aind){ 
                
                if(aind >= 3){ 
                    i = aind -1;
                }else{ i = aind;}
                
                if(!inArray(pre, Object.keys(addr))) {
                    if(i == 2 || i == 3){
                        
                       var da = aSplit[2].split(' ');
                       tmp[pre] = (i==2)? da[0]: da[1];
                       
                    }else{ tmp[pre] = aSplit[i];}
                }
            });
            
            for (x in tmp) {
                addr[x] = tmp[x];
            }
        }
    
        callback(addr);

    },
    saveToUser : function(req, res){
        console.log(9);
        var apart   = req.apartData,
            id      = req.aId,
            apartUser = {};

        if(!apart.userId){res(false);}
        /*
        * add apartment to user account
        */     
        apartUser.userId = apart.userId;  
        apartUser.lineups = id;
        
        if(apart.lineupname){// new
            apartUser.lineupname =  apart.lineupname;
        }
        if(apart.labelId){// already existing
            apartUser.labelId =  apart.labelId;
        }

        // add to user collection 
        userModel.addUserLineUps(apartUser, function(resp){                      
            res(resp); 
        });
          
    },
    /**
     *
     * Get all lineups from apartment collection with page limit
     *
     * @param {String} get the sort field and pagination limit
     * @return {Boolean} lineups
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
    */
    findallLineups : function (req, res) {
   console.log(10);
        var args = req.body,
            limt, cond = {},sort,
            totalCount = 0;


        limt =  ('limit' in args)? args.limit : 9;
        sort =  ('sort' in args)? '-' +args.sort : '-mylineup_count';
             
        if(req.cookies.adress){  
            var adrr = req.cookies.adress; 
           
            // get the lat & lon of city/state
            var astr = adrr.split(",");
            if(astr.length>0){
                var regcity ='', 
                    regstate = '';
                
                if(astr[0] && astr[0] != '')regcity = new RegExp([".*",astr[0],".*"].join(""),"i");
                if(astr[1] && astr[1] != '')regstate = new RegExp([".*",astr[1],".*"].join(""),"i");
              
                //cond = { $or: [ { city: regcity }, { state: regstate } ] } ;  
                cond = {google: {$elemMatch: { $or: [ { city: regcity }, { state: regstate } ] }}};  
            }
        }
    
        //total count
        apartmentModel.count(function(e, cnt){
            if(e) res.json(e);
            totalCount = cnt;
        });
     
        var skp = limt - 9;
        skp = (skp)? parseInt(skp) : 0;
    
        // get all lineups
        apartmentModel.find(cond).lean().sort(sort).skip(skp).limit(limt).exec( function (err, item) {    //        
            if(err || !item) {res.json(err); }

            //get images from s3 bucket
            ApartmentData.processAparts(item, function(ares){            
   
                res.json({'totalcount' : totalCount, 'apart' : ares}); 

            });        
        });    
    },
    processAparts : function(apartments, returnback){
console.log(11);
        var apart = []; 

        async.each(apartments, function (doc, pcallback) {

          ApartmentData.parsingData(doc, function(result){

            apart.push(result);
 
            pcallback();
          });

        }, function (err) {
          if (err) console.error(err.message);

          // configs is now a map of JSON data
          returnback(apart);
        });
    },
    /*
     * Fetch the url of images in different sizes from S3 bucket
     * 
     * @param {type} apartments is the object which contains the details of apartment
     * @param {type} callback which return the result
     * @returns {array which contains all the urls of images from S3 bucket}
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
    */
    parsingData : function(doc, reback){
             console.log(12);
        var img_ext     = '.png',
            imagename   = doc.google[0].place_id + img_ext;
            params      = {Bucket: bucketName},
            subset      = {},
            subset      = doc,           
            screencap   = doc.screen_captures,
            i           = (screencap.length - 1);  

        // Generate Vanity URL
        ApartmentData.generateVanityUrl(subset, function(vanity){          
            subset.vanity = vanity;
        });

        /*
         * s3 bucket configuration to get the screenshot images from there
        */  
        AWS.config.update({accessKeyId: accessKeyId , secretAccessKey: secretAccessKey, region: region});   
        var s3 = new AWS.S3();

        var scap = {}; 
        if(screencap[i]){
           if(screencap[i].largepicture != ''){             

            params.Key = 'large/'+ imagename;           
            scap.fullPic = s3.getSignedUrl('getObject', params); 
        }
        if(screencap[i].mediumpicture != ''){             
            params.Key =  'medium/'+ imagename;                
            scap.mediumPic = s3.getSignedUrl('getObject', params); 
        }  
        if(screencap[i].smallpicture != ''){             
            params.Key = 'small/'+ imagename;               
            scap.smallPic = s3.getSignedUrl('getObject', params); 
        }  
        if(screencap[i].thumbpicture != ''){             
            params.Key = 'thumb/'+ imagename;               
            scap.thumbPic = s3.getSignedUrl('getObject', params); 
        } 
        if(screencap[i].mobpicture != ''){            
            params.Key = 'mobile/'+imagename;                
            scap.mobPic = s3.getSignedUrl('getObject', params);
        }

            subset.screen_captures = scap;
        }  

        subset.yelp = doc.yelp[0];
  
        // Parsing google data
       // ApartmentData.googleParse(subset, function(res){
            subset.google = doc.google[0];
         //   subset.google = res;

            reback(subset);     
       // });
        
    },
    /*
     * Generate the dynamic url for apartment 
     * 
     * @param {type} address from place details of google map
     * @returns {generated vanity url}
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
     */
    generateVanityUrl : function(data, callback){
        console.log(13);
        var state, city, apart, vanity ='';
        
        var address = data.google[0];

        if('city' in address && address.city){
            city = address.city;
            city = city.toLowerCase();
        } 
        vanity += city;
        if('state' in address && address.state){
            state = address.state;
            state = state.toLowerCase();
        }
        
        if(city && state){vanity += '-';}
        vanity += state;
        
        if('apart_name' in address && address.apart_name){
            apart = address.apart_name;
            apart = apart.toLowerCase();
        }
        if(vanity){ vanity += '/';}
        
        vanity += apart;
       console.log(vanity);
        callback(vanity);
    },    
    /*
    * The reviews & open hours are parsed from the json result. Fetched image urls from s3 bucket. 
    */   
    googleParse : function(datas, callback){ 
    console.log(14);
        var openhrs  ={}, open = {};

        var jsonData = datas.google[0];

        //open hours processing
        if('opening_hours' in jsonData){
            openhrs = jsonData.opening_hours;   

            if(openhrs.length <= 0){ 
               callback(jsonData);
            }
                    
            open.open_now = (typeof openhrs[0] == "object" && openhrs[0].open_now)? openhrs[0].open_now :false;
            var periods  = [];
            periods  = (typeof openhrs[0] == "object" && openhrs[0].periods)? openhrs[0].periods : {};
            var working_text = (typeof openhrs[0] == "object" && openhrs[0].weekday_text)?openhrs[0].weekday_text : {};

            var timelog  = [];
            var totalhrs = 0;            
            var indx = 0;
           
            async.eachSeries(working_text, function(works, acallback) { 
                var datetmp = {};
                var daysFormat = dbvar.general.splitWorkingDays(works);
                //closed days
                if(daysFormat.time == 0){

                    datetmp.time =  '--';  
                    datetmp.days = daysFormat.days;              
                    timelog.push(datetmp);

                }else if(typeof periods[indx] == "object"){//Working days

                    //if(!periods[indx]){console.log('NO PERIODS'); indx++; acallback();}                    
                    var start = 0,end = 0, res = 0;
                   
                    //working hours calculate
                    if (typeof periods[indx].close == "object" && typeof periods[indx].open == "object"){                    

                        start = dbvar.general.iterate(periods[indx].open, 'time'); 
                        start = start? start : 0;

                        end = dbvar.general.iterate(periods[indx].close, 'time');                       
                        end = end? end : 0;

                        res = dbvar.general.TimeDiff(start, end);

                    }else if(typeof periods[indx].open == "object"){
                        start = dbvar.general.iterate(periods[indx].open, 'hours');                         
                        res = (start == 0)? 24 : 0;                        
                    }
                    
                    totalhrs += parseFloat(res);
                    datetmp.time =  res+' hrs';  
                    datetmp.days = daysFormat.days;          
                    timelog.push(datetmp);

                }

                indx++; 
                acallback(); 
                
            }, function(err){
                open.periods = timelog; 
                open.totalhrs = totalhrs; 

                jsonData.opening_hours = open? open : null;

                callback(jsonData);   
            });
        }else{  
            callback(jsonData);
        }    
    },    
    /**
     *
     * Get city / states based on typehead search
     *
     * @param {String} keywords of city, state and address
     * @return {Boolean} lineups
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
    */
    findLocations : function (req, res) {
   console.log(15);
     /*   var args = req.body;
        var cond = ''; 

        if('address' in args){     //get address   
            cond = args.address;        
        }
        
        if(cond){
           
            var regex = new RegExp([".*",cond,".*"].join(""),"i");
              
            apartmentModel.find( { $or: [ { city: regex }, { state: regex } ] } ,function (err, output) {   
              
                if (err){ console.log(err);  res.json(false); }
                
                var tmpres = []; 
                     
                output.forEach(function(doc, index){
                    
                    doc = doc.toObject();
                    var locn = args.address;
                    locn = locn.toLowerCase();
                    
                    var city = doc['city'];
                    city = city.toLowerCase();
                    
                    var state = doc['state'];
                    state = state.toLowerCase();
                    
                    if(city.indexOf(locn) > -1 || state.indexOf(locn) > -1){                    
                        doc['location']  =  (doc['city'])? doc['city'] : '';
                        doc['location'] +=  (doc['city'] && doc['state'])?",": '';
                        doc['location'] +=  doc['state']? doc['state'] : '';
                    }
             
                    if(tmpres.length >0){
                        tmpres.forEach(function(res, xind){
                            if(city.indexOf(res['city'].toLowerCase()) < 0 && state.indexOf(res['state'].toLowerCase()) < 0){                                                 
                                tmpres.push(doc); // not found -1
                            }
                        });
                    }else{                    
                        tmpres.push(doc);
                    }
                   
                });          
                res.json({'apart' : tmpres}); 
                
            });
        }*/
    },
    /**
     *
     * Get the nearby locations of selected address with geolocation finder
     *
     * @param {String} keywords of city, state and address
     * @return {Boolean} lineups
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
    */
    getGeoLocations : function (req, res) {
    console.log(16);
        var args = req.body;   
        var cond = '';

        if('address' in args){     //get address   
            cond = args.address;
            res.cookie('adress', cond); // set next result from cookies
            
            // get the lat & lon of city/state
            var astr = cond.split(",");
            if(astr.length>0){
                var regcity ='', 
                    regstate = '';
                
                if(astr[0] && astr[0] != '')regcity = new RegExp([".*",astr[0],".*"].join(""),"i");
                if(astr[1] && astr[1] != '')regstate = new RegExp([".*",astr[1],".*"].join(""),"i");                 

                apartmentModel.findOne({google: {$elemMatch: { $or: [ { city: regcity }, { state: regstate } ] }}} ,function (err, output) { 
                    if (err){ console.log(err);  res.json(false);  }
                 
                    if(output){                         
                        apartmentModel.find(
                            {
                            position: {
                                $geoWithin: { 
                                   $center: [ [ parseFloat(output.google[0].lng), parseFloat(output.google[0].lat)], 2 ]
                                }
                            }
                        }).lean().sort('-mylineup_count').exec(function(err2, result){
                            if (err2){ console.log(err2);  res.json(false);  }    
                            
                            if(result){
                               
                                ApartmentData.processAparts(result, function(ares){ 
                                    
                                    res.json({'totalcount' : output.length, 'apart' : ares}); 
                                });
                            }else{
                                res.json(false);
                            }  
                        });
                    }else{ 
                        res.json(false);
                    }
                    
                    
                });
                
            }
        }

    },  
    /*
     * Download screenshots of various format and uploaded it into the S3 bucket 
     * 
     * @param {type} wid is the object id of apartment
     * @param {type} arUrl have the urls of screenshots
     * @returns {true or false}
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
     */
    downloadScreenshot : function(req){ //wid, arUrl
     
        var wid         = req.google[0].place_id, links = [],
            screencap   = req.screen_captures,
            i           = (screencap.length - 1),
            imagename   = wid + '.png';
            

           links.push({'url': String(screencap[i].largepicture),
        'fname': wid +"_large_#"+process.pid, 'folder' : 'large/'});
                       
          links.push({'url': String(screencap[i].mediumpicture),

        'fname': wid +"_medium_#"+process.pid, 'folder': 'medium/'});

            links.push({'url': String(screencap[i].smallpicture),
        'fname': wid +"_small_#"+process.pid, 'folder': 'small/'});

            links.push({'url': String(screencap[i].thumbpicture),
        'fname': wid +"_thumb_#"+process.pid, 'folder': 'thumb/'});

            links.push({'url': String(screencap[i].mobpicture),
        'fname': wid +"_mobile_#"+process.pid, 'folder': 'mobile/'});
      
        /*
         * s3 bucket configuration to get the screenshot images from there
        */      
        AWS.config.update({accessKeyId: accessKeyId , secretAccessKey: secretAccessKey, region: region});
         
        /*
        Check a  temporary directory is exists.
        */
       if(fs.existsSync('./tmp')) {
          
        //console.log("exists");
            ApartmentData.uploadImgaeS3(links,imagename);
        // Do something
        }else{
        /*
         * Create temporary directory to upload image into it.
        */
            fs.mkdir('./tmp',function(err){           
                console.log(err);
            });
            ApartmentData.uploadImgaeS3(links,imagename);
        //console.log("not exists");
        }
    },
    /**
     *
     * Upload images to s3 bucket
     *
     * @param {String} links,imagename
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
    */
    uploadImgaeS3 : function(links,imagename){
        var s3bucket = new AWS.S3();
        async.eachSeries(links, function(link, callback) {
            
            http.get({url : link.url, method : 'GET'}, './tmp/'+link.fname, function (error, result) {        
                if(error) { console.error("Error in fetching file: "+error); callback(); }

                if(fs.existsSync('./tmp/'+link.fname)){
                    setTimeout(function(){
                    var stats = fs.statSync('./tmp/'+link.fname);
                    var fileSizeInBytes = stats["size"];
                    if(fileSizeInBytes > 0){
                        //console.log('Image downloaded and moved to local at: ' + result.file);
                        fs.readFile('./tmp/'+link.fname,function (err, data) {
                            params = {Bucket: bucketName, Key: link.folder + imagename,  ContentType: 'image/png',  Body  : data};      

                            s3bucket.putObject(params, function(err, datas) {                     
                                if (err) {
                                    console.log("Error from s3 uploading: ", err);
                                    callback()
                                }else{
                                    console.log("Image Uploaded",link.fname);
                                }

                                //console.log("Successfully uploaded data to apartmentlist/"+link.folder+imagename);
                                callback()                       
                            });
                        });  
                    }
                },5000)
                }
                
                         
            });  

        });
},

    /**
     *
     * Get single lineup details
     *
     * @param {String} lineup id
     * @return {Boolean} single lineup collection
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
    */
    getSingleLineup : function (req, res) {
    console.log(17);
        var args = req.body;
        var result = {};
        
        apartmentModel.findOne({'_id': args.lineid}).lean().exec(function (err, item) {   
            if (err) console.log(err);
            
            ApartmentData.parsingData(item, function(result){
                console.log(result);
                res.json(result); 
            });
            
        });
    },
    /**
     *
     * increment and update the count of lineup to apartment collection which are added by users
     *
     * @param {String} place id
     * @return {Boolean} single lineup collection
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
    */
    updateLineupCount : function (param, res) {
             console.log(18);  
        apartmentModel.findOne({_id: param.apartId}, function (aerr, item) {
            if(aerr){return res.json(aerr);}
           
            //update mylineup count
            if(param.increment == true){
                item.mylineup_count = item.mylineup_count + 1;
            }
            if(param.increment == false){
                item.mylineup_count = item.mylineup_count - 1;
            }
            item.save();
            
            res(true);
        });
    },
    /**
     *
     * Update the details of lineup for every week 
     *
     * @param {String} place id
     * @return {Boolean} updated lineup details
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
    */
    updateLineupDetails : function(req, res){
       /* var apart = req.body,
            city, region, country;
        
        var unixTimeStamp = new Date().getTime();
        var errMsg = {}, 
            apartArr = {},
            apartUser = {},
            aURLS = [];

        ApartmentData.getPlaceDetails(apart.place_id, function(newres){       
            var pardata = JSON.parse(newres); 
            
            if(pardata.result){
                var gdata = pardata.result; 
                apartmentModel.findOne({place_id: apart.place_id}, function (err, exists) {             
                    if(err) {console.log(err); return false;}

                    if(exists.length <= 0){return false;}
                    
                    /*
                    * updation if the updated date greater than 7days from today
                    * (today - update) > 7
                    */
                    /*var d  = new Date();                
                    var d1 = new Date(exists.lastupdates);
                    
                    var day = d1.getDate();
                    var month = d1.getMonth();
                    var year = d1.getFullYear();
                    
                    d1.setDate(parseInt(day));
                    d1.setMonth(parseInt(month));
                    d1.setYear(parseInt(year));  
                    
                    var day = dbvar.general.DateDiff(d, d1);
                    
                    if(day > 7){           
                        apartArr = {
                            apart_name : exists.apart_name,
                            address    : exists.address,
                            place_id   : exists.place_id,
                            lat        : exists.lat,
                            lng        : exists.lng,    
                            gplus      : exists.gplus,
                            website    : exists.website,
                            picture    : exists.picture,
                            mediumpicture : exists.mediumpicture,
                            smallpicture : exists.smallpicture,
                            thumbpicture : exists.thumbpicture,
                            mobpicture : exists.mobpicture,
                            city       : exists.city,
                            state      : exists.state,
                            country    : exists.country,
                            zipcode    : exists.zipcode                       
                        };

                        exists.lastupdates = unixTimeStamp;
                        
                        if('reviews' in gdata){
                            apartArr.reviews = [];  
                            gdata.reviews.forEach(function(review, index){
                               apartArr.reviews.push(review);                           
                            });
                            
                            exists.reviews = apartArr.reviews;
                        }    
                        if('opening_hours' in gdata){
                           apartArr.opening_hours = [];           
                           apartArr.opening_hours.push(gdata.opening_hours);
                           
                           exists.opening_hours = gdata.opening_hours;
                        }   
                        if('rating' in gdata){                   
                            apartArr.rating =  gdata.rating? gdata.rating: 0;
                            
                            exists.rating = gdata.rating? gdata.rating: 0;
                        }
                        exists.save();
                        
                        userModel.updateLineupDetails(apartArr, function(userdata){
                            userdata.forEach(function(data, index){
                                userModel.updateLineup(data, function(resData){      
                                    console.log('RESULT : ' + resData)
                                });                           
                            });
                        });  
                        
                    }

                });
            }
        });*/
    }, 
    /*
     * Get the place details from google map using API key
     * @param {type} placeId
     * @param {type} callback
     * @returns {return json array of place details}
     * @author debugger@hotmail.co.uk
     * @date 10-10-2014
     */
    getPlaceDetails : function(placeId, callback){

       /* https.get('https://maps.googleapis.com/maps/api/place/details/json?placeid='+placeId+'&key='+gapi_key, function(res) {

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
        }); */   

    }

}; 
module.exports = ApartmentData;  


/*
 * Parse address from json result which are provided by google.
 * 
 * @param {type} address from place details of google map
 * @param {type} callback which return the address 
 * @returns {array which formated address}
 * @author debugger@hotmail.co.uk
 * @date 10-10-2014
 */
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}
function isEmpty(ob){
    for(var i in ob){ return false;}
    return true;
}