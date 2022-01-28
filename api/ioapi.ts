declare namespace io {
    function read(this: void) : string;
    function write(this: void, stuff: any) : void;
    function open(this: void, path: string, mode: string) : FileDescriptor;
}

declare class FileDescriptor {
    public read(type: string) : any;
}