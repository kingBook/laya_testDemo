const { regClass, property } = Laya;

@regClass()
export class TestCells extends Laya.Script {

    @property({ type: Laya.List })
    list: Laya.List;

    onAwake(): void {
        this.list.array = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
        this.list.renderHandler = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
            if (!cell.dataSource) return;
            cell.getChild("label", Laya.Label).text = cell.dataSource.id;
        });
        this.printCells();
    }

    private printCells(): void {
        // list.cells的长度与repeatX,repeatY一致，与列表数据源不一定相等, 并且会跟随着列表滚动变化
        this.list.cells.forEach((cell, index) => {
            console.log("cells", index, cell.name, cell.getChild("label", Laya.Label).text);
        });
        console.log("--------------------");
        // list.getCell() 会跟随着列表滚动变化，不在可视区域内的索引获取到 null
        for (let i = 0; i < this.list.length; i++) {
            const cell = this.list.getCell(i);
            if (!cell) console.log("getCell", i, null);
            else console.log("getCell", i, cell.name, cell.getChild("label", Laya.Label).text);
        }
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {
            this.printCells();
        }
    }
}