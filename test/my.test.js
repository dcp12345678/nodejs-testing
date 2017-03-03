'use strict';
/* eslint no-console: 0 */
/* eslint-disable no-unused-vars,import/no-extraneous-dependencies */
const should = require('should');
const chai = require('chai');
const assert = require('chai').assert;
const fs = require('fs');
const fp = require('path');
const request = require('request');
const _ = require('lodash');
const sinon = require('sinon');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const co = require('co');
const DA = require('deasync');
const logger = require('../helpers/logger');
const streamify = require('stream-array');
const os = require('os');
/* eslint-enable no-unused-vars */

const IMAGE_CDN_ROOT = 'http://hgtvhome.sndimg.com';

describe('my-tests', () => {
  beforeEach((done) => {
    if (_.isFunction(done)) {
      done();
    }
  });
  afterEach((done) => {
    done();
  });

  describe('1st test', () => {
    it('should succeed', () => {
      const user = {
        name: 'joey',
        age: 42,
      };
      user.should.have.property('name', 'joey');
      user.should.have.property('age', 42);
    });
  });

  describe('2nd test', () => {
    it('should succeed', () => {
      const myObj = {
        category: 'category_1',
        revenuePct: 12.45343,
      };

      myObj.should.have.property('category', 'category_1');
      myObj.should.have.property('revenuePct', 12.45343);
    });
  });

  describe('3rd test', () => {
    it('should succeed', () => {
      const foo = {
        name: 'Joey',
        age: 51,
      };
      assert.property(foo, 'name');
      assert.equal(foo.name, 'Joey');
    });
  });

  describe('path test', () => {
    it('should get correct file contents for path', () => {
      const txt = fs.readFileSync(fp.resolve(__dirname, '../test_files', 'sample_file.txt')).toString();
      assert.equal(txt, 'test text', 'file context are incorrect');
    });
  });

  describe('request test', () => {
    it('should get correct request contents', function (done) {
      this.timeout(4000);
      request.get('http://www.google.com', (error, response, body) => {
        if (!error && response.statusCode === 200) {
          logger.debug(body); // Show the HTML for the Google homepage.
          logger.debug('google request completed successfully');
        } else {
          throw new Error('failed, error = ' + error + ' statusCode = ' + response.statusCode);
        }
        assert.equal(response.statusCode, 200);
        done();
      });
    });
  });

  describe('lodash tests', () => {
    it('should get property added to object', () => {
      const obj = {
        name: 'Joey',
        age: 51,
      };
      _.extend(obj, { publishDate: new Date() });
      assert.property(obj, 'publishDate');
    });

    it('should get property updated in object for all array elements', (done) => {
      const arr = [{
        name: 'Joey',
        age: 51,
        hobby: 'soccer',
      }, {
        name: 'Mary',
        age: 34,
        hobby: 'running',
      }];
      _.each(arr, (obj) => { _.extend(obj, { hobby: 'tennis' }); });

      _.each(arr, (obj) => {
        assert.equal(obj.hobby, 'tennis');
      });

      done();
    });

    it('should test _.startsWith and get correct result', () => {
      const x = 'ice cream';
      assert.equal(_.startsWith(x, 'ice '), true);
    });

    it('should check if variable is a function', () => {
      const x = () => 42;
      const y = x();
      assert.equal(y, 42);
      assert.equal(_.isFunction(x), true);
    });

    it('should get correct value from _.chain', () => {
      const users = [
        { user: 'barney', age: 36 },
        { user: 'fred', age: 40 },
        { user: 'pebbles', age: 1 },
      ];

      const youngest = _
        .chain(users)
        .sortBy('age')
        .map(o => o.user + ' is ' + o.age)
        .head()
        .value();

      assert.equal(youngest, 'pebbles is 1');
    });

    it('should get correct value from _.chain', () => {
      const users = [
        { user: 'barney', age: 36 },
        { user: 'fred', age: 40 },
        { user: 'pebbles', age: 1 },
      ];

      const oldest = _
        .chain(users)
        .sortBy('age')
        .map(o => o.user + ' is ' + o.age)
        .last()
        .value();

      assert.equal(oldest, 'fred is 40');
    });

    it('should get correct value from _.flatten', () => {
      const users = [
        [10, 20, 30],
        [40, 50, 60],
        [70, 80, 90],
      ];

      const f = _.flatten(users);
      for (let i = 0; i < f.length; ++i) {
        logger.debug(f[i] + ' ');
      }
      assert.deepEqual(f, [10, 20, 30, 40, 50, 60, 70, 80, 90]);
    });

    it('should get correct value from _.each', () => {
      const users = [
        { user: 'barney', age: 36 },
        { user: 'fred', age: 40 },
        { user: 'pebbles', age: 1 },
      ];

      let res = '';
      _.each(users, (u) => {
        res += u.user + '-';
      });

      assert.equal(res, 'barney-fred-pebbles-');
    });

    it('should get correct value from _.filter', () => {
      const users = [
        { user: 'barney', age: 36 },
        { user: 'fred', age: 40 },
        { user: 'pebbles', age: 1 },
      ];

      let res = _.filter(users, (u) => u.age >= 36);

      assert(res.length === 2, 'wrong number of elements in result');
      assert.equal(res[0].user, 'barney');
      assert.equal(res[1].user, 'fred');

      res = _.filter(users, (u) => u.user.includes('d'));

      assert(res.length === 1, 'wrong number of elements in result');
      assert.equal(res[0].user, 'fred');
    });

    it('should get correct value from _.map', () => {
      const users = [
        { user: 'barney', age: 36 },
        { user: 'fred', age: 40 },
        { user: 'pebbles', age: 1 },
      ];

      const res = _.map(users, (u) =>
        ({
          user: u.user,
          age: u.age,
          type: u.age >= 40 ? 'old' : 'young',
        })
      );

      assert.equal(res.length, 3, 'wrong number of elements');
      assert(res[0].type, 'young', 'wrong type');
      assert(res[1].type, 'old', 'wrong type');
      assert(res[2].type, 'young', 'wrong type');

      assert(_.filter(res, (u) => u.type === 'young').length === 2, 'wrong count');
    });

    it('should get correct value when using _.filter and _.every', () => {
      const neededAttrs = ['a', 'b', 'd'];
      const v = [
        { a: 'a', b: 'b', c: 'c', d: 'd' },
        { a: 'a', b: 'b', c: 'c' },
        { a: 'a', b: 'b', d: 'd' },
      ];
      const res = _.filter(v, (e) => _.every(neededAttrs, (m) => _.has(e, m)));
      assert.deepEqual(res[0], { a: 'a', b: 'b', c: 'c', d: 'd' });
      assert.deepEqual(res[1], { a: 'a', b: 'b', d: 'd' });
    });

    it('should get correct value when using _.uniq', () => {
      const vals = ['a', 'b', 'c', 'd', 'd', 'e', 'f', 'e', 'g', 'g', 'c'];
      const res = _.uniq(vals);
      assert.equal(res.length, 7, 'wrong number of elements');
    });

    it('should get correct value when using _.uniqBy', () => {
      const vals = [
        { name: 'Joey', age: 42 },
        { name: 'Joey', age: 19 },
        { name: 'Mary', age: 23 },
      ];

      const res = _.uniqBy(vals, 'name');
      assert.equal(2, res.length);
    });

    it('should get correct from when using _.orderBy', () => {
      const vals = [
        { a: 'a0', b: 'b0', dt: "2016-11-05T04:00:00.000Z" },
        { a: 'a1', b: 'b1', dt: "2016-08-04T04:00:00.000Z" },
        { dt: "2017-01-13T15:03:01.647Z", foobar: 'foo' }
      ];

      const res = _.orderBy(vals, ['dt'], ['desc']);
      console.log(`res = ${JSON.stringify(res, null, 2)}`);
      assert.equal(res[0], vals[2], 'wrong order');
      assert.equal(res[1], vals[0], 'wrong order');
      assert.equal(res[2], vals[1], 'wrong order');
    });
  });

  describe('sinon.stub tests', () => {
    it('should test sinon.stub and get correct result', sinon.test(function () {
      const dummyHtml = '<html><p>dummy html</p></html>';
      const stub = this.stub(request, 'get');
      stub.yields(null, { statusCode: 200 }, dummyHtml); // the "null, { statusCode: 200 }, dummyHtml" correspond to (err, resp, body)
      request.get(dummyHtml, (err, resp, body) => {
        if (!err && resp.statusCode === 200) {
          logger.debug('success');
          logger.debug('body=' + body);
        } else {
          logger.debug('failure');
        }
      });
    }));

    it('should test sinon.mock and get correct result', sinon.test(function () {
      const dummyHtml = '<html><p>dummy html</p></html>';
      const dummyAddress = 'http://mysite.com?parm1=42';
      const mock = this.mock(request);
      mock.expects('get').withArgs(dummyAddress).yields(null, { statusCode: 200 }, dummyHtml); // the "null, { statusCode: 200 }, dummyHtml" correspond to (err, resp, body)
      request.get(dummyAddress, (err, resp, body) => {
        logger.debug('body=' + body);
      });
    }));
  });

  describe('reg expression tests', () => {
    it('should pass regular expression tests', () => {
      let re = /^[a-z].*$/;
      assert.ok(re.exec('abcd123'), 'should match regex');

      re = /^[0-9]{3}[a-zA-Z]{3}$/;
      assert(re.exec('123AbC') !== null, 'should match regex');
      assert(re.exec('1234AbC') === null, 'should not match regex');
    });

    it('should pass get capture group correctly', () => {
      const txt = `
        if (x == 42) {
          let y = 'this is the text that should be captured';
        } else {
          let z = 'this text should not be captured';
        }
      `;
      const re = /if \(x == 42\) {\s+let y\s=\s'([^']+)'/; // the parenthesis create a capture group we can use
      assert.ok(re.exec(txt)[1], 'this is the text that should be captured');
    });
  });

  describe('Promise tests', () => {
    it('should get correct promise results', (done) => {
      const p = (arg1) => {
        const promise = new Promise((resolve) => {
          setTimeout(() => {
            resolve('it worked! arg1 = ' + arg1);
          }, 200);
        });
        return promise;
      };

      p('abc').then((data) => {
        assert.equal(data, 'it worked! arg1 = abc');
        logger.debug('data = ' + data);
        done();
      });
    });

    it('should get correct promise results if promise fails', (done) => {
      const p = (arg1) => {
        const promise = new Promise((resolve, reject) => {
          logger.debug(`arg1 is ${arg1}`);
          setTimeout(() => {
            reject('it failed!');
          }, 200);
        });
        return promise;
      };

      p('abc').then((data) => {
        throw new Error('should not have gotten here, data = ' + JSON.stringify(data));
      }).catch((e) => {
        logger.debug('error is ' + e);
        done();
      });
    });

    it('should get correct result for promise.map', (done) => {
      Promise.map(['one', 'two', 'three'], (i) => {
        const promise = new Promise((resolve) => {
          setTimeout(() => {
            resolve(i + '_mapped');
          }, 20);
        });
        return promise;
      }).then((results) => {
        logger.debug('results = ' + results);
        assert.equal(results, 'one_mapped,two_mapped,three_mapped');
        done();
      });
    });

    it('should get correct result for PromisifyAll for successful call', (done) => {
      const obj = {};
      obj.func1 = (callback) => {
        setTimeout(() => {
          logger.debug('completed setTimeout call');
          callback(null); // pass err as first argument, which is null in this case
        }, 20);
      };

      Promise.promisifyAll(obj);
      obj.func1Async().then(() => {
        logger.debug('completed thenable part of func1Async call');
        done();
      }).catch((err) => {
        throw new Error('should not have gotten here, err = ' + JSON.stringify(err));
      });
    });

    it('should get correct result for PromisifyAll for failed call', (done) => {
      const obj = {};
      obj.func1 = (callback) => {
        setTimeout(() => {
          logger.debug('completed setTimeout call');
          callback('this is an error');
        }, 20);
      };

      Promise.promisifyAll(obj);
      obj.func1Async().then(() => {
        throw new Error('should not have gotten here');
      }).catch((err) => {
        logger.debug('got an error in funcAsync, which is the expected behavior');
        logger.debug('err.message = ' + err.message);
        done();
      });
    });
  }); // end of Promise tests

  describe('co tests', () => {
    it('should get correct result from co test', (done) => {
      const name = 'John Doe';
      const p = new Promise((resolve) => {
        setTimeout(() => {
          logger.debug('hello there ' + name);
          resolve('promise complete');
        }, 345);
      });

      co(function* () {
        const res = yield p;
        logger.debug('res = ' + res);
        done();
      });
    });

    it('should get correct result from co test with promisifyAll', (done) => {
      const obj = {};
      obj.getSquareOfNum = (num, callback) => {
        setTimeout(() => {
          logger.debug('completed setTimeout call');
          callback(null, num * num); // pass err as first argument, wich is null in this case
        }, 203);
      };

      Promise.promisifyAll(obj);

      co(function* () {
        const res = yield obj.getSquareOfNumAsync(42);
        assert.equal(res, 42 * 42);
        done();
      });
    });

    it('should get correct result from co.wrap test', (done) => {
      const fn = co.wrap(function* (val) {
        return yield Promise.resolve(val);
      });

      fn(42).then((val) => {
        assert.equal(42, val);
        done();
      });
    });

    it('should get correct result from co.wrap test (2nd test)', (done) => {
      const fn = co.wrap(function* (val) {
        yield new Promise(resolve => { setTimeout(resolve, 234); });
        return yield Promise.resolve(val * val);
      });

      fn(42).then((val) => {
        assert.equal(42 * 42, val);
        done();
      }).catch((err) => {
        done(err);
      });
    });

    it('should get correct result from another co yield test', (done) => {
      const obj = {};
      obj.getSum = (a, b, cb) => {
        setTimeout(
          () => { cb(null, a + b); },
          234);
      };

      obj.getProduct = (a, b, cb) => {
        setTimeout(
          () => { cb(null, a * b); },
          321);
      };

      Promise.promisifyAll(obj);

      co(function* () {
        logger.debug('getting sum');
        const sm = yield obj.getSumAsync(23, 45);
        logger.debug('back from getting sum, the sum = ' + sm);
        assert.equal(sm, 23 + 45, 'wrong sum');

        logger.debug('getting product');
        const prod = yield obj.getProductAsync(9, 7);
        logger.debug('back from getting product, the product = ' + prod);
        assert.equal(prod, 9 * 7, 'wrong product');

        done();
      }).catch((err) => {
        done(err);
      });
    });
  });

  describe('map/reduce tests', () => {
    it('should get correct outputs from map/reduce', () => {
      // note: the last argument we pass to reduce is the initial value for the accumulator. If not passed, it defaults
      //       to first element in the collection
      const res = _.map([1, 2, 3, 4, 5], (x) => {
        const obj = {};
        obj.first = x;
        obj.second = x * 2;
        return obj;
      }).reduce((sm, x) => {
        logger.debug('inside reduce, x.first = ' + x.first + ' x.second = ' + x.second);
        return sm + (x.first * x.second);
      }, 0);
      logger.debug('result for map/reduce is ' + res);
      assert.equal(res, 110);
    });

    it('should get correct outputs from map/reduce', () => {
      const res = _.reduce({ a: 1, b: 2, c: 1 }, (result, value, key) => {
        (result[value] || (result[value] = [])).push(key);
        return result;
      }, {});
      // --> { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
      assert.ok(_.has(res, '1'), 'should have a property of 1');
      assert.ok(_.has(res, '2'), 'should have a property of 2');
      assert.deepEqual(res['1'], ['a', 'c'], 'array is invalid for \'1\' property');
      assert.deepEqual(res['2'], ['b'], 'array is invalid for \'2\' property');
    });
  });

  describe('deasync tests', () => {
    it('should get correct result from deasync', (done) => {
      let ret;
      const func1 = () => {
        setTimeout(() => {
          logger.debug('completed setTimeout call');
          ret = 'done';
        }, 203);
      };

      func1();
      while (ret === undefined) {
        DA.sleep(100);
      }
      logger.debug('completed deasync test');
      done();
    });
  });

  describe('cheerio tests', () => {
    it('should get correct outputs from cheerio', () => {
      const html = `<ul id="fruits">
                      <li data-attr1='appleAttr' class="apple">Apple</li>
                      <li data-attr1='orangeAttr' class="orange">Orange</li>
                      <li data-attr1='pearAttr' class="pear">Pear</li>
                    </ul>`;
      const $ = cheerio.load(html);
      assert.equal($('.apple', '#fruits').text(), 'Apple');
      assert.equal($('li[class=orange]').html(), 'Orange');
      assert.equal($('ul .pear').attr('data-attr1'), 'pearAttr');
      assert.equal($('#fruits').find('.pear').text(), 'Pear');

      const res = $('li').map((i, elem) => {
        logger.debug('elem = ' + $(elem).text());
        logger.debug('elem.data-attr = ' + $(elem).attr('data-attr1'));
        const obj = {};
        obj.fruitName = $(elem).text();
        obj.dataAttr = $(elem).attr('data-attr1');
        return obj;
      });
      assert.equal(res.length, 3);
      assert.equal(res[0].fruitName, 'Apple');
      assert.equal(res[0].dataAttr, 'appleAttr');
      assert.equal(res[1].fruitName, 'Orange');
      assert.equal(res[1].dataAttr, 'orangeAttr');
      assert.equal(res[2].fruitName, 'Pear');
      assert.equal(res[2].dataAttr, 'pearAttr');
    });

    it('should get correct outputs from cheerio (2nd test)', () => {
      const txt = `
                  <script type="text/javascript">
                    var mdManager = new MetaDataManager(),
                    origPubDate = '2015-08-26T17:50:44.311-04:00'.replace(/T.*$/, ''),
                    lastReplicationDate = '2016-06-08T11:34:37.251-04:00'.replace(/T.*$/, '');
                    mdManager.addParameter("Url", "/shows/full-episodes");
      `;
      // notes on regex:
      // The [^'] says match any charcter except for single quote. This gets the stuff between the quotes in origPubDate
      // The parentheses around the ([^]) are used to create a capture group. This capture group isolates the pub date into
      // its own string, and that's why we use [1] below to get the date.
      const origPubDate = new Date(/origPubDate\s=\s'([^']+)'/.exec(txt)[1]); // find pubdate
      logger.debug('origPubDate = ' + origPubDate);
      const html = `
          <html>
                <script type="text/x-config">
                {
                  "syncAdSelector": "#bigbox-video-embed_2429119",
                  "player": {
                      "autoplay": true,
                      "logLevel": "warn",
                      "containerId": "video-player_2429119",
                      "controlHoverColor": "0xffffff",
                      "controlSelectedColor": "0xffffff",
                      "playProgressColor": "0xffffff"
                  },
                  "channels": [{
                      "id": "393939393",
                      "start": 0,


                    "end": 12,
                    "total": 13,
                    "title": "",
                    "description": "",
                    "videos": [

                      {
                      "id" : "http://data.media.theplatform.com/media/data/Media/465068099969",
                      "title" : "Expectant Couple Seeks Nest",
                      "description" : "Chip and Jo Gaines update a ranch style house for baby's birth.",
                      "releaseUrl" : "http://link.theplatform.com/s/ip77QC/6gSeLVk2mh8b?format=SMIL&MBR=true",
                      "thumbnailUrl" : "/content/dam/images/hgtv/video/0/02/023/0230/0230147.jpg",
                      "length" : "2580",
                      "duration" : "43:00",
                      "publisherId" : "HGTV",
                      "nlvid" : "0230147",
                      "scrid" : "2429119",
                      "cmsid" : "60a1adbdbf0f6715a6c1451f0837bda3",
                      "sniGUID": "bc0eb5fb-047e-4586-93b2-ae04a93cb581",
                      "sponsor" : ""
                      },
                      {
                      "id" : "http://data.media.theplatform.com/media/data/Media/465046595666",
                      "title" : "Extra Space for Blended Family",
                      "description" : "Nearly empty nesters seeks right sized fixer upper for blended family.",
                      "releaseUrl" : "http://link.theplatform.com/s/ip77QC/g1d_4IUmFG94?format=SMIL&MBR=true",
                      "thumbnailUrl" : "/content/dam/images/hgtv/video/0/02/023/0230/0230150.jpg",
                      "length" : "2580",
                      "duration" : "43:00",
                      "publisherId" : "HGTV",
                      "nlvid" : "0230150",
                      "scrid" : "2429143",
                      "cmsid" : "e23cafc5f733d53409f3ecd7908d5ad7",
                      "sniGUID": "eec16182-4fc4-445c-aea6-54be2eb1f645",
                      "sponsor" : ""

                      }
                    ]
              }]
            }
            </script>
            <p>this is first paragraph</p>
            <table>
              <tr id='row1'>
                <td>test1</td>
              </tr>
              <tr id='row2'>
                <td>test2</td>
              </tr>
            </table>
          </html>`;

      const $ = cheerio.load(html);
      let videos;
      $('script[type="text/x-config"]').each(function (i, elem) { //eslint-disable-line
        // find prerendered script with video infos
        const scriptRendered = $(elem).text();
        // logger.debug('scriptRendered = ' + scriptRendered);
        const script = JSON.parse(scriptRendered);
        const channels = _.get(script, 'channels');
        if (channels) {
          videos = _.chain(channels)
            .map('videos')
            .flatten() // channels is an array of objects, each object has videos attribute
            .filter((v) => { // fetch videos with required metadata
              const neededAttrs = ['title', 'description', 'thumbnailUrl', 'length', 'releaseUrl'];
              return _.every(neededAttrs, (m) => _.has(v, m));
            })
            .map((v) => ({ // transform values to the format we want
              title: v.title,
              description: v.description,
              thumbnailImage: IMAGE_CDN_ROOT + v.thumbnailUrl,
              runLength: parseInt(v.length, 10),
              provider: 'HGTV',
              provider_lowered: 'hgtv',
              xmlUrl: v.releaseUrl,
              publishDate: origPubDate,
            }))
            .value();
        }
      });
      assert.ok(videos !== undefined, 'videos should not be undefined');
    });
  });

  describe('streamify tests', () => {
    it('should call streamify and stream result to stdout', (done) => {
      let arr = ['1','2','3','4','5', os.EOL];
      streamify(arr).pipe(process.stdout);
      done();
    });
  });

});
