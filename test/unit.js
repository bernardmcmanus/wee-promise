describe('#constructor', function() {
	it('should fail when an error is thrown', function() {
		var spy = sinon.spy(_.noop);
		return new WeePromise(function(resolve, reject) {
			setTimeout(resolve);
			throw new Error('error');
		})
		.catch(spy)
		.then(function() {
			expect(spy).to.have.been.called.once;
		});
	});
});

describe('#then', function() {
	it('should do nothing when resolve is called twice', function() {
		var spy = sinon.spy(_.noop);
		return new WeePromise(function(resolve, reject) {
			resolve();
			resolve();
		})
		.then(spy)
		.then(function() {
			expect(spy).to.have.been.called.once;
		});
	});

	it('should do nothing if the promise is rejected', function() {
		var spy = sinon.spy(_.noop);
		new WeePromise(function(resolve, reject) {
			reject();
			resolve();
		})
		.catch(spy)
		.then(function() {
			expect(spy).to.have.been.called.once;
			expect(spy).to.have.been.calledWith(undefined);
		});
	});

	it('should fail when an error is thrown', function() {
		var spy = sinon.spy(_.noop);
		return new WeePromise(function(resolve, reject) {
			setTimeout(resolve);
		})
		.then(function() {
			throw new Error('error');
		})
		.catch(spy)
		.then(function() {
			expect(spy).to.have.been.called.once;
		});
	});

	it('should pass returned args to the next then function', function() {
		return new WeePromise(function(resolve) {
			setTimeout(function() {
				resolve('a');
			});
		})
		.then(function(val) {
			expect(val).to.equal('a');
			return val + 'b';
		})
		.then(function(val) {
			expect(val).to.equal('ab');
			return val + 'c';
		})
		.then(function(val) {
			expect(val).to.equal('abc');
		});
	});

	it('should allow for promise chaining (asynchronous)', function() {
		var start = Date.now();
		var delay = 100;
		var i = 0;

		return new WeePromise(function(resolve) {
			setTimeout(resolve, delay);
		})
		.then(function() {
			i++;
			expect(Date.now() - start).to.be.at.least(i * delay);
			return new WeePromise(function(resolve) {
				setTimeout(resolve, delay);
			});
		})
		.then(function() {
			i++;
			expect(Date.now() - start).to.be.at.least(i * delay);
			return new WeePromise(function(resolve) {
				setTimeout(resolve, delay);
			});
		})
		.then(function() {
			i++;
			expect(Date.now() - start).to.be.at.least(i * delay);
			return 5;
		})
		.then(function(val) {
			expect(val).to.equal(5);
			expect(Date.now() - start).to.be.at.least(i * delay);
		});
	});

	it('should allow for promise chaining (synchronous)', function() {
		return new WeePromise(function(resolve) {
			resolve(1);
		})
		.then(function(result) {
			return new WeePromise(function(resolve) {
				resolve(result + 1);
			});
		})
		.then(function(result) {
			return result + 1;
		})
		.then(function(result) {
			expect(result).to.equal(3);
		});
	});

	it('should pass resolved args along promise chains (asynchronous)', function() {
		return new WeePromise(function(resolve) {
			setTimeout(function() {
				resolve('a');
			});
		})
		.then(function(val) {
			expect(val).to.equal('a');
			return val + 'b';
		})
		.then(function(val) {
			expect(val).to.equal('ab');
			return new WeePromise(function(resolve) {
				setTimeout(function() {
					resolve(val + 'c');
				});
			});
		})
		.then(function(val) {
			expect(val).to.equal('abc');
			return new WeePromise(function(resolve) {
				setTimeout(function() {
					resolve(val + 'd');
				});
			});
		})
		.then(function(val) {
			expect(val).to.equal('abcd');
		});
	});

	it('should pass resolved args along promise chains (synchronous)', function() {
		return new WeePromise(function(resolve) {
			resolve('a');
		})
		.then(function(val) {
			expect(val).to.equal('a');
			return val + 'b';
		})
		.then(function(val) {
			expect(val).to.equal('ab');
			return new WeePromise(function(resolve) {
				resolve(val + 'c');
			});
		})
		.then(function(val) {
			expect(val).to.equal('abc');
			return val + 'd';
		})
		.then(function(val) {
			expect(val).to.equal('abcd');
		});
	});
});

