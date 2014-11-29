(function( WeePromise , ES6Promise ) {


  [
    WeePromise,
    ES6Promise
  ]
  .forEach(function( Promise , i ) {

    /*async(function() {

      console.log('--------------- ' + Promise.name + ' ---------------');

      var p2, p1 = new Promise(function( resolve , reject ) {
        console.log(0);
        resolve();
      })
      .then(function() {
        p2 = new Promise(function( resolve , reject ) {
          console.log(1);
          throw new Error( 'error' );
        });
        p2.then(function() {
          console.log('then-child');
          return true;
        });
        return p2;
      });
      p1.then(function( args ) {
        console.log(args);
      });
      p1.catch(function( err ) {
        console.log(2);
        console.log('catch');
      });

    }, i * 100);*/
    
    /*async(function() {

      console.log('--------------- ' + Promise.name + ' ---------------');

      var p2, p1 = new Promise(function( resolve , reject ) {
        console.log(0);
        resolve();
      })
      .then(function() {
        p2 = new Promise(function( resolve , reject ) {
          console.log(1);
          throw new Error( 'error' );
        })
        .then(function() {
          console.log('child-then');
          return true;
        })
        .catch(function() {
          console.log(2);
          //debugger;
          return false;
        });
        return p2;
      })
      .then(function( args ) {
        console.log(3);
        console.log(args);
      })
      .catch(function( args ) {
        console.log(args);
        console.log('catch');
      });

    }, i * 100);*/

    /*async(function() {

      console.log('--------------- ' + Promise.name + ' ---------------');

      var promise1 = new Promise(function( resolve , reject ) {
        log('0-0');
        resolve();
        //async( resolve );
      })
      .then(function() {
        log('0-1');
        return true;
      })
      .catch(function() {
        return false;
      });

      var promise2 = new Promise(function( resolve , reject ) {
        log('1-0');
        throw new Error( 'error' );
        //reject();
        //async( reject );
      })
      .then(function() {
        return true;
      })
      .catch(function() {
        log('1-1');
        promise2;
        all;
        //debugger;
        return false;
      });

      var all = Promise.all([ promise1 , promise2 ]).then(function( args ) {
        log('all-then');
        log( args );
      })
      .catch(function( err ) {
        log('all-catch');
      });

    }, i * 100);*/

    /*async(function() {

      console.log('--------------- ' + Promise.name + ' ---------------');

      var promises = [ 0 , 1 ].map(function( i ) {
        return new Promise(function( resolve , reject ) {
          log(i + '-0');
          async(function() {
            if (i) {
              reject();
            }
            else {
              resolve();
            }
          });
        })
        .then(function() {
          log(i + '-1');
          return true;
        })
        .catch(function() {
          log(i + '-1');
          return false;
        });
      });

      var all = Promise.all( promises ).then(function( args ) {
        log('all-then');
        log( args );
      })
      .catch(function( err ) {
        log('all-catch');
      });

    }, i * 100);*/

    /*async(function() {

      console.log('--------------- ' + Promise.name + ' ---------------');

      var target = [ 2 , 3 ],
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
            return true;
          })
          .catch(function( val ) {
            return false;
          });

      });

      Promise.all( promises ).then(function( args ) {
        log('then');
        log(args);
      })
      .catch(function( args ) {
        log('catch');
        log(args);
      });

    }, i * 100);*/

    /*async(function() {

      console.log('--------------- ' + Promise.name + ' ---------------');

      var routes = [],
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
          //debugger;
          return false;
        });

      });

      Promise.all( promises ).then(function( args ) {
        log(routes);
        log(args);
        log('all-then');
      })
      .catch(function( err ) {
        log('all-catch');
      });

    }, i * 100);*/

    async(function() {

      console.log('--------------- ' + Promise.name + ' ---------------');

      new Promise(function( resolve , reject ) {
        resolve();
      })
      .then(function() {
        return new Promise(function( resolve , reject ) {
          throw new Error( 'error' );
        })
        .then(function() {
          log('child-then');
          return true;
        })
        .catch(function() {
          log('child-catch');
          return false;
        });
      })
      .then(function( args ) {
        log('parent-then');
        log(args);
      })
      .catch(function() {
        log('parent-catch');
      });

    }, i * 100);

  });

  function log() {
    var args = Array.prototype.slice.call( arguments , 0 );
    console.log.apply( console , args );
  }


  function async( callback , delay ) {
    setTimeout( callback , ( delay || 1 ));
  }


  function done() {}


}( WeePromise , ES6Promise.Promise ));




























