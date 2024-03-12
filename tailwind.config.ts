import { join } from "path";
import type { Config } from "tailwindcss";
import { skeleton } from "@skeletonlabs/tw-plugin";
import forms from "@tailwindcss/forms";

export default {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}")
	],
	theme: {
		extend: {
			colors: {
				carrier: "#e53935",
				battleship: "#8E24AA",
				cruiser: "#039BE5",
				submarine: "#3949AB",
				destroyer: "#00897B"
			}
		}
	},
	plugins: [
		forms,
		skeleton({
			themes: { preset: ["wintry", "skeleton", "modern"] }
		})
	]
} satisfies Config;