describe('#catch', function() {
	it('should do nothing when reject is called twice', function() {
		var spy = sinon.spy(_.noop);
		return new WeePromise(function(resolve, reject) {
			reject();
			reject();
		})
		.catch(spy)
		.then(function() {
			expect(spy).to.have.been.called.once;
		});
	});

	it('should do nothing if the promise is resolved', function() {
		var spy = sinon.spy(_.noop);
		return new WeePromise(function(resolve, reject) {
			resolve();
			reject();
		})
		.catch(spy)
		.then(function() {
			expect(spy).to.have.not.been.called;
		});
	});

	it('should catch errors thrown in the resolver function', function() {
		var error = new Error('error');
		var spy = sinon.spy(_.identity);
		return new WeePromise(function(resolve, reject) {
			throw error;
		})
		.catch(spy)
		.then(function(err) {
			expect(err).to.equal(error);
			expect(spy).to.have.been.called.once;
		});
	});

	it('should catch errors thrown in then', function() {
		var error = new Error('error');
		var spy = sinon.spy(_.identity);
		return new WeePromise(function(resolve, reject) {
			resolve();
		})
		.then(function() {
			throw error;
		})
		.catch(spy)
		.then(function(err) {
			expect(err).to.equal(error);
			expect(spy).to.have.been.called.once;
		});
	});

	it('should catch errors thrown in catch', function() {
		var spy = sinon.spy(_.identity);
		return new WeePromise(function(resolve, reject) {
			resolve();
		})
		.then(function() {
			throw new Error('error1');
		})
		.catch(function(err) {
			throw new Error('error2');
		})
		.catch(spy)
		.then(function(err) {
			expect(err.message).to.equal('error2');
			expect(spy).to.have.been.called.once;
		});
	});

	it('should receive the error thrown in the resolver function', function() {
		var error = new Error('error');
		var spy = sinon.spy(_.identity);
		return new WeePromise(function(resolve, reject) {
			throw error;
		})
		.catch(spy)
		.then(function(err) {
			expect(err).to.equal(error);
			expect(spy).to.have.been.called.once;
		});
	});

	it('should receive the error thrown in then', function() {
		var error = new Error('error');
		var spy = sinon.spy(_.identity);
		return new WeePromise(function(resolve, reject) {
			resolve();
		})
		.then(function() {
			throw error;
		})
		.catch(spy)
		.then(function(err) {
			expect(err).to.equal(error);
			expect(spy).to.have.been.called.once;
		});
	});
});

