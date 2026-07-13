import { Convexdecomposition } from "./Convexdecomposition";

import * as poly2tri from "./poly2tri/poly2tri"



const { regClass, property } = Laya;

@regClass()
export class TestConvexdecomposition extends Laya.Script {

    /** 用于显示鼠标点击绘制的凹多边形的sprite */
    private _polOriginPointsSprite: Laya.Sprite;
    /** 用于显示凸分解后的多边形的sprite */
    private _polygonPointsSprite: Laya.Sprite;
    /** 已开始画多边形 */
    private _isBeginDrawPol: boolean = true;
    /** 鼠标点击绘制的凹多边形顶点*/
    private _polOriginPoints: Laya.IV2[] = [];
    /** 凸分解后的多边形顶点 */
    private _polygonPoints: Laya.IV2[][];

    /** 用于显示孔洞的sprite */
    private _holePointsSpirte: Laya.Sprite;
    /** 已开始画孔洞 */
    private _isBeginDrawHole: boolean;
    /** 孔洞顶点列表 */
    private _holePoints: Laya.IV2[][] = [];
    /** 当前绘制的孔洞索引 */
    private _holeIndex: number = 0;

    private _testVertices: Laya.IV2[] = [
        {
            "x": 202,
            "y": 412
        },
        {
            "x": 677,
            "y": 412
        },
        {
            "x": 457,
            "y": 972
        },
        {
            "x": 209,
            "y": 876
        }
    ];

    private _testHolePoints: Laya.IV2[][] = [
        [
            {
                "x": 309,
                "y": 495
            },
            {
                "x": 448,
                "y": 501
            },
            {
                "x": 348,
                "y": 595
            }
        ],
        [
            {
                "x": 425,
                "y": 653
            },
            {
                "x": 469,
                "y": 797
            },
            {
                "x": 349,
                "y": 799
            }
        ]
    ];

