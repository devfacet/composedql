/* jslint node: true */
/* global describe: false, it: false */
'use strict';

var cql    = require('../lib/composedql'),
    expect = require('chai').expect;

// Tests

describe('parse', function() {

  it('should parse query - field', function(done) {
    var query = cql.parse('test');

    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({name: 'test', type: 'field', source: 'test'});

    query = cql.parse('test.foo');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'field',
      source: 'test.foo',
      properties: [{name: 'foo', type: 'property'}]
    });

    query = cql.parse('test.foo.bar');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'field',
      source: 'test.foo.bar',
      properties: [
        {name: 'foo', type: 'property'},
        {name: 'bar', type: 'property'}
      ]
    });

    query = cql.parse('test.foo.bar.baz');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'field',
      source: 'test.foo.bar.baz',
      properties: [
        {name: 'foo', type: 'property'},
        {name: 'bar', type: 'property'},
        {name: 'baz', type: 'property'}
      ]
    });

    done();
  });

  it('should parse query - resource field', function(done) {
    var query = cql.parse('~test');

    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({name: 'test', type: 'resource', source: '~test'});

    query = cql.parse('~test.foo');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test.foo',
      properties: [{name: 'foo', type: 'property'}]
    });

    query = cql.parse('~test()');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test()'
    });

    query = cql.parse('~test(foo)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test(foo)',
      fields: [{name: 'foo', type: 'field', source: 'foo'}]
    });

    query = cql.parse('~test(foo.bar)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test(foo.bar)',
      fields: [{
          name: 'foo',
          type: 'field',
          source: 'foo.bar',
          properties: [{name: 'bar', type: 'property'}]
      }]
    });

    query = cql.parse('~test(foo.bar.baz)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test(foo.bar.baz)',
      fields: [{
          name: 'foo',
          type: 'field',
          source: 'foo.bar.baz',
          properties: [
            {name: 'bar', type: 'property'},
            {name: 'baz', type: 'property'}
          ]
      }]
    });

    query = cql.parse('~test(foo,bar)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test(foo,bar)',
      fields: [
        {name: 'foo', type: 'field', source: 'foo'},
        {name: 'bar', type: 'field', source: 'bar'}
      ]
    });

    done();
  });

  it('should parse query - function', function(done) {
    var query = cql.parse('test()');

    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({name: 'test', type: 'function', source: 'test()'});

    query = cql.parse('test(foo)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'function',
      source: 'test(foo)',
      args: [{name: 'foo', type: 'arg', source: 'foo'}]
    });

    query = cql.parse('test(foo.bar)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'function',
      source: 'test(foo.bar)',
      args: [{
          name: 'foo',
          type: 'arg',
          source: 'foo.bar',
          properties: [{name: 'bar', type: 'property'}]
      }]
    });

    query = cql.parse('test(foo.bar.baz)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'function',
      source: 'test(foo.bar.baz)',
      args: [{
          name: 'foo',
          type: 'arg',
          source: 'foo.bar.baz',
          properties: [
            {name: 'bar', type: 'property'},
            {name: 'baz', type: 'property'}
          ]
      }]
    });

    query = cql.parse('test(foo,bar)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'function',
      source: 'test(foo,bar)',
      args: [
        {name: 'foo', type: 'arg', source: 'foo'},
        {name: 'bar', type: 'arg', source: 'bar'}
      ]
    });

    done();
  });

  it('should parse query - field function', function(done) {
    var query = cql.parse('test.foo(bar)');

    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'field',
      source: 'test.foo(bar)',
      properties: [{
          name: 'foo',
          type: 'function',
          args: [{name: 'bar', type: 'arg', source: 'bar'}]
      }]
    });

    query = cql.parse('test.foo.bar(baz)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'field',
      source: 'test.foo.bar(baz)',
      properties: [
        {name: 'foo', type: 'property'},
        {
          name: 'bar',
          type: 'function',
          args: [{name: 'baz', type: 'arg', source: 'baz'}]
        }
      ]
    });

    query = cql.parse('test.foo(bar.baz)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'field',
      source: 'test.foo(bar.baz)',
      properties: [{
        name: 'foo',
        type: 'function',
        args: [{
            name: 'bar',
            type: 'arg',
            source: 'bar.baz',
            properties: [{name: 'baz', type: 'property'}]
        }]
      }]
    });

    query = cql.parse('test.foo(bar.baz.qux)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'field',
      source: 'test.foo(bar.baz.qux)',
      properties: [{
        name: 'foo',
        type: 'function',
        args: [{
            name: 'bar',
            type: 'arg',
            source: 'bar.baz.qux',
            properties: [
              {name: 'baz', type: 'property'},
              {name: 'qux', type: 'property'}
            ]
        }]
      }]
    });

    query = cql.parse('test.foo(bar,baz)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'field',
      source: 'test.foo(bar,baz)',
      properties: [{
        name: 'foo',
        type: 'function',
        args: [
          {name: 'bar', type: 'arg', source: 'bar'},
          {name: 'baz', type: 'arg', source: 'baz'}
        ]
      }]
    });

    done();
  });

  it('should parse query - field function - chain', function(done) {
    var query = cql.parse('test.foo(bar).baz(qux)');

    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'field',
      source: 'test.foo(bar).baz(qux)',
      properties: [
        {
          name: 'foo',
          type: 'function',
          args: [{name: 'bar', type: 'arg', source: 'bar'}]
        },
        {
          name: 'baz',
          type: 'function',
          args: [{name: 'qux', type: 'arg', source: 'qux'}]
        }
      ]
    });

    done();
  });

  it('should parse query - resource field - field function', function(done) {
    var query = cql.parse('~test.foo(bar)');

    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test.foo(bar)',
      properties: [{
          name: 'foo',
          type: 'function',
          args: [{name: 'bar', type: 'arg', source: 'bar'}]
      }]
    });

    query = cql.parse('~test.foo.bar(baz)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test.foo.bar(baz)',
      properties: [
        {name: 'foo', type: 'property'},
        {
          name: 'bar',
          type: 'function',
          args: [{name: 'baz', type: 'arg', source: 'baz'}]
        }
      ]
    });

    query = cql.parse('~test.foo(bar.baz)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test.foo(bar.baz)',
      properties: [{
        name: 'foo',
        type: 'function',
        args: [{
            name: 'bar',
            type: 'arg',
            source: 'bar.baz',
            properties: [{name: 'baz', type: 'property'}]
        }]
      }]
    });

    query = cql.parse('~test.foo(bar.baz.qux)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test.foo(bar.baz.qux)',
      properties: [{
        name: 'foo',
        type: 'function',
        args: [{
            name: 'bar',
            type: 'arg',
            source: 'bar.baz.qux',
            properties: [
              {name: 'baz', type: 'property'},
              {name: 'qux', type: 'property'}
            ]
        }]
      }]
    });

    query = cql.parse('~test.foo(bar,baz)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test.foo(bar,baz)',
      properties: [{
        name: 'foo',
        type: 'function',
        args: [
          {name: 'bar', type: 'arg', source: 'bar'},
          {name: 'baz', type: 'arg', source: 'baz'}
        ]
      }]
    });

    done();
  });

  it('should parse query - resource field - field function - chain', function(done) {
    var query = cql.parse('~test.foo(bar).baz(qux)');

    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test.foo(bar).baz(qux)',
      properties: [
        {
          name: 'foo',
          type: 'function',
          args: [{name: 'bar', type: 'arg', source: 'bar'}]
        },
        {
          name: 'baz',
          type: 'function',
          args: [{name: 'qux', type: 'arg', source: 'qux'}]
        }
      ]
    });

    done();
  });

  it('should parse query - function - chain', function(done) {
    var query = cql.parse('test(foo).bar(baz)');

    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'function',
      source: 'test(foo).bar(baz)',
      args: [{name: 'foo', type: 'arg', source: 'foo'}],
      properties: [{
        name: 'bar',
        type: 'function',
        args: [{name: 'baz', type: 'arg', source: 'baz'}]
      }]
    });

    query = cql.parse('test(foo).bar(baz).qux(boom)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'function',
      source: 'test(foo).bar(baz).qux(boom)',
      args: [{name: 'foo', type: 'arg', source: 'foo'}],
      properties: [
        {
          name: 'bar',
          type: 'function',
          args: [{name: 'baz', type: 'arg', source: 'baz'}]
        },
        {
          name: 'qux',
          type: 'function',
          args: [{name: 'boom', type: 'arg', source: 'boom'}]
        }
      ]
    });

    done();
  });

  it('should parse query - resource field - chain', function(done) {
    var query = cql.parse('~test(foo).bar(baz)');

    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test(foo).bar(baz)',
      fields: [{name: 'foo', type: 'field', source: 'foo'}],
      properties: [{
        name: 'bar',
        type: 'function',
        args: [{name: 'baz', type: 'arg', source: 'baz'}]
      }]
    });

    query = cql.parse('~test(foo).bar(baz).qux(boom)');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({
      name: 'test',
      type: 'resource',
      source: '~test(foo).bar(baz).qux(boom)',
      fields: [{name: 'foo', type: 'field', source: 'foo'}],
      properties: [
        {
          name: 'bar',
          type: 'function',
          args: [{name: 'baz', type: 'arg', source: 'baz'}]
        },
        {
          name: 'qux',
          type: 'function',
          args: [{name: 'boom', type: 'arg', source: 'boom'}]
        }
      ]
    });

    done();
  });

  it('should parse query - trim fields', function(done) {
    var query = cql.parse(' test, foo ,bar ');
    expect(query).to.be.a('array');
    expect(query[0]).to.deep.equal({name: 'test', type: 'field', source: 'test'});
    expect(query[1]).to.deep.equal({name: 'foo', type: 'field', source: 'foo'});
    expect(query[2]).to.deep.equal({name: 'bar', type: 'field', source: 'bar'});
    done();
  });

  it('should parse query - empty arguments', function(done) {
    var query = cql.parse('');
    expect(query).to.be.a('null');

    query = cql.parse(',');
    expect(query).to.be.a('null');

    done();
  });

  it('should fail to parse query - invalid query', function(done) {
    expect(cql.parse()).to.be.equal(null);

    var func = function() { cql.parse('field1,~field2())'); };
    expect(func).to.throw('invalid parentheses');
    expect(cql.parse({}, {throwError: false})).to.equal(false);

    done();
  });

});