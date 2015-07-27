/*
 * ComposedQL
 * Copyright (c) 2015 Fatih Cetinkaya (http://github.com/cmfatih/composedql)
 * For the full copyright and license information, please view the LICENSE.txt file.
 */

/* jslint node: true */
'use strict';

// Init the module
module.exports = (function() {

  // NOTE: Performance definitely matters. Always check JSPERF and try to avoid REGEX.
  //       Simple loops are highly optimized by JS engines

  // Here we go...

  // Parses given composed query
  var parse = function parse(query, options) {

    if(!options || typeof options !== 'object') {
      options = {throwError: true};
    }

    if(query && typeof query !== 'string') {
      return parseError('invalid query', options);
    } else if(!query) {
      return null;
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

      // No fields then return falsy
      return (fields.length) ? fields : null;
    }

    // Determine fields
    var fieldList  = [], // field list for further processes
        fieldChars = [], // field characters for buffer
        fieldChar  = '', // field character in the iteration
        pCounter   = 0;  // parentheses counter for determining scope

    for(var i = 0, len = query.length; i < len; i++) {
      fieldChar = query[i];

      // Scope context
      // `(` begins scope context and `)` ends scope context
      if(fieldChar === '(') {
        pCounter++;
      } else if(fieldChar === ')') {
        pCounter--;
      }

      // If there is no scope and the current character is a comma then complete the current field
      if(pCounter === 0 && fieldChar === ',') {
        fieldList.push({source: fieldChars.join('')});
        fieldChars = []; // cleanup field characters
        continue; // skip rest
      }

      // Add current character to field characters
      fieldChars.push(fieldChar);

      // If it is end of loop then complete the current field
      if(i+1 === len) {
        fieldList.push({source: fieldChars.join('')});
        fieldChars = [];
      }
    } // loop query

    // Cleanup
    fieldChars = [];

    // Determine field scopes
    var fieldScopes   = [],    // field scopes
        scopeChars    = [],    // scope context characters
        scopeContexts = [],    // scope contexts
        currentChar   = '',    // current character in the loop
        nextChar      = '',    // next character in the loop
        parCnt        = 0,     // parentheses counter
        parOFound     = false, // whether opening parentheses found
        parCFound     = false, // whether closing parentheses found
        isEOL         = false; // whether end of the loop or not

    for(var j = 0, lenj = fieldList.length; j < lenj; j++) {
      for(var l = 0, lenl = fieldList[j].source.length; l < lenl; l++) {
        currentChar = fieldList[j].source[l];
        nextChar    = fieldList[j].source[l+1];
        isEOL       = (l+1 === lenl);
        parOFound   = false;
        parCFound   = false;

        // Scope context
        // `(` begins scope context and `)` ends scope context
        if(currentChar === '(') {
          parCnt++;
          parOFound = true;
        } else if(currentChar === ')') {
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

        // If it is end of loop or next character is a dot then
        if(isEOL || nextChar === '.' || currentChar === ',') {

          // If it is end of loop and a resource field then
          if(isEOL && fieldChars[0] === '~') {
            fieldScopes.push({field: fieldChars.join(''), context: scopeContexts.shift()});
            fieldChars = [];
            continue;
          }

          // If current character is a closing parentheses then it is end of field scope
          if(parCFound === true) {
            fieldScopes.push({field: fieldChars.join(''), context: scopeContexts.shift()});
            fieldChars = [];
            l++; // step next character (dot)
            continue;
          }
        }

      } // fieldList.source
      // Add scopes to field list
      if(fieldScopes.length) {
        fieldList[j].scopes = fieldScopes;
      }
      // Cleanup
      fieldChars  = [];
      fieldScopes = [];
    } // fieldList

    // Parse fields
    for(var m = 0, lenm = fieldList.length; m < lenm; m++) {

      var curField = fieldList[m];

      if(!curField.scopes) {
        // If there is no scope then simply parse it
        fieldList[m].parsed = parseField(curField.source);
      } else {
        // Otherwise process scopes
        var curFieldScope,
            curFieldScopeField,
            curFieldScopeContext,
            curFieldScopeProp,
            curFieldProps = [];

        for(var n = 0, lenn = curField.scopes.length; n < lenn; n++) {
          curFieldScope        = curField.scopes[n];
          curFieldScopeField   = parseField(curFieldScope.field);
          curFieldScopeContext = curFieldScope.context;

          // TODO: Merge following blocks

          // If the field is a resource field then
          if(curFieldScopeField.type === 'resource') {
            // If it has no property then
            if(!curFieldScopeField.properties) {
              // Scope context represents fields
              if(curFieldScopeContext) {
                curFieldScopeField.fields = parse(curFieldScopeContext, options);
              }
            } else {
              // If it has property then
              curFieldScopeProp = curFieldScopeField.properties[curFieldScopeField.properties.length-1];
              // last property is a function
              curFieldScopeProp.type = 'function';
              delete curFieldScopeProp.source;
              // If it has scope context then set arguments
              if(curFieldScopeContext) {
                curFieldScopeProp.args = parse(curFieldScopeContext, options);
                for(var p = 0, lenp = curFieldScopeProp.args.length; p < lenp; p++) {
                  curFieldScopeProp.args[p].type = 'arg';
                }
              }
            }
          }

          // If the field is a normal field then
          if(curFieldScopeField.type === 'field') {
            // If it has no property then
            if(!curFieldScopeField.properties) {
              // It is a function
              curFieldScopeField.type = 'function';
              delete curFieldScopeField.source;
              // If it has scope context then set arguments
              if(curFieldScopeContext) {
                curFieldScopeField.args = parse(curFieldScopeContext, options);
                for(var o = 0, leno = curFieldScopeField.args.length; o < leno; o++) {
                  curFieldScopeField.args[o].type = 'arg';
                }
              }
            } else {
              // If it has property then
              curFieldScopeProp = curFieldScopeField.properties[curFieldScopeField.properties.length-1];
              // last property is a function
              curFieldScopeProp.type = 'function';
              // If it has scope context then set arguments
              if(curFieldScopeContext) {
                curFieldScopeProp.args = parse(curFieldScopeContext, options);
                for(var r = 0, lenr = curFieldScopeProp.args.length; r < lenr; r++) {
                  curFieldScopeProp.args[r].type = 'arg';
                }
              }
            }
          }

          // Add it to properties
          curFieldProps.push(curFieldScopeField);
        } // curField.scopes

        // Set parsed to first field
        fieldList[m].parsed = curFieldProps.shift();
        // Set source (parseField returns source without scope)
        fieldList[m].parsed.source = fieldList[m].source;
        // Set properties
        if(curFieldProps.length) {
          if(fieldList[m].parsed.properties) {
            fieldList[m].parsed.properties = fieldList[m].parsed.properties.concat(curFieldProps);
          } else {
            fieldList[m].parsed.properties = curFieldProps;
          }
        }
      } // if curField.scopes

      fields.push(fieldList[m].parsed);
    } // fieldList

    if(parCnt !== 0) { // Check missing/extra parentheses
      return parseError('invalid parentheses', options);
    } else if(fieldChars.length) { // Check field processed
      return parseError('parse could not be completed', options);
    }

    // No fields then return falsy
    return (fields.length) ? fields : null;
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
        result.type   = 'resource';
        result.name   = propField.split('~', 2)[1];
        result.source = field;
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