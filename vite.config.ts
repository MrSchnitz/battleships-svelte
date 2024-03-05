import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { webSocketServer } from "./webSocketPluginVite";

export default defineConfig({
	server: {
		port: 3000,
		fs: {
			allow: ["/"]
		}
	},
	preview: {
		port: 3000
	},
	plugins: [sveltekit(), webSocketServer]
});
