(function(){
  'use strict';
  var Promise = WeePromise;
  describe( '#constructor' , function(){
    it( 'should fail silently when an error is thrown' , function(){
      var caught;
      return new Promise(function( resolve , reject ){
        setTimeout( resolve );
        throw new Error( 'error' );
      })
      .catch(function() {
        caught = true;
      })
      .then(function() {
        expect(caught).to.be.ok;
      });
    });
  });
  describe( '#then' , function(){
    it( 'should do nothing when resolve is called twice' , function( done ){
      new Promise(function( resolve , reject ){
        resolve();
        resolve();
      })
      .then(function(){
        done();
      })
      .catch( done );
    });
    it( 'should do nothing if the promise is rejected' , function( done ){
      new Promise(function( resolve , reject ){
        reject();
        resolve();
      })
      .then(function(){
        done();
      })
      .catch( done );
    });
    it( 'should fail silently when an error is thrown' , function(){
      var caught;
      return new Promise(function( resolve , reject ){
        setTimeout(resolve);
      })
      .then(function(){
        throw new Error( 'error' );
      })
      .catch(function() {
        caught = true;
      })
      .then(function() {
        expect(caught).to.be.ok;
      });
    });
    it( 'should pass returned args to the next then function' , function( done ){
      new Promise(function( resolve ){
        setTimeout(function(){
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
    it( 'should allow for promise chaining (asynchronous)' , function( done ){
      var start = Date.now(),
        delay = 100,
        i = 0;
      new Promise(function( resolve ){
        setTimeout( resolve , delay );
      })
      .then(function(){
        i++;
        expect( Date.now() - start ).to.be.at.least( i * delay );
        return new Promise(function( resolve ){
          setTimeout( resolve , delay );
        });
      })
      .then(function(){
        i++;
        expect( Date.now() - start ).to.be.at.least( i * delay );
        return new Promise(function( resolve ){
          setTimeout( resolve , delay );
        });
      })
      .then(function(){
        i++;
        expect( Date.now() - start ).to.be.at.least( i * delay );
        return 5;
      })
      .then(function( val ) {
        expect( val ).to.equal( 5 );
        expect( Date.now() - start ).to.be.at.least( i * delay );
        done();
      })
      .catch( done );
    });
    it( 'should allow for promise chaining (synchronous)' , function( done ){
      new Promise(function( resolve ){
        resolve( 1 );
      })
      .then(function( result ){
        return new Promise(function( resolve ){
          resolve( result + 1 );
        });
      })
      .then(function( result ){
        return result + 1;
      })
      .then(function( result ) {
        expect( result ).to.equal( 3 );
        done();
      })
      .catch( done );
    });
    it( 'should pass resolved args along promise chains (asynchronous)' , function( done ){
      new Promise(function( resolve ){
        setTimeout(function(){
          resolve( 'a' );
        });
      })
      .then(function( val ) {
        expect( val ).to.equal( 'a' );
        return val + 'b';
      })
      .then(function( val ) {
        expect( val ).to.equal( 'ab' );
        return new Promise(function( resolve ){
          setTimeout(function(){
            resolve( val + 'c' );
          });
        });
      })
      .then(function( val ) {
        expect( val ).to.equal( 'abc' );
        return new Promise(function( resolve ){
          setTimeout(function(){
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
    it( 'should pass resolved args along promise chains (synchronous)' , function( done ){
      new Promise(function( resolve ){
        resolve( 'a' );
      })
      .then(function( val ) {
        expect( val ).to.equal( 'a' );
        return val + 'b';
      })
      .then(function( val ) {
        expect( val ).to.equal( 'ab' );
        return new Promise(function( resolve ){
          resolve( val + 'c' );
        });
      })
      .then(function( val ) {
        expect( val ).to.equal( 'abc' );
        return val + 'd';
      })
      .then(function( val ) {
        expect( val ).to.equal( 'abcd' );
        done();
      })
      .catch( done );
    });
  });
  describe( '#catch' , function(){
    it( 'should do nothing when reject is called twice' , function( done ){
      new Promise(function( resolve , reject ){
        reject();
        reject();
      })
      .catch(function(){
        done();
      });
    });
    it( 'should do nothing if the promise is resolved' , function( done ){
      new Promise(function( resolve , reject ){
        resolve();
        reject();
      })
      .then(function(){
        done();
      })
      .catch( done );
    });
    it( 'should catch errors thrown in the resolver function' , function( done ){
      new Promise(function( resolve , reject ){
        throw new Error( 'error' );
      })
      .catch(function( err ){
        expect( err ).to.be.an.instanceOf( Error );
        done();
      })
      .catch( done );
    });
    it( 'should catch errors thrown in then' , function( done ){
      new Promise(function( resolve , reject ){
        resolve();
      })
      .then(function(){
        throw new Error( 'error' );
      })
      .catch(function( err ){
        expect( err ).to.be.an.instanceOf( Error );
        done();
      })
      .catch( done );
    });
    it( 'should catch errors thrown in catch' , function( done ){
      new Promise(function( resolve , reject ){
        resolve();
      })
      .then(function(){
        throw new Error( 'error1' );
      })
      .catch(function( err ){
        throw new Error( 'error2' );
      })
      .catch(function( err ){
        expect( err.message ).to.equal( 'error2' );
        expect( err ).to.be.an.instanceOf( Error );
        done();
      })
      .catch( done );
    });
    it( 'should receive the error thrown in the resolver function' , function( done ){
      new Promise(function( resolve , reject ){
        throw new Error( 'error' );
      })
      .catch(function( err ){
        expect( err ).to.be.an.instanceOf( Error );
        done();
      })
      .catch( done );
    });
    it( 'should receive the error thrown in then' , function( done ){
      new Promise(function( resolve , reject ){
        resolve();
      })
      .then(function(){
        throw new Error( 'error' );
      })
      .catch(function( err ){
        expect( err ).to.be.an.instanceOf( Error );
        done();
      })
      .catch( done );
    });
  });
  describe( '::all' , function(){
    it( 'should handle mixed types' , function( done ){
      var initial = [ 0 , 1 , 2 , 3 , 4 ];
      var arr = initial.map(function( i ){
        var returnOriginal = Math.round(Math.random()) > 0;
        return returnOriginal ? i : Promise.resolve( i );
      });
      Promise.all( arr ).then(function( result ){
        expect( result ).to.eql( initial );
        done();
      })
      .catch( done );
    });
    it( 'should asynchronously resolve an array of non-promises' , function( done ){
      var initial = [ 0 , 1 , 2 ];
      var error = new Error( 'test' );
      var promise = Promise.all( initial ).then(function( result ){
        expect( result ).to.eql( initial );
        expect( promise ).to.be.ok;
        throw error;
      })
      .catch(function( err ){
        expect( err ).to.equal( error );
        expect( promise ).to.be.ok;
        done();
      })
      .catch( done );
    });
    it( 'should support nested collections' , function( done ){
      var collections = [ 0 , 1 , 2 ];
      var superset = collections.map(function( i ){
        var subset = [( i ),( i + 1 ),( i + 2 )].map(function( j ){
          return new Promise(function( resolve ){
            setTimeout(function(){
              resolve( j );
            });
          });
        });
        return Promise.all( subset );
      });
      Promise.all( superset ).then(function( result ){
        expect( result ).to.have.length( collections.length );
        result.forEach(function( subset ){
          expect( subset ).to.have.length( collections.length );
        });
        done();
      })
      .catch( done );
    });
    describe( '#then' , function(){
      it( 'should be executed once all promises are resolved (asynchronous)' , function( done ){
        all_then().then(function(){
          done();
        })
        .catch( done );
      });
      it( 'should be executed once all promises are resolved (synchronous)' , function( done ){
        all_then( true ).then(function(){
          done();
        })
        .catch( done );
      });
      it( 'should receive a result array equal to the array of resolved promises (asynchronous)' , function( done ){
        all_then().then(_.spread(function( result , test ){
          expect( arguments ).to.have.length( 2 );
          expect( result.length ).to.equal( test.length );
          expect( result ).to.eql( test );
          done();
        }))
        .catch( done );
      });
      it( 'should receive a result array equal to the array of resolved promises (synchronous)' , function( done ){
        all_then( true ).then(_.spread(function( result , test ){
          expect( arguments ).to.have.length( 2 );
          expect( result.length ).to.equal( test.length );
          expect( result ).to.eql( test );
          done();
        }))
        .catch( done );
      });
      it( 'should pass returned args to the next then function' , function( done ){
        var promises = [ 0 , 1 , 2 ].map(function( i ){
          return new Promise(function( resolve ){
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
          });
        });
        Promise.all( promises ).then(function( result ){
          result.forEach(function( arg , i ) {
            expect( arg ).to.equal( i + '-abc' );
          });
          done();
        })
        .catch( done );
      });
      it( 'should allow for promise chaining (asynchronous)' , function( done ){
        var promises = [ 0 , 1 , 2 ].map(function( i ){
          var start = Date.now(),
            delay = 100,
            j = 0;
          return new Promise(function( resolve ){
            setTimeout( resolve , delay );
          })
          .then(function(){
            j++;
            expect( Date.now() - start ).to.be.at.least( j * delay );
            return new Promise(function( resolve ){
              setTimeout( resolve , delay );
            });
          })
          .then(function(){
            j++;
            expect( Date.now() - start ).to.be.at.least( j * delay );
            return new Promise(function( resolve ){
              setTimeout( resolve , delay );
            });
          })
          .then(function(){
            j++;
            expect( Date.now() - start ).to.be.at.least( j * delay );
            return 5;
          })
          .then(function( val ) {
            expect( val ).to.equal( 5 );
            expect( Date.now() - start ).to.be.at.least( j * delay );
            return val + i;
          });
        });
        Promise.all( promises ).then(function( result ){
          result.forEach(function( arg , i ) {
            expect( arg ).to.equal( 5 + i );
          });
          done();
        })
        .catch( done );
      });
      it( 'should allow for promise chaining (synchronous)' , function( done ){
        var promises = [ 0 , 1 , 2 ].map(function( i ){
          var start = Date.now(),
            index = 0,
            tolerance = 50;
          return new Promise(function( resolve ){
            resolve();
          })
          .then(function(){
            index++;
            expect( Date.now() - start ).to.be.at.most( tolerance * index );
            return new Promise(function( resolve ){
              resolve();
            });
          })
          .then(function(){
            index++;
            expect( Date.now() - start ).to.be.at.most( tolerance * index );
            return new Promise(function( resolve ){
              resolve();
            });
          })
          .then(function(){
            index++;
            expect( Date.now() - start ).to.be.at.most( tolerance * index );
            return 5;
          })
          .then(function( val ) {
            expect( val ).to.equal( 5 );
            expect( Date.now() - start ).to.be.at.most( tolerance * index );
            return val + i;
          });
        });
        Promise.all( promises ).then(function( result ){
          result.forEach(function( arg , i ) {
            expect( arg ).to.equal( 5 + i );
          });
          done();
        })
        .catch( done );
      });
      it( 'should pass resolved args along promise chains (asynchronous)' , function( done ){
        var promises = [ 0 , 1 , 2 ].map(function( i ){
          return new Promise(function( resolve ){
            setTimeout(function(){
              resolve( i + '-a' );
            });
          })
          .then(function( val ) {
            return val + 'b';
          })
          .then(function( val ) {
            return new Promise(function( resolve ){
              setTimeout(function(){
                resolve( val + 'c' );
              });
            });
          });
        });
        Promise.all( promises ).then(function( result ){
          result.forEach(function( arg , i ) {
            expect( arg ).to.equal( i + '-abc' );
          });
          done();
        })
        .catch( done );
      });
      it( 'should pass resolved args along promise chains (synchronous)' , function( done ){
        var promises = [ 0 , 1 , 2 ].map(function( i ){
          return new Promise(function( resolve ){
            resolve( i + '-a' );
          })
          .then(function( val ) {
            return val + 'b';
          })
          .then(function( val ) {
            return new Promise(function( resolve ){
              resolve( val + 'c' );
            });
          });
        });
        Promise.all( promises ).then(function( result ){
          result.forEach(function( arg , i ) {
            expect( arg ).to.equal( i + '-abc' );
          });
          done();
        })
        .catch( done );
      });
    });
    describe( '#catch' , function(){
      it( 'should be executed if a promise is rejected (asynchronous)' , function( done ){
        all_catch().then(function( reason ){
          expect( reason ).to.be.ok;
          done();
        })
        .catch( done );
      });
      it( 'should be executed if a promise is rejected (synchronous)' , function(){
        return all_catch( true ).then(function( reason ){
          expect( reason ).to.be.ok;
        });
      });
      it( 'should receive arguments from the first promise that was rejected (asynchronous)' , function( done ){
        all_catch().then(_.spread(function( result , test ){
          expect( result ).to.be.ok;
          expect( result ).to.equal( test );
          done();
        }))
        .catch( done );;
      });
      it( 'should receive arguments from the first promise that was rejected (synchronous)' , function( done ){
        all_catch( true ).then(_.spread(function( result , test ){
          expect( arguments ).to.have.length( 2 );
          expect( result ).to.be.ok;
          expect( result ).to.equal( test );
          done();
        }))
        .catch( done );
      });
      it( 'should handle promise chains' , function( done ){
        var index = Math.floor( Math.random() * 3 );
        var promises = [ 0 , 1 , 2 ].map(function( i ){
          return new Promise(function( resolve ){
            setTimeout( resolve );
          })
          .then(function( val ) {
            return new Promise(function( resolve , reject ){
              if (i === index) {
                throw new Error( i );
              }
              else {
                setTimeout( resolve );
              }
            });
          });
        });
        Promise.all( promises ).catch(function( err ){
          expect( err.message ).to.equal( index.toString() );
          done();
        })
        .catch( done );
      });
    });
  });
  describe( '::race' , function(){
    describe( '#then' , function(){
      it( 'should be executed once the first promise is resolved (asynchronous)' , function( done ){
        race_then().then(function(){
          done();
        })
        .catch( done );
      });
      it( 'should be executed once the first promise is resolved (synchronous)' , function( done ){
        race_then( true ).then(function(){
          done();
        })
        .catch( done );
      });
      it( 'should receive arguments from the first promise that was resolved (asynchronous)' , function( done ){
        race_then().then(_.spread(function( result , test ){
          expect( arguments ).to.have.length( 2 );
          expect( result ).to.equal( test );
          done();
        }))
        .catch( done );
      });
      it( 'should receive arguments from the first promise that was resolved (synchronous)' , function( done ){
        race_then( true ).then(_.spread(function( result , test ){
          expect( arguments ).to.have.length( 2 );
          expect( result ).to.equal( test );
          done();
        }))
        .catch( done );
      });
      it( 'should handle promise chains' , function( done ){
        var index = Math.floor( Math.random() * 3 );
        var delay = 50;
        var promises = [ 0 , 1 , 2 ].map(function( i ){
          return new Promise(function( resolve ){
            setTimeout(function(){
              resolve( i );
            });
          })
          .then(function( val ) {
            return new Promise(function( resolve ){
              setTimeout(function(){
                resolve( i );
              } , ( i === index ? 1 : delay ));
            });
          });
        });
        Promise.race( promises ).then(function( result ){
          expect( result ).to.equal( index );
          done();
        })
        .catch( done );
      });
    });
  });
  describe( '::async' , function(){
    it( 'should always flush the internal stack sequentially' , function( done ){
      var actual = [],
        expected = (function( length ){
          var arr = [];
          for (var i = 0; i < length; i++) {
            arr.push( i );
          }
          return arr;
        }( 15 )),
        enqueue = function( args ){
          while (args.length) {
            (function( arg ){
              Promise.async(function(){
                actual.push( arg );
              });
            }( args.shift() ));
          }
        };
      Promise.async(function(){
        enqueue([ 3 , 4 , 5 ]);
        Promise.async(function(){
          enqueue([ 9 , 10 , 11 ]);
          Promise.async(function(){
            Promise.async(function(){
              Promise.async(function(){
                enqueue([ 14 ]);
              });
              enqueue([ 13 ]);
            });
            enqueue([ 12 ]);
          });
        });
        enqueue([ 6 , 7 , 8 ]);
      });
      enqueue([ 0 , 1 , 2 ]);
      setTimeout(function(){
        expect( actual ).to.eql( expected );
        done();
      });
    });
    it( 'should gracefully handle errors' , function( done ){
      var gotCalls = 0,
        $onerror = window.onerror;
      window.onerror = function( message ){
        if (!/test/.test( message )) {
          $onerror.apply( window , arguments );
        }
        window.onerror = $onerror;
      };
      Promise.async(function(){
        Promise.async(function(){
          Promise.async(function(){
            Promise.async(function(){
              expect( gotCalls ).to.equal( 2 );
              done();
            });
            gotCalls++;
          });
          throw new Error( 'test' );
          gotCalls++;
        });
        gotCalls++;
      });
    });
  });
  function all_then( sync ){
    var i = 0,
      count = 5,
      promises = [],
      test = [];
    for (; i < count; i++) {
      promises.push(
        (function( i ){
          return new Promise(function( resolve , reject ){
            if (sync) {
              resolve( i );
            }
            else {
              setTimeout(function(){
                resolve( i );
              });
            }
          });
        }( i ))
      );
      test.push( i );
    }
    return Promise.all( promises ).then(function( result ){
      return [ result , test ];
    });
  }
  function all_catch( sync ){
    var count = 5,
      target = [ 2 , 3 ][ Math.round(Math.random()) ],
      promises = [];
    function determine( i , resolve , reject ) {
      if (target == i) {
        reject( i );
      }
      else {
        resolve( i );
      }
    }
    for (var i = 0; i < count; i++) {
      promises.push(
        (function( i ){
          return new Promise(function( resolve , reject ){
            if (sync) {
              determine( i , resolve , reject );
            }
            else {
              setTimeout(function(){
                determine( i , resolve , reject );
              },i);
            }
          });
        }( i ))
      );
    }
    return Promise.all( promises ).catch(function( result ){
      return [ result , target ];
    });
  }
  function race_then( sync ){
    var count = 5,
      target = [ 2 , 3 ],
      test = sync ? 0 : target[0],
      promises = [];
    for (var i = 0; i < count; i++) {
      promises.push(
        (function( i ){
          return new Promise(function( resolve , reject ){
            if (sync) {
              resolve( i );
            }
            else {
              var t = (target.indexOf( i ) >= 0 ? 1 : count * 10);
              setTimeout(function(){
                resolve( i );
              },t);
            }
          });
        }( i ))
      );
    }
    return Promise.race( promises ).then(function( result ){
      return [ result , test ];
    });
  }
}());
