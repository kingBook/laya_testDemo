const { regClass, property } = Laya;

@regClass()
export class TestListDistortion extends Laya.Script {

    @property({ type: Laya.Material, private: false })
    private _mat: Laya.Material;

    @property({ type: Laya.List, private: false })
    private _list: Laya.List;



    onStart(): void {
        this._list.array = [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}];
    }
}