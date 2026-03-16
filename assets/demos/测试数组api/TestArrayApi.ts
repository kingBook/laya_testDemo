const { regClass, property } = Laya;

@regClass()
export class TestArrayApi extends Laya.Script {

    onAwake(): void {
        this.testReduce1();
        this.testReduce2();
    }

    private testReduce1(): void {
        console.log("-----testReduce1-----");
        const arr = [1, 2, 3, 4];
        // reduce() 最后一个参数是初始值，如果有内部回调从0索引开始，否则从1索引开始
        // * 注意 如果数组为空数组（[]），又没填初始值，会报错
        const total = arr.reduce((sumItem: number, curItem: number, curIndex: number, collection: any[]) => {
            console.log(curItem, curIndex, collection);
            return sumItem + curItem;
        }, 0);
        console.log("total", total);
    }

    private testReduce2(): void {
        console.log("----- testReduce2-----");
        const arr = [{ n: 1, p: 1 }, { n: 2 }, { n: 3, p: 3 }, { n: 4 }];
        const total = arr.reduce((sumItem: number, curItem: { n: number }, curIndex: number, collection: any[]) => {
            console.log(curItem, curIndex, collection);
            return sumItem + curItem.n;
        }, 0);
        console.log("total", total);
    }

    private testFrom(): void {
        console.log("----- testFrom -----");
        const arr = [1, 2, 3, 4];
        //arr.includes()
    }


}