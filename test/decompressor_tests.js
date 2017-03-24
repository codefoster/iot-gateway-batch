
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

    var decompressor = require('../decompressor');

    const compressedArray = new Uint8Array(
        [31, 139, 8, 0, 0, 0, 0, 0, 0, 11, 43, 201, 200, 44,
        86, 0, 162, 68, 133, 220, 212, 226, 226, 196, 244,
        84, 61, 0, 249, 210, 81, 69, 18, 0, 0, 0]);

    var runDecompressor = (message) => {
        return new Promise((resolve) => {
            decompressor.receive(message);
            setTimeout(() => {
                resolve();
            }, 500);
        });
    };

    describe('calling decompressor.destroy', function () {

        before(function (done) {
            sinon.spy(console, 'log');
            done();
        });

        after(function (done) {
            console.log.restore();
            done();
        });

        it('should log module destruction.', function (done) {
            decompressor.destroy();
            expect(console.log.calledOnce).to.be.true;
            expect(console.log.calledWith('decompressor.destroy')).to.be.true;
            done();
        });

    });

    describe('calling decompressor.decompress with compressed data', () => {

        it('should return a decompressed buffer.', () => {

            const decompressedValue = "this is a message.";
            return decompressor
                .decompress(Buffer.from(compressedArray), function (err, decompressed) {
                    expect(Buffer.from(decompressed).toString()).to.equal(decompressedValue);
                });
        });

    });

    describe('calling decompressor.receive with compressed data', () => {

        var messageBroker = { publish: sinon.spy() };

        before((done) => {
            sinon.spy(console, 'log');
            done();
        });

        beforeEach((done) => {
            decompressor.create(messageBroker, null);
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
            var message = { content: compressedArray };
            return runDecompressor(message)
                .then(() => {
                    expect(messageBroker.publish).to.not.throw;
                });
        });

        it('should call messageBus.publish once.', () => {

            var message = { content: compressedArray };
            return runDecompressor(message)
                .then(() => {
                    expect(messageBroker.publish.calledOnce).to.be.true;
                });
        });

        it('should publish expected message to message bus.', () => {

            const decompressedValue = "this is a message.";
            var message = { content: compressedArray };
            return runDecompressor(message)
                .then(() => {
                    // compare object structure.
                    expect(messageBroker.publish.calledWithMatch(sinon.match(message)));
                    // compare array contents.
                    expect(Buffer.from(messageBroker.publish.args[0][0].content).toString()).to.equal(decompressedValue);
                });
        });

        it('should call mesasgeBroker.publish once.', () => {

            var message = { content: compressedArray };
            return runDecompressor(message)
                .then(() => {
                    expect(messageBroker.publish.calledOnce).to.be.true;
                });
        });

        it('should throw.', function (done) {
            var message = { content: "" };
            // set a publish stub that will throw.
            decompressor.create({ publish: sinon.stub().throws() }, null);
            runDecompressor(message)
                .then(() => {
                    expect(messageBroker.publish).to.throw(new Error('Error running gzip decompression for data blob: %s', message));
                });
            done();
        });
    });

} ());
