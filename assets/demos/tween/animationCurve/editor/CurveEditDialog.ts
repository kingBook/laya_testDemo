
export class CurveEditDialog extends IEditor.Dialog {

    async create() {
        console.log(gui.UIPackage.createWidget);
        console.log(gui.UIPackage.resourceMgr.getRes);

        const panel = new gui.Widget();
        panel.setSize(300, 300 + 20);

        const comboBox = await gui.UIPackage.createWidget<gui.ComboBox>("~/ui/basic/ComboBox/ComboBox.widget");
        panel.addChild(comboBox);

        const shape = new gui.Shape();
        shape.x = 10;
        shape.y = 20 + 10;
        shape.width = 280;
        shape.height = 280;
        shape.drawRect(1, gui.Color.BLACK, new gui.Color("#434343"));
        panel.addChild(shape);


        const uiEl: any = shape.element;
        const overlay = document.createElement("canvas") as HTMLCanvasElement;
        overlay.style.position = "absolute";
        overlay.style.left = "0";
        overlay.style.top = "0";

        overlay.width = shape.width;
        overlay.height = shape.height;
        uiEl.appendChild(overlay);

        const ctx = overlay.getContext("2d");
        ctx.lineWidth = 4;
        ctx.strokeStyle = "white";
        ctx.fillStyle = "red";
        ctx.fillRect(100, 100, 20, 20);
        ctx.strokeRect(100, 100, 20, 20);






        this.contentPane = panel;
        this.title = "CurveEdit";
        //this.setSize(300, 300);




    }

    protected onShown(...args: any[]): void {

    }

    protected onHide(): void {

    }

}