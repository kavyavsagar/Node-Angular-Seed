/**
* Routing of the site
*
* The routing of the site are described 
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Model
* @subpackage model_index
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
* 
*/

/**
*
* When a GET request is fired to / or access the site with root path, it calls this method. This function does is render the index view of site.
*
* @param {string} get request & responds
* @returns {string} render html template to view index page
* @author debugger@hotmail.co.uk
* @date 10-07-2014
*/
exports.index = function(req, res){  
  res.render('index');   
};

/**
*
* When a GET request is fired to / with any string, it calls this method. This function does is render the corresponding template view of site.
*
* @param {string} get request & responds
* @returns {string} render html template to view index page
* @author debugger@hotmail.co.uk
* @date 10-07-2014
*/
exports.partials = function (req, res) {  
  var name = req.params.name;
  res.render('partials/'+name);
};
