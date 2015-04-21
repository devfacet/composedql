/*
 * ComposedQL
 * Copyright (c) 2015 Fatih Cetinkaya (http://github.com/cmfatih/composedql)
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

/* jslint node: true */
'use strict';

// Init the module
exports = module.exports = (function() {

  // NOTE: Performance definitely matters
  //       Always check JSPERF
  //       Try to avoid REGEX
  //       Simple loops are highly optimized by JS engines

  // Here we go...

  // Parses given composed query
  var parse = function parse(query, options) {

    // Options
    if(!options || typeof options !== 'object') {
      options = {throwError: true};
    }
    // Check query
    if(typeof query !== 'string') {
      return parseError('invalid query', options);
    }
    query = query.trim();

    // Return an array (sorting!) or falsy if there is no field
    var fields = [];

    // Commas are separators for fields
    if(query.indexOf('(') === -1) {
      // But commas between parentheses are specific to their resources
      // So no parentheses then no resource, just split by comma
      var fieldsNames = query.split(',');
      for(var k = 0, klen = fieldsNames.length; k < klen; k++) {
        if(fieldsNames[k]) {
          fields.push(parseField(fieldsNames[k], null, options));
        }
      }
    } else {

      // Parentheses are separators for resource contexts so need to split

      // Split fields by comma
      var fieldChars    = [],
          resFieldChars = [],
          parCnt        = 0;

      for(var i = 0, len = query.length; i < len; i++) {

        // Count parentheses for determining resource contexts
        var parOFound = false,
            parCFound = false;

        if(query[i] === '(') {        // Resource context begin
          parCnt++;
          parOFound = true;
        } else if(query[i] === ')') { // Resource context end
          parCnt--;
          parCFound = true;
        }

        // Anything between parentheses is belong to resource field context
        if(parCnt > 0) {
          // If current char is neither a opening or closing parentheses then it is part of a field
          if(parOFound === false && parCFound === false) {
            resFieldChars.push(query[i]);
          }
        }

        // Out of parentheses scope then it is a normal field
        if(parCnt === 0) {

          // If current char is neither a comma or a closing parentheses then it is part of field
          if(query[i] !== ',' && parCFound === false) {
            fieldChars.push(query[i]);
          }

          // Push current field since comma starts a new field OR end of loop
          if(query[i] === ',' || (i+1) === len) {
            fields.push(parseField(fieldChars.join(''), resFieldChars.join(''), options));
            resFieldChars = []; // Clear resource field chars
            fieldChars    = []; // Clear field chars
          }
        }
      }

      // Check missing/extra parentheses
      if(parCnt !== 0) {
        return parseError('invalid parentheses', options);
      } else if(fieldChars.length) {
        return parseError('parse could not be completed', options);
      }
    }

    // No fields then return falsy
    if(!fields.length) {
      return null;
    }

    return fields;
  };

  // Parses given field
  var parseField = function parseField(field, context, options) {

    // Options
    if(!options || typeof options !== 'object') {
      options = {throwError: true};
    }
    // Check field
    if(typeof field !== 'string') {
      return parseError('invalid field', options);
    } else if(context && typeof context !== 'string') {
      return parseError('invalid context', options);
    }
    field = field.trim();

    // Return an array (sorting!) or falsy
    var result;

    // Dots are accessors for accessing object properties
    var fieldProps = field.split('.'),
        propField  = fieldProps.shift().trim(); // field name

    if(propField) {

      var fieldType = 'field',
          fieldPath = field,
          resFields;

      // Tildes are identifier for resources
      if(propField[0] === '~') {
        fieldType = 'resource';
        propField = propField.split('~', 2)[1];
        fieldPath = propField; // Ignore `~resource.property` and use `resource`
        // Resource field contexts are simply queries
        if(context) {
          resFields = parse(context);
        }
      }

      // Field
      result = {
        type: fieldType,
        name: propField
      };

      // Field properties
      // NOTE: It could be just `result.properties = parseField(fieldProps.join('.'));`
      //       but properties in array is preferred for future flexibility.
      if(fieldProps.length) {
        // Add path if there is property
        result.path = fieldPath;

        result.properties = [];
        for(var i = 0, len = fieldProps.length; i < len; i++) {
          result.properties.push(parseField(fieldProps[i]));
        }
      }

      // Resource fields
      if(resFields) {
        result.fields = resFields;
      }
    }

    return result;
  };

  // Handles parsing errors
  var parseError = function parseError(error, options) {
    if(!options || options.throwError === true) {
      throw new Error(error);
    }
    return false;
  };

  // Return
  return {
    parse:      parse,
    parseField: parseField,
    parseError: parseError
  };
})();