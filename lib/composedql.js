/*
 * ComposedQL
 * Copyright (c) 2015 Fatih Cetinkaya (http://github.com/cmfatih/composedql)
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

/* jslint node: true */
'use strict';

// Init the module
exports = module.exports = (function() {

  // NOTE: Performance definitely matters. Always check JSPERF and try to avoid REGEX.
  //       Simple loops are highly optimized by JS engines

  // Here we go...

  // Parses given composed query
  var parse = function parse(query, options) {

    if(!options || typeof options !== 'object') {
      options = {throwError: true};
    }

    if(typeof query !== 'string') {
      return parseError('invalid query', options);
    }

    query = query.trim();

    // Return an array (sorting!) or falsy if there is no field
    var fields = [];

    // If there is no parentheses then no scope
    if(query.indexOf('(') === -1) {
      // Commas are separators for fields so just split by comma
      var fieldsNames = query.split(',');
      for(var k = 0, klen = fieldsNames.length; k < klen; k++) {
        if(fieldsNames[k]) {
          // Only non-empty fields
          fields.push(parseField(fieldsNames[k]));
        }
      }
    } else {
      // Parentheses are wrapper for scope

      var fieldList   = [],    // field list
          fieldChars  = [],    // field characters
          currentChar = '',    // current character
          isEOL       = false, // whether end of loop or not
          parCnt      = 0;     // count parentheses for determining scope contexts

      // Determine fields
      for(var i = 0, len = query.length; i < len; i++) {

        currentChar = query[i];
        isEOL       = (i+1 === len);

        // Scope context
        if(currentChar === '(') {
          // Scope context begin
          parCnt++;
        } else if(currentChar === ')') {
          // Scope context end
          parCnt--;
        }

        // If there is no scope and the current character is a comma then complete the current field
        if(parCnt === 0 && currentChar === ',') {
          fieldList.push({source: fieldChars.join('')});
          fieldChars = []; // cleanup field characters
          continue; // skip rest
        }

        // Add current character to field characters
        fieldChars.push(currentChar);

        // If it is end of loop then complete the current field
        if(isEOL === true) {
          fieldList.push({source: fieldChars.join('')});
          fieldChars = [];
        }
      } // Loop query

      // Cleanup
      fieldChars = [];
      parCnt     = 0;

      // Parse fields
      var scopeChars    = [],    // scope context characters
          scopeContexts = [],    // scope contexts
          scopeTrig     = false, // whether iteration in a scope or not
          parOFound     = false, // opening parentheses found
          parCFound     = false; // closing parentheses found

      for(var j = 0, lenj = fieldList.length; j < lenj; j++) {

        // Parse field
        for(var l = 0, lenl = fieldList[j].source.length; l < lenl; l++) {

          currentChar = fieldList[j].source[l];
          isEOL       = (l+1 === lenl);
          parOFound   = false;
          parCFound   = false;

          // Scope context
          if(currentChar === '(') {
            // Scope context begin
            parCnt++;
            parOFound = true;
            scopeTrig = true;
          } else if(currentChar === ')') {
            // Scope context end
            parCnt--;
            parCFound = true;
          }

          if(parCnt > 0) {
            // Anything between parentheses is belong to scope context
            // If current character is NOT an opening or closing parentheses then it is part of scope
            if(parOFound === false && parCFound === false) {
              scopeChars.push(currentChar);
            }
          } else {
            // Anything out of parentheses is belong to field
            // If current character is NOT a closing parentheses then it is part of field
            if(parCFound === false) {
              fieldChars.push(currentChar);
            }
          }

          // If current character is a closing parentheses then it is end of scope context
          if(parCFound === true) {
            // If there is a scope context
            if(scopeChars.length) {
              // Push it to scope contexts list
              scopeContexts.push(scopeChars.join(''));
              scopeChars = []; // cleanup scope characters
            }
          }

          // Complete current field since it is end of loop
          if(isEOL) {

            var pField = parseField(fieldChars.join('')),
                pFieldLastProp, // last field property
                pFieldArgsObj;  // field object for arguments

            // Set source
            pField.source = fieldList[j].source;

            // If there is a scope then
            if(scopeTrig) {

              // If the field has no property then
              if(!pField.properties) {
                // If the field is standard field then it is a function
                if(pField.type === 'field') {
                  pField.type   = 'function';
                  pFieldArgsObj = pField;
                } else if(pField.type === 'resource') {
                  // If the field is a resource field then scope context represents fields
                  pField.fields = parse(scopeContexts.join(), options);
                }
              }

              // If the field has a scope with property then last property is a function
              if(pField.properties) {
                pFieldLastProp      = pField.properties[pField.properties.length-1];
                pFieldLastProp.type = 'function';
                pFieldArgsObj       = pFieldLastProp;
              }

              // Scope context represents function arguments if the field is a function
              if(scopeContexts.length && pFieldArgsObj) {
                pFieldArgsObj.args = parse(scopeContexts.join(), options);
                if(pFieldArgsObj.args.length) {
                  for(var m = 0, lenm = pFieldArgsObj.args.length; m < lenm; m++) {
                    pFieldArgsObj.args[m].type = 'arg';
                  }
                }
              }
            }

            // Cleanup
            fieldChars    = [];
            scopeChars    = [];
            scopeContexts = [];
            scopeTrig     = false;
            fields.push(pField);
          }
        } // Loop fieldList[j].source
      } // Loop fieldList

      if(parCnt !== 0) { // Check missing/extra parentheses
        return parseError('invalid parentheses', options);
      } else if(fieldChars.length) { // Check field processed
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
  var parseField = function parseField(field, type) {

    if(typeof field !== 'string') {
      return;
    } else if(type && typeof type !== 'string') {
      return;
    }

    field = field.trim();

    // Return an array (sorting!) or falsy
    var result;

    // Dots are accessors for accessing object properties
    var fieldProps    = field.split('.'),          // field properties
        propField     = fieldProps.shift().trim(), // field name
        fieldPropsLen = fieldProps.length;

    if(propField) {
      // Initials
      result = {
        name: propField,
        type: type || 'field'
      };
      if(result.type === 'field') {
        result.source = field;
      }

      // Tildes are identifier for resources
      if(propField[0] === '~') {
        result.type = 'resource';
        result.name = propField.split('~', 2)[1];
      }

      // Field properties
      if(fieldPropsLen) {
        result.properties = [];
        for(var i = 0, len = fieldPropsLen; i < len; i++) {
          result.properties.push(parseField(fieldProps[i], 'property'));
        }
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