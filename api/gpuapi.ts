declare class GPUApi {
    public getScreen(this: void) : string;
    public getBackground(this: void) : LuaMultiReturn<[number, boolean]>
    public setBackground(this: void, color: number) : number;
    public getForeground(this: void) : LuaMultiReturn<[number, boolean]>
    public setForeground(this: void, color: number) : number;
    public getPalleteColor(this: void, index: number) : number;
    public setPalleteColor(this: void, index: number, value: number) : number;
    public maxDepth(this: void) : number; 
    public getDepth(this: void) : number;
    public setDepth(this: void, bit: number) : string;
    public maxResolution(this: void) : LuaMultiReturn<[number, number]>;
    public getResolution(this: void) : LuaMultiReturn<[number, number]>;
    public setResolution(this: void, width: number, height: number) : boolean;
    public getViewport(this: void) : LuaMultiReturn<[number, number]>;
    public setViewport(this: void, width: number, height: number) : boolean;
    public get(this: void, x: number, y: number) : LuaMultiReturn<[string, number, number, number, number]>;
    public set(this: void, x: number, y: number, value: string, ...vertical: boolean[]) : boolean;
    public copy(this: void, x: number, y: number, width: number, height: number, tx: number, ty: number) : boolean;
    public fill(this: void, x: number, y: number, width: number, height: number, char: string) : boolean;
    public getActiveBuffer(this: void) : number;
    public setActiveBuffer(this: void, buffer: number) : number;
    public buffers(this: void) : number[];
    public allocateBuffer(this: void) : number;
    public allocateBuffer(this: void, width: number, height: number) : number;
    public freeBuffer(this: void) : boolean;
    public freeBuffer(this: void, buffer: number) : boolean;
    public freeAllBuffers(this: void);
    public totalMemory(this: void) : number;
    public freeMemory(this: void) : number;
    public getBufferSize(this: void) : LuaMultiReturn<[number, number]>;
    public getBufferSize(this: void, index: number) : LuaMultiReturn<[number, number]>;
    public bitblt(this: void);
    public bitblt(this: void, dst: number, col: number, row: number, width: number, height: number, src: number, fromCol: number, fromRow: number);
}