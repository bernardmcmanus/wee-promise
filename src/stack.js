export default function Stack() {
	const queue = [];
	let index = 0;
	let length = 0;

	function put(element) {
		queue[length] = element;
		length++;
	}

	function get() {
		const element = queue[index];
		index++;
		if (index >= length) {
			queue.length = index = length = 0;
		}
		return element;
	}

	return { put: put, get: get };
}
