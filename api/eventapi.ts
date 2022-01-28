export declare class event {
    public listen(this: void, event: string, callback: (a: LuaMultiReturn<[any]>) => void) : boolean;
    public listen(this: void, event: string, callback: (this: void, event: any, ladr: string, radr: string, port: number, distance: number, message: any) => void);
    public pull(this: void, ...param: any[]) : LuaMultiReturn<[any]>
}