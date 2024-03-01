import {json} from "@sveltejs/kit";
// import { Server } from "socket.io";
//
// const io = new Server()
//
// io.on("connection", (socket) => {
//     console.log("Client connected:", socket.id)
// })
//
// io.listen(1337)

export function GET() {

    return json("Hmmm!")
}