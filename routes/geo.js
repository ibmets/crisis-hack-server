'use strict';

var express = require('express');
var router = express.Router();

var ceStoreBaseUrl = process.env.CE_STORE_BASE_URL;
var geoJSONCEBaseUrl = process.env.CE_GEOJSON_BASE_URL;

var model = require('../storage/model.js');
var request = require('request');

router.get('/ceToCloudant/:concept_name', function(req, res, next) {
	var concept_name = req.params.concept_name;

	//Make call to Adrian's Node-RED instance to get geojson from CE
	var url = geoJSONCEBaseUrl+"ce-to-geojson?concept="+concept_name;

	// Helper to remove all people from the database
	var deleteAllPeople = function() {
		return new Promise(function(resolve, reject) {
			// Clear the demo_people_locations table and insert the new geojson
			model.initialise("demo_people_locations");
			model.getAll().then(function(people) {
				for (var i=0; i<people.length; i++) {
					people[i]._deleted = true;
				}
				model.insertBulk(people).then(function() {
					resolve();
				}, function(err) {
					return reject(err);
				})
			}, function(err) {
				reject(err);
			});
		})
	}

	//Helper to insert new concept into cloudant
	var insertNewConcept = function(geoJSONDocs) {
		return new Promise(function(resolve, reject) {
			model.insertBulk(geoJSONDocs).then(function(result) {
				resolve();
			}, function(err) {
				return reject(err);
			})
		})
	}


	//control flow
	request(url, {json: true}, function(error, response, body) {
		if (!error && response.statusCode === 200) {

			//delete all
			deleteAllPeople().then(function() {
				insertNewConcept(body).then(function() {
					res.json({inserted: true});
				}, function(err) {
					res.json(err);
				})
			}, function(err) {
				res.json(err);
			})

		} else {
			res.json(error);
		}
	});

});

router.get('/peopleNearLocation/:latitude/:longitude/:radius', function(req, res, next) {
	var latitude = req.params.latitude;
	var longitude = req.params.longitude;
	var radius = req.params.radius;

	var runPeopleNearLocationQuery = function(lat, lng, radius, people, bookmark, callback) {
		setTimeout(function() {
			//formulate cloudant geo parameters
			var parameters = {
				lat: lat,
				lon: lng,
				radius: radius,
				include_docs: true,
				limit: 200
			}

			if (bookmark !== "") {
				parameters.bookmark = bookmark;
			}
			
			model.initialise("demo_people_locations");
			// console.log(parameters);
			model.geo("demo_people_locations", "people", parameters).then(function(result) {

				if (result.rows.length === 0 ) {
					//finished
					console.log("finished");
					return callback(null, people);
				}
				people = people.concat(result.rows);
				runPeopleNearLocationQuery(lat, lng, radius, people, result.bookmark, callback)

			}, function(err) {
				callback(err);
			})
		}, 0);
	}

	runPeopleNearLocationQuery(latitude, longitude, radius, [], "", function(err, result) {
		if (err) {
			return res.json(err);
		} else {
			res.json(result);
		}
	})
})

module.exports = router;