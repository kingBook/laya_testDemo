const { regClass, property } = Laya;

@regClass()
export class TestList extends Laya.Script {

    declare owner: Laya.List;

    onAwake(): void {

        // 列表数据源
        const listData: any[] = [];
        for (let i = 0; i < 15/*this.owner.repeatY*/; i++) {
            listData[i] = { id: i };
        }
        this.owner.array = listData;

        // 点击列表项，3D UI 需要开启 'Enable Hit'
        this.owner.mouseHandler = new Laya.Handler(this, (e: Laya.Event, index: number) => {
            if (e.type == Laya.Event.CLICK) {
                console.log("mouseListItem", e.type, index, this.owner.getCell(index).dataSource.id);
            }
        });



        // 渲染列表项
        this.owner.renderHandler = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
            const cellDataSource: { id: number } = cell.dataSource;
            if (!cellDataSource) return;

            const flipBox = cell.getChild("flipBox", Laya.Box);
            // flipBox.cacheAs = "bitmap";
            // flipBox.scaleY = -1;

            const txtNO = flipBox.getChild("txtNO", Laya.Label);
            txtNO.text = `${cellDataSource.id}`;

            const spine = flipBox.getChild("spine", Laya.Sprite);
            if (spine) {
                //spine.visible = true;
            }
        });

        // this.owner.scrollBar.changeHandler = new Laya.Handler(this, (value) => {
        //     //this.owner.scrollBar.value = - value;
        // });

    }

}