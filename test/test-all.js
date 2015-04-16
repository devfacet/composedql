/* jslint node: true */
/* global describe: false, it: false */
'use strict';

var cql    = require('../lib/composedql'),
    expect = require('chai').expect;

// Tests

describe('composedql', function() {

  it('should parse query correctly', function(done) {
    var query = cql.parse('first_name,last_name,address.city,settings.foo.bar');

    expect(query).to.be.a('array');

    expect(query[0]).to.have.property('type', 'field');
    expect(query[0]).to.have.property('name', 'first_name');

    expect(query[1]).to.have.property('type', 'field');
    expect(query[1]).to.have.property('name', 'last_name');

    expect(query[2]).to.have.property('type', 'field');
    expect(query[2]).to.have.property('name', 'address');
    expect(query[2]).to.have.property('properties').to.be.a('array');
    expect(query[2].properties[0]).to.have.property('type', 'field');
    expect(query[2].properties[0]).to.have.property('name', 'city');

    expect(query[3]).to.have.property('type', 'field');
    expect(query[3]).to.have.property('name', 'settings');
    expect(query[3]).to.have.property('properties').to.be.a('array');
    expect(query[3].properties[0]).to.have.property('type', 'field');
    expect(query[3].properties[0]).to.have.property('name', 'foo');
    expect(query[3].properties[0].properties[0]).to.have.property('type', 'field');
    expect(query[3].properties[0].properties[0]).to.have.property('name', 'bar');

    done();
  });
  it('should parse query correctly (trim)', function(done) {
    var query = cql.parse('first_name, last_name');

    expect(query).to.be.a('array');

    expect(query[0]).to.have.property('type', 'field');
    expect(query[0]).to.have.property('name', 'first_name');

    expect(query[1]).to.have.property('type', 'field');
    expect(query[1]).to.have.property('name', 'last_name');

    done();
  });
  it('should parse query correctly (empty)', function(done) {
    var query = cql.parse(',');

    expect(query).to.be.a('null');

    done();
  });
  it('should fail to parse query', function(done) {
    expect(cql.parse).to.throw('Invalid input');

    done();
  });

});