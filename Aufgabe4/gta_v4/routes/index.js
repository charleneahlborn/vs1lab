// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');
const GeoTagExamples = require('../models/geotag-examples');

const store = new GeoTagStore();

GeoTagExamples.tagList.forEach(tagArray => {
    const neuesTag = new GeoTag(tagArray[0], tagArray[1], tagArray[2], tagArray[3]);
    store.addGeoTag(neuesTag);
});

const SEARCH_RADIUS_KM = 50;

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

// TODO: extend the following route example if necessary
router.get('/', (req, res) => {
    res.render('index', {
        taglist: [],
        lat: "",
        lon: ""
    });
}   );

/**
 * Route '/tagging' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the tagging form in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Based on the form data, a new geotag is created and stored.
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the new geotag.
 * To this end, "GeoTagStore" provides a method to search geotags 
 * by radius around a given location.
 */

router.post('/tagging', (req, res) => {

    const lat = req.body.latitude;
    const lon = req.body.longitude;
    const name = req.body.name;
    const hashtag = req.body.hashtag;

    const newTag = new GeoTag(name, lat, lon, hashtag);
    store.addGeoTag(newTag);

    const location = { latitude: lat, longitude: lon };
    const nearbyTags = store.getNearbyGeoTags(location, SEARCH_RADIUS_KM);

    res.render('index', { 
        taglist: nearbyTags, 
        lat: lat, 
        lon: lon 
    });
});

/**
 * Route '/discovery' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the discovery form in the body.
 * This includes coordinates and an optional search term.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the given coordinates.
 * If a search term is given, the results are further filtered to contain 
 * the term as a part of their names or hashtags. 
 * To this end, "GeoTagStore" provides methods to search geotags 
 * by radius and keyword.
 */

router.post('/discovery', (req, res) => {

    const lat = req.body.latitude;
    const lon = req.body.longitude;
    const searchterm = req.body.searchterm;

    const location = { latitude: lat, longitude: lon };
    let nearbyTags = [];

    if (searchterm) {

        nearbyTags = store.searchNearbyGeoTags(searchterm, location, SEARCH_RADIUS_KM);
    } else {

        nearbyTags = store.getNearbyGeoTags(location, SEARCH_RADIUS_KM);
    }

    res.render('index', { 
        taglist: nearbyTags, 
        lat: lat, 
        lon: lon 
    });
});




// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */
router.get('/api/geotags', (req, res) => {
    const lat = req.query.latitude;
    const lon = req.query.longitude;
    const searchterm = req.query.searchterm;
    

    const page = parseInt(req.query.page) || 1;   
    const limit = parseInt(req.query.limit) || 5; 

    let tags = [];

    if (lat && lon) {
        const location = { latitude: lat, longitude: lon };
        if (searchterm) {
            tags = store.searchNearbyGeoTags(searchterm, location, SEARCH_RADIUS_KM);
        } else {
            tags = store.getNearbyGeoTags(location, SEARCH_RADIUS_KM);
        }
    } else {
        tags = store.getAllGeoTags(); 
    }
    const totalCount = tags.length; 

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTags = tags.slice(startIndex, endIndex);

    res.json({
        tags: paginatedTags,
        totalCount: totalCount
    });
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

router.post('/api/geotags', (req, res) => {
    const name = req.body.name;
    const lat = req.body.latitude;
    const lon = req.body.longitude;
    const hashtag = req.body.hashtag;

    const newTag = new GeoTag(name, lat, lon, hashtag);
    store.addGeoTag(newTag); 

    const newId = newTag.id; 

    res.location(`/api/geotags/${newId}`);
    res.status(201).json(newTag);
});


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get('/api/geotags/:id', (req, res) => {
    const id = req.params.id;
    
    // HINWEIS: Diese Funktion musst du in deinem Store implementieren!
    const tag = store.getGeoTagById(id); 

    if (tag) {
        res.json(tag);
    } else {
        // Wenn die ID nicht existiert, senden wir einen 404 Fehler
        res.status(404).json({ message: "GeoTag nicht gefunden" });
    }
});


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

// TODO: ... your code here ...
router.put('/api/geotags/:id', (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    
    const updatedTag = store.updateGeoTag(id, updatedData);

    if (updatedTag) {
        res.json(updatedTag);
    } else {
        res.status(404).json({ message: "GeoTag nicht gefunden" });
    }
});

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */
router.delete('/api/geotags/:id', (req, res) => {
    const id = req.params.id;
    
    const deletedTag = store.removeGeoTag(id);

    if (deletedTag) {
        res.json(deletedTag);
    } else {
        res.status(404).json({ message: "GeoTag nicht gefunden" });
    }
});

module.exports = router;
