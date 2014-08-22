(function() {


    var Promise = require( '../index.js' );
    var ES6_Promise = require( 'es6-promise' ).Promise;
    var chai = require( 'chai' );
    var assert = chai.assert;
    var should = chai.should();


    [
        [ Promise , 'wee-promise' ],
        [ ES6_Promise , 'es6-promise' ]
    ]
    .forEach(function( testArgs ) {


        var Constructor = testArgs[0];
        var name = testArgs[1];


        describe( name , function() {

            describe( '#then()' , function() {
                it( 'should fail silently when an error is thrown' , function( done ) {
                    new Constructor(function( resolve , reject ) {
                        resolve();
                    })
                    .then(function() {
                        var a;
                        a.b = 'c';
                    });
                    done();
                });
            });

            describe( '#catch()' , function() {
                it( 'should catch errors thrown in then' , function( done ) {
                    new Constructor(function( resolve , reject ) {
                        resolve();
                    })
                    .then(function() {
                        var a;
                        a.b = 'c';
                    })
                    .catch(function( err ) {
                        assert.instanceOf( err , Error );
                    });
                    done();
                });
            });

            describe( '#catch()' , function() {
                it( 'should catch errors thrown in catch' , function( done ) {
                    new Constructor(function( resolve , reject ) {
                        resolve();
                    })
                    .then(function() {
                        var a;
                        a.b = 'c';
                    })
                    .catch(function( err ) {
                        assert.instanceOf( err , Error );
                        throw err;
                    });
                    done();
                });
            });

            describe( 'all' , function() {
                describe( 'then' , function() {
                    it( 'should be resolved once all promises are resolved' , function( done ) {
                        var promises = [];
                        for (var i = 0; i < 5; i++) {
                            promises.push(
                                (function( i ) {
                                    return new Constructor(function( resolve , reject ) {
                                        setTimeout(function() {
                                            resolve( i );
                                        }, (Math.random() * 5));
                                    });
                                }( i ))
                            );
                        }
                        Constructor.all( promises ).then(function() {
                            done();
                        });
                    });
                });
            });

            
            describe( 'all' , function() {
                describe( 'catch' , function() {
                    it( 'should be rejected if a promise is rejected' , function( done ) {
                        var promises = [];
                        for (var i = 0; i < 5; i++) {
                            promises.push(
                                (function( i ) {
                                    return new Constructor(function( resolve , reject ) {
                                        setTimeout(function() {
                                            if (i === 0) {
                                                reject();
                                            }
                                            else {
                                                resolve();
                                            }
                                        }, (Math.random() * 5));
                                    });
                                }( i ))
                            );
                        }
                        Constructor.all( promises ).then(function() {
                            done();
                        });
                        Constructor.all( promises ).catch(function() {
                            done();
                        });
                    });
                });
            });
        });
    });
}());




























