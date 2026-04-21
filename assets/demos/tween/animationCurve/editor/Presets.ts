/** 预设 */
export default class Presets {

    /** 预设的缓动数据 */
    public static readonly easeDatas = [
        { name: "linear", index: 0, values: [0, 0, 1, 1], isDefault: true },
        { name: "ease", index: 1, values: [.25, .1, .25, 1], isDefault: false },
        { name: "ease-in", index: 2, values: [.42, 0, 1, 1], isDefault: false },
        { name: "ease-out", index: 3, values: [0, 0, .58, 1], isDefault: false },
        { name: "ease-in-out", index: 4, values: [.42, 0, .58, 1], isDefault: false }
    ];
}