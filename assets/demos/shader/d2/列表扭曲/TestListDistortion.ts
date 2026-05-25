const { regClass, property } = Laya;

@regClass()
export class TestListDistortion extends Laya.Script {

    @property({ type: Laya.List, private: false })
    private _list: Laya.List;

    onAwake(): void {
        // 设置列表缓存模式，使 shader 作用于整个 bitmap
        this._list.cacheAs = 'bitmap';
        
        // 获取材质并配置圆柱扭曲参数
        const mat = this._list.material as Laya.Material;
        if (mat) {
            // 圆柱半径：值越小扭曲越强，值越大扭曲效果越弱
            mat.setFloat("u_Radius", 300.0);
            // 初始滚动偏移
            mat.setFloat("u_Offset", 0.0);
        }

        
        // 绑定列表滚动条事件，实时更新圆柱扭曲效果中心位置
        if (this._list.scrollBar) {
            this._list.scrollBar.changeHandler = new Laya.Handler(this, () => {
                if (mat) {
                    // 同步滚动位置到着色器，使扭曲中心跟随滚动
                    mat.setFloat("u_Offset", this._list.scrollBar.value * 0.5);
                }
            });
        }
    }
}