describe('::all', function() {
	it('should handle mixed types', function() {
		var initial = [0, 1, 2, 3, 4];
		var arr = initial.map(function(i) {
			var returnOriginal = Math.round(Math.random()) > 0;
			return returnOriginal ? i : WeePromise.resolve(i);
		});
		return WeePromise.all(arr).then(function(result) {
			expect(result).to.eql(initial);
		});
	});

	it('should asynchronously resolve an array of non-promises', function() {
		var initial = [0, 1, 2];
		var error = new Error('test');
		return WeePromise.all(initial).then(function(result) {
			expect(result).to.eql(initial);
			throw error;
		})
		.catch(function(err) {
			expect(err).to.equal(error);
		});
	});

	it('should support nested collections', function() {
		var collections = [0, 1, 2];
		var superset = collections.map(function(i) {
			var subset = [(i),(i + 1),(i + 2)].map(function(j) {
				return new WeePromise(function(resolve) {
					setTimeout(function() {
						resolve(j);
					});
				});
			});
			return WeePromise.all(subset);
		});
		return WeePromise.all(superset).then(function(result) {
			expect(result).to.have.length(collections.length);
			result.forEach(function(subset) {
				expect(subset).to.have.length(collections.length);
			});
		});
	});

	describe('#then', function() {
		it('should be invoked once all promises are resolved (asynchronous)', function() {
			return all_then();
		});

		it('should be invoked once all promises are resolved (synchronous)', function() {
			return all_then(true);
		});

		it('should receive a result array equal to the array of resolved promises (asynchronous)', function() {
			return all_then().then(_.spread(function(result, test) {
				expect(arguments).to.have.length(2);
				expect(result.length).to.equal(test.length);
				expect(result).to.eql(test);
			}));
		});

		it('should receive a result array equal to the array of resolved promises (synchronous)', function() {
			return all_then(true).then(_.spread(function(result, test) {
				expect(arguments).to.have.length(2);
				expect(result.length).to.equal(test.length);
				expect(result).to.eql(test);
			}));
		});

		it('should pass returned args to the next then function', function() {
			var promises = [0, 1, 2].map(function(i) {
				return new WeePromise(function(resolve) {
					resolve(i + '-a');
				})
				.then(function(val) {
					expect(val).to.equal(i + '-a');
					return val + 'b';
				})
				.then(function(val) {
					expect(val).to.equal(i + '-ab');
					return val + 'c';
				})
				.then(function(val) {
					expect(val).to.equal(i + '-abc');
					return val;
				});
			});

			return WeePromise.all(promises).then(function(result) {
				result.forEach(function(arg, i) {
					expect(arg).to.equal(i + '-abc');
				});
			});
		});

		it('should allow for promise chaining (asynchronous)', function() {
			var promises = [0, 1, 2].map(function(i) {
				var start = Date.now();
				var delay = 100;
				var j = 0;

				return new WeePromise(function(resolve) {
					setTimeout(resolve, delay);
				})
				.then(function() {
					j++;
					expect(Date.now() - start).to.be.at.least(j * delay);
					return new WeePromise(function(resolve) {
						setTimeout(resolve, delay);
					});
				})
				.then(function() {
					j++;
					expect(Date.now() - start).to.be.at.least(j * delay);
					return new WeePromise(function(resolve) {
						setTimeout(resolve, delay);
					});
				})
				.then(function() {
					j++;
					expect(Date.now() - start).to.be.at.least(j * delay);
					return 5;
				})
				.then(function(val) {
					expect(val).to.equal(5);
					expect(Date.now() - start).to.be.at.least(j * delay);
					return val + i;
				});
			});

			return WeePromise.all(promises).then(function(result) {
				result.forEach(function(arg, i) {
					expect(arg).to.equal(5 + i);
				});
			});
		});

		it('should allow for promise chaining (synchronous)', function() {
			var promises = [0, 1, 2].map(function(i) {
				var start = Date.now();
				var index = 0;
				var tolerance = 50;

				return new WeePromise(function(resolve) {
					resolve();
				})
				.then(function() {
					index++;
					expect(Date.now() - start).to.be.at.most(tolerance * index);
					return new WeePromise(function(resolve) {
						resolve();
					});
				})
				.then(function() {
					index++;
					expect(Date.now() - start).to.be.at.most(tolerance * index);
					return new WeePromise(function(resolve) {
						resolve();
					});
				})
				.then(function() {
					index++;
					expect(Date.now() - start).to.be.at.most(tolerance * index);
					return 5;
				})
				.then(function(val) {
					expect(val).to.equal(5);
					expect(Date.now() - start).to.be.at.most(tolerance * index);
					return val + i;
				});
			});

			return WeePromise.all(promises).then(function(result) {
				result.forEach(function(arg, i) {
					expect(arg).to.equal(5 + i);
				});
			});
		});

		it('should pass resolved args along promise chains (asynchronous)', function() {
			var promises = [0, 1, 2].map(function(i) {
				return new WeePromise(function(resolve) {
					setTimeout(function() {
						resolve(i + '-a');
					});
				})
				.then(function(val) {
					return val + 'b';
				})
				.then(function(val) {
					return new WeePromise(function(resolve) {
						setTimeout(function() {
							resolve(val + 'c');
						});
					});
				});
			});

			return WeePromise.all(promises).then(function(result) {
				result.forEach(function(arg, i) {
					expect(arg).to.equal(i + '-abc');
				});
			});
		});

		it('should pass resolved args along promise chains (synchronous)', function() {
			var promises = [0, 1, 2].map(function(i) {
				return new WeePromise(function(resolve) {
					resolve(i + '-a');
				})
				.then(function(val) {
					return val + 'b';
				})
				.then(function(val) {
					return new WeePromise(function(resolve) {
						resolve(val + 'c');
					});
				});
			});

			return WeePromise.all(promises).then(function(result) {
				result.forEach(function(arg, i) {
					expect(arg).to.equal(i + '-abc');
				});
			});
		});
	});

	describe('#catch', function() {
		it('should be invoked if a promise is rejected (asynchronous)', function() {
			return all_catch();
		});

		it('should be invoked if a promise is rejected (synchronous)', function() {
			return all_catch(true);
		});

		it('should receive arguments from the first promise that was rejected (asynchronous)', function() {
			return all_catch().then(_.spread(function(result, test) {
				expect(result).to.be.ok;
				expect(result).to.equal(test);
			}));
		});

		it('should receive arguments from the first promise that was rejected (synchronous)', function() {
			return all_catch(true).then(_.spread(function(result, test) {
				expect(arguments).to.have.length(2);
				expect(result).to.be.ok;
				expect(result).to.equal(test);
			}));
		});

		it('should handle promise chains', function() {
			var index = Math.floor(Math.random() * 3);
			var promises = [0, 1, 2].map(function(i) {
				return new WeePromise(function(resolve) {
					setTimeout(resolve);
				})
				.then(function(val) {
					return new WeePromise(function(resolve, reject) {
						if (i === index) {
							throw new Error(i);
						} else {
							setTimeout(resolve);
						}
					});
				});
			});

			return WeePromise.all(promises).catch(function(err) {
				expect(err.message).to.equal(index.toString());
			});
		});
	});
});

