export declare class Modem {
    public isOpen(this: void, port: number) : boolean;
    public open(this: void, port: number) : boolean;
    public close(this: void) : boolean;
    public close(this: void, port: number) : boolean;
    public send(this: void, address: string, port: number, param: any) : boolean;
    public broadcast(this: void, port: number, param: any) : boolean;
    public address: string;
}