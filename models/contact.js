/**
* 
*Contact Us
* 
*
* LICENSE: Some license information
*
* @category Node Angular Seed
* @package Model
* @subpackage model_contact
* @version  $Id:$v.1.0
* @date 29-09-2014
* @author debugger@hotmail.co.uk
*/

/*
* module dependencies
*/
var madrill_api = global.config.madrill_api;

var mandrill = require('node-mandrill')(madrill_api);

/**
 *
 * Send mail via mandrill
 *
 * @param {String} get contact details and responds
 * @return {Boolean} success or failed
 * @author debugger@hotmail.co.uk
 * @date 10-10-2014
*/
exports.sendContact = function (req, res) {

    var contact = req.body;   
    if(!contact.email || !contact.name || !contact.looking || !contact.message){
        res.send({'msg' : 'Empty Fields', 'err' : true});
    }
    
    var str = createMailTemplate(contact);
    
    //send an e-mail to jim rubenstein
    mandrill('/messages/send', {
        message: {
            to: [{email: 'kavya@email.com', name: 'Kavya Sagar'}],
            from_email: contact.email,
            subject: contact.looking,           
            html: str
        }
    }, function(error, response)
    {
        //uh oh, there was an error
        if (error) {
            var err = JSON.stringify(error);
            console.log(err);
            res.send({'msg' : err, 'err' : true});
        }

        //everything's good, lets see what mandrill said
        else {
            console.log(response);
            res.send({'msg' : response.status, 'err' : false});
        }
    });
};
/**
 *
 * Generate mail html template
 *
 * @param {String} get contact details 
 * @return {Boolean} html template
 * @author debugger@hotmail.co.uk
 * @date 10-10-2014
*/
function createMailTemplate(contact){
    var sHTML = '';
    
    sHTML += '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html>';
    sHTML += '<head><meta content="text/html; charset=utf-8" http-equiv="Content-Type" />';
    sHTML += '<title>Node Angular Seeds</title>';
    sHTML += '<style type="text/css"> a:hover { text-decoration: underline !important; }</style>';
    sHTML += '</head>';
    sHTML += '<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #eff2f7;" leftmargin="0">';
    sHTML += '<table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#eff2f7" style="font-family:Arial, Helvetica, sans-serif; color: #333; margin-top:20px;">';
    sHTML += '<tr><td>';
    sHTML += '<table style="background-color:#fff; padding:10px 0 25px 0; font-size:15px;" width="600" border="0" align="center" cellpadding="0" cellspacing="0">';
    sHTML += '<tr><td>';
    sHTML += '<table width="100%" border="0" cellspacing="0" cellpadding="0">';
    sHTML += '<tr><td valign="middle" width="600"><table width="100%" border="0" cellspacing="0" cellpadding="0">';
    sHTML += '<tr><td><h1 style="text-align:center;"><img src="'+global.config.host+'/assets/images/apartmentlineup_full-logo.png"/></h1></td></tr>';
    sHTML += '</table></td></tr></table></td></tr>';
    sHTML += '<tr><td><h1 style="text-align:center; font-weight:normal; font-size:25px; margin:0 20px 25px 20px; padding-bottom:15px; border-bottom: 1px solid #ddd;">Contact Details</h1></td></tr>';
    sHTML += '<tr style="text-align:center; display:inline-block; margin-bottom:30px;"><td style="float:left; margin-left:170px; display:block; text-align:left; width:70px;">Name:</td><td style="float:left; display:block;">'+contact.name+'</td></tr>';
    sHTML += '<tr style="text-align:center; display:inline-block; margin-bottom:30px;"><td style="float:left; margin-left:170px; display:block; text-align:left; width:70px;">Email:</td><td style="float:left; display:block;">'+contact.email+'</td></tr>';
    if(contact.contactnum && contact.contactnum != ''){
        sHTML += '<tr style="text-align:center; display:inline-block; margin-bottom:30px;"><td style="float:left; margin-left:170px; display:block; text-align:left; width:70px;">Phone:</td><td style="float:left; display:block;">'+contact.contactnum+'</td></tr>';
    }
    sHTML += '<tr style="text-align:center; display:inline-block; margin-bottom:30px;"><td style="float:left; margin-left:170px; display:block; text-align:left; width:90px;">Message:</td>';
    sHTML += '<td style="float:left; display:block; width:290px; text-align:left; line-height:20px;">'+contact.message+'</td></tr>';
    sHTML += '<tr style="text-align:center; display:block; margin-top:30px;"><td style="display:block; margin: 40px 20px 0px 20px;; font-size:13px;border-top:1px solid #ddd; padding-top:10px;"><p style="margin:0; font-weight:bold;">Node Angular Seed</p></td></tr>';
    sHTML += '</table></td></tr></table></body></html>';

    return sHTML;

}