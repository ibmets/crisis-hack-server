// Common CRUD operations to the database
var storage = require('../storage/cloudant.js');
var modelName;

var initialise = function(mname) {
	modelName = mname;
	storage.useDatabase(mname);
}

var getAll = function() {
	return new Promise(function(resolve, reject) {
		storage.get(modelName, 'all').then(function(data) {
			var removeCloudantInfo = [];
		    for (var i=0; i<data.length; i++) {
		      removeCloudantInfo.push(data[i].doc);
		    }
		    resolve(removeCloudantInfo);
		  
		}, function(err) {
			return reject(err);
		});
	});
}

var getById = function(id) {
	return new Promise(function(resolve, reject) {
		storage.getById(id).then(function(data) {
			resolve(data);
		}, function(err) {
			reject(err);
		})
	});
}

var getByQuery = function(query) {
	return new Promise(function(resolve, reject) {
		storage.getByQuery(query).then(function(data) {
			resolve(data);
		}, function(err) {
			reject(err);
		})
	});
}

var geo = function(design_doc_name, index_name, parameters) {
	return new Promise(function(resolve, reject) {
		storage.geo(design_doc_name, index_name, parameters).then(function(data) {
			resolve(data);
		}, function(err) {
			reject(err);
		})
	});
}

var insertDocument = function(doc) {
	return new Promise(function(resolve, reject) {
		storage.insert(doc).then(function(data) {
			resolve(data);
		}, function(err) {
			reject(err);
		})
	});
}

var insertBulk = function(docs) {
	return new Promise(function(resolve, reject) {
		storage.insertBulk(docs).then(function(data) {
			resolve(data);
		}, function(err) {
			reject(err);
		});
	});
}

var deleteDocument = function(id) {
	return new Promise(function(resolve, reject) {
		//Find out revision of this document
		storage.getById(id).then(function(data) {
		    var rev = data._rev;
		    // return storage.deleteDocument(id,rev);
		    storage.deleteDocument(id, rev).then(function(data) {
		    	resolve(data);
		    }, function(err) {
		    	reject(err)
		    })
		  
		}, function(err) {
			return reject(err);
		});
	});
}

var updateDocument = function(id, doc) {
	return new Promise(function(resolve, reject) {
		storage.getById(id).then(function(data) {
		  var rev = data._rev;
		  doc._id = id;
		  doc._rev = rev;
		  storage.updateDocument(id, doc).then(function(data) {
		  	resolve(data);
		  }, function(err) {
		  	reject(err);
		  })
		}, function(err) {
			return reject(err);
		})
	});
}

var resetYelp = function() {
	return new Promise(function(resolve, reject) {
		// yelp_venues table - find all, delete all
		var yelp_venues = function() {
			return new Promise(function(resolve, reject) {
				initialise('yelp_venues');
				getAll().then(function(data) {
					for (var i=0; i<data.length; i++) {
						data[i]._deleted = true;
					}
					insertBulk(data).then(function() {
						resolve();
					}, function(err) {
						return reject(err);
					})
					
				}, function(err) {
					return reject(err);
				});
			});
		}

		// Control flow
		yelp_venues()
			.then(function() {
				resolve();
			}, function(err) {
				return reject(err);
			});

	});
}

var resetOurVenuesGeoJSON = function() {
	return new Promise(function(resolve, reject) {
		// yelp_venues table - find all, delete all
		var unique_venues_geojson = function() {
			return new Promise(function(resolve, reject) {
				initialise('our_unique_venues_geojson');
				getAll().then(function(data) {
					for (var i=0; i<data.length; i++) {
						data[i]._deleted = true;
					}
					insertBulk(data).then(function() {
						resolve();
					}, function(err) {
						return reject(err);
					})
					
				}, function(err) {
					return reject(err);
				});
			});
		}

		// Control flow
		unique_venues_geojson()
			.then(function() {
				resolve();
			}, function(err) {
				return reject(err);
			});

	});
}

