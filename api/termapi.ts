declare class TermAPI {
    public setCursor(this: void, col: number, row: number) : void;
    public getViewport(this: void) : LuaMultiReturn<[number, number, number, number, number, number]>;
    public clear(this: void) : void;
}