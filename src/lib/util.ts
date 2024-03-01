export function create2DArray(size: number) {
	const array = new Array(size);

	for (let i = 0; i < size; i++) {
		array[i] = new Array(size);
		for (let j = 0; j < size; j++) {
			array[i][j] = { x: i, y: j };
		}
	}

	return array;
}
