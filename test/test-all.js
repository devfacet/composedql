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
      expect(query).to.have.property('type', 'field');
      expect(query).to.have.property('name', 'username');
      done();
    });
    it('should parse field - nested field', function(done) {
      var query = cql.parseField('location.city');

      expect(query).to.be.a('object');
      expect(query).to.have.property('type', 'field');
      expect(query).to.have.property('name', 'location');
      expect(query).to.have.property('path', 'location.city');
      expect(query).to.have.property('properties').to.be.a('array');
      expect(query.properties[0]).to.have.property('type', 'field');
      expect(query.properties[0]).to.have.property('name', 'city');
      done();
    });
    it('should parse field - multi nested field', function(done) {
      var query = cql.parseField('settings.foo.bar');

      expect(query).to.be.a('object');
      expect(query).to.have.property('type', 'field');
      expect(query).to.have.property('name', 'settings');
      expect(query).to.have.property('path', 'settings.foo.bar');
      expect(query).to.have.property('properties').to.be.a('array');
      expect(query.properties[0]).to.have.property('type', 'field');
      expect(query.properties[0]).to.have.property('name', 'foo');
      expect(query.properties[1]).to.have.property('type', 'field');
      expect(query.properties[1]).to.have.property('name', 'bar');
      done();
    });
    it('should parse field - resource field (simple field)', function(done) {
      var query = cql.parseField('~photo', 'profile,cover');

      expect(query).to.be.a('object');
      expect(query).to.have.property('type', 'resource');
      expect(query).to.have.property('name', 'photo');
      expect(query).to.have.property('fields').to.be.a('array');
      expect(query.fields[0]).to.have.property('type', 'field');
      expect(query.fields[0]).to.have.property('name', 'profile');
      expect(query.fields[1]).to.have.property('type', 'field');
      expect(query.fields[1]).to.have.property('name', 'cover');
      done();
    });

    it('should parse field - trim field', function(done) {
      var query = cql.parseField(' field1 ');

      expect(query).to.be.a('object');
      expect(query).to.have.property('type', 'field');
      expect(query).to.have.property('name', 'field1');
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
      expect(query[0]).to.have.property('type', 'field');
      expect(query[0]).to.have.property('name', 'username');
      done();
    });
    it('should parse query - nested field', function(done) {
      var query = cql.parse('location.city');

      expect(query).to.be.a('array');
      expect(query[0]).to.have.property('type', 'field');
      expect(query[0]).to.have.property('name', 'location');
      expect(query[0]).to.have.property('path', 'location.city');
      expect(query[0]).to.have.property('properties').to.be.a('array');
      expect(query[0].properties[0]).to.have.property('type', 'field');
      expect(query[0].properties[0]).to.have.property('name', 'city');
      done();
    });
    it('should parse query - multi nested field', function(done) {
      var query = cql.parse('settings.foo.bar');

      expect(query).to.be.a('array');
      expect(query[0]).to.have.property('type', 'field');
      expect(query[0]).to.have.property('name', 'settings');
      expect(query[0]).to.have.property('path', 'settings.foo.bar');
      expect(query[0]).to.have.property('properties').to.be.a('array');
      expect(query[0].properties[0]).to.have.property('type', 'field');
      expect(query[0].properties[0]).to.have.property('name', 'foo');
      expect(query[0].properties[1]).to.have.property('type', 'field');
      expect(query[0].properties[1]).to.have.property('name', 'bar');
      done();
    });
    it('should parse query - resource field (simple field)', function(done) {
      var query = cql.parse('~photo(profile,cover)');

      expect(query).to.be.a('array');
      expect(query[0]).to.have.property('type', 'resource');
      expect(query[0]).to.have.property('name', 'photo');
      expect(query[0]).to.have.property('fields').to.be.a('array');
      expect(query[0].fields[0]).to.have.property('type', 'field');
      expect(query[0].fields[0]).to.have.property('name', 'profile');
      expect(query[0].fields[1]).to.have.property('type', 'field');
      expect(query[0].fields[1]).to.have.property('name', 'cover');
      done();
    });
    it('should parse query - resource field (nested field)', function(done) {
      var query = cql.parse('~activity(login.date)');

      expect(query).to.be.a('array');
      expect(query[0]).to.have.property('type', 'resource');
      expect(query[0]).to.have.property('name', 'activity');
      expect(query[0]).to.have.property('fields').to.be.a('array');
      expect(query[0].fields[0]).to.have.property('type', 'field');
      expect(query[0].fields[0]).to.have.property('name', 'login');
      expect(query[0].fields[0]).to.have.property('path', 'login.date');
      expect(query[0].fields[0]).to.have.property('properties').to.be.a('array');
      expect(query[0].fields[0].properties[0]).to.have.property('type', 'field');
      expect(query[0].fields[0].properties[0]).to.have.property('name', 'date');
      done();
    });
    it('should parse query - resource field (no field)', function(done) {
      var query = cql.parse('~foo');

      expect(query).to.be.a('array');
      expect(query[0]).to.have.property('type', 'resource');
      expect(query[0]).to.have.property('name', 'foo');
      done();
    });

    it('should parse query - trim fields', function(done) {
      var query = cql.parse(' field1, field2 ,field3 ');
      expect(query).to.be.a('array');
      expect(query[0]).to.have.property('type', 'field');
      expect(query[0]).to.have.property('name', 'field1');
      expect(query[1]).to.have.property('type', 'field');
      expect(query[1]).to.have.property('name', 'field2');
      expect(query[2]).to.have.property('type', 'field');
      expect(query[2]).to.have.property('name', 'field3');
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