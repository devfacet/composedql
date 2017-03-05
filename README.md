# ComposedQL

[![NPM][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

ComposedQL is a query language that aims URI friendly queries for RESTful APIs.

## Use Cases

- Composing data queries with efficient way
- Selecting only a subset of data
- Filtering sensitive information
- Creating authZ compatible API endpoints
- Improving caching and routing

## Design Goals

- URI friendly queries
- High performance query parsing
- Exchangeable and human readable/writable structure

## Specification

(*work in progress*)

- Fields represent object properties, resources or functions.
  - Examples:
    - `foo` - field
    - `~foo` - resource
    - `foo()` - function
- Commas are separators for fields or function arguments
  - Examples;
    - `foo,bar` - fields
    - `~foo(bar,baz)` - resource fields
    - `foo(bar,baz)` - function arguments
- Dots are accessors for accessing nested fields or field functions
  - Examples;
    - `foo.bar` - nested field
    - `~foo(bar.baz)` - nested resource field
    - `foo.bar()` - field function
    - `foo(bar).baz(qux)` - function chain
    - `~foo(bar).baz(qux)` - resource field chain

## Notes

This repository provides composed query language parser and specifications.

## Installation

```bash
npm install composedql
```

## Usage

```javascript
var cql = require('composedql');
```

### parse

Parses given composed query

```javascript
cql.parse('user,location.city');
```
```javascript
[ { name: 'user',
    type: 'field',
    source: 'user' },
  { name: 'location',
    type: 'field',
    source: 'location.city',
    properties: [ { name: 'city', type: 'property' } ] } ]
```

```javascript
cql.parse('user,~photo(profile,cover),~post(id,text).from(today)');
```
```javascript
[ { name: 'user',
    type: 'field',
    source: 'user' },
  { name: 'photo',
    type: 'resource',
    source: '~photo(profile,cover)',
    fields:
     [ { name: 'profile',
         type: 'field',
         source: 'profile' },
       { name: 'cover',
         type: 'field',
         source: 'cover' } ] },
  { name: 'post',
    type: 'resource',
    source: '~post(id,text).from(today)',
    fields:
     [ { name: 'id',
         type: 'field',
         source: 'id' },
       { name: 'text',
         type: 'field',
         source: 'text' } ],
    properties:
     [ { name: 'from',
         type: 'function',
         args:
          [ { name: 'today',
              type: 'arg',
              source: 'today' } ] } ] } ]
```

## License

Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.

[npm-url]: http://npmjs.org/package/composedql
[npm-image]: https://badge.fury.io/js/composedql.svg

[travis-url]: https://travis-ci.org/devfacet/composedql
[travis-image]: https://travis-ci.org/devfacet/composedql.svg?branch=master
