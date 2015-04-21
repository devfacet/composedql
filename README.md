## ComposedQL

[![NPM][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

ComposedQL is a query language that aims URI friendly queries.

### Use Cases

- Composing data queries with efficient way
- Selecting only a subset of data
- Filtering sensitive data
- Creating authZ compatible API endpoints
- Implementing middleware caching and routing

### Goals

- URI friendly queries
- High performance query parsing
- Exchangeable and human readable/writable

### Specification
(*work in progress*)

- Commas are separators for fields
- Fields represent object properties
- Dots are accessors for accessing object properties
- Tildes are identifier for resources
- Resources point different data structures
- Parentheses are wrapper for resource contexts
- Resource contexts contain fields for their resources

### Notes

This repository provides composed query language parser and specifications.

### Installation

```
npm install composedql
```

### Usage

```javascript
var cql = require('composedql');
```

#### parse

Parses given composed query

```javascript
cql.parse('username,location.city,settings.foo.bar');
```
```javascript
[ { type: 'field',
    name: 'username',
    path: 'username' },
  { type: 'field',
    name: 'location',
    path: 'location.city',
    properties:
     [ { type: 'field',
         name: 'city',
         path: 'city' } ] },
  { type: 'field',
    name: 'settings',
    path: 'settings.foo.bar',
    properties:
     [ { type: 'field',
         name: 'foo',
         path: 'foo' },
       { type: 'field',
         name: 'bar',
         path: 'bar' } ] } ]
```

```javascript
cql.parse('username,~photo(profile,cover),~activity(login.date)');
```
```javascript
[ { type: 'field',
    name: 'username',
    path: 'username' },
  { type: 'resource',
    name: 'photo',
    fields:
     [ { type: 'field',
         name: 'profile',
         path: 'profile' },
       { type: 'field',
         name: 'cover',
         path: 'cover' } ] },
  { type: 'resource',
    name: 'activity',
    fields:
     [ { type: 'field',
         name: 'login',
         path: 'login.date',
         properties:
          [ { type: 'field',
              name: 'date',
              path: 'date' } ] } ] } ]
```

### License

Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.

[npm-url]: http://npmjs.org/package/composedql
[npm-image]: https://badge.fury.io/js/composedql.png

[travis-url]: https://travis-ci.org/cmfatih/composedql
[travis-image]: https://travis-ci.org/cmfatih/composedql.svg?branch=master