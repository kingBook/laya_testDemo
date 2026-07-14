{
  "_$ver": 1,
  "_$id": "0ip9gzgx",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestRocketChart",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "53ff027d-3d78-489c-818b-d61ccdbbb14a",
      "scriptPath": "demos/火箭图表测试/TestRocketChart.ts"
    }
  ],
  "_$child": [
    {
      "_$id": "xu5la9vr",
      "_$type": "Box",
      "name": "RocketChart",
      "x": 72,
      "y": 19,
      "width": 600,
      "height": 400,
      "bgColor": "#385163",
      "_$comp": [
        {
          "_$type": "a49eb932-cb92-4e35-9b5b-b1eebd1fdef7",
          "scriptPath": "demos/火箭图表测试/rocketChart/RocketChart.ts",
          "_canvas": {
            "_$ref": "oxyf25e9"
          },
          "_triangle": {
            "_$ref": "aqroded6"
          },
          "_line": {
            "_$ref": "n52manlf"
          },
          "_lineHead": {
            "_$ref": "xd0dxqjx"
          },
          "_animCurve1": {
            "_$type": "582992a0-a2fc-45a6-92d7-9517db859673",
            "keys": [
              {
                "_$type": "FloatKeyframe",
                "inTangent": 0,
                "outTangent": 0,
                "value": 0,
                "inWeight": 0,
                "outWeight": 0.42,
                "weightedMode": 0,
                "time": 0
              },
              {
                "_$type": "FloatKeyframe",
                "inTangent": 0,
                "outTangent": 0,
                "value": 1,
                "inWeight": 2.220446049250313e-16,
                "outWeight": 0,
                "weightedMode": 0,
                "time": 1
              }
            ]
          },
          "_animCurve2": {
            "_$type": "582992a0-a2fc-45a6-92d7-9517db859673",
            "keys": [
              {
                "_$type": "FloatKeyframe",
                "inTangent": 0,
                "outTangent": 0,
                "value": 0,
                "inWeight": 0,
                "outWeight": 1,
                "weightedMode": 0,
                "time": 0
              },
              {
                "_$type": "FloatKeyframe",
                "inTangent": 0,
                "outTangent": 0,
                "value": 1,
                "inWeight": 2.220446049250313e-16,
                "outWeight": 0,
                "weightedMode": 0,
                "time": 1
              }
            ]
          }
        }
      ],
      "_$child": [
        {
          "_$id": "oxyf25e9",
          "_$type": "Box",
          "name": "canvas",
          "x": 50,
          "width": 550,
          "height": 350,
          "left": 50,
          "right": 0,
          "top": 0,
          "bottom": 50,
          "bgColor": "rgba(30,113,142,0.39215686274509803)",
          "_$child": [
            {
              "_$id": "aqroded6",
              "_$type": "Sprite",
              "name": "triangle",
              "width": 100,
              "height": 100,
              "_$comp": [
                {
                  "_$type": "03fab6c1-9262-46bb-a21d-81a2a9cdac59",
                  "scriptPath": "demos/火箭图表测试/rocketChart/Mesh2dGraphics.ts",
                  "sharedMaterial": {
                    "_$uuid": "a7957581-7184-4bb9-86b6-7a4f07938524",
                    "_$type": "Material"
                  }
                }
              ]
            },
            {
              "_$id": "n52manlf",
              "_$type": "Sprite",
              "name": "line",
              "y": 350,
              "width": 100,
              "height": 100,
              "_$comp": [
                {
                  "_$type": "03fab6c1-9262-46bb-a21d-81a2a9cdac59",
                  "scriptPath": "demos/火箭图表测试/rocketChart/Mesh2dGraphics.ts",
                  "sharedMaterial": {
                    "_$uuid": "7eb950e9-b434-40fa-a38f-3e74c0f7e501",
                    "_$type": "Material"
                  }
                }
              ]
            },
            {
              "_$id": "xd0dxqjx",
              "_$type": "Sprite",
              "name": "lineHead",
              "y": 350,
              "width": 30,
              "height": 30,
              "_gcmds": [
                {
                  "_$type": "DrawCircleCmd",
                  "x": 0,
                  "y": 0,
                  "radius": 0.5,
                  "percent": true,
                  "lineWidth": 1,
                  "lineColor": "#000000",
                  "fillColor": "#ffffff"
                },
                {
                  "_$type": "DrawLineCmd",
                  "fromX": 0,
                  "fromY": 0,
                  "toX": -1,
                  "toY": 0,
                  "percent": true,
                  "lineWidth": 15,
                  "lineColor": "#ffffff"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}