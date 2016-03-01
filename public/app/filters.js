'use strict';
/**
* Demonstrate how to use app filters 
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Angular Filters
* @subpackage filters
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

angular.module('applineup.filters', []).
  filter('interpolate', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  });
// Format the structure of website url and return domain name only
app.filter( 'domain', function () {
  return function ( input ) {
    var output = "",
        matches;

    matches = input.replace(/.*?:\/\//g, ""); // replace http
    matches = matches.split("/");
    output = matches[0];

    /*var urls = /\w+:\/\/([\w|\.]+)/;
    matches = urls.exec( input );

    if ( matches !== null ) output = matches[1];*/

    return output;
  };
});
// create vanity url for apartment detail page
app.filter( 'vanityURL', function () {
  return function ( input ) { 
     
    var output = "";
    output += "/"+encodeURI(input);

    return output;
  };
});


/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs a AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform a OR.
 */
app.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
});