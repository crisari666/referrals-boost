import { io, type Socket } from "socket.io-client";

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(serverUrl: string, options?: any): void {
    if (this.socket) {
      return;
    }

    this.socket = io(serverUrl, {
      transports: ["websocket"],
      autoConnect: true,
      ...options,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error: Error) => {
      this.handleConnectionError(error);
    });

    this.socket.on("error", () => {
      // no-op, handled ad hoc where needed
    });
  }

  public on<T = any>(eventName: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      return () => {};
    }

    this.socket.on(eventName, callback);

    return () => {
      if (this.socket) {
        this.socket.off(eventName, callback);
      }
    };
  }

  public off(eventName: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    this.socket.off(eventName, callback);
  }

  public emit(eventName: string, ...args: any[]): void {
    if (!this.socket || !this.isConnected) {
      return;
    }
    this.socket.emit(eventName, ...args);
  }

  public joinRoom(roomName: string, eventName = "joinRoom"): void {
    if (!this.socket || !this.isConnected) {
      return;
    }
    this.socket.emit(eventName, roomName);
  }

  public leaveRoom(roomName: string, eventName = "leaveRoom"): void {
    if (!this.socket || !this.isConnected) {
      return;
    }
    this.socket.emit(eventName, roomName);
  }

  private handleConnectionError(_error: Error): void {
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, 5000);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public isConnectedToServer(): boolean {
    return this.isConnected;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const websocketService = WebSocketService.getInstance();

