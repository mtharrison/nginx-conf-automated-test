'use strict';

// Load modules

const ChildProcess = require('child_process');
const Code = require('code');
const Lab = require('lab');
const Path = require('path');
const Wreck = require('wreck');


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;
const afterEach = lab.afterEach;


const dockerHost = '192.168.99.100';     // yours may vary
const port = '4321';                     // pick a free port
let proc;


// Starts a nginx container running with my config
// calls-back when ready

const setup = function (configFile, callback) {

    const basedir = Path.join(__dirname, '..');
    proc = ChildProcess.spawn('docker', [
        'run',
        '-v', `${basedir}/public:/var/www`,                         // static file dir
        '-v', `${basedir}/${configFile}:/etc/nginx/nginx.conf`,     // map the config volume
        '-p', `${port}:80`,                                         // bind outside port to 80 in container
        'nginx']);

    setTimeout(callback, 1000);                                         // wait a sec for proc to start
};

afterEach((done) => {

    proc.kill();
    done();
});

describe('nginx conf', () => {

    // This test will pass

    it('works with good config', (done) => {

        setup('nginx-good.conf', () => {

            Wreck.get(`http://${dockerHost}:${port}/`, (err, res, payload) => {

                if (err) {
                    throw err;
                }

                expect(res.headers['x-dessert-header']).to.equal('frozen yogurt');
                expect(payload.toString()).to.equal('Hello world!\n');
                done();
            });
        });
    });

    // This test will fail

    it('works with bad config', (done) => {

        setup('nginx-bad.conf', () => {

            Wreck.get(`http://${dockerHost}:${port}/`, (err, res, payload) => {

                if (err) {
                    throw err;
                }

                expect(res.headers['x-dessert-header']).to.equal('frozen yogurt');
                expect(payload.toString()).to.equal('Hello world!\n');
                done();
            });
        });
    });
});