describe('::race', function() {
	describe('#then', function() {
		it('should be invoked once the first promise is resolved (asynchronous)', function() {
			return race_then();
		});

		it('should be invoked once the first promise is resolved (synchronous)', function() {
			return race_then(true);
		});

		it('should receive arguments from the first promise that was resolved (asynchronous)', function() {
			return race_then().then(_.spread(function(result, test) {
				expect(arguments).to.have.length(2);
				expect(result).to.equal(test);
			}));
		});

		it('should receive arguments from the first promise that was resolved (synchronous)', function() {
			return race_then(true).then(_.spread(function(result, test) {
				expect(arguments).to.have.length(2);
				expect(result).to.equal(test);
			}));
		});

		it('should handle promise chains', function() {
			var index = Math.floor(Math.random() * 3);
			var delay = 50;
			var promises = [0, 1, 2].map(function(i) {
				return new WeePromise(function(resolve) {
					setTimeout(function() {
						resolve(i);
					});
				})
				.then(function(val) {
					return new WeePromise(function(resolve) {
						setTimeout(function() {
							resolve(i);
						}, (i === index ? 1 : delay));
					});
				});
			});

			return WeePromise.race(promises).then(function(result) {
				expect(result).to.equal(index);
			});
		});
	});
});

describe('::async', function() {
	it('should always flush the internal stack sequentially', function(done) {
		var actual = [];

		var expected = (function(length) {
			var arr = [];
			for (var i = 0; i < length; i++) {
				arr.push(i);
			}
			return arr;
		}(15));

		var enqueue = function(args) {
			while (args.length) {
				(function(arg) {
					WeePromise.async(function() {
						actual.push(arg);
					});
				}(args.shift()));
			}
		};

		WeePromise.async(function() {
			enqueue([3, 4, 5]);
			WeePromise.async(function() {
				enqueue([9, 10, 11]);
				WeePromise.async(function() {
					WeePromise.async(function() {
						WeePromise.async(function() {
							enqueue([14]);
						});
						enqueue([13]);
					});
					enqueue([12]);
				});
			});
			enqueue([6, 7, 8]);
		});

		enqueue([0, 1, 2]);

		setTimeout(function() {
			expect(actual).to.eql(expected);
			done();
		});
	});

	it('should gracefully handle errors', function(done) {
		var gotCalls = 0;
		var $onerror = window.onerror;

		window.onerror = function(message) {
			if (!/test/.test(message)) {
				$onerror.apply(window, arguments);
			}
			window.onerror = $onerror;
		};

		WeePromise.async(function() {
			WeePromise.async(function() {
				WeePromise.async(function() {
					WeePromise.async(function() {
						expect(gotCalls).to.equal(2);
						done();
					});
					gotCalls++;
				});
				throw new Error('test');
				gotCalls++;
			});
			gotCalls++;
		});
	});
});

function all_then(sync) {
	var i = 0;
	var count = 5;
	var promises = [];
	var test = [];
	for (; i < count; i++) {
		promises.push(
			(function(i) {
				return new WeePromise(function(resolve, reject) {
					if (sync) {
						resolve(i);
					} else {
						setTimeout(function() {
							resolve(i);
						});
					}
				});
			}(i))
		);
		test.push(i);
	}
	return WeePromise.all(promises).then(function(result) {
		return [result, test];
	});
}

function all_catch(sync) {
	var count = 5;
	var target = [2, 3][Math.round(Math.random())];
	var promises = [];
	function determine(i, resolve, reject) {
		if (target === i) {
			reject(i);
		} else {
			resolve(i);
		}
	}
	for (var i = 0; i < count; i++) {
		promises.push(
			(function(i) {
				return new WeePromise(function(resolve, reject) {
					if (sync) {
						determine(i, resolve, reject);
					} else {
						setTimeout(function() {
							determine(i, resolve, reject);
						},i);
					}
				});
			}(i))
		);
	}
	return WeePromise.all(promises).catch(function(result) {
		return [result, target];
	});
}

function race_then(sync) {
	var count = 5;
	var target = [2, 3];
	var test = sync ? 0 : target[0];
	var promises = [];
	for (var i = 0; i < count; i++) {
		promises.push(
			(function(i) {
				return new WeePromise(function(resolve, reject) {
					if (sync) {
						resolve(i);
					} else {
						var t = (target.indexOf(i) >= 0 ? 1 : count * 10);
						setTimeout(function() {
							resolve(i);
						},t);
					}
				});
			}(i))
		);
	}
	return WeePromise.race(promises).then(function(result) {
		return [result, test];
	});
}
