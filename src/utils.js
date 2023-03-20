//If used in a browser, module don't exist and we don't need to export the functions
if (module) module.exports = {
    "lerp":lerp,
    "clamp":clamp,
    "random":random,
    "decToHex":decToHex,
    "hexToDec":hexToDec,
    "rgbToHex":rgbToHex,
    "greenRedGradient":greenRedGradient,
    "rgbGradient":rgbGradient,
    "numMap":numMap,
    "getIndexBy":getIndexBy,
    "getElementBy":getElementBy,
    "isValidNumber":isValidNumber,
    "decodeBase64ToArrayBuffer":decodeBase64ToArrayBuffer,
    "falloffCurve":falloffCurve,

    "getIndexById":getIndexById,
    "getElementById":getElementById,
    "getIndexByName":getIndexByName,
    "getElementByName":getElementByName,
    "getIndex":getIndex,
    "getElement":getElement,
};


//Utility functions =============================
/**
 * Linear interpolation function.
 * @param {Number} v0 
 * @param {Number} v1 
 * @param {Number} x 
 * @returns {Number}
 */
function lerp(v0, v1, x) {
    return (1 - x) * v0 + x * v1;
};

/**
 * Clamps a number input value between min and max
 * @version 1.0
 * @author Shyne
 * @param {number} value The value to be clamped
 * @param {number} min The minimum value
 * @param {number} max The
 * @returns {number} Output between (including) min and max;
 */
function clamp(value, min, max) {
    if (!isValidNumber(min)) min = false;
    if (!isValidNumber(max)) max = false;
    if (!isValidNumber(value)) return min;

    if (min!== false && value<min) return min;
    if (max!== false && value>max) return max;
    return value;
};

/**
 * Generates pseudo-random numbers between max and min.
 * @version 1.0
 * @author Shyne
 * @param {number} max The max value of the pseudo-random generated number.
 * @param {number} min The min value of the pseudo-random generated number.
 * @returns {number} The pseudo-random generated number.
 */
function random(max, min) {
    if (!isValidNumber(min)) min = 0;
    if (isValidNumber(max)) {
        let delta = max - min;
        return min + Math.random() * delta;
    } else return min + Math.random() * 1;
};

/**
 * Converts a number to a hex string.
 * @version 1.0
 * @author Shyne
 * @param {number} value The value to convert.
 * @param {number=} min_length The minimum length of the Hex String, defaults to 2.
 * @returns {string} The output Hex string.
 */
function decToHex(value, min_length) { 
    if (!isValidNumber(min_length)) min_length = 2;

    if (value > 255) value = 255; 
    if (value < 0) value = 0;

    let hex = Number(value).toString(16);
    while (hex.length < min_length) hex = "0" + hex;
    return hex;
};

/**
 * 
 * @author Shyne
 * @version 1.0
 * @param {string} value 
 */
