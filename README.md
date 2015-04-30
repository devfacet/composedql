## ComposedQL

[![NPM][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

ComposedQL is a query language that aims URI friendly queries for RESTful APIs.

### Use Cases

- Composing data queries with efficient way
- Selecting only a subset of data
- Filtering sensitive information
- Creating authZ compatible API endpoints
- Improving caching and routing

### Goals

- URI friendly queries
- High performance query parsing
- Exchangeable and human readable/writable structure

### Specification
(*work in progress*)

- Fields represent object properties, resources or functions
  - examples: `foo` (field), `~foo` (resource), `foo()` (function)
- Commas are separators for fields or function arguments
  - examples; `foo,bar` (fields), `~foo(bar,baz)` (resource fields), `foo(bar,baz)` (function arguments)
- Dots are accessors for accessing nested fields or field functions
  - examples; `foo.bar` (nested field), `~foo(bar.baz)` (nested resource field), `foo.bar()` (field function)

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
[ { name: 'username',
    type: 'field',
    source: 'username' },
  { name: 'location',
    type: 'field',
    source: 'location.city',
    properties: [ { name: 'city', type: 'property' } ] },
  { name: 'settings',
    type: 'field',
    source: 'settings.foo.bar',
    properties:
     [ { name: 'foo', type: 'property' },
       { name: 'bar', type: 'property' } ] } ]
```

```javascript
cql.parse('username,~photo(profile,cover),~activity(login.date)');
```
```javascript
[ { name: 'username',
    type: 'field',
    source: 'username' },
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
  { name: 'activity',
    type: 'resource',
    source: '~activity(login.date)',
    fields:
     [ { name: 'login',
         type: 'field',
         source: 'login.date',
         properties: [ { name: 'date', type: 'property' } ] } ] } ]
```

```javascript
cql.parse('username.id(foo),comments.from(today)');
```
```javascript
[ { name: 'username',
    type: 'field',
    source: 'username.id(foo)',
    properties:
     [ { name: 'id',
         type: 'function',
         args:
          [ { name: 'foo',
              type: 'arg',
              source: 'foo' } ] } ] },
  { name: 'comments',
    type: 'field',
    source: 'comments.from(today)',
    properties:
     [ { name: 'from',
         type: 'function',
         args:
          [ { name: 'today',
              type: 'arg',
              source: 'today' } ] } ] } ]
```

### License

Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.

[npm-url]: http://npmjs.org/package/composedql
[npm-image]: https://badge.fury.io/js/composedql.png

[travis-url]: https://travis-ci.org/cmfatih/composedql
[travis-image]: https://travis-ci.org/cmfatih/composedql.svg?branch=master