(function() {


  var util = require( 'util' );
  var WeePromise = require( '../index.js' );
  var ES6_Promise = require( 'es6-promise' ).Promise;
  var chai = require( 'chai' );
  var assert = chai.assert;
  var expect = chai.expect;


  var http = require( 'http' );
  var url = require( 'url' );
  var querystring = require( 'querystring' );


  [
    [ WeePromise , 'wee-promise' ],
    [ ES6_Promise , 'es6-promise' ]
  ]
  .forEach(function( args ) {


    var Promise = args[0];
    var name = args[1];
    

    describe( name , function() {

      describe( 'functionality' , function() {

        it( 'when a single promise is rejected' , function( done ) {
          new Promise(function( resolve , reject ) {
            throw new Error( 'error' );
          })
          .then(function() {
            log('then');
          })
          .catch(function( err ) {
            log('catch');
            done();
          });
        });

        it( 'when a single promise chain is rejected WITHOUT a catch handler on the child' , function( done ) {
          new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            return new Promise(function( resolve , reject ) {
              throw new Error( 'error' );
            })
            .then(function() {
              return true;
            });
          })
          .then(function( args ) {
            log(args);
            done();
          })
          .catch(function( err ) {
            log('catch');
            done();
          });
        });

        it( 'when a single promise chain is rejected WITH a catch handler on the child' , function( done ) {
          new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            return new Promise(function( resolve , reject ) {
              throw new Error( 'error' );
            })
            .then(function() {
              return true;
            })
            .catch(function() {
              return false;
            });
          })
          .then(function( args ) {
            log(args);
            done();
          })
          .catch(function( err ) {
            log('catch');
            done();
          });
        });

        it( 'when a promise list WITHOUT individual catch handlers is rejected' , function( done ) {
          
          var promise1 = new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            return true;
          });

          var promise2 = new Promise(function( resolve , reject ) {
            throw new Error( 'error' );
          })
          .then(function() {
            return true;
          });

          Promise.all([ promise1 , promise2 ]).then(function( args ) {
            log( args );
            done();
          })
          .catch(function( err ) {
            log('catch');
            done();
          });
        });

        it( 'when a promise list WITH individual catch handlers is rejected' , function( done ) {
          
          var promise1 = new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            return true;
          })
          .catch(function() {
            return false;
          });

          var promise2 = new Promise(function( resolve , reject ) {
            throw new Error( 'error' );
          })
          .then(function() {
            return true;
          })
          .catch(function() {
            return false;
          });

          Promise.all([ promise1 , promise2 ]).then(function( args ) {
            log( args );
            done();
          })
          .catch(function( err ) {
            log('catch');
            done();
          });
        });

        it( 'when a promise list chain WITHOUT individual catch handlers is rejected' , function( done ) {
          
          var promise1 = new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            return new Promise(function( resolve , reject ) {
              resolve();
            });
          })
          .then(function() {
            return true;
          });

          var promise2 = new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            return new Promise(function( resolve , reject ) {
              throw new Error( 'error' );
            });
          })
          .then(function() {
            return true;
          });

          Promise.all([ promise1 , promise2 ]).then(function( args ) {
            log( args );
            done();
          })
          .catch(function( err ) {
            log('catch');
            done();
          });
        });

        it( 'when a promise list chain WITH individual catch handlers is rejected' , function( done ) {
          
          var promise1 = new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            return new Promise(function( resolve , reject ) {
              resolve();
            });
          })
          .then(function() {
            return true;
          })
          .catch(function() {
            return false;
          });

          var promise2 = new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            return new Promise(function( resolve , reject ) {
              throw new Error( 'error' );
            });
          })
          .then(function() {
            return true;
          })
          .catch(function() {
            return false;
          });

          Promise.all([ promise1 , promise2 ]).then(function( args ) {
            log( args );
            done();
          })
          .catch(function( err ) {
            log('catch');
            done();
          });
        });

      });

      return;

      describe( 'Special Cases' , function() {

        it( 'should fail recursively until maxAttempts is reached' , function( done ) {

          var maxAttempts = 3;

          loadImages( overlays() ).then(function( args ) {
            log(args);
            done();
          })
          .catch( done );
          
          function overlays() {
            var cloud = 'http://s3-us-west-2.amazonaws.com/s.cdpn.io/141981/cloud.png';
            return {
              image0: { src: cloud + '?r=' + uts() },
              image1: { src: cloud + 'FAIL?r=' + uts() },
              image2: { src: cloud + '?r=' + uts() },
              image3: { src: cloud + '?r=' + uts() }
            };
          }

          function uts() {
            return Date.now() + '.' + Math.floor( Math.random() * 100000 );
          }

          function loadImages( srcObj ) {

            function load( imgObj , key ) {
              var statusCode, img = '\u2713\u0020success!';
              var promise = new Promise(function( resolve , reject ) {
                log('GET -> ' + key);
                http.get( imgObj.src )
                .on( 'response' , function( res ) {
                  statusCode = parseInt( res.statusCode , 10 );
                  res.on( 'data' , function() {} );
                  res.on( 'end' , function() {
                    if (statusCode === 200) {
                      resolve();
                    }
                    else {
                      reject();
                    }
                  });
                })
                .on( 'error' , function() {
                  reject();
                });
              })
              .then(function() {
                return img;
              })
              .catch(function() {
                //log(promise);
                imgObj.attempts++;
                if (imgObj.attempts <= maxAttempts) {
                  log(key + ' failed, attempts = ' + imgObj.attempts);
                  return load( imgObj , key );
                }
                return '\u2716\u0020error!';
              });
              return promise;
            }

            return Promise.all(
              Object.keys( srcObj ).map(function( key ) {
                srcObj[key].attempts = 0;
                return load( srcObj[key] , key );
              })
            );
          }

        });

      });

      return;

      describe( 'Constructor' , function() {
        it( 'should fail silently when an error is thrown' , function( done ) {
          new Promise(function( resolve , reject ) {
            async( done );
            throw new Error( 'error' );
          });
        });
      });

      describe( '#then()' , function() {
        it( 'should do nothing when resolve is called twice' , function( done ) {
          new Promise(function( resolve , reject ) {
            resolve();
            resolve();
          })
          .then(function() {
            done();
          });
        });
        it( 'should do nothing if the promise is rejected' , function( done ) {
          new Promise(function( resolve , reject ) {
            reject();
            resolve();
          })
          .then(function() {
            done();
          })
          .catch(function() {
            done();
          });
        });
        it( 'should fail silently when an error is thrown' , function( done ) {
          new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            async( done );
            throw new Error( 'error' );
          });
        });
        it( 'should pass returned args to the next then function' , function( done ) {
          new Promise(function( resolve ) {
            async(function() {
              resolve( 'a' );
            });
          })
          .then(function( val ) {
            expect( val ).to.equal( 'a' );
            return val + 'b';
          })
          .then(function( val ) {
            expect( val ).to.equal( 'ab' );
            return val + 'c';
          })
          .then(function( val ) {
            expect( val ).to.equal( 'abc' );
            done();
          })
          .catch( done );
        });
        it( 'should allow for promise chaining (asynchronous)' , function( done ) {

          var start = Date.now();
          var delay = 100;
          var tolerance = 50;
          var i = 0;

          new Promise(function( resolve ) {
            async( resolve , delay );
          })
          .then(function() {
            i++;
            expect( Date.now() - start ).to.be.closeTo( i * delay , tolerance );
            return new Promise(function( resolve ) {
              async( resolve , delay );
            });
          })
          .then(function() {
            i++;
            expect( Date.now() - start ).to.be.closeTo( i * delay , tolerance );
            return new Promise(function( resolve ) {
              async( resolve , delay );
            });
          })
          .then(function() {
            i++;
            expect( Date.now() - start ).to.be.closeTo( i * delay , tolerance );
            return 5;
          })
          .then(function( val ) {
            expect( val ).to.equal( 5 );
            expect( Date.now() - start ).to.be.closeTo( i * delay , tolerance );
            done();
          })
          .catch( done );
        });
        it( 'should allow for promise chaining (synchronous)' , function( done ) {
          new Promise(function( resolve ) {
            resolve();
          })
          .then(function() {
            return new Promise(function( resolve ) {
              resolve();
            });
          })
          .then(function() {
            return new Promise(function( resolve ) {
              resolve();
            });
          })
          .then(function() {
            return 5;
          })
          .then(function( val ) {
            expect( val ).to.equal( 5 );
            done();
          })
          .catch( done );
        });
        it( 'should pass resolved args along promise chains (asynchronous)' , function( done ) {
          new Promise(function( resolve ) {
            async(function() {
              resolve( 'a' );
            });
          })
          .then(function( val ) {
            expect( val ).to.equal( 'a' );
            return val + 'b';
          })
          .then(function( val ) {
            expect( val ).to.equal( 'ab' );
            return new Promise(function( resolve ) {
              async(function() {
                resolve( val + 'c' );
              });
            });
          })
          .then(function( val ) {
            expect( val ).to.equal( 'abc' );
            return new Promise(function( resolve ) {
              async(function() {
                resolve( val + 'd' );
              });
            });
          })
          .then(function( val ) {
            expect( val ).to.equal( 'abcd' );
            done();
          })
          .catch( done );
        });
        it( 'should pass resolved args along promise chains (synchronous)' , function( done ) {
          new Promise(function( resolve ) {
            resolve( 'a' );
          })
          .then(function( val ) {
            expect( val ).to.equal( 'a' );
            return val + 'b';
          })
          .then(function( val ) {
            expect( val ).to.equal( 'ab' );
            return new Promise(function( resolve ) {
              resolve( val + 'c' );
            });
          })
          .then(function( val ) {
            expect( val ).to.equal( 'abc' );
            return new Promise(function( resolve ) {
              resolve( val + 'd' );
            });
          })
          .then(function( val ) {
            expect( val ).to.equal( 'abcd' );
            done();
          })
          .catch( done );
        });
      });

      describe( '#catch()' , function() {
        it( 'should do nothing when reject is called twice' , function( done ) {
          new Promise(function( resolve , reject ) {
            reject();
            reject();
          })
          .catch(function() {
            done();
          });
        });
        it( 'should do nothing if the promise is resolved' , function( done ) {
          new Promise(function( resolve , reject ) {
            resolve();
            reject();
          })
          .then(function() {
            done();
          })
          .catch(function() {
            done();
          });
        });
        it( 'should catch errors thrown in the resolver function' , function( done ) {
          new Promise(function( resolve , reject ) {
            throw new Error( 'error' );
          })
          .catch(function( err ) {
            assert.instanceOf( err , Error );
            done();
          });
        });
        it( 'should catch errors thrown in then' , function( done ) {
          new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            throw new Error( 'error' );
          })
          .catch(function( err ) {
            assert.instanceOf( err , Error );
            done();
          });
        });
        it( 'should catch errors thrown in catch' , function( done ) {
          new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            throw new Error( 'error' );
          })
          .catch(function( err ) {
            async( done );
            throw new Error( 'error' );
          });
        });
        it( 'should receive the error thrown in the resolver function' , function( done ) {
          new Promise(function( resolve , reject ) {
            throw new Error( 'error' );
          })
          .catch(function( err ) {
            assert.instanceOf( err , Error );
            done();
          });
        });
        it( 'should receive the error thrown in then' , function( done ) {
          new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            throw new Error( 'error' );
          })
          .catch(function( err ) {
            assert.instanceOf( err , Error );
            done();
          });
        });
      });

      describe( '#all()' , function() {

        describe( '#then()' , function() {
          it( 'should be executed once all promises are resolved (asynchronous)' , function( done ) {
            all_then( Promise , false , function( result ) {
              done();
            })
            .catch( done );
          });
          it( 'should be executed once all promises are resolved (synchronous)' , function( done ) {
            all_then( Promise , true , function( result ) {
              done();
            })
            .catch( done );
          });
          it( 'should receive a result array equal to the array of resolved promises (asynchronous)' , function( done ) {
            all_then( Promise , false , function( result , test ) {
              expect( result.length ).to.equal( test.length );
              expect( result ).to.eql( test );
              done();
            })
            .catch( done );
          });
          it( 'should receive a result array equal to the array of resolved promises (synchronous)' , function( done ) {
            all_then( Promise , true , function( result , test ) {
              expect( result.length ).to.equal( test.length );
              expect( result ).to.eql( test );
              done();
            })
            .catch( done );
          });
          it( 'should pass returned args to the next then function' , function( done ) {

            var promises = [ 0 , 1 , 2 ].map(function( i ) {
              return new Promise(function( resolve ) {
                resolve( i + '-a' );
              })
              .then(function( val ) {
                expect( val ).to.equal( i + '-a' );
                return val + 'b';
              })
              .then(function( val ) {
                expect( val ).to.equal( i + '-ab' );
                return val + 'c';
              })
              .then(function( val ) {
                expect( val ).to.equal( i + '-abc' );
                return val;
              })
              .catch( done );
            });

            Promise.all( promises ).then(function( result ) {
              result.forEach(function( arg , i ) {
                expect( arg ).to.equal( i + '-abc' );
              });
              done();
            })
            .catch( done );
          });
          it( 'should allow for promise chaining (asynchronous)' , function( done ) {

            var promises = [ 0 , 1 , 2 ].map(function( i ) {

              var start = Date.now();
              var delay = 100;
              var tolerance = 50;
              var j = 0;

              return new Promise(function( resolve ) {
                async( resolve , delay );
              })
              .then(function() {
                j++;
                expect( Date.now() - start ).to.be.closeTo( j * delay , tolerance );
                return new Promise(function( resolve ) {
                  async( resolve , delay );
                });
              })
              .then(function() {
                j++;
                expect( Date.now() - start ).to.be.closeTo( j * delay , tolerance );
                return new Promise(function( resolve ) {
                  async( resolve , delay );
                });
              })
              .then(function() {
                j++;
                expect( Date.now() - start ).to.be.closeTo( j * delay , tolerance );
                return 5;
              })
              .then(function( val ) {
                expect( val ).to.equal( 5 );
                expect( Date.now() - start ).to.be.closeTo( j * delay , tolerance );
                return val + i;
              });
            });

            Promise.all( promises ).then(function( result ) {
              result.forEach(function( arg , i ) {
                expect( arg ).to.equal( 5 + i );
              });
              done();
            })
            .catch( done );
          });
          it( 'should allow for promise chaining (synchronous)' , function( done ) {

            var promises = [ 0 , 1 , 2 ].map(function( i ) {

              var start = Date.now();
              var tolerance = 20;

              return new Promise(function( resolve ) {
                resolve();
              })
              .then(function() {
                expect( Date.now() - start ).to.be.closeTo( 0 , tolerance );
                return new Promise(function( resolve ) {
                  resolve();
                });
              })
              .then(function() {
                expect( Date.now() - start ).to.be.closeTo( 0 , tolerance );
                return new Promise(function( resolve ) {
                  resolve();
                });
              })
              .then(function() {
                expect( Date.now() - start ).to.be.closeTo( 0 , tolerance );
                return 5;
              })
              .then(function( val ) {
                expect( val ).to.equal( 5 );
                expect( Date.now() - start ).to.be.closeTo( 0 , tolerance );
                return val + i;
              });
            });

            Promise.all( promises ).then(function( result ) {
              result.forEach(function( arg , i ) {
                expect( arg ).to.equal( 5 + i );
              });
              done();
            })
            .catch( done );
          });
          it( 'should pass resolved args along promise chains (asynchronous)' , function( done ) {

            var promises = [ 0 , 1 , 2 ].map(function( i ) {
              return new Promise(function( resolve ) {
                async(function() {
                  resolve( i + '-a' );
                });
              })
              .then(function( val ) {
                return val + 'b';
              })
              .then(function( val ) {
                return new Promise(function( resolve ) {
                  async(function() {
                    resolve( val + 'c' );
                  });
                });
              });
            });

            Promise.all( promises ).then(function( result ) {
              result.forEach(function( arg , i ) {
                expect( arg ).to.equal( i + '-abc' );
              });
              done();
            })
            .catch( done );
          });
          it( 'should pass resolved args along promise chains (synchronous)' , function( done ) {

            var promises = [ 0 , 1 , 2 ].map(function( i ) {
              return new Promise(function( resolve ) {
                resolve( i + '-a' );
              })
              .then(function( val ) {
                return val + 'b';
              })
              .then(function( val ) {
                return new Promise(function( resolve ) {
                  resolve( val + 'c' );
                });
              });
            });

            Promise.all( promises ).then(function( result ) {
              result.forEach(function( arg , i ) {
                expect( arg ).to.equal( i + '-abc' );
              });
              done();
            })
            .catch( done );
          });
        });

        describe( '#catch()' , function() {
          it( 'should be executed if a promise is rejected (asynchronous)' , function( done ) {
            all_catch( Promise , false , function( result ) {
              done();
            });
          });
          it( 'should be executed if a promise is rejected (synchronous)' , function( done ) {
            all_catch( Promise , true , function( result ) {
              done();
            });
          });
          it( 'should receive arguments from the first promise that was rejected (asynchronous)' , function( done ) {
            all_catch( Promise , false , function( result , test ) {
              expect( result ).to.equal( test );
              done();
            })
            .catch(function( err ) {
              if (err instanceof Error) {
                done( err );
              }
            });
          });
          it( 'should receive arguments from the first promise that was rejected (synchronous)' , function( done ) {
            all_catch( Promise , true , function( result , test ) {
              expect( result ).to.equal( test );
              done();
            })
            .catch(function( err ) {
              if (err instanceof Error) {
                done( err );
              }
            });
          });
          it( 'should handle promise chains' , function( done ) {

            var index = Math.floor( Math.random() * 3 );

            var promises = [ 0 , 1 , 2 ].map(function( i ) {
              return new Promise(function( resolve ) {
                async( resolve );
              })
              .then(function( val ) {
                return new Promise(function( resolve , reject ) {
                  if (i === index) {
                    throw new Error( i );
                  }
                  else {
                    async( resolve );
                  }
                });
              });
            });

            Promise.all( promises ).catch(function( err ) {
              expect( err.message ).to.equal( index.toString() );
              done();
            })
            .catch( done );
          });
        });
      });

      describe( '#race()' , function() {

        describe( '#then()' , function() {
          it( 'should be executed once the first promise is resolved (asynchronous)' , function( done ) {
            race_then( Promise , false , function( result ) {
              done();
            })
            .catch( done );
          });
          it( 'should be executed once the first promise is resolved (synchronous)' , function( done ) {
            race_then( Promise , true , function( result ) {
              done();
            })
            .catch( done );
          });
          it( 'should receive arguments from the first promise that was resolved (asynchronous)' , function( done ) {
            race_then( Promise , false , function( result , test ) {
              expect( result ).to.equal( test );
              done();
            })
            .catch( done );
          });
          it( 'should receive arguments from the first promise that was resolved (synchronous)' , function( done ) {
            race_then( Promise , true , function( result , test ) {
              expect( result ).to.equal( test );
              done();
            })
            .catch( done );
          });
          it( 'should handle promise chains' , function( done ) {

            var index = Math.floor( Math.random() * 3 );
            var delay = 50;

            var promises = [ 0 , 1 , 2 ].map(function( i ) {
              return new Promise(function( resolve ) {
                async(function() {
                  resolve( i );
                });
              })
              .then(function( val ) {
                return new Promise(function( resolve ) {
                  async(function() {
                    resolve( i );
                  } , ( i === index ? 1 : delay ));
                });
              });
            });

            Promise.race( promises ).then(function( result ) {
              expect( result ).to.equal( index );
              done();
            })
            .catch( done );
          });
        });
      });
    });
  });


  function log() {
    var args = Array.prototype.slice.call( arguments , 0 );
    args = args.map(function( arg ) {
      return util.inspect.apply( util , [ arg , { colors: true, depth: 3 }]);
    });
    console.log.apply( console , args );
  }

  
  function all_then( Promise , sync , callback ) {

    var count = 5, promises = [], test = [];

    for (var i = 0; i < count; i++) {
      promises.push(
        (function( i ) {
          return new Promise(function( resolve , reject ) {
            if (sync) {
              resolve( i );
            }
            else {
              async(function() {
                resolve( i );
              });
            }
          });
        }( i ))
      );
      test.push( i );
    }

    return Promise.all( promises ).then(function( result ) {
      callback( result , test );
    });
  }


  function all_catch( Promise , sync , callback ) {

    var count = 5;
    var target = [ 2 , 3 ];
    var promises = [];
    var arr = [];

    function determine( i , resolve , reject ) {
      if (target.indexOf( i ) >= 0) {
        reject( i );
      }
      else {
        resolve( i );
      }
    }

    for (var i = 0; i < count; i++) {
      promises.push(
        (function( i ) {
          return new Promise(function( resolve , reject ) {
            if (sync) {
              determine( i , resolve , reject );
            }
            else {
              async(function() {
                determine( i , resolve , reject );
              });
            }
          });
        }( i ))
      );
    }

    return Promise.all( promises ).catch(function( result ) {
      callback( result , target[0] );
    });
  }


  function race_then( Promise , sync , callback ) {

    var count = 5;
    var target = [ 2 , 3 ];
    var test = sync ? 0 : target[0];
    var promises = [];

    for (var i = 0; i < count; i++) {
      promises.push(
        (function( i ) {
          return new Promise(function( resolve , reject ) {
            if (sync) {
              resolve( i );
            }
            else {
              var t = (target.indexOf( i ) >= 0 ? 1 : count);
              async(function() {
                resolve( i );
              }, t );
            }
          });
        }( i ))
      );
    }

    return Promise.race( promises ).then(function( result ) {
      callback( result , test );
    });
  }


  function async( callback , delay ) {
    setTimeout( callback , ( delay || 1 ));
  }


}());




























