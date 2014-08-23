(function( Promise ) {

    if (typeof exports === 'object') {
        module.exports = Promise;
    }
    else {
        window.Promise = window.Promise || Promise;
    }

}(function( Object , setTimeout ) {


    var PROTOTYPE = 'prototype';
    var STATE = 'state';
    var ARGS = 'args';
    var ALWAYS = 'always';
    var THEN = 'then';
    var CATCH = 'catch';
    var _ALWAYS = '_' + ALWAYS;
    var _THEN = '_' + THEN;
    var _CATCH = '_' + CATCH;
    var _ADD_HANDLER = '_addHandler';
    var _EXEC_HANDLER = '_execHandler';
    var _CLEAR = '_clear';

    var STATEMAP = {};
    STATEMAP[_CATCH] = -1;
    STATEMAP[_THEN] = 1;


    function Promise( func ) {

        var that = this;

        DefineProperty( that , STATE , 0 );
        DefineProperty( that , ARGS , [] );
        DefineProperty( that , _ALWAYS , [] );
        DefineProperty( that , _THEN , [] );
        DefineProperty( that , _CATCH , [] );

        setTimeout(function() {
            func(
                getPromiseArg( that , _THEN ),
                getPromiseArg( that , _CATCH )
            );
        }, 0);
    }


    Promise[ PROTOTYPE ][ _ADD_HANDLER ] = function( type , func ) {
        var that = this;
        if (func) {
            that[type].push( func );
        }
        return that;
    };


    Promise[ PROTOTYPE ][ _EXEC_HANDLER ] = function( type , args ) {

        args = [ args ];

        var that = this;
        var handlers = that[type];
        var len = length( handlers );
        var i = 0;

        try {
            while (i < len && length( handlers ) > 0) {
                ( STATEMAP[type] ? handlers.shift() : handlers[i] ).apply( null , args );
                i++;
            }
        }
        catch ( err ) {
            that[ _EXEC_HANDLER ]( _CATCH , err , true );
        }

        that[ARGS] = args;
        that[STATE] = STATEMAP[type] || that[STATE];

        return that;
    };


    Promise[ PROTOTYPE ][ ALWAYS ] = function( func ) {
        return this[ _ADD_HANDLER ]( _ALWAYS , func );
    };


    Promise[ PROTOTYPE ][ THEN ] = function( onresolve , onreject ) {
        return this
            [ _ADD_HANDLER ]( _THEN , onresolve )
            [CATCH]( onreject );
    };


    Promise[ PROTOTYPE ][ CATCH ] = function( func ) {
        return this[ _ADD_HANDLER ]( _CATCH , func );
    };


    Promise[ PROTOTYPE ][ _CLEAR ] = function() {
        var that = this;
        that[_THEN] = [];
        that[_CATCH] = [];
        that[_ALWAYS] = [];
    };


    Promise.all = function( arr ) {
        return new Promise(function( resolve , reject ) {
            forEach( arr , function( promise ) {
                promise[ ALWAYS ](
                    checkArray( arr , resolve , reject , length( arr ))
                );
            });
        });
    };


    Promise.race = function( arr ) {
        return new Promise(function( resolve , reject ) {
            forEach( arr , function( promise ) {
                promise[ ALWAYS ](
                    checkArray( arr , resolve , reject , 1 , true )
                );
            });
        });
    };


    function getPromiseArg( context , type ) {

        return function( args ) {

            if (context[STATE]) {
                return;
            }

            context
            [ _EXEC_HANDLER ]( type , args )
            [ _EXEC_HANDLER ]( _ALWAYS , args )
            [_CLEAR]();
        };
    }


    function checkArray( arr , resolve , reject , test , single ) {

        return function() {
            
            var resolved = filter( arr , 1 );
            var rejected = filter( arr , -1 );

            if (length( resolved ) === test) {

                var args = resolved.map(function( promise ) {
                    return promise[ARGS][0];
                });
                
                resolve( single ? args[0] : args );
            }
            else if (length( rejected ) > 0) {
                reject(
                    rejected[0][ARGS][0]
                );
            }
        };
    }


    function filter( arr , testState ) {
        return arr.filter(function( promise ) {
            return promise[STATE] === testState;
        });
    }


    function DefineProperty( context , name , value ) {
        Object.defineProperty( context , name , {
            value: value,
            writable: true
        });
    }


    function length( subject ) {
        return subject.length;
    }


    function forEach( subject , callback ) {
        subject.forEach( callback );
    }


    return Promise;

    
}( Object , setTimeout )));




























