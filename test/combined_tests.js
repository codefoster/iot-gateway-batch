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
    var decompressor = require('../decompressor');

    var runCompressor = (message) => {
        return new Promise((resolve) => {
            compressor.receive(message);
            setTimeout(() => {
                resolve();
            }, 50);
        });
    };

    var runDecompressor = (message) => {
        return new Promise((resolve) => {
            decompressor.receive(message);
            setTimeout(() => {
                resolve();
            }, 50);
        });
    };

    describe('Piping data through the compressor and onto the decompressor', function () {

        var messageBroker = { publish: sinon.spy() };

        before((done) => {
            sinon.spy(console, 'log');
            done();
        });

        beforeEach((done) => {
            compressor.create(messageBroker, null);
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
            var message = { content: "this is a message." };
            var compress = function (msg) {
                return runCompressor(msg)
                    .then(() => {
                        expect(messageBroker.publish).to.not.throw;
                        // return the compressed data, i.e. first call to publish.
                        return messageBroker.publish.args[0][0].content;
                    });
            },
                decompress = function (compressed) {
                    var compMessage = { content: compressed };
                    return runDecompressor(compMessage)
                        .then(() => {
                            expect(messageBroker.publish).to.not.throw;
                        });
                };
            return compress(message)
                .then(decompress);
        });

        it('should call messageBus.publish once.', () => {
            var message = { content: "this is a message." };
            return runCompressor(message)
                .then(() => {
                    expect(messageBroker.publish.calledOnce).to.be.true;
                });
        });

        it('the input and output strings should match.', () => {
            const content = "this is a message.";
            var message = { content: content };
            var compress = function (msg) {
                return runCompressor(msg)
                    .then(() => {
                        return messageBroker.publish.args[0][0].content;
                    });
            },
                decompress = function (compressed) {
                    var compMessage = { content: compressed };
                    return runDecompressor(compMessage)
                        .then(() => {
                            // expect seconnd call to publish to equal orig message.
                            var published = Buffer.from(messageBroker.publish.args[1][0].content).toString();
                            expect(published).to.equal(content);
                        });
                };
            return compress(message)
                .then(decompress);
        });
        
    });

} ());
