import Stack from './stack';

let asyncProvider;

if (global.setImmediate) {
	asyncProvider = setImmediate;
} else if (global.MessageChannel) {
	const stack = Stack();
	const channel = new MessageChannel();
	channel.port1.onmessage = () => {
		 /* jshint -W084 */
		let fn;
		while (fn = stack.get()) {
			fn();
		}
	};
	asyncProvider = (cb) => {
		stack.put(cb);
		channel.port2.postMessage(0);
	};
} else {
	asyncProvider = setTimeout;
}

export default asyncProvider;
