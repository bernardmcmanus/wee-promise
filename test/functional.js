describe('Functional Tests', function() {
	it('when a single promise is rejected', function() {
		var spy = sinon.spy(_.noop);
		var error = new Error('error');
		return new WeePromise(function(resolve, reject) {
			throw error;
		})
		.then(spy)
		.catch(function(err) {
			expect(err).to.equal(error);
			expect(spy).to.have.not.been.called;
		});
	});

	it('when a single promise chain is rejected WITHOUT a catch handler on the child', function() {
		var spy = sinon.spy(_.noop);
		var error = new Error('error');
		return new WeePromise(function(resolve, reject) {
			resolve();
		})
		.then(function() {
			return new WeePromise(function(resolve, reject) {
				throw error;
			})
			.then(spy);
		})
		.then(spy)
		.catch(function(err) {
			expect(err).to.equal(error);
			expect(spy).to.have.not.been.called;
		});
	});

	it('when a single promise chain is rejected WITH a catch handler on the child', function() {
		var route = [];
		var routeFinal = [0, 1, 2];
		var spy = sinon.spy(_.noop);

		return new WeePromise(function(resolve, reject) {
			route.push(0);
			resolve();
		})
		.then(function() {
			return new WeePromise(function(resolve, reject) {
				route.push(1);
				throw new Error('error');
			})
			.then(spy)
			.catch(function() {
				route.push(2);
				return false;
			});
		})
		.then(function(args) {
			expect(route).to.eql(routeFinal);
			expect(args).to.equal(false);
			expect(spy).to.have.not.been.called;
		});
	});

	it('when a promise list WITHOUT individual catch handlers is rejected', function() {
		var routes = [];
		var routesFinal = [
			['0-0', '0-1'],
			['1-0', '1-1']
		];
		var spy = sinon.spy(_.noop);
		var error = new Error('error');
		var promises = [0, 1].map(function(i) {
			var route = routes[i] = [];
			return new WeePromise(function(resolve, reject) {
				route.push(i + '-0');
				if (i) {
					route.push(i + '-1');
					throw error;
				} else {
					resolve();
				}
			})
			.then(function() {
				route.push(i + '-1');
			});
		});

		return WeePromise
			.all(promises)
			.then(spy)
			.catch(_.identity)
			.then(function(err) {
				expect(err).to.equal(error);
				expect(routes).to.eql(routesFinal);
				expect(spy).to.have.not.been.called;
			});
	});

	it('when a promise list WITH individual catch handlers is rejected', function() {
		var routes = [];
		var routesFinal = [
			['0-0', '0-1'],
			['1-0', '1-1']
		];
		var argsFinal = [true, false];
		var promises = [0, 1].map(function(i) {
			var route = routes[i] = [];
			return new WeePromise(function(resolve, reject) {
				route.push(i + '-0');
				if (i) {
					throw new Error('error');
				} else {
					resolve();
				}
			})
			.then(function() {
				route.push(i + '-1');
				return true;
			})
			.catch(function() {
				route.push(i + '-1');
				return false;
			});
		});

		return WeePromise.all(promises).then(function(args) {
			expect(args).to.eql(argsFinal);
			expect(routes).to.eql(routesFinal);
		});
	});

	it('when a promise list chain WITHOUT individual catch handlers is rejected', function() {
		var routes = [];
		var routesFinal = [
			['0-0', '0-1', '0-2'],
			['1-0', '1-1', '1-2']
		];
		var spy = sinon.spy(_.noop);
		var error = new Error('error');
		var promises = [0, 1].map(function(i) {
			var route = routes[i] = [];
			return new WeePromise(function(resolve, reject) {
				route.push(i + '-0');
				resolve();
			})
			.then(function() {
				return new WeePromise(function(resolve, reject) {
					route.push(i + '-1');
					if (!i) {
						resolve();
					} else {
						route.push(i + '-2');
						throw error;
					}
				});
			})
			.then(function() {
				route.push(i + '-2');
				return true;
			});
		});

		return WeePromise
			.all(promises)
			.then(spy)
			.catch(function(err) {
				expect(err).to.equal(error);
				expect(routes).to.eql(routesFinal);
				expect(spy).to.have.not.been.called;
			});
	});

	it('when a promise list chain WITH individual catch handlers is rejected', function() {
		var routes = [];
		var routesFinal = [
			[0, 1, 2, 'then-0'],
			[0, 1, 2, 'catch-1']
		];
		var argsFinal = [true, false];
		var promises = [0, 1].map(function(i) {
			var route = routes[i] = [];
			return new WeePromise(function(resolve, reject) {
				route.push(0);
				resolve();
			})
			.then(function() {
				return new WeePromise(function(resolve, reject) {
					route.push(1);
					if (!i) {
						resolve();
					} else {
						throw new Error('error');
					}
				});
			})
			.then(function() {
				route.push(2);
				route.push('then-' + i);
				return true;
			})
			.catch(function() {
				route.push(2);
				route.push('catch-' + i);
				return false;
			});
		});

		return WeePromise.all(promises).then(function(args) {
			expect(args).to.eql(argsFinal);
			expect(routes).to.eql(routesFinal);
		});
	});

	it('when multiple promises in a list WITH individual catch handlers are rejected', function() {
		var target = [2, 3];
		var argsFinal = [0, 1, false, false, 4];
		var promises = [0, 1, 2, 3, 4].map(function(i) {
			return new WeePromise(function(resolve, reject) {
					setTimeout(function() {
						if (target.indexOf(i) >= 0) {
							reject(i);
						} else {
							resolve(i);
						}
					});
				})
				.then(function(val) {
					return val;
				})
				.catch(function(val) {
					return false;
				});
		});

		return WeePromise.all(promises).then(function(args) {
			expect(args).to.eql(argsFinal);
		});
	});

	it('should fail recursively until maxAttempts is reached', function() {
		var attempts = 0;
		var maxAttempts = 3;
		var result = [true, false, true, true];
		
		function getSrcObject() {
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

		function loadImages(srcObj) {
			function load(imgObj, key) {
				return new WeePromise(function(resolve, reject) {
					var img = new Image();
					img.onload = resolve;
					img.onerror = reject;
					img.src = imgObj.src;
				})
				.then(function() {
					return true;
				})
				.catch(function() {
					imgObj.attempts++;
					if (imgObj.attempts <= maxAttempts) {
						return load(imgObj, key);
					}
					return false;
				});
			}
			return WeePromise.all(
				_.keys(srcObj).map(function(key) {
					srcObj[key].attempts = 0;
					return load(srcObj[key], key);
				})
			);
		}

		return loadImages(getSrcObject()).then(function(args) {
			expect(args).to.eql(result);
		});
	});
});
