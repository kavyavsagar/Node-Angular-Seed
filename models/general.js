/**
* Define general functions
*
* General functions are defined in this file which will help to reuse anywhere in the site
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Model
* @subpackage model_general
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

module.exports = {
    /**
    *
    * Calculate the difference between two dates and return the num of days among them
    *
    * @param {String} start date and end date
    * @return {Boolean} number of days
    * @author debugger@hotmail.co.uk
    * @date 10-07-2014
    */
    DateDiff : function(date1, date2){
        var datediff = date1.getTime() - date2.getTime();
        //store the getTime diff - or +
        var res = Math.abs((datediff / (24 * 60 * 60 * 1000)));
        return Math.round(res);
        //Convert values to -/+ days and return value
    },
    TimeDiff : function(start, end){

    	var ahr = start.substr(0, 2),
    	amin = start.substr(2);

    	var bhr = end.substr(0, 2),
    	bmin = end.substr(2);

    	//today
     	var d = new Date();
    	var da = d.getDate();
        	var m = d.getMonth() + 1;
    	var y = d.getFullYear();
    	 
    	var timeStart = new Date(y, m, da,  ahr, amin);
    	var timeEnd = new Date(y, m, da,  bhr, bmin);
    	 
    	var diff = timeEnd - timeStart;

    	diff = msToTime(diff);

    	return diff;
      
    },

    in_array : function(search, array){
        for (i = 0; i < array.length; i++)
        {
            if(array[i] == search )
            {
                return true;
            }
        }
        return false;
    },
    splitWorkingDays : function(works){        
        var substr = works.split(":"); 

        var caseltr = substr[1].trim();
        caseltr = caseltr.toLowerCase();        
        
        var working = {};
        working.days = substr[0].trim();

        switch(caseltr){
            case "closed":                
                working.time = 0;
                break;
            case "opened":
                console.log("WORKING DAY OPENED");
                working.time = 0;
                break;
            default:
               working.time = 1;
               break;
        }
        
        return working;
    },
    iterate : function(obj, doIndent) { 

      for (var property in obj) {
        if (obj.hasOwnProperty(property)){
            if (obj[property].constructor === Object) {            
               iterate(obj[property]);  
            } else {
                if(property == doIndent) return obj[property];
            }
        }
      }  

    }



};

/*
 * private class for hour convertion
 */
function msToTime(duration) {
    var  minutes = parseInt((duration/(1000*60))%60)
        ,hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;

    return hours + "." + minutes;
}