var resetPRSVenuesGeoJSON = function() {
	return new Promise(function(resolve, reject) {
		// yelp_venues table - find all, delete all
		var prs_venues_geojson = function() {
			return new Promise(function(resolve, reject) {
				initialise('prs_venues_geojson');
				getAll().then(function(data) {
					for (var i=0; i<data.length; i++) {
						data[i]._deleted = true;
					}
					insertBulk(data).then(function() {
						resolve();
					}, function(err) {
						return reject(err);
					})
					
				}, function(err) {
					return reject(err);
				});
			});
		}

		// Control flow
		prs_venues_geojson()
			.then(function() {
				resolve();
			}, function(err) {
				return reject(err);
			});

	});
}

var resetTweets = function() {
	return new Promise(function(resolve, reject) {

		// twitter_fs_checkins table - find all, delete all
		var twitter_fs_checkins = function() {
			return new Promise(function(resolve, reject) {
				initialise('twitter_fs_checkins');
				getAll().then(function(data) {
					for (var i=0; i<data.length; i++) {
						data[i]._deleted = true;
					}
					insertBulk(data).then(function() {
						resolve();
					}, function(err) {
						return reject(err);
					})
					
				}, function(err) {
					return reject(err);
				});
			});
		}

		// twitter_relevant_tweets table - find all, delete all
		var twitter_relevant_tweets = function() {
			return new Promise(function(resolve, reject) {
				initialise('twitter_relevant_tweets');
				getAll().then(function(data) {
					for (var i=0; i<data.length; i++) {
						data[i]._deleted = true;				
					}
					insertBulk(data).then(function() {
						resolve();
					}, function(err) {
						return reject(err);
					});
					
				}, function(err) {
					return reject(err);
				});
			});
		}

		// twitter_relevant_tweets_and_checkins_queries table - find all, delete all
		var twitter_relevant_tweets_and_checkins_queries = function() {
			return new Promise(function(resolve, reject) {
				initialise('twitter_relevant_tweets_and_checkins_queries');
				getAll().then(function(data) {
					for (var i=0; i<data.length; i++) {
						data[i]._deleted = true;				
					}
					insertBulk(data).then(function() {
						resolve();
					}, function(err) {
						return reject(err);
					});
					
				}, function(err) {
					return reject(err);
				});
			});
		}


		// Control flow
		twitter_fs_checkins()
			.then(function() {
				return twitter_relevant_tweets();
			}, function(err) {
				return reject(err);
			})

			.then(function() {
				return twitter_relevant_tweets_and_checkins_queries();
			}, function(err) {
				return reject(err);
			})

			.then(function() {
				resolve();
			}, function(err) {
				return reject(err);
			});

	});
}

var resetDatabase = function() {
	return new Promise(function(resolve, reject) {

		// fs_venues table - find all, delete all
		var venues = function() {
			return new Promise(function(resolve, reject) {
				initialise('fs_venues');
				getAll().then(function(data) {
					for (var i=0; i<data.length; i++) {
						data[i]._deleted = true;
					}
					insertBulk(data).then(function() {
						resolve();
					}, function(err) {
						return reject(err);
					})
					
				}, function(err) {
					return reject(err);
				});
			});
		}

		// fs_venue_queries table - find all, delete all
		var venueQueries = function() {
			return new Promise(function(resolve, reject) {
				initialise('fs_venue_queries');
				getAll().then(function(data) {
					for (var i=0; i<data.length; i++) {
						data[i]._deleted = true;				
					}
					insertBulk(data).then(function() {
						resolve();
					}, function(err) {
						return reject(err);
					});
					
				}, function(err) {
					return reject(err);
				});
			});
		}


		// Control flow
		venues()
			.then(function() {
				return venueQueries();
			}, function(err) {
				return reject(err);
			})

			.then(function() {
				resolve();
			}, function(err) {
				return reject(err);
			});

	});
}

module.exports = {
	initialise: initialise,
	getAll: getAll,
	getById: getById,
	getByQuery: getByQuery,
	geo: geo,
	insertDocument: insertDocument,
	insertBulk: insertBulk,
	deleteDocument: deleteDocument,
	updateDocument: updateDocument,
	resetDatabase: resetDatabase,
	resetTweets: resetTweets,
	resetYelp: resetYelp,
	resetOurVenuesGeoJSON: resetOurVenuesGeoJSON,
	resetPRSVenuesGeoJSON: resetPRSVenuesGeoJSON
}
