var extend = require('node.extend'),
    debug = require('debug')('polyfill:wrap');

var polyfillsWrappers = require('./wrappers');

/**
 * Wraps code with conditional expression
 *
 * @param {string} code
 * @param {string} polyfillName
 * @returns {string}
 */
function wrapDefault(code, polyfillName) {
    debug('wrapping code of `%s` using default wrapper', polyfillName);
    var parts = polyfillName.split('.'),
        expression = 'true';

    if (parts.length === 1) {
        // Promise
        // typeof Promise === "undefined"
        expression = 'typeof ' + parts[0] + ' === "undefined"';
    } else if (parts.length === 2) {
        // Object.keys
        // typeof Object === "undefined" || Object && !Object.keys
        expression = 'typeof ' + parts[0] + ' === "undefined" || ' + parts[0] + ' && !' + parts[0] + '.' + parts[1];
    } else if (parts[0] === 'Window' && parts[1] === 'prototype' && parts[2]) {
        // Window.prototype.JSON
        expression = 'typeof window.' + parts[2] + ' === "undefined"';
    } else {
        // Array.prototype.map
        // !Array.prototype.map
        expression = '!' + polyfillName;
    }

    debug('got `%s` condition expression for `%s`', expression, polyfillName);
    return 'if (' + expression + ') {\n' + code + '\n}\n';
}

/**
 * Wraps code with conditional expression
 *
 * @param {string} code
 * @param {string} polyfillName
 * @returns {string}
 */
function wrap(code, polyfillName) {
    var wrapper = polyfillsWrappers[polyfillName];
    if (typeof wrapper !== 'object') {
        return wrapDefault(code, polyfillName);
    }

    return wrapper.before + code + wrapper.after;
}

/**
 *
 * @param {Object} wrappers
 *
 * @example
 *
 * .addWrapper({
 *      'Promise': {
 *          'before': 'if (!window.Promise) {',
 *          'after': '}'
 *      }
 * });
 */
function addWrapper(wrappers) {
    extend(polyfillsWrappers, wrappers);
}

module.exports = wrap;
module.exports.addWrapper = addWrapper;
