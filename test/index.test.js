
var Analytics = require('analytics.js-core').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Driftt = require('../lib/');

describe('Driftt', function() {
  var analytics;
  var driftt;
  var options = {
    embedId: 'buvw2r8z43np-dev'
  };

  beforeEach(function() {
    analytics = new Analytics();
    driftt = new Driftt(options);
    analytics.use(Driftt);
    analytics.use(tester);
    analytics.add(driftt);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    driftt.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(Driftt, integration('Driftt')
      .global('driftt')
      .option('embedId', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(driftt, 'load');
    });

    describe('#initialize', function() {
      it('should create the window.driftt object', function() {
        analytics.assert(!window.driftt);
        analytics.initialize();
        analytics.assert(window.driftt);
      });

      it('should call #load', function() {
        analytics.initialize();
        analytics.called(driftt.load);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(driftt, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window.driftt, 'identify');
      });

      it('should not send an id without an email', function() {
        analytics.identify('id');
        analytics.didNotCall(window.driftt.identify);
      });

      it('should send an id with an email', function() {
        analytics.identify('id', { email: 'blackwidow@shield.gov' });
        analytics.called(window.driftt.identify, 'id', { email: 'blackwidow@shield.gov' });
      });

      it('should send an id and traits', function() {
        analytics.identify('id', { email: 'blackwidow@shield.gov' });
        analytics.called(window.driftt.identify, 'id', { email: 'blackwidow@shield.gov' });
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window.driftt, 'track');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called(window.driftt.track, 'event');
      });

      it('should send an event and properties', function() {
        analytics.track('event', { property: true });
        analytics.called(window.driftt.track, 'event', { property: true });
      });

      it('should convert dates to unix timestamps', function() {
        var date = new Date();
        analytics.track('event', { date: date });
        analytics.called(window.driftt.track, 'event', { date: Math.floor(date / 1000) });
      });
    });
  });
});
