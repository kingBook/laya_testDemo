
export class CurveEditDialog extends IEditor.Dialog {

    async create() {
        // console.log(gui.UIPackage.createWidget);
        // console.log(gui.UIPackage.resourceMgr.getRes);

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

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("width", shape.width.toString());
        svg.setAttribute("height", shape.height.toString());
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.right = "0";
        svg.style.top = "0";
        svg.style.bottom = "0";
        svg.style.pointerEvents = "auto";
        shape.element.appendChild(svg);


        const pathEl = document.createElementNS(svgNS, "path");
        pathEl.setAttribute("fill", "none");
        pathEl.setAttribute("stroke", "#00ff00");
        pathEl.setAttribute("stroke-width", "1");
        svg.appendChild(pathEl);

        const rect1 = document.createElementNS(svgNS, "rect");
        rect1.setAttribute("width", "5");
        rect1.setAttribute("height", "5");
        rect1.setAttribute("fill", "#ff0000");
        rect1.setAttribute("stroke", "#ffffff");
        rect1.setAttribute("stroke-width", "1");
        //rect1.setAttribute("transform", "rotate(45 2.5 2.5)");// 绕中心旋转45度
        svg.appendChild(rect1);



        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        panel.element.addEventListener("mousedown", (e: MouseEvent) => {
            isDragging = true;
            const rect = rect1.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            // console.log("mousedown rect1");
        });

        panel.element.addEventListener("mousemove", (e: MouseEvent) => {
            if (!isDragging) return;

            const svgRect = svg.getBoundingClientRect();
            let x = e.clientX - svgRect.left - offsetX;
            let y = e.clientY - svgRect.top - offsetY;

            // 限制在svg范围内
            const xmax = parseFloat(svg.getAttribute("width")) - parseFloat(rect1.getAttribute("width"));
            const ymax = parseFloat(svg.getAttribute("height")) - parseFloat(rect1.getAttribute("height"));
            x = Math.max(0, Math.min(x, xmax));
            y = Math.max(0, Math.min(y, ymax));

            rect1.setAttribute("x", x.toString());
            rect1.setAttribute("y", y.toString());
            //console.log("mousemove");

        });

        panel.element.addEventListener("mouseup", () => {
            isDragging = false;
            // console.log("mouseUp");

        });


        console.log("gui.GRoot.inst:", this._groot);








        this.contentPane = panel;
        this.title = "CurveEdit";
        //this.setSize(300, 300);



    }

    protected onShown(...args: any[]): void {
        this._groot.on("pointer_down", this.onPointerDown, this);
        this._groot.on("pointer_move", this.onPointerMove, this);
        this._groot.on("pointer_up", this.onPointerUp, this);
    }

    protected onHide(): void {
        this._groot.offAll("pointer_down");
        this._groot.offAll("pointer_move");
        this._groot.offAll("pointer_up");
    }
    protected onAction(): void {

    }

    protected handleKeyEvent(evt: gui.Event): void {
        console.log("handleKeyEvent:", evt);

    }

    private onPointerDown(e: gui.Event): void {
        console.log("pointer_down");
    }

    private onPointerMove(e: gui.Event): void {

    }

    private onPointerUp(e: gui.Event): void {
        console.log("pointer_up");

    }


}