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



    getNearbyGeoTags(location,radius){
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
    };

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
