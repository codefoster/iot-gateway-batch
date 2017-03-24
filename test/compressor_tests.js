
(function () {
    'use strict';
    require('mocha-jshint')({
        pretty: true
    });
    require('mocha-sinon');

    var sinonChai = require("sinon-chai");
    var sinon = require('sinon');
    var chai = require('chai');
    chai.use(sinonChai);

    var expect = chai.expect;

    var compressor = require('../compressor');


    const content = "this is a message.";
    const compressedData = new Uint8Array([31, 139, 8, 0, 0, 0, 0, 0, 0, 11, 43, 201, 200, 44,
        86, 0, 162, 68, 133, 220, 212, 226, 226, 196, 244,
        84, 61, 0, 249, 210, 81, 69, 18, 0, 0, 0]);

    var runCompressor = (message) => {
        return new Promise((resolve) => {
            compressor.receive(message);
            setTimeout(() => {
                resolve();
            }, 500);
        });
    };

    describe('calling compressor.destroy', function () {

        before(function (done) {
            sinon.spy(console, 'log');
            done();
        });

        after(function (done) {
            console.log.restore();
            done();
        });

        it('should log module destruction.', function (done) {
            compressor.destroy();
            expect(console.log.calledOnce).to.be.true;
            expect(console.log.calledWith('compressor.destroy')).to.be.true;
            done();
        });

    });

    describe('calling decompressor.decompress with compressed data', () => {

        it('should return a decompressed buffer.', () => {
            return compressor
                .compress(Buffer.from(content), function (err, compressed) {
                    expect(new Uint8Array(compressed)).to.eql(compressedData);
                });
        });

    });

    describe('calling compressor.receive with a simple string', () => {

        var messageBroker = { publish: sinon.spy() };

        before((done) => {
            sinon.spy(console, 'log');
            done();
        });

        beforeEach((done) => {
            compressor.create(messageBroker, null);
            done();
        });

        after((done) => {
            console.log.restore();
            done();
        });

        afterEach((done) => {
            console.log.reset();
            messageBroker.publish.reset();
            done();
        });

        it('should not error.', () => {
            var message = { content: content};
            return runCompressor(message)
                .then(() => {
                    expect(messageBroker.publish).to.not.throw;
                });
        });

        it('should call messageBus.publish once.', () => {
            var message = { content: content};
            return runCompressor(message)
                .then(() => {
                    expect(messageBroker.publish.calledOnce).to.be.true;
                });
        });

        it('should publish expected array to message bus.', () => {

            var message = { content: content};

            var expected = { content: compressedData };

            return runCompressor(message)
                .then(() => {
                    // compare object structure.
                    expect(messageBroker.publish.calledWithMatch(sinon.match(expected)));
                    // compare array contents.
                    expect(messageBroker.publish.args[0][0].content).to.deep.equal(compressedData);
                });
        });

        it('should call mesasgeBroker.publish once.', () => {
            var message = { content: content};
            return runCompressor(message)
                .then(() => {
                    expect(messageBroker.publish.calledOnce).to.be.true;
                });
        });

        it('should throw.', function (done) {
            var message = { content: "" };
            // set a publish stub that will throw.
            compressor.create({ publish: sinon.stub().throws() }, null);
            runCompressor(message)
                .then(() => {
                    expect(messageBroker.publish).to.throw(new Error('Error running gzip compression for data blob: %s', message));
                });
            done();
        });
    });

} ());
