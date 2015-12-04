(function(){
  'use strict';
  var Promise = WeePromise;
  describe( 'Functional Tests' , function(){
    it( 'when a single promise is rejected' , function( done ){
      new Promise(function( resolve , reject ){
        throw new Error( 'error' );
      })
      .then(function(){
        expect( true ).to.equal( false );
      })
      .catch(function( err ){
        expect( err ).to.be.an.instanceOf( Error );
        done();
      });
    });
    it( 'when a single promise chain is rejected WITHOUT a catch handler on the child' , function( done ){
      new Promise(function( resolve , reject ){
        resolve();
      })
      .then(function(){
        return new Promise(function( resolve , reject ){
          throw new Error( 'error' );
        })
        .then(function(){
          expect( true ).to.equal( false );
          return true;
        });
      })
      .then(function( args ) {
        expect( true ).to.equal( false );
        done();
      })
      .catch(function( err ){
        expect( err ).to.be.an.instanceOf( Error );
        done();
      });
    });
    it( 'when a single promise chain is rejected WITH a catch handler on the child' , function( done ){
      var route = [],
      routeFinal = [ 0 , 1 , 2 ];

      new Promise(function( resolve , reject ){
        route.push( 0 );
        resolve();
      })
      .then(function(){
        return new Promise(function( resolve , reject ){
          route.push( 1 );
          throw new Error( 'error' );
        })
        .then(function(){
          expect( true ).to.equal( false );
          return true;
        })
        .catch(function(){
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
    it( 'when a promise list WITHOUT individual catch handlers is rejected' , function( done ){
      var routes = [],
      routesFinal = [
        [ '0-0' , '0-1' ],
        [ '1-0' , '1-1' ]
      ],
      promises = [ 0 , 1 ].map(function( i ){

        var route = routes[i] = [];

        return new Promise(function( resolve , reject ){
          route.push( i + '-0' );
          if (i) {
            route.push( i + '-1' );
            throw new Error( 'error' );
          }
          else {
            resolve();
          }
        })
        .then(function(){
          route.push( i + '-1' );
        });

      });

      Promise.all( promises ).then(function( args ) {
        expect( true ).to.equal( false );
      })
      .catch(function( err ){
        expect( err ).to.be.an.instanceOf( Error );
        expect( err.message ).to.equal( 'error' );
        expect( routes ).to.eql( routesFinal );
        done();
      });
    });
    it( 'when a promise list WITH individual catch handlers is rejected' , function( done ){
      var routes = [],
      routesFinal = [
        [ '0-0' , '0-1' ],
        [ '1-0' , '1-1' ]
      ],
      argsFinal = [ true , false ],
      promises = [ 0 , 1 ].map(function( i ){

        var route = routes[i] = [];

        return new Promise(function( resolve , reject ){
          route.push( i + '-0' );
          if (i) {
            throw new Error( 'error' );
          }
          else {
            resolve();
          }
        })
        .then(function(){
          route.push( i + '-1' );
          return true;
        })
        .catch(function(){
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
    it( 'when a promise list chain WITHOUT individual catch handlers is rejected' , function( done ){
      var routes = [],
      routesFinal = [
        [ '0-0' , '0-1' , '0-2' ],
        [ '1-0' , '1-1' , '1-2' ]
      ],
      promises = [ 0 , 1 ].map(function( i ){

        var route = routes[i] = [];

        return new Promise(function( resolve , reject ){
          route.push( i + '-0' );
          resolve();
        })
        .then(function(){
          return new Promise(function( resolve , reject ){
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
        .then(function(){
          route.push( i + '-2' );
          return true;
        });

      });

      Promise.all( promises ).then(function( args ) {
        expect( true ).to.equal( false );
      })
      .catch(function( err ){
        setTimeout(function(){
          expect( err ).to.be.an.instanceOf( Error );
          expect( routes ).to.eql( routesFinal );
          done();
        })
      })
      .catch( done );
    });
    it( 'when a promise list chain WITH individual catch handlers is rejected' , function( done ){
      var routes = [],
      routesFinal = [
        [ 0 , 1 , 2 , 'then-0' ],
        [ 0 , 1 , 2 , 'catch-1' ]
      ],
      argsFinal = [ true , false ],
      promises = [ 0 , 1 ].map(function( i ){

        var route = routes[i] = [];

        return new Promise(function( resolve , reject ){
          route.push( 0 );
          resolve();
        })
        .then(function(){
          return new Promise(function( resolve , reject ){
            route.push( 1 );
            if (!i) {
              resolve();
            }
            else {
              throw new Error( 'error' );
            }
          });
        })
        .then(function(){
          route.push( 2 );
          route.push( 'then-' + i );
          return true;
        })
        .catch(function(){
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
    it( 'when multiple promises in a list WITH individual catch handlers are rejected' , function( done ){
      var target = [ 2 , 3 ],
      argsFinal = [ 0 , 1 , false , false , 4 ],
      promises = [ 0 , 1 , 2 , 3 , 4 ].map(function( i ){
        return new Promise(function( resolve , reject ){
            setTimeout(function(){
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
    it( 'should fail recursively until maxAttempts is reached' , function( done ){
      var attempts = 0,
      maxAttempts = 3,
      result = [ true , false , true , true ];

      loadImages( overlays() ).then(function( args ) {
        expect( args ).to.eql( result );
        done();
      })
      .catch( done );
      
      function overlays() {
        var img = '/test/promise.jpg';
        return {
          image0: { src: img + '?r=' + uts() },
          image1: { src: img + 'FAIL?r=' + uts() },
          image2: { src: img + '?r=' + uts() },
          image3: { src: img + '?r=' + uts() }
        };
      }

      function uts() {
        return Date.now() + Math.random();
      }

      function loadImages( srcObj ) {
        function load( imgObj , key ) {
          return new Promise(function( resolve , reject ){
            var img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = imgObj.src;
          })
          .then(function(){
            return true;
          })
          .catch(function(){
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
}());
