{
  "_$ver": 1,
  "_$id": "hcdo2nr3",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestScrollingLotteryListScript",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "0d530538-ae0f-4342-87a0-2773f2f16ae4",
      "scriptPath": "demos/循环滚动抽奖列表/TestScrollingLotteryListScript.ts",
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
      "x": 184,
      "y": 20,
      "width": 383,
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
              "x": 34,
              "y": 20,
              "width": 33,
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
              "x": 45,
              "y": 69,
              "width": 10,
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
      "_$id": "pnlinnwv",
      "_$type": "List",
      "name": "vList",
      "x": 622,
      "y": 502,
      "width": 100,
      "height": 300,
      "right": 28,
      "top": 502,
      "bgColor": "#ffffff",
      "itemTemplate": {
        "_$ref": "ys3px1a8",
        "_$tmpl": "itemRender"
      },
      "repeatX": 1,
      "repeatY": 3,
      "spaceY": 20,
      "scrollType": 2,
      "_$child": [
        {
          "_$id": "ys3px1a8",
          "_$type": "Box",
          "name": "item",
          "width": 100,
          "height": 100,
          "bgColor": "#26394e",
          "_$child": [
            {
              "_$id": "8c3fbu85",
              "_$type": "Label",
              "name": "Label",
              "x": 34,
              "y": 20,
              "width": 33,
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
              "_$id": "ltstwnr9",
              "_$type": "Label",
              "name": "labelIndex",
              "x": 47,
              "y": 79,
              "width": 7,
              "height": 21,
              "visible": false,
              "bottom": 0,
              "centerX": 0,
              "text": "-",
              "fontSize": 20,
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
    },
    {
      "_$id": "rkb4wi9d",
      "_$type": "Panel",
      "name": "bodyPanel",
      "y": 1400,
      "width": 750,
      "height": 200,
      "_mouseState": 2,
      "left": 0,
      "right": 0,
      "bottom": 0,
      "bgColor": "#ffffff",
      "_$child": [
        {
          "_$id": "maucymo2",
          "_$var": true,
          "_$type": "List",
          "name": "letterList",
          "y": 50,
          "width": 750,
          "height": 70,
          "left": 0,
          "right": 0,
          "bottom": 80,
          "itemTemplate": {
            "_$ref": "cjqwp5ry",
            "_$tmpl": "itemRender"
          },
          "repeatX": 7,
          "repeatY": 1,
          "spaceX": 10,
          "scrollType": 1,
          "_$child": [
            {
              "_$id": "cjqwp5ry",
              "_$type": "Box",
              "name": "item",
              "width": 100,
              "height": 70,
              "bgColor": "#d5e1ed",
              "_$child": [
                {
                  "_$id": "6afsb2rt",
                  "_$type": "Label",
                  "name": "Label",
                  "x": 36,
                  "y": 15,
                  "width": 29,
                  "height": 41,
                  "centerX": 0,
                  "centerY": 0,
                  "text": "A",
                  "fontSize": 40,
                  "fitContent": "yes",
                  "bold": true
                }
              ]
            }
          ]
        },
        {
          "_$id": "s0fi6cwi",
          "_$var": true,
          "_$type": "List",
          "name": "numberList",
          "y": 130,
          "width": 750,
          "height": 70,
          "_mouseState": 1,
          "left": 0,
          "right": 0,
          "bottom": 0,
          "itemTemplate": {
            "_$ref": "ervgoolu",
            "_$tmpl": "itemRender"
          },
          "repeatX": 7,
          "repeatY": 1,
          "spaceX": 10,
          "scrollType": 1,
          "_$child": [
            {
              "_$id": "ervgoolu",
              "_$type": "Box",
              "name": "item",
              "width": 100,
              "height": 70,
              "bgColor": "#d5e1ed",
              "_$child": [
                {
                  "_$id": "ii4im3z0",
                  "_$type": "Label",
                  "name": "Label",
                  "x": 39,
                  "y": 15,
                  "width": 22,
                  "height": 41,
                  "centerX": 0,
                  "centerY": 0,
                  "text": "0",
                  "fontSize": 40,
                  "fitContent": "yes",
                  "bold": true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "_$id": "h2dw9doh",
      "_$type": "List",
      "name": "List",
      "x": 622,
      "y": 502,
      "width": 200,
      "height": 300,
      "repeatX": 1,
      "repeatY": 1,
      "_$comp": [
        {
          "_$type": "250a8313-8524-4316-aea2-24f623598970",
          "scriptPath": "demos/循环滚动抽奖列表/ScrollingLotteryListScript.ts",
          "focusT": 0.5,
          "speedSign": 1,
          "aniTotalTime": 5078,
          "circles": 298,
          "aniCurve": {
            "_$type": "582992a0-a2fc-45a6-92d7-9517db859673",
            "keys": [
              {
                "_$type": "FloatKeyframe",
                "inTangent": 0,
                "outTangent": 0.4,
                "value": 0,
                "inWeight": 0,
                "outWeight": 0.25,
                "weightedMode": 0,
                "time": 0
              },
              {
                "_$type": "FloatKeyframe",
                "inTangent": 0,
                "outTangent": 0,
                "value": 1,
                "inWeight": 0.75,
                "outWeight": 0,
                "weightedMode": 0,
                "time": 1
              }
            ]
          }
        }
      ]
    }
  ]
}