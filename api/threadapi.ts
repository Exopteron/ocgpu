declare class ThreadAPI {
    public create(this: void, func: (param: any[]) => void) : Thread;
    public current(this: void) : Thread;
}
declare class Thread {
    public resume() : LuaMultiReturn<[boolean, string]>;
    public suspend() : LuaMultiReturn<[boolean, string]>;
    public kill() : void;
    public status() : string;
    public attach(level: number) : LuaMultiReturn<[boolean, string]>;
    public detach() : LuaMultiReturn<[boolean, string]>;
    public join() : LuaMultiReturn<[boolean, string]>;
}