    onAwake(): void {
        // 用于显示鼠标点击绘制的凹多边形
        this._polOriginPointsSprite = new Laya.Sprite();
        this.owner.addChild(this._polOriginPointsSprite);

        // 用于显示凸分解后的多边形
        this._polygonPointsSprite = new Laya.Sprite();
        this.owner.addChild(this._polygonPointsSprite);

        // 用于显示孔洞
        this._holePointsSpirte = new Laya.Sprite();
        this.owner.addChild(this._holePointsSpirte);



    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'h') {
            // 绘制孔洞开启 或 绘制孔洞结束
            this._isBeginDrawHole = !this._isBeginDrawHole;
            console.log(this._isBeginDrawHole ? "绘制孔洞开启" : "绘制孔洞结束");
        } else if (evt.key === ' ') {
            this._holeIndex++;
            console.log("完成一个孔洞绘制");
        } else if (evt.key === 'f') {
            this._polOriginPoints.length = 0;
            this._polOriginPoints.push(...this._testVertices);
            console.log("从指定的顶点数组画一个凹多边形");
        } else if (evt.key === 'd') {
            this._holePoints.length = 0;
            this._holePoints.push(...this._testHolePoints);
            console.log("从指定的顶点数组画孔洞");
        } else if (evt.key === 'c') {
            // 清空鼠标绘制的凹多边形
            this._polOriginPoints && (this._polOriginPoints.length = 0);
            // 清空凸分解后的多边形
            this._polygonPoints && (this._polygonPoints.length = 0);
            // 清空孔洞
            this._holePoints.length = 0;
            this._holeIndex = 0;

            console.log("已清空");
        } else if (evt.key === 'v') {
            console.log("凸分解检验："/*, Separator.validate(this._polOriginPoints).msg*/);
        } else if (evt.key === 'b') {
            console.log("凸分解 开始 -----------------");
            console.time("separate");
            console.log("即将被分解的原凹多边形顶点", this._polOriginPoints);
            console.log("即将被合并的原孔洞顶点", this._holePoints);

            // try {
            //     this._polygonPoints = Convexdecomposition.separate(this._polOriginPoints, this._holePoints, 30);
            //     this._polOriginPoints.length = 0;
            //     this._holePoints.length = 0;
            // } catch (err) {
            //     this._polOriginPoints.length = 0;
            //     this._holePoints.length = 0;

            //     this._polygonPoints ||= [];
            //     this._polygonPoints.length = 0;
            //     this._polygonPoints.push(Convexdecomposition.testMergedHoleVertices);
            //     console.log("this._polygonPoints:", this._polygonPoints);
            //     console.error(err);
            // }

            const pts = new poly2tri.std_vector(this._polOriginPoints.map(item => new poly2tri.Point(item.x, item.y)));
            const swctx = new poly2tri.CDT(pts);

            this._holePoints.forEach(pts => {
                const holePoints = new poly2tri.std_vector(pts.map(item => new poly2tri.Point(item.x, item.y)));
                swctx.AddHole(holePoints)
            });

            swctx.Triangulate();


            this._polygonPoints = [];
            const triangles = swctx.GetTriangles();
            for (let i = 0; i < triangles.size(); i++) {
                const t = triangles.at(i);
                this._polygonPoints.push([t.GetPoint(0), t.GetPoint(1), t.GetPoint(2)]);
            }

            // swctx.addHoles(this._holePoints);
            // swctx.triangulate();
            // const triangles = swctx.getTriangles();
            // this._polygonPoints = triangles.map(t=>{
            //     return t.getPoints();
            // });

            console.timeEnd("separate");
            console.log("凸分解 结束 -----------------", "凸多形数量:", this._polygonPoints.length, "凸多边形数组:", this._polygonPoints);
        }
    }

    onMouseClick(evt: Laya.Event): void {
        if (this._isBeginDrawHole) {
            this._holePoints[this._holeIndex] ||= [];
            this._holePoints[this._holeIndex].push({ x: evt.stageX, y: evt.stageY });
            console.log("绘制孔洞：", 'x:', evt.stageX, 'y:', evt.stageY);
        } else if (this._isBeginDrawPol) {
            this._polOriginPoints.push({ x: evt.stageX, y: evt.stageY });
            console.log("绘制凹多边形：", 'x:', evt.stageX, 'y:', evt.stageY);
        }
    }

    onUpdate(): void {
        // 画鼠标绘制的凹多边形
        this.drawPoints(this._polOriginPointsSprite, this._polOriginPoints, true, false, "#FFFFFF", 4, false);

        // 画凸分解后的多边形
        this.drawPolygonPoints();

        // 画孔洞
        this.drawHolePoints();
    }

    /**
     * 画多边形
     * @param sprite 用于 graphics 的 Sprite
     * @param pts 顶点数组
     * @param clearOnStart 画之前清除内容
     * @param close 闭合
     * @param lineColor 线颜色
     * @param lineWidth 线宽
     * @param isDisplayNo 是否显示顶点编号
     * @returns 
     */
    private drawPoints(sprite: Laya.Sprite, pts: Laya.IV2[], clearOnStart: boolean, close: boolean, lineColor: string = "#FFFFFF", lineWidth: number = 2, isDisplayNo: boolean = false): void {
        if (clearOnStart) {
            sprite.graphics.clear();
            sprite.removeChildren();
        }
        if (pts.length <= 0) return;

        const xys: number[] = [];
        pts.forEach((p, i) => {
            // 顶点编号
            const somePosOtherTxt = sprite.children.findLast(node => {
                const txt = node as Laya.Text;
                if (!txt) return false;
                const d = Math.sqrt(Math.pow(txt.x - p.x, 2) + Math.pow(txt.y - p.y, 2));
                return d <= 1;
            }) as Laya.Text;
            if ((!somePosOtherTxt || parseInt(somePosOtherTxt.text) !== i) && isDisplayNo) {
                const noTxt = new Laya.Text();
                noTxt.color = "#ffffff";
                noTxt.text = `${i}`;
                noTxt.pos(p.x, somePosOtherTxt ? p.y + noTxt.height : p.y);
                sprite.addChild(noTxt);
            }
            // 添加顶点
            xys.push(p.x, p.y);
        });

        // 闭合
        if (close) {
            if (xys.length >= 2) {
                xys.push(xys[0], xys[1]);
            }
        }
        sprite.graphics.drawLines(0, 0, xys, lineColor, lineWidth);
    }

    /** 画凸分解后的多边形 */
    private drawPolygonPoints(): void {
        this._polygonPointsSprite.graphics.clear();

        if (!this._polygonPoints || this._polygonPoints.length <= 0) return;

        this._polygonPoints.forEach(pts => {
            this.drawPoints(this._polygonPointsSprite, pts, false, true, "#00FF00", 2, true);
        });
    }

    /** 画孔洞 */
    private drawHolePoints(): void {
        this._holePointsSpirte.graphics.clear();

        if (!this._holePoints || this._holePoints.length <= 0) return;

        this._holePoints.forEach(pts => {
            this.drawPoints(this._holePointsSpirte, pts, false, false, "#00FFFF", 2, false);
        });
    }




}