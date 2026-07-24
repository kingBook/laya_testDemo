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
          "_multiplierLabel": {
            "_$ref": "sksvv25a"
          },
          "curve1": {
            "_$type": "582992a0-a2fc-45a6-92d7-9517db859673",
            "keys": [
              {
                "_$type": "FloatKeyframe",
                "inTangent": 0,
                "outTangent": 0.44571428571428573,
                "value": 0,
                "inWeight": 0,
                "outWeight": 0.5,
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
          "curve1SpeedX": 5,
          "curve2": {
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
                "inTangent": 98.99999999999991,
                "outTangent": 0,
                "value": 1,
                "inWeight": 0.010000000000000009,
                "outWeight": 0,
                "weightedMode": 0,
                "time": 1
              }
            ]
          },
          "rangeNormalMapY": [
            0.8,
            1
          ],
          "showGrid": true
        }
      ],
      "_$child": [
        {
          "_$id": "oxyf25e9",
          "_$type": "Box",
          "name": "canvas",
          "x": 50,
          "y": 30,
          "width": 520,
          "height": 330,
          "left": 50,
          "right": 30,
          "top": 30,
          "bottom": 40,
          "bgColor": "rgba(30,113,142,0.39215686274509803)",
          "_$child": [
            {
              "_$id": "aqroded6",
              "_$type": "Sprite",
              "name": "triangle",
              "y": 340,
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
              "y": 340,
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
              "y": 340,
              "width": 100,
              "height": 100,
              "_gcmds": [],
              "_filters": [],
              "_$child": [
                {
                  "_$id": "clujabsf",
                  "_$type": "Sprite",
                  "name": "graphics",
                  "width": 100,
                  "height": 100,
                  "_gcmds": [
                    {
                      "_$type": "DrawCircleCmd",
                      "x": 0,
                      "y": 0,
                      "radius": 0.1,
                      "percent": true,
                      "lineWidth": 1,
                      "fillColor": "#ffffff"
                    },
                    {
                      "_$type": "DrawPolyCmd",
                      "x": 0,
                      "y": 0,
                      "points": [
                        0,
                        -11,
                        -35,
                        0,
                        0,
                        11
                      ],
                      "lineWidth": 1,
                      "fillColor": "#ffffff"
                    }
                  ],
                  "_filters": []
                }
              ]
            },
            {
              "_$id": "4i8rl6rg",
              "_$type": "Box",
              "name": "multiplierBox",
              "x": 160,
              "y": 22,
              "width": 200,
              "height": 120,
              "centerX": 0,
              "centerY": -83,
              "_$child": [
                {
                  "_$id": "sksvv25a",
                  "_$type": "Label",
                  "name": "multiplierLabel",
                  "x": 39,
                  "y": 35,
                  "width": 122,
                  "height": 51,
                  "centerX": 0,
                  "centerY": 0,
                  "text": "{p=1.00}x",
                  "fontSize": 50,
                  "color": "#ffffff",
                  "fitContent": "yes",
                  "templateVars": true,
                  "align": "center",
                  "valign": "middle"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}