// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
class InMemoryGeoTagStore{

    #geotag_array = [];

    addGeoTag = (geotag) => this.#geotag_array.push(geotag);

    removeGeoTag(name){
        this.#geotag_array = this.#geotag_array.filter(tag => {
            return tag.name !== name; 
        });
    };


    // OLD
    /*getNearbyGeoTags(location,radius){
        const radiusSq = radius * radius;

        return this.#geotag_array.filter(tag => {

            const lat1 = parseFloat(location.latitude);
            const lon1 = parseFloat(location.longitude);
            const lat2 = parseFloat(tag.latitude);
            const lon2 = parseFloat(tag.longitude);

            const dLat = lat1 - lat2;
            const dLon = lon1 - lon2;

            const distanceSq = (dLat * dLat) + (dLon * dLon);

            return distanceSq <= radiusSq;
        });
    };*/


    getNearbyGeoTags(location, radius) {
        return this.#geotag_array.filter(tag => {
            const lat1 = parseFloat(location.latitude);
            const lon1 = parseFloat(location.longitude);
            const lat2 = parseFloat(tag.latitude);
            const lon2 = parseFloat(tag.longitude);

            const distanceKm = this.getDistanceKm(lat1, lon1, lat2, lon2);
            return distanceKm <= radius;
        });
    }

    getDistanceKm(lat1, lon1, lat2, lon2) {
        const toRad = deg => deg * Math.PI / 180;
        const R = 6371; // Erdradius in km

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    searchNearbyGeoTags(keyword, location, radius){
        let nearbyTags = this.getNearbyGeoTags(location, radius);
        const lowerKeyword = keyword.toLowerCase();

        return nearbyTags.filter(tag =>{
            return tag.name.toLowerCase().includes(lowerKeyword) || 
                    tag.hashtag.toLowerCase().includes(lowerKeyword);
        })
    };



}

module.exports = InMemoryGeoTagStore
