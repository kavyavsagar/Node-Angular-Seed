# Angular-Node Seed

Angular-Node  is a seed project that specify the establishment directory which will have address & its details briefly. The technologies based on this project is expressjs (nodejs) & angularjs for server side & client side respectively. Mongodb is the database of this project which will meet our needs. The places are located using google map and fetced details using google api that are saved into this system.

### Running the app

Runs like a typical express app:

    node app.js

## Directory Layout

app.js        			# app config

package.json  			# for npm

config
	--- env                 	# Config Files
        ------ uat.js          	# Test specific
		------ development.js   # Development specific
		------ production.js    # Production specific
	--- config.js 		# General configuration for all environments
	--- routes.js 		# AngularJs api endpoints routing
	--- server.js       	# Express middleware

models	 			# Database Schema Models
	--- apartment               # capartment models and its functions
	--- user               		# user models and its functions
	--- contact              	# Manage and Send contact mail
	--- general                     # commonly used methods
	--- dbconnct                    # database connection
	--- index                       # rendering html

public				# Anything in public is public assessible

	--- assets        	# Javascript/Css/Images/fonts (not aggregated)
		------ css      	# Css files
		------ js   		# js files
		------ images   	# images
		------ fonts     	# images

	--- lib        		# Angular and other js libraries
	--- controllers   	# Angular Controllers
		------ search        	# Search on google map and its related method's logic goes here
		------ frontend   		# Frontend client side logic goes here
		------ common        	# commonly used header and other common controllers 

	--- app         		# Angular application files		
		------ services   	# Generally used Angular services  at frontend
		------ app        	# Angular app that register modules & routing at client side
		------ directives   # Angular directive files found
		------ filters	   	# Angular filter files found

Views				 # All html templates
	--- index        		# main page for app -  doctype, title, head boilerplate
	--- partials         		# angular view partials 
		------ header        	# header part of the website
		------ footer        	# footer part of the website
		------ index        	# main page of the site that list all apartments
		------ login        	# user login
		------ search        	# search page which load google map
		------ mylineups       	# List all the label community and lineups with details of logined user
		------ aboutus        	# aboutus
		------ contact        	# contact us form 
		------ privacy        	# privacy policy 
		------ viewscreenshot   # List the full view of screenshots
		------ 404        		# page not found
		------ 500      		# internel server error

## Contact

mail to :  Kavya Sagar <debugger@hotmail.co.uk>

