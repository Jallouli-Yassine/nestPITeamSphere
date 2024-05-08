import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from "./user.service";
import { EmailService } from './mail.service';

interface User {
  id: string;
  socketid:string;
  name: string;
  statusAccount: number;
  verifiedAccount:boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;
  users: User[] = [];


  constructor(private userService: UserService,private mailService:EmailService) {
    
    console.log('WebsocketGateway constructor');
    console.log("dehe : "+this.users.length);
  }

  @SubscribeMessage("Connect")
  handleConnect(client: Socket, user: User): void {
    user.socketid = client.id;
    if(this.users){
      if(this.users.find(u => u.id == user.id)) {
        this.users.find(u => u.id == user.id).socketid = client.id;
      } else {
        this.users.push(user);
      }
    }
    console.log(`xd ${user.name} (${user.id}) connected`);
  }

  @SubscribeMessage("userAccepted")
  handleUserAccepted(client: Socket, user: User): void {

    user.statusAccount = 1;
    user.verifiedAccount = true;

    console.log(this.users)
    if(this.users){

      if(this.users.find(u => u.id == user.id)) {

        user.socketid=this.users.find(u => u.id == user.id).socketid
        console.log(user)
        this.server.to(user.socketid).emit('Accepted', user);
        this.userService.acceptUser(user.id);
        this.mailService.sendUserAcceptance(user)
        console.log(`User ${user.name} (${user.id}) accepted`)
      }
    }

  }

  @SubscribeMessage("userRejected")
  handleUserRejected(client: Socket, user: User): void {
    user.statusAccount = -1;
    user.verifiedAccount = false;
    if(this.users){
      if(this.users.find(u => u.id == user.id)) {
        user.socketid=this.users.find(u => u.id == user.id).socketid
        this.server.to(user.socketid).emit('userdeclined', user);
        this.userService.declinetUser(user.id);
        this.mailService.sendUserRejection(user);
        console.log(`User ${user.name} (${user.id}) rejected`)
      }
    }
  }
  handleDisconnect(client: Socket): void {
    this.users = this.users.filter(user => user.socketid !== client.id);

  }

}