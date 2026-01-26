{
  "_$ver": 1,
  "_$id": "hcdo2nr3",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestScrollingLotteryListFixedLen",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "a210ec7f-0b2d-4ec7-b184-10c44e682f27",
      "scriptPath": "demos/循环滚动抽奖列表/TestScrollingLotteryListFixedLen.ts",
      "hList": {
        "_$ref": "6kxe8xbj"
      },
      "vList": {
        "_$ref": "pnlinnwv"
      },
      "letterList": {
        "_$ref": "maucymo2"
      },
      "numberList": {
        "_$ref": "s0fi6cwi"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "x8dexbj3",
      "_$type": "Label",
      "name": "tip",
      "x": 183,
      "y": 20,
      "width": 385,
      "height": 112,
      "top": 20,
      "centerX": 0,
      "text": "按 J，设置结果\n按 K，立即设置到结果处\n按 L，开始滚动",
      "fontSize": 35,
      "color": "#ffffff",
      "fitContent": "yes",
      "valign": "middle"
    },
    {
      "_$id": "6kxe8xbj",
      "_$type": "List",
      "name": "hList",
      "x": 225,
      "y": 399,
      "width": 300,
      "height": 100,
      "centerX": 0,
      "bgColor": "#ffffff",
      "itemTemplate": {
        "_$ref": "qvi4q30r",
        "_$tmpl": "itemRender"
      },
      "repeatX": 3,
      "repeatY": 1,
      "scrollType": 1,
      "_$child": [
        {
          "_$id": "qvi4q30r",
          "_$type": "Box",
          "name": "item",
          "width": 100,
          "height": 100,
          "bgColor": "#26394e",
          "_$child": [
            {
              "_$id": "0qhcd7d8",
              "_$type": "Label",
              "name": "Label",
              "x": 35,
              "y": 20,
              "width": 30,
              "height": 61,
              "centerX": 0,
              "centerY": 0,
              "text": "0",
              "fontSize": 60,
              "color": "#ffffff",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            },
            {
              "_$id": "xzpfvxci",
              "_$type": "Label",
              "name": "labelIndex",
              "x": 43,
              "y": 69,
              "width": 15,
              "height": 31,
              "bottom": 0,
              "centerX": 0,
              "text": "-",
              "fontSize": 30,
              "color": "#ff0000",
              "fitContent": "yes"
            }
          ]
        }
      ]
    },
    {
      "_$id": "z8qpag7f",
      "_$type": "Sprite",
      "name": "redLine",
      "x": 270,
      "y": 363,
      "width": 100,
      "height": 225,
      "_gcmds": [
        {
          "_$type": "DrawLineCmd",
          "fromX": 0.5,
          "fromY": 0,
          "toX": 0.5,
          "toY": 1,
          "percent": true,
          "lineWidth": 2,
          "lineColor": "#ff0000"
        }
      ]
    }
  ]
}