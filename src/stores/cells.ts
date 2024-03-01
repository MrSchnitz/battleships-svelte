import { writable } from 'svelte/store';

function createSelectedCells() {
	const { set, update, subscribe } = writable([] as any[]);

	return {
		subscribe,
		add: (x: number, y: number) => update((value) => {
			console.log("HMM", x, y)
			value.push({x,y})
			return value
		}),
        remove: (x: number, y: number) =>
			update((value) => value.filter((v) => v.x !== x && v.y !== y)),
		reset: () => set([])
	};
}
export const selectedCells = createSelectedCells();