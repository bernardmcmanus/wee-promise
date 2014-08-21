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
    var _ALWAYS = '_always';
    var _THEN = '_then';
    var _CATCH = '_catch';


    function Promise( func ) {

        var that = this;

        DefineProperty( that , STATE , 0 );
        DefineProperty( that , _ALWAYS , [] );
        DefineProperty( that , _THEN , [] );
        DefineProperty( that , _CATCH , [] );

        setTimeout(function() {
            func(
                getPromiseArg( that , 1 , _THEN ),
                getPromiseArg( that , -1 , _CATCH )
            );
        }, 0);
    }


    Promise[PROTOTYPE] = {};


    Promise[PROTOTYPE]._addHandler = function( type , func ) {
        var that = this;
        that[type].push( func );
        return that;
    };


    Promise[PROTOTYPE]._execHandler = function( type , args , remove ) {

        var that = this;
        var handlers = that[type];
        var len = length( handlers );
        var i = 0;

        while (i < len && length( handlers ) > 0) {
            (remove ? handlers.shift() : handlers[i]).apply( null , args );
            i++;
        }

        return that;
    };


    Promise[PROTOTYPE].always = function( func ) {
        return this._addHandler( _ALWAYS , func );
    };


    Promise[PROTOTYPE].then = function( func ) {
        return this._addHandler( _THEN , func );
    };


    Promise[PROTOTYPE].catch = function( func ) {
        return this._addHandler( _CATCH , func );
    };


    Promise[PROTOTYPE]._clear = function() {
        var that = this;
        that[_THEN] = [];
        that[_CATCH] = [];
        that[_ALWAYS] = [];
    };


    Promise.all = function( arr ) {
        return new Promise(function( resolve , reject ) {
            forEach( arr , function( promise ) {
                promise.always(
                    checkArray( arr , resolve , reject , length( arr ))
                );
            });
        });
    };


    Promise.race = function( arr ) {
        return new Promise(function( resolve , reject ) {
            forEach( arr , function( promise ) {
                promise.always(
                    checkArray( arr , resolve , reject , 1 )
                );
            });
        });
    };


    function getPromiseArg( context , state , handlerType ) {

        return function() {
            if (context[STATE]) {
                return;
            }
            var args = arguments;
            context[STATE] = state;
            context
            ._execHandler( handlerType , args , true )
            ._execHandler( _ALWAYS , args )
            ._clear();
        };
    }


    function checkArray( arr , resolve , reject , resolveIf ) {

        return function() {
                        
            var isResolve = filterTest( arr , 1 , function( len ) {
                return len === resolveIf;
            });

            var isReject = filterTest( arr , -1 , function( len ) {
                return len > 0;
            });

            if (isResolve) {
                resolve();
            }
            else if (isReject) {
                reject();
            }

            if (isResolve || isReject) {
                forEach( arr , function( promise ) {
                    promise._clear();
                });
            }
        };
    }

    function filterTest( arr , testState , testLength ) {
        return testLength(
            length(
                arr.filter(function( promise ) {
                    return promise[STATE] === testState;
                })
            )
        );
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




























