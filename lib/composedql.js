/*
 * ComposedQL
 * Copyright (c) 2015 Fatih Cetinkaya (http://github.com/cmfatih/composedql)
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

/* jslint node: true */
'use strict';

// Init the module
exports = module.exports = (function() {

  // Parses given composed query
  var parse = function parse(input) {

    // No support for non-string inputs (yet)
    if(typeof input !== 'string') {
      throw new Error('Invalid input');
    }

    // Return an array (sorting!) for better AST or falsy if there is no field
    var result = [];

    // Commas are separators for fields
    var fields    = input.trim().split(','),
        fieldsLen = fields.length;

    if(!fieldsLen) {
      return null;
    }

    // Check each field for advanced queries
    for(var i = 0; i < fieldsLen; i++) {

      // Fields should contain some value
      var curField = fields[i].trim();
      if(!curField) {
        continue;
      }

      // Dots are accessors for accessing object properties
      var dotPos = curField.indexOf('.');
      if(dotPos === -1) {
        // No dot then no accessors
        result.push({
          type: 'field',
          name: curField
        });
      } else {

        // A dot before a parentheses means simple property accessing
        var parPos = curField.indexOf('(');
        if(parPos === -1 || dotPos < parPos) {
          var curFieldProps = curField.split('.'),
              curPropField  = curFieldProps.shift().trim();
          if(curPropField) {
            result.push({
              type:      'field',
              name:       curPropField,
              properties: parse(curFieldProps.join('.'))
            });
          }
        }
      }
    }

    if(!result.length) {
      result = null;
    }

    return result;
  };

  // Return
  return {
    parse: parse
  };
})();