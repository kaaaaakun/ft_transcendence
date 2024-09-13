/**
 * Tournament API
 * トーナメント、試合、プレイヤーの管理用API。
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: support@example.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */

import ApiClient from '../ApiClient';
import MatchStatusPlayersInner from './MatchStatusPlayersInner';

/**
 * The MatchStatus model module.
 * @module model/MatchStatus
 * @version 1.0.0
 */
class MatchStatus {
    /**
     * Constructs a new <code>MatchStatus</code>.
     * @alias module:model/MatchStatus
     * @param players {Array.<module:model/MatchStatusPlayersInner>} 
     * @param endMatch {Boolean} 
     */
    constructor(players, endMatch) { 
        
        MatchStatus.initialize(this, players, endMatch);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, players, endMatch) { 
        obj['players'] = players;
        obj['end_match'] = endMatch;
    }

    /**
     * Constructs a <code>MatchStatus</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/MatchStatus} obj Optional instance to populate.
     * @return {module:model/MatchStatus} The populated <code>MatchStatus</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new MatchStatus();

            if (data.hasOwnProperty('players')) {
                obj['players'] = ApiClient.convertToType(data['players'], [MatchStatusPlayersInner]);
            }
            if (data.hasOwnProperty('end_match')) {
                obj['end_match'] = ApiClient.convertToType(data['end_match'], 'Boolean');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>MatchStatus</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>MatchStatus</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of MatchStatus.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }
        if (data['players']) { // data not null
            // ensure the json data is an array
            if (!Array.isArray(data['players'])) {
                throw new Error("Expected the field `players` to be an array in the JSON data but got " + data['players']);
            }
            // validate the optional field `players` (array)
            for (const item of data['players']) {
                MatchStatusPlayersInner.validateJSON(item);
            };
        }

        return true;
    }


}

MatchStatus.RequiredProperties = ["players", "end_match"];

/**
 * @member {Array.<module:model/MatchStatusPlayersInner>} players
 */
MatchStatus.prototype['players'] = undefined;

/**
 * @member {Boolean} end_match
 */
MatchStatus.prototype['end_match'] = undefined;






export default MatchStatus;

