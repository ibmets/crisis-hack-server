var Cloudant = require('cloudant'),
	vcapServices = require('vcap_services'),
	credentials = vcapServices.getCredentials('cloudantNoSQLDB'),
	cloudant = Cloudant({url: credentials.url}),
  	db;

var useDatabase = function(dbName) {
	db = cloudant.db.use(dbName);
}

var insertDocument = function(doc) {
	return new Promise(function(resolve, reject){
		db.insert(doc, function(err, data){
			(err) ? reject(err) : resolve(data);
		});
	});
}

var insertBulk = function(docs) {
	return new Promise(function(resolve, reject){
		db.bulk({docs: docs}, function(err, data){
			(err) ? reject(err) : resolve(data);
		});
	});
}

var get = function(designdoc, viewname) {
	return new Promise(function(resolve, reject) {
		db.view(designdoc, viewname, {include_docs: true}, function(err, body) {
			(err) ? reject(err) : resolve(body.rows);
		});
	});
}

var getByQuery = function(query) {
	return new Promise(function(resolve,reject){
		db.find({selector: query}, function(err, data) {
			(err) ? reject(err) : resolve(data);
		});
	});
}

var geo = function(design_doc_name, index_name, parameters) {
	return new Promise(function(resolve, reject) {
		db.geo(design_doc_name, index_name, parameters, function(err, data) {
			(err) ? reject(err) : resolve(data);
		});
	})
}

var getById = function(id) {
	return new Promise(function(resolve, reject) {
		db.get(id, function(err, data) {
		    (err) ? reject(err) : resolve(data);
		});
	});
}

var deleteDocument = function(id, rev) {
	return new Promise(function(resolve, reject) {
		db.destroy(id, rev, function(err, data) {
			(err) ? reject(err) : resolve(data);
		});
	});
}

var updateDocument = function(id, doc) {
	return new Promise(function(resolve, reject) {
		if (!doc.hasOwnProperty('_rev')) {
			reject({err: 'No rev parameter specified!'});
		} else {
			db.insert(doc, function(err, data) {
			  (err) ? reject(err) : resolve(data);
			});
		}
	})
}

module.exports = {
	insert: insertDocument,
	insertBulk: insertBulk,
	get: get,
	getById: getById,
	geo: geo,
	deleteDocument: deleteDocument,
	useDatabase: useDatabase,
	updateDocument: updateDocument,
	getByQuery: getByQuery
}
