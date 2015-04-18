## ComposedQL

[![NPM][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

ComposedQL is a query language that aims URI friendly queries.

### Use Cases

- Composing data queries with efficient way
- Selecting only a subset of data
- Filtering sensitive data
- Creating authZ compatible API endpoints
- Implementing middleware caching and routing

This repository provides composed query parser and specifications.

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
[ { type: 'field', name: 'username' },
  { type: 'field',
    name: 'location',
    properties: [ { type: 'field', name: 'city' } ] },
  { type: 'field',
    name: 'settings',
    properties:
     [ { type: 'field', name: 'foo' },
       { type: 'field', name: 'bar' } ] } ]
```

```javascript
cql.parse('username,~photo(profile,cover),~activity(login.date)');
```
```javascript
[ { type: 'field', name: 'username' },
  { type: 'resource',
    name: 'photo',
    fields:
     [ { type: 'field', name: 'profile' },
       { type: 'field', name: 'cover' } ] },
  { type: 'resource',
    name: 'activity',
    fields:
     [ { type: 'field',
         name: 'login',
         properties: [ { type: 'field', name: 'date' } ] } ] } ]
```

### License

Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.

[npm-url]: http://npmjs.org/package/composedql
[npm-image]: https://badge.fury.io/js/composedql.png

[travis-url]: https://travis-ci.org/cmfatih/composedql
[travis-image]: https://travis-ci.org/cmfatih/composedql.svg?branch=master