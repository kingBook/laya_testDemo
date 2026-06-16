const { regClass, property } = Laya;

@regClass()
export class TestChangeItem extends Laya.Script {

    @property({ type: Laya.List })
    list: Laya.List;

    onAwake(): void {
        this.list.array = [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
        this.list.renderHandler = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
            if (!cell.dataSource) return;

            console.log("render item", index);

            cell.getChild("label", Laya.Label).text = cell.dataSource.id;
        });
    }



    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {
            const index = 3;

            console.log("changeItem index:", index);

            this.list.changeItem(index, { id: 'j' });
        } else if (evt.key === 'k') {
            const index = 5;

            console.log("changeItem index:", index);

            this.list.changeItem(index, { id: 'k' });
        }
    }
}