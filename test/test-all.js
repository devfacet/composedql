/* jslint node: true */
/* global describe: false, it: false */
'use strict';

var cql    = require('../lib/composedql'),
    expect = require('chai').expect;

// Tests

describe('composedql', function() {

  describe('parseError', function() {

    it('should parse error - throw', function(done) {
      var func = function() { cql.parseError('test'); };
      expect(func).to.throw('test');
      done();
    });
    it('should parse error - no throw', function(done) {
      expect(cql.parseError('test', {throwError: false})).to.equal(false);
      done();
    });

  });

  describe('parseField', function() {

    it('should parse field - simple field', function(done) {
      var query = cql.parseField('username');

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({type: 'field', name: 'username', path: 'username'});
      done();
    });
    it('should parse field - nested field', function(done) {
      var query = cql.parseField('location.city');

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({
        type: 'field',
        name: 'location',
        path: 'location.city',
        properties: [{type: 'field', name: 'city', path: 'city'}]
      });
      done();
    });
    it('should parse field - multi nested field', function(done) {
      var query = cql.parseField('settings.foo.bar');

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({
        type: 'field',
        name: 'settings',
        path: 'settings.foo.bar',
        properties: [
          {type: 'field', name: 'foo', path: 'foo'},
          {type: 'field', name: 'bar', path: 'bar'}
        ]
      });
      done();
    });
    it('should parse field - resource field (simple field)', function(done) {
      var query = cql.parseField('~photo', 'profile,cover');

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({
        type: 'resource',
        name: 'photo',
        fields: [
          {type: 'field', name: 'profile', path: 'profile'},
          {type: 'field', name: 'cover', path: 'cover'}
        ]
      });
      done();
    });
    it('should parse field - resource field (nested field)', function(done) {
      var query = cql.parseField('~activity', 'login.date');

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({
        type: 'resource',
        name: 'activity',
        fields: [
          {
            type: 'field',
            name: 'login',
            path: 'login.date',
            properties: [
              {type: 'field', name: 'date', path: 'date'}
            ]
          }
        ]
      });
      done();
    });
    it('should parse field - resource field (no field)', function(done) {
      var query = cql.parseField('~foo');

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({type: 'resource', name: 'foo'});
      done();
    });

    it('should parse field - trim field', function(done) {
      var query = cql.parseField(' field1 ');

      expect(query).to.be.a('object');
      expect(query).to.deep.equal({type: 'field', name: 'field1', path: 'field1'});
      done();
    });

    it('should fail to parse field - invalid field', function(done) {
      expect(cql.parseField).to.throw('invalid field');
      done();
    });
    it('should fail to parse field - invalid context', function(done) {
      var func = function() { cql.parseField('field1', {}); };
      expect(func).to.throw('invalid context');
      done();
    });
    it('should fail to parse field - invalid field - no throw', function(done) {
      expect(cql.parse({}, {throwError: false})).to.equal(false);
      done();
    });

  });

  describe('parse', function() {

    it('should parse query - simple field', function(done) {
      var query = cql.parse('username');

      expect(query).to.be.a('array');
      expect(query[0]).to.deep.equal({type: 'field', name: 'username', path: 'username'});
      done();
    });
    it('should parse query - nested field', function(done) {
      var query = cql.parse('location.city');

      expect(query).to.be.a('array');
      expect(query[0]).to.deep.equal({
        type: 'field',
        name: 'location',
        path: 'location.city',
        properties: [{type: 'field', name: 'city', path: 'city'}]
      });
      done();
    });
    it('should parse query - multi nested field', function(done) {
      var query = cql.parse('settings.foo.bar');

      expect(query).to.be.a('array');
      expect(query[0]).to.deep.equal({
        type: 'field',
        name: 'settings',
        path: 'settings.foo.bar',
        properties: [
          {type: 'field', name: 'foo', path: 'foo'},
          {type: 'field', name: 'bar', path: 'bar'}
        ]
      });
      done();
    });
    it('should parse query - resource field (simple field)', function(done) {
      var query = cql.parse('~photo(profile,cover)');

      expect(query).to.be.a('array');
      expect(query[0]).to.deep.equal({
        type: 'resource',
        name: 'photo',
        fields: [
          {type: 'field', name: 'profile', path: 'profile'},
          {type: 'field', name: 'cover', path: 'cover'}
        ]
      });
      done();
    });
    it('should parse query - resource field (nested field)', function(done) {
      var query = cql.parse('~activity(login.date)');

      expect(query).to.be.a('array');
      expect(query[0]).to.deep.equal({
        type: 'resource',
        name: 'activity',
        fields: [
          {
            type: 'field',
            name: 'login',
            path: 'login.date',
            properties: [
              {type: 'field', name: 'date', path: 'date'}
            ]
          }
        ]
      });
      done();
    });
    it('should parse query - resource field (no field)', function(done) {
      var query = cql.parse('~foo');

      expect(query).to.be.a('array');
      expect(query[0]).to.deep.equal({type: 'resource', name: 'foo'});
      expect(query[0]).to.have.property('type', 'resource');
      expect(query[0]).to.have.property('name', 'foo');
      done();
    });

    it('should parse query - trim fields', function(done) {
      var query = cql.parse(' field1, field2 ,field3 ');
      expect(query).to.be.a('array');
      expect(query[0]).to.deep.equal({type: 'field', name: 'field1', path: 'field1'});
      expect(query[1]).to.deep.equal({type: 'field', name: 'field2', path: 'field2'});
      expect(query[2]).to.deep.equal({type: 'field', name: 'field3', path: 'field3'});
      done();
    });

    it('should parse query and return null due to empty arg', function(done) {
      var query = cql.parse('');
      expect(query).to.be.a('null');
      done();
    });
    it('should parse query and return null due to empty arg - comma', function(done) {
      var query = cql.parse(',');
      expect(query).to.be.a('null');
      done();
    });

    it('should fail to parse query - invalid query', function(done) {
      expect(cql.parse).to.throw('invalid query');
      done();
    });
    it('should fail to parse query - invalid parentheses', function(done) {
      var func = function() { cql.parse('field1,~field2())'); };
      expect(func).to.throw('invalid parentheses');
      done();
    });
    it('should fail to parse query - invalid query - no throw', function(done) {
      expect(cql.parse({}, {throwError: false})).to.equal(false);
      done();
    });

  });

});