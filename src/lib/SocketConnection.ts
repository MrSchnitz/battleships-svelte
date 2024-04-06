import ioClient, { Socket } from "socket.io-client";
import { SocketEvents } from "../../common/types";

// const ENDPOINT = "http://localhost:3000";
const ENDPOINT = "http://10.0.0.17:3000";
// const ENDPOINT = 'http://192.168.1.115:3000';

class SocketAPI {
	private static instance: SocketAPI;
	private socket: Socket;

	private constructor() {
		this.socket = ioClient(ENDPOINT);
	}

	public static getInstance(): SocketAPI {
		if (!SocketAPI.instance) {
			SocketAPI.instance = new SocketAPI();
		}
		return SocketAPI.instance;
	}

	public onAfterConnect(callback: (data: any) => void) {
		this.socket.on(SocketEvents.AFTER_CONNECT, callback);
	}
	public onAvailableRooms(callback: (rooms: string[]) => void) {
		this.socket.on(SocketEvents.AVAILABLE_ROOMS, callback);
	}
	public onYourRoom(callback: (room: string | null) => void) {
		this.socket.on(SocketEvents.YOUR_ROOM, callback);
	}
	public onRoomReady(callback: (data: any) => void) {
		this.socket.on(SocketEvents.ROOM_READY, callback);
	}
	public onTurnEnded(callback: (game: any) => void) {
		this.socket.on(SocketEvents.TURN_ENDED, callback);
	}
	public onShoot(callback: (game: any) => void) {
		this.socket.on(SocketEvents.SHOOT, callback);
	}
	public onPlayerDisconnected(callback: (data: any) => void) {
		this.socket.on(SocketEvents.PLAYER_DISCONNECTED, callback);
	}

	public connect() {
		if (!this.socket.active) {
			this.socket.connect();
		}
	}

	public afterConnect(data: any) {
		this.socket.emit(SocketEvents.AFTER_CONNECT, data);
	}

	public disconnect(callback?: () => void) {
		this.socket.disconnect();
		this.socket.close();
		callback?.();
	}

	public applyDisconnect() {
		this.socket.emit(SocketEvents.APPLY_DISCONNECT);
	}

	public createRoom(data: any) {
		this.socket.emit(SocketEvents.CREATE_ROOM, data);
	}

	public joinRoom(data: any) {
		this.socket.emit(SocketEvents.JOIN_ROOM, data);
	}

	public shoot(data: any) {
		this.socket.emit(SocketEvents.SHOOT, data);
	}

	public turnEnded(playerNick: string) {
		this.socket.emit(SocketEvents.TURN_ENDED, playerNick);
	}
}

export default SocketAPI.getInstance();
