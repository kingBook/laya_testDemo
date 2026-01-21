const { regClass, property } = Laya;

export class Foo {

    public fn: () => void;
    public fnCaller: any;
    
    public constructor(fn: () => void, fnCaller: any) {
        this.fn = fn;
        this.fnCaller = fnCaller;
    }

    public runFn(): void {
        this.fn.apply(this.fnCaller);
    }
}


@regClass()
export class TestArrowFunction extends Laya.Script {

    private _num: number = 123;

    public onAwake(): void {
        const foo = new Foo(() => {
            console.log("this:", this, "_num:", this._num);
        }, this);
        foo.runFn(); // TestArrowFunction {_hideFlags:…} _num: 123


        const obj = { _num: 456 };

        const foo2 = new Foo(() => {
            console.log("this:", this, "_num:", this._num);
        }, obj);
        foo2.runFn(); // TestArrowFunction {_hideFlags:…} _num: 123
        

    }
}