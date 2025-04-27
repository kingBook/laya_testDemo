const { regClass, property } = Laya;

/** 加载场景时的进度页面 */
@regClass()
export class SceneLonadingPage extends Laya.Script {

    @property({ type: Laya.ProgressBar, private: false, tips: "进度条" })
    private _progressBar: Laya.ProgressBar;

    @property({ type: Laya.Label, private: false, tips: "进度文本" })
    private _progressLabel: Laya.Label;

    /**
     * 设置加载的进度
     * @param value 0-1
     */
    public setProgress(value: number): void {
        this._progressBar.value = Laya.MathUtil.clamp01(value);
        this._progressLabel.text = Math.floor(value * 100) + "%";
    }


}