function hexToDec(value) {
    let v = value.toUpperCase();

    if (v.startsWith('0x'))
        v.replace('0x','');

    const c = {"0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"A":10,"B":11,"C":12,"D":13,"E":14,"F":15};

    let acc = 0;
    for (let i = 0; i<v.length; i++)
        acc += c[v.charAt(i)] * (16**(v.length-i-1));

    return acc;
}

/**
 * Converts an RGB object to a Hex color string.
 * @version 1.0
 * @author Shyne
 * @param {number | {r:number, g:number, b:number}} r_or_rgb The red canal value or the rgb object containing all 3 canals.
 * @param {number=} g The green canal value.
 * @param {number=} b The blue canal value.
 * @returns {string} The output Hex string.
 */
function rgbToHex(/** @type object | number*/r_or_rgb,g,b) {
    if (typeof r_or_rgb == "object") {
        if (
            isValidNumber(r_or_rgb.r) 
            && isValidNumber(r_or_rgb.g) 
            && isValidNumber(r_or_rgb.b) 
            && r_or_rgb.r >= 0 
            && r_or_rgb.g >= 0 
            && r_or_rgb.b >= 0
        ) return decToHex(r_or_rgb.r)+decToHex(r_or_rgb.g)+decToHex(r_or_rgb.b);
        else return "";
    } else if (
        isValidNumber(r_or_rgb) 
        && isValidNumber(g) 
        && isValidNumber(b) 
        && r_or_rgb >= 0 
        && g >= 0 
        && b >= 0
    ) return decToHex(r_or_rgb)+decToHex(g)+decToHex(b);
    
    else return "000000";
};

/**
 * Creates an rgb green to red gradient.
 * @version 1.0
 * @author Shyne
 * @param {number} g The value at wich the output rgb will be green.
 * @param {number} r The value at wich the output rgb will be red.
 * @param {number} value The value to get the color in the gradient.
 * @returns {{r:number, g:number, b:number}} The rgb output value.
 */
function greenRedGradient(g, r, value) {
    let rgb = {"r":0,"g":0,"b":0};
    if (!isValidNumber([g, r, value])) return rgb;

    let color_ = numMap(value, g, r, 0, 510);

    if (color_ <= 255) {
        rgb.r = Math.round(color_);
        rgb.g = 255;
    } else if (color_ > 255) {
        rgb.r = 255;
        rgb.g = 255 - Math.round(color_ / 2);
    };

    if (rgb.r != Math.abs(rgb.r)) rgb.r = 0;
    if (rgb.g != Math.abs(rgb.g)) rgb.g = 0;

    return rgb;
};

/**
 * Generates a RGB gradient depending on the input range, the value, and the low and high value's rgb target
 * @version 1.0
 * @author Shyne
 * @param {number} low The minimum value.
 * @param {{r:number, g:number, b:number}} low_rgb The rgb color at the minimum value.
 * @param {number} high The maximum value.
 * @param {{r:number, g:number, b:number}} high_rgb The rgb color at the maximum value.
 * @param {number} value The value to choose from the gradient.
 * @returns {{r:number, g:number, b:number}} The rgb color at given value.
 */
function rgbGradient(low, low_rgb, high, high_rgb, value) {
    let rgb = {"r":0,"g":0,"b":0};
    if (!isValidNumber([low, low_rgb, high, high_rgb, value])) return rgb;

    value = numMap(value, low, high, 0, 1);

    let rgb_delta = {"r":low_rgb.r - high_rgb.r,"g":low_rgb.g - high_rgb.g,"b":low_rgb.b - high_rgb.b};

    Object.keys(rgb).forEach(element => {
        rgb[element] = Math.round( value * rgb_delta[element] );
    });

    return rgb;
};

/**
 * Maps the given value from the input range to the output one.
 * @version 1.0
 * @author Shyne
 * @param {number} value The value to map.
 * @param {number} in_min The minimum input value.
 * @param {number} in_max The maximum input value.
 * @param {number} out_min The minimum output value.
 * @param {number} out_max The max output value.
 * @returns {number} Output number, parsed in the output range.
 */
function numMap(value, in_min, in_max, out_min, out_max) {
    if (value < in_min) value = in_min;
    if (value > in_max) value = in_max;
    return out_min + (value - in_min) * (out_max - out_min) / (in_max - in_min);
};

/**
 * Returns the index of the first element in the given iterable object who's given [criterion] matches the given value.
 * @version 0.1
 * @author Shyne
 * @param {[any]} array The iterable object to search.
 * @param {any} value The filter value.
 * @param {string} criterion A given criterion.
 * @returns {number | undefined} The first found element's index, or -1 if nothing was found and undefined if bad arguments were provided.
 */
function getIndexBy(object, value, criterion = "") {
    if (object == undefined || typeof object != "object" || value == undefined || !["string", "object"].includes(typeof value) || typeof criterion != "string" || criterion.length <= 0) return undefined;
    if (Array.isArray(object)) {//If an array is given
        return object.findIndex((element, index) => {
            if (criterion === "" && element === value) return true;
            if (element != undefined && element[criterion] === value) return true;
            return false;
        });
    } else if (Object.keys(object).length > 0) {//If an object is given
        return Object.keys(object).findIndex((element, index) => {
            if (criterion === "" && object[element] === value) return true;
            if (object[element] != undefined && object[element][criterion] === value) return true;
            return false
        });
    } else return undefined; //If given object is not an array or a valid object, we reject it.
};

/**
 * returns the first element in the given iterable object who's given [criterion] matches the given value
 * @version 0.1
 * @author Shyne
 * @param {[any]} array The iterable object to search.
 * @param {any} value The filter value.
 * @param {string} criterion A given criterion.
 * @returns {Object | Null | undefined} the first found element, or null if nothing was found, undefined if bad arguments were provided.
 */
function getElementBy(object, value, criterion = "") {
    if (
        object == undefined 
        || typeof object != "object" 
        || value == undefined 
        || !["string", "object"].includes(typeof value) 
        || typeof criterion != "string" 
        || criterion.length <= 0
    ) return undefined;

    if (Array.isArray(object)) {//If an array is given
        return object.find((element, index) => {
            if (criterion === "" && element === value) return_ = element;
            if (element != undefined && element[criterion] === value) return_ = element;
            return false;
        });
    } 
    
    else if (Object.keys(object).length > 0) {//If an object is given
        return Object.keys(object).find((element, index) => {
            if (criterion === "" && object[element] === value) return true;
            if (object[element] != undefined && object[element][criterion] === value) return true;
            return false;
        });
    } else return undefined; //If given object is not an array or a valid object, we reject it.
};

/**
 * Checks if the given value is a valid number.
 * @version 1.0
 * @author Shyne
 * @param {any | any[] | {any:any}} num_ The value to check.
 * @returns {boolean} Wether the given value is a valid number or not.
 */
function isValidNumber(num_) {
    if (typeof num_ == "number" && num_ < Infinity && num_ > -Infinity && num_ != NaN && num_ != null) return true;
    else if (typeof num_ == "number") return false;
    else if (typeof num_ == "object" && Array.isArray("object") && num_.length >= 1) {
        let is_valid = true;
        num_.forEach(element => {
            if (isValidNumber(element) != true) is_valid = false;
        });
        return is_valid;
    }
    else if (typeof num_ == "object" && num_ != undefined && Object.keys(num_).length > 0) {
        let is_valid = true;
        Object.keys(num_).forEach(element => {
            if (isValidNumber(num_[element]) != true) is_valid = false;
        });
        return is_valid;
    }
    else return false;
};

/**
 * Decodes the base 64 audio to ArrayBuffer used by Web Audio.
 * @version 0.96
 * @author Google, Inc.
 * @param {string} base64String The base64 string to decode.
 * @returns {Buffer} The buffer containing the decoded audio.
 */
function decodeBase64ToArrayBuffer(base64String) {
    const len = (base64String.length / 4) * 3;
    const str = atob(base64String);
    const arrayBuffer = new ArrayBuffer(len);
    const bytes = new Uint8Array(arrayBuffer);
  
    for (let i = 0; i < len; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
};

function falloffCurve(x, k) {
    return Math.exp(-x * k) * (1 - x);
}


//Premade finders ===============================
function getIndexById(array_, id_) {
    if (!Array.isArray(array_)) throw new TypeError(`Object of type Array expected, got ${typeof array_}`);

    return array_.findIndex(
        (v)=>(v.id != undefined && v.id == id_)
    );
};

function getElementById(array_, id_) {
    if (!Array.isArray(array_)) throw new TypeError(`Object of type Array expected, got ${typeof array_}`);

    return array_.find(
        (v)=>(v.id != undefined && v.id == id_)
    );
};

function getIndexByName(array_, name_) {
    if (!Array.isArray(array_)) throw new TypeError(`Object of type Array expected, got ${typeof array_}`);

    return array_.findIndex(
        (v)=>(v.name != undefined && v.name == name_)
    );
};

function getElementByName(array_, name_) {
    if (!Array.isArray(array_)) throw new TypeError(`Object of type Array expected, got ${typeof array_}`);

    return array_.find(
        (v)=>(v.name != undefined && v.name == name_)
    );
};

function getIndex(array_, object_) {
    if (!Array.isArray(array_)) throw new TypeError(`Object of type Array expected, got ${typeof array_}`);

    return array_.findIndex(
        (v)=>(v != undefined && v == object_)
    );
};

function getElement(array_, object_) {
    if (!Array.isArray(array_)) throw new TypeError(`Object of type Array expected, got ${typeof array_}`);

    return array_.find(
        (v)=>(v != undefined && v == object_)
    );
};