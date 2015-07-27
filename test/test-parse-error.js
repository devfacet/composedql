/* jslint node: true */
/* global describe: false, it: false */
'use strict';

var cql    = require('../lib/composedql'),
    expect = require('chai').expect;

// Tests

describe('parseError', function() {

  it('should throw parse error', function(done) {
    var func = function() { cql.parseError('test'); };
    expect(func).to.throw('test');
    done();
  });

  it('should return false', function(done) {
    expect(cql.parseError('test', {throwError: false})).to.equal(false);
    done();
  });

});