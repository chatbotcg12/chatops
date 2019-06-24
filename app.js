/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

/**set port using env variable for server */
 var port = process.env.PORT || 3000;
	app.listen(port, "0.0.0.0", function () {
		console.log("Listening on --- Port 3000");
});

/** start connection  from servicenow*/
const sn = require('servicenow-rest-api');
const ServiceNow = new sn('dev49606', 'admin', '10Service@321');
/** end connection  from servicenow*/

///////////////////////////////////////////
//     API for connection from servicenow ticket//
///////////////////////////////////////////
app.post('/chatops', function (req, response) {    
		 response.setHeader('Content-Type', 'application/json');
		console.log("Display name ", req.body.queryResult.intent.displayName);
        switch (req.body.queryResult.intent.displayName) {				
		
		/**Create new ticket in service now */
        case "createnewticketservicenow":
            var sort_desc = (req.body.queryResult.parameters.sort_description).toString();
            const data = {
                'short_description': (req.body.queryResult.parameters.sort_description).toString(),
                'urgency': (req.body.queryResult.parameters.urgency).toString(),
                'assignment_group': 'Hardware'
            };
            ServiceNow.createNewTask(data, 'incident', res => {
                console.log(JSON.stringify({ "fulfillmentText": "Your ticket " + res.number + " is created successfully with status: " + res.state + " and description: " + res.short_description }));
                response.send(JSON.stringify({ "fulfillmentText": "Your ticket " + res.number + " is created successfully with status: " + res.state + " and description: " + res.short_description }));
            });

            break;
		/**Getting ticket details from service now */
        case "getServiceNowTkt":
            response.setHeader('Content-Type', 'application/json');
            const fields = [
                'number',
                'short_description',
                'assignment_group',
                'priority',
                'incident_state'
            ];
            const filters = [
                'number=' + req.body.queryResult.parameters.tktnumber
            ];
            ServiceNow.getTableData(fields, filters, 'incident', res => {
		
                console.log(JSON.stringify({ "fulfillmentText": "Ticketnumber: " + res[0].number + " status is " + res[0].incident_state + " and description : " + res[0].short_description }));
                response.send(JSON.stringify({ "fulfillmentText": "Ticketnumber:  " + res[0].number + " status is " + res[0].incident_state + " and description : " + res[0].short_description }));
            });
            break;
			/**Getting ticket urgency from service now */
			 case "geturgencyofticket":
				response.setHeader('Content-Type', 'application/json');
				const fieldsarray = [
					'number',
					'urgency'             
				];
				const filtersarray = [
					'number=' + req.body.queryResult.parameters.ticketnumber
				];
            ServiceNow.getTableData(fieldsarray, filtersarray, 'incident', res => {
                console.log("data is here", res);
                var result = res[0].urgency;
                var data = result.split("-", -1);
                var urgencydata = data[1];
                console.log(JSON.stringify({ "fulfillmentText": "Ticketnumber: " + res[0].number + " urgeny is " +urgencydata }));
                response.send(JSON.stringify({ "fulfillmentText": "Ticketnumber: " + res[0].number + " urgeny is " +urgencydata }));
            });
            break;
			    break;
        /**Update ticket status in service now */
        case "updateservicenowticket":
            var status = (req.body.queryResult.parameters.ticket_status).toString();
		     var ticketnuber = (req.body.queryResult.parameters.ticket_number).toString();			  
            /**change status in first charater in uppercase */
            function toTitleCase(str) {
                return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            }
			
            var newstatus = toTitleCase(status);
				console.log("hii",newstatus)
            const updatedata = {
                'incident_state': newstatus
            };
            ServiceNow.UpdateTask('incident',ticketnuber,updatedata, res => {
                response.setHeader("Content-Type", "application/json");
				response.send(JSON.stringify({ "fulfillmentText": "Your ticket number: " + ticketnuber + " is updated successfully with status " + newstatus }));
				
				/*  if (res = "undefined") {
                    console.log("Unable to process your request")
                    response.send(JSON.stringify({ "fulfillmentText": "Unable to process your request"}));
                } else {
					console.log(JSON.stringify({ "fulfillmentText": "Your ticket number: " + req.body.queryResult.parameters.ticket_number + " is updated successfully with status " + newstatus }));
					response.send(JSON.stringify({ "fulfillmentText": "Your ticket number: " + req.body.queryResult.parameters.ticket_number + " is updated successfully with status " + newstatus }));
				} */
            });
            break;
		
		
		
        }
    });   

