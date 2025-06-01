const { regClass, property } = Laya;

@regClass()
export class TestPromiseReturn extends Laya.Script {


    private resolvePromise(): Promise<any> {
        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            setTimeout(() => {
                resolve("resolve promise");
            }, 1000);
        });
    }


    private rejectPromise(): Promise<any> {
        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            setTimeout(() => {
                reject("reject promise");
            }, 1000);
        });
    }

    public onAwake(): void {
        const pa = this.resolvePromise();
        const pb = this.resolvePromise().then();
        const pc = this.resolvePromise().catch();
        console.log("pa", pa);
        console.log("pb", pb);
        console.log("pc", pc);
        /* output:
        pa Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: "resolve promise"
        pb Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: "resolve promise"
        pc Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: "resolve promise"
        */

        const pb1 = this.resolvePromise().then(res => { });
        const pb2 = this.resolvePromise().then(res => { }, err => { });
        const pb3 = this.resolvePromise().then(res => { }, err => { return err; });
        console.log("pb1", pb1);
        console.log("pb2", pb2);
        console.log("pb3", pb3);
        /* output:
       pb1 Promise[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: undefined
       pb2 Promise[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: undefined
       pb3 Promise[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: undefined
       */

        const pb4 = this.resolvePromise().then(res => { return res; });
        const pb5 = this.resolvePromise().then(res => { return res; }, err => { });
        const pb6 = this.resolvePromise().then(res => { return res; }, err => { return err; });
        console.log("pb4", pb4);
        console.log("pb5", pb5);
        console.log("pb6", pb6);
        /* output:
        pb4 Promise[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: "resolve promise"
        pb5 Promise[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: "resolve promise"
        pb6 Promise[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: "resolve promise"
        */
    }

    public onEnable(): void {
        const p1 = this.rejectPromise();
        const p2 = this.rejectPromise().then();
        const p3 = this.rejectPromise().catch();
        console.log("p1", p1);
        console.log("p2", p2);
        console.log("p3", p3);
        /* output:
        p1 Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "rejected"[[PromiseResult]]: "reject promise"
        p2 Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "rejected"[[PromiseResult]]: "reject promise"
        p3 Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "rejected"[[PromiseResult]]: "reject promise"
        */

        const p11 = this.rejectPromise().then(res => { }, err => { });
        const p22 = this.rejectPromise().then(res => { }, err => { return err; });
        console.log("p11", p11);
        console.log("p22", p22);
        /* output:
        p11 Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: undefined
        p22 Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: "reject promise"
        */

        const p33 = this.rejectPromise().catch(err => { });
        const p44 = this.rejectPromise().catch(err => { return err; });
        console.log("p33", p33);
        console.log("p44", p44);
        /* output:
        p33 Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: undefined
        p44 Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: "reject promise"
        */
    }

    public onStart(): void {
        this.resolvePromise().then(res => { }).then(res => { console.log("res", res); });             // 1秒后，输出：res undefined
        this.resolvePromise().then(res => { return res; }).then(res => { console.log("res", res); }); // 1秒后，输出：res resolve promise

        this.rejectPromise()
            .then(res => { return res; }, err => { }) // 定义了 onrejected 回调，在赋值到变量或链式调用时，将不再被执行
            .then(res => { return res; }, err => { console.log("err0", err); }); // 无输出

        this.rejectPromise()
            .then(res => { return res; }, err => { return err; }) // 定义了 onrejected 回调，在赋值到变量或链式调用时，将不再被执行
            .then(res => { return res; }, err => { console.log("err1", err); }); // 无输出

        this.rejectPromise()
            .then(res => { return res; }) // 
            .then(res => { return res; }, err => { console.log("err2", err); }); // 1秒后，输出：err2 reject promise

        this.rejectPromise().catch().catch(err => { console.log("err3", err); }); // 1秒后，输出：err3 reject promise

        this.rejectPromise()
            .catch(err => { }) // 定义了 onrejected 回调，在赋值到变量或链式调用时，将不再被执行
            .catch(err => { console.log("err4", err); }); // 无输出
        this.rejectPromise()
            .catch(err => { return err; }) // 定义了 onrejected 回调，在赋值到变量或链式调用时，将不再被执行
            .catch(err => { console.log("err5", err); }); // 无输出
    }

}