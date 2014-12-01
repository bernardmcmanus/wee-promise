(function( WeePromise , ES6Promise ) {


  [
    WeePromise,
    ES6Promise
  ]
  .forEach(function( Promise , i ) {

    async(function() {

      console.log('--------------- ' + Promise.name + ' ---------------');

      // this should try up to 3 times to load the images
      // result: [ img , undefined , img , img ]
      
      recursiveLoad( Promise );

    }, i * 1000);

  });

  function recursiveLoad( Promise ) {

    loadImages( overlays() ).then(function( args ) {
      console.log(args);
    });

    function overlays() {
      var cloud = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141981/cloud.png';
      return {
        cold: { src: cloud + '?r=' + uts() },
        rain: { src: cloud + 'z?r=' + uts() },
        snow: { src: cloud + '?r=' + uts() },
        sun: { src: cloud + '?r=' + uts() }
      };
    }

    function uts() {
      return Date.now() + '.' + Math.floor( Math.random() * 100000 );
    }

    function loadImages( srcObj ) {

      function load( imgObj ) {
        var img;
        var p = new Promise(function( resolve , reject ) {
          async(function() {
            img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = imgObj.src;
            imgObj.attempts++;
          });
        })
        .then(function() {
            console.log('child-then');
          return img;
        })
        .catch(function() {
          if (imgObj.attempts < 3) {
            console.log('try again');
            return load( imgObj );
          }
        });
        return p;
      }

      /*function load( imgObj ) {
        var img;
        var p = new Promise(function( resolve , reject ) {
          async(function() {
            img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = imgObj.src;
            imgObj.attempts++;
          });
        });
        p.then(function() {
          console.log('child-then');
          return img;
        })
        .catch(function() {
          if (p.__TESTFLAG) {
            console.log(p);
          }
          if (imgObj.attempts < 3) {
            console.log('try again');
            return load( imgObj );
          }
        });
        return p;
      }*/

      return Promise.all(
        Object.keys( srcObj ).map(function( key ) {
          srcObj[key].attempts = 0;
          return load( srcObj[key] );
        })
      );
    }
  }

  function log() {
    var args = Array.prototype.slice.call( arguments , 0 );
    console.log.apply( console , args );
  }


  function async( callback , delay ) {
    setTimeout( callback , ( delay || 1 ));
  }
  
}( WeePromise , ES6Promise.Promise ));



















