(function() {

  'use strict';


  var util = require( 'util' );
  var http = require( 'http' );
  var WeePromise = require( '../index.js' );
  var ES6_Promise = require( 'es6-promise' ).Promise;
  var chai = require( 'chai' );
  var colors = require( 'colors' );
  var expect = chai.expect;


  function theme( name , text ) {
    text = text.toString();
    switch (name) {
      case 'h1':
        return text.bold.underline.white;
      case 'h2':
      case 'h3':
        return text.magenta;
      default:
        return text;
    }
  }


  [
    [ WeePromise , 'wee-promise' ],
    [ ES6_Promise , 'es6-promise' ]
  ]
  .forEach(function( args ) {


    var Promise = args[0];
    var name = args[1];
    

    describe(theme( 'h1' , name ) , function() {

      describe(theme( 'h2' , 'Constructor' ) , function() {
        it( 'should fail silently when an error is thrown' , function( done ) {
          new Promise(function( resolve , reject ) {
            async( done );
            throw new Error( 'error' );
          });
        });
      });

      describe(theme( 'h2' , '#then()' ) , function() {
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

      describe(theme( 'h2' , '#catch()' ) , function() {
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
            expect( err ).to.be.an.instanceOf( Error );
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
            expect( err ).to.be.an.instanceOf( Error );
            done();
          });
        });
        it( 'should catch errors thrown in catch' , function( done ) {
          new Promise(function( resolve , reject ) {
            resolve();
          })
          .then(function() {
            throw new Error( 'error1' );
          })
          .catch(function( err ) {
            throw new Error( 'error2' );
          })
          .catch(function( err ) {
            expect( err.message ).to.equal( 'error2' );
            expect( err ).to.be.an.instanceOf( Error );
            done();
          });
        });
        it( 'should receive the error thrown in the resolver function' , function( done ) {
          new Promise(function( resolve , reject ) {
            throw new Error( 'error' );
          })
          .catch(function( err ) {
            expect( err ).to.be.an.instanceOf( Error );
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
            expect( err ).to.be.an.instanceOf( Error );
            done();
          });
        });
      });

      describe(theme( 'h2' , '#all()' ) , function() {

        describe(theme( 'h3' , '#then()' ) , function() {
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

        describe(theme( 'h3' , '#catch()' ) , function() {
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
            .catch( done );
          });
          it( 'should receive arguments from the first promise that was rejected (synchronous)' , function( done ) {
            all_catch( Promise , true , function( result , test ) {
              expect( result ).to.equal( test );
              done();
            })
            .catch( done );
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

      describe(theme( 'h2' , '#race()' ) , function() {

        describe(theme( 'h3' , '#then()' ) , function() {
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

      describe(theme( 'h2' , 'Functional Tests' ) , function() {

        it( 'when a single promise is rejected' , function( done ) {
          new Promise(function( resolve , reject ) {
            throw new Error( 'error' );
          })
          .then(function() {
            expect( true ).to.equal( false );
          })
          .catch(function( err ) {
            expect( err ).to.be.an.instanceOf( Error );
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
              expect( true ).to.equal( false );
              return true;
            });
          })
          .then(function( args ) {
            expect( true ).to.equal( false );
            done();
          })
          .catch(function( err ) {
            expect( err ).to.be.an.instanceOf( Error );
            done();
          });
        });

        it( 'when a single promise chain is rejected WITH a catch handler on the child' , function( done ) {

          var route = [],
          routeFinal = [ 0 , 1 , 2 ];

          new Promise(function( resolve , reject ) {
            route.push( 0 );
            resolve();
          })
          .then(function() {
            return new Promise(function( resolve , reject ) {
              route.push( 1 );
              throw new Error( 'error' );
            })
            .then(function() {
              expect( true ).to.equal( false );
              return true;
            })
            .catch(function() {
              route.push( 2 );
              return false;
            });
          })
          .then(function( args ) {
            expect( route ).to.eql( routeFinal );
            expect( args ).to.equal( false );
            done();
          })
          .catch( done );
        });

        it( 'when a promise list WITHOUT individual catch handlers is rejected' , function( done ) {

          var routes = [],
          routesFinal = [
            [ '0-0' , '0-1' ],
            [ '1-0' , '1-1' ]
          ],
          promises = [ 0 , 1 ].map(function( i ) {

            var route = routes[i] = [];

            return new Promise(function( resolve , reject ) {
              route.push( i + '-0' );
              if (i) {
                route.push( i + '-1' );
                throw new Error( 'error' );
              }
              else {
                resolve();
              }
            })
            .then(function() {
              route.push( i + '-1' );
            });

          });

          Promise.all( promises ).then(function( args ) {
            expect( true ).to.equal( false );
          })
          .catch(function( err ) {
            expect( err ).to.be.an.instanceOf( Error );
            expect( err.message ).to.equal( 'error' );
            expect( routes ).to.eql( routesFinal );
            done();
          });
        });

        it( 'when a promise list WITH individual catch handlers is rejected' , function( done ) {

          var routes = [],
          routesFinal = [
            [ '0-0' , '0-1' ],
            [ '1-0' , '1-1' ]
          ],
          argsFinal = [ true , false ],
          promises = [ 0 , 1 ].map(function( i ) {

            var route = routes[i] = [];

            return new Promise(function( resolve , reject ) {
              route.push( i + '-0' );
              if (i) {
                throw new Error( 'error' );
              }
              else {
                resolve();
              }
            })
            .then(function() {
              route.push( i + '-1' );
              return true;
            })
            .catch(function() {
              route.push( i + '-1' );
              return false;
            });
          });

          Promise.all( promises ).then(function( args ) {
            expect( args ).to.eql( argsFinal );
            expect( routes ).to.eql( routesFinal );
            done();
          })
          .catch( done );
        });

        it( 'when a promise list chain WITHOUT individual catch handlers is rejected' , function( done ) {

          var routes = [],
          routesFinal = [
            [ '0-0' , '0-1' , '0-2' ],
            [ '1-0' , '1-1' , '1-2' ]
          ],
          promises = [ 0 , 1 ].map(function( i ) {

            var route = routes[i] = [];

            return new Promise(function( resolve , reject ) {
              route.push( i + '-0' );
              resolve();
            })
            .then(function() {
              return new Promise(function( resolve , reject ) {
                route.push( i + '-1' );
                if (!i) {
                  resolve();
                }
                else {
                  route.push( i + '-2' );
                  throw new Error( 'error' );
                }
              });
            })
            .then(function() {
              route.push( i + '-2' );
              return true;
            });

          });

          Promise.all( promises ).then(function( args ) {
            expect( true ).to.equal( false );
          })
          .catch(function( err ) {
            async(function() {
              expect( err ).to.be.an.instanceOf( Error );
              expect( routes ).to.eql( routesFinal );
              done();
            })
          })
          .catch( done );
        });

        it( 'when a promise list chain WITH individual catch handlers is rejected' , function( done ) {

          var routes = [],
          routesFinal = [
            [ 0 , 1 , 2 , 'then-0' ],
            [ 0 , 1 , 2 , 'catch-1' ]
          ],
          argsFinal = [ true , false ],
          promises = [ 0 , 1 ].map(function( i ) {

            var route = routes[i] = [];

            return new Promise(function( resolve , reject ) {
              route.push( 0 );
              resolve();
            })
            .then(function() {
              return new Promise(function( resolve , reject ) {
                route.push( 1 );
                if (!i) {
                  resolve();
                }
                else {
                  throw new Error( 'error' );
                }
              });
            })
            .then(function() {
              route.push( 2 );
              route.push( 'then-' + i );
              return true;
            })
            .catch(function() {
              route.push( 2 );
              route.push( 'catch-' + i );
              return false;
            });

          });

          Promise.all( promises ).then(function( args ) {
            expect( args ).to.eql( argsFinal );
            expect( routes ).to.eql( routesFinal );
            done();
          })
          .catch( done );
        });

        it( 'when multiple promises in a list WITH individual catch handlers are rejected' , function( done ) {

          var target = [ 2 , 3 ],
          argsFinal = [ 0 , 1 , false , false , 4 ],
          promises = [ 0 , 1 , 2 , 3 , 4 ].map(function( i ) {
            return new Promise(function( resolve , reject ) {
                async(function() {
                  if (target.indexOf( i ) >= 0) {
                    reject( i );
                  }
                  else {
                    resolve( i );
                  }
                });
              })
              .then(function( val ) {
                return val;
              })
              .catch(function( val ) {
                return false;
              });
          });

          Promise.all( promises ).then(function( args ) {
            expect( args ).to.eql( argsFinal );
            done();
          })
          .catch( done );
        });

        it( 'should fail recursively until maxAttempts is reached' , function( done ) {

          var attempts = 0,
          maxAttempts = 3,
          result = [ true , false , true , true ];

          loadImages( overlays() ).then(function( args ) {
            expect( args ).to.eql( result );
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
              return new Promise(function( resolve , reject ) {
                http.get( imgObj.src )
                .on( 'response' , function( res ) {
                  var statusCode = parseInt( res.statusCode , 10 );
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
                return true;
              })
              .catch(function() {
                imgObj.attempts++;
                if (imgObj.attempts <= maxAttempts) {
                  return load( imgObj , key );
                }
                return false;
              });
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




























