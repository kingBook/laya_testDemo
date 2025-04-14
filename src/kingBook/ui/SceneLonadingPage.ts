const { regClass, property } = Laya;

@regClass()
export class SceneLonadingPage extends Laya.Script {

    @property({type:Laya.ProgressBar, private:false})
    private _progressBar:Laya.ProgressBar;

    @property({type:Laya.Label, private:false})
    private _progressLabel:Laya.Label;

    /**
     * 设置加载的进度
     * @param value 0-1
     */
    public setProgress(value:number):void{
        this._progressBar.value = value;
        this._progressLabel.text = Math.floor(value*100)+"%";
    }


}