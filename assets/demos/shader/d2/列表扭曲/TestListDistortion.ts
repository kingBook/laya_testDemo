const { regClass, property } = Laya;

@regClass()
export class TestListDistortion extends Laya.Script {

    @property({ type: Laya.Material, private: false })
    private _mat: Laya.Material;

    @property({ type: Laya.Box, private: false })
    private _listBox: Laya.Box;

    @property({ type: Laya.List, private: false })
    private _list: Laya.List;

    @property({ type: Laya.Box, private: false })
    private _scaleBox: Laya.Box;

    onAwake(): void {
        // ----------------------------------------------
        this._list.itemRender.data.material = {
            "_$uuid": `${this._mat.uuid}`,
            "_$type": "Material"
        }

        this._list.array = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

        const scaleFn = () => {
            this._list.content.children.forEach(child => {
                console.log(this._list.scrollBar.value);

                const isListItem = child.name.indexOf("item") >= 0;
                if (!isListItem) return;

                const cell = child as Laya.Box;
                cell.children.forEach(cellChild => {
                    const image = cellChild as Laya.Image;
                    if(!image)return;

                    image.material ??= this._mat;
                    image.material.setVector2("u_center",
                        new Laya.Vector2(
                            this._listBox.x + this._listBox.width * 0.5,
                            this._listBox.y + this._list.scrollBar.value + this._listBox.height * 0.5
                        )
                    );
                    image.material.setVector2("u_viewSize",
                        new Laya.Vector2(
                            this._listBox.width,
                            this._listBox.height
                        )
                    );
                });

            });
        };

        this._list.scrollBar.changeHandler = new Laya.Handler(this, () => {
            scaleFn();
        });
        scaleFn();
        // ----------------------------------------------

        // ----------------------------------------------
        this._scaleBox.children.forEach(item => {
            const image = item as Laya.Image;
            image.material.setVector2("u_center",
                new Laya.Vector2(
                    this._scaleBox.x + this._scaleBox.width * 0.5,
                    this._scaleBox.y + this._scaleBox.height * 0.5
                )
            );
            image.material.setVector2("u_viewSize",
                new Laya.Vector2(
                    this._scaleBox.width,
                    this._scaleBox.height
                )
            );
        });
        // ----------------------------------------------

    }
}