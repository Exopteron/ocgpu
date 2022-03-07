import { ThreadAPI } from "./constants";

export class ThreadPool {
    private threads: Thread[] = [];
    private waiting: ((param: any[]) => void)[] = [];
    private cap: number;
    constructor(cap: number) {
        this.cap = cap;
    }
    public execute(func: (param: any[]) => void) {
        if (this.threads.length >= this.cap) {
            //print("Waiting on it");
            this.waiting.push(func);
        } else {
            //print("Creating");
            this.threads.push(ThreadAPI.create(func));
        }
    }
    private remove(index: number) : void {
        this.threads.splice(index, 1);
    }
    public wait() : void {
        while (this.waiting.length > 0) {
            let func = this.waiting.pop();
            while (true) {
                for (let i = 0; i < this.threads.length; i++) {
                    let thread = this.threads[i];
                    if (thread.status() == "dead") {
                        //print("Dead");
                        this.remove(i);
                    }
                    //os.sleep(0);
                }
                //print("Threads: " + this.threads.length);
                if (this.threads.length < this.cap) {
                    break;
                }
            }
            //print("spawning thread");
            this.threads.push(ThreadAPI.create(func));
        }
        for (let thread of this.threads) {
            thread.join();
        }
    }
}