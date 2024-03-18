import LoseSound from "$lib/sounds/lose.mp3";
import WinSound from "$lib/sounds/win.mp3";
import PlopSound from "$lib/sounds/plop.mp3";
import CannonSound from "$lib/sounds/cannon.mp3";
import IncomingSound from "$lib/sounds/incoming.mp3";
import HitSound from "$lib/sounds/hit.mp3";
import ExplosionSound from "$lib/sounds/explosion.mp3";
import TotalExplosionSound from "$lib/sounds/totalExplosion.mp3";

const SOUNDS: Record<string, string> = {
	win: WinSound,
	lose: LoseSound,
	plop: PlopSound,
	cannon: CannonSound,
	incoming: IncomingSound,
	explosion: ExplosionSound,
	hit: HitSound,
	totalExplosion: TotalExplosionSound
};

class AudioPlayer {
	private static instance: AudioPlayer | null = null;
	private sound: HTMLAudioElement | null = null;

	constructor() {}

	public static getInstance() {
		if (!this.instance) {
			this.instance = new AudioPlayer();
		}

		return this.instance;
	}

	private play(soundName: string) {
		this.sound = new Audio(SOUNDS[soundName]);
		this.sound.play();
	}

	win() {
		this.play("win");
	}

	lose() {
		this.play("lose");
	}

	plop() {
		this.play("plop");
	}

	cannon() {
		this.play("cannon");
	}

	incoming() {
		this.play("incoming");
	}

	explosion() {
		this.play("explosion");
	}

	hit() {
		this.play("hit");
	}

	totalExplosion() {
		this.play("totalExplosion");
	}
}

export default AudioPlayer.getInstance();
