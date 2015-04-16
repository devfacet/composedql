## ComposedQL

**!!! UNDER DEVELOPMENT !!!**

[![NPM][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

ComposedQL is a query language that aims URI friendly queries.


This module provides composed query parser and specifications.

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
var query = cql.parse('first_name,last_name,address.city,settings.foo.bar.qux');
```
```javascript
[ { type: 'field', name: 'first_name' },
  { type: 'field', name: 'last_name' },
  { type: 'field',
    name: 'address',
    properties: [ { type: 'field', name: 'city' } ] },
  { type: 'field',
    name: 'settings',
    properties:
     [ { type: 'field',
         name: 'foo',
         properties:
          [ { type: 'field',
              name: 'bar',
              properties: [ { type: 'field', name: 'qux' } ] } ] } ] } ]
```

### License

Licensed under The MIT License (MIT)  
For the full copyright and license information, please view the LICENSE.txt file.

[npm-url]: http://npmjs.org/package/composedql
[npm-image]: https://badge.fury.io/js/composedql.png

[travis-url]: https://travis-ci.org/cmfatih/composedql
[travis-image]: https://travis-ci.org/cmfatih/composedql.svg?branch=master