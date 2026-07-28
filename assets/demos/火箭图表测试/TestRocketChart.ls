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
      "scriptPath": "demos/火箭图表测试/TestRocketChart.ts",
      "_rocketChart": {
        "_$ref": "285rp8ua",
        "_$type": "a49eb932-cb92-4e35-9b5b-b1eebd1fdef7"
      },
      "_playerJumpPointPrefab": {
        "_$uuid": "11fb67d6-9330-43e4-a8bd-80375d0fba0d",
        "_$type": "Prefab"
      },
      "_otherUserJumpPointPrefab": {
        "_$uuid": "13513fbb-29cb-46e1-9846-64a3ef7cca59",
        "_$type": "Prefab"
      },
      "graphicsMaterial": {
        "_$uuid": "ed54ef60-b7f3-4baf-b22f-f945242e8028",
        "_$type": "Material"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "285rp8ua",
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
            "_$ref": "oz6s85xo"
          },
          "_shapeBox": {
            "_$ref": "qpqz6ib3"
          },
          "_triangle": {
            "_$ref": "l1jpd696"
          },
          "_line": {
            "_$ref": "w5qpmom6"
          },
          "_lineHead": {
            "_$ref": "0haqjez3"
          },
          "_multiplierBox": {
            "_$ref": "mr4shopw"
          },
          "_multiplierLabel": {
            "_$ref": "3uh1ijc4"
          },
          "showGrid": false,
          "_rulerLabelMargin": 10,
          "_rulerFontSize": 18,
          "_rulerFontColor": {
            "_$type": "Color",
            "r": 0.9,
            "g": 0.9,
            "b": 0.9
          }
        }
      ],
      "_$child": [
        {
          "_$id": "oz6s85xo",
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
              "_$id": "qpqz6ib3",
              "_$type": "Box",
              "name": "shapeBox",
              "width": 520,
              "height": 330,
              "visible": false,
              "left": 0,
              "right": 0,
              "top": 0,
              "bottom": 0,
              "_$child": [
                {
                  "_$id": "l1jpd696",
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
                  "_$id": "w5qpmom6",
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
                  "_$id": "0haqjez3",
                  "_$type": "Sprite",
                  "name": "lineHead",
                  "y": 340,
                  "width": 100,
                  "height": 100,
                  "_gcmds": [
                    {
                      "_$type": "DrawPolyCmd",
                      "x": 0,
                      "y": 0,
                      "points": [
                        0,
                        0,
                        -40,
                        15,
                        -40,
                        -15
                      ],
                      "lineWidth": 1,
                      "lineColor": "#000000",
                      "fillColor": "#ffffff"
                    }
                  ]
                }
              ]
            },
            {
              "_$id": "mr4shopw",
              "_$type": "Box",
              "name": "multiplierBox",
              "x": 160,
              "y": 22,
              "width": 200,
              "height": 120,
              "visible": false,
              "centerX": 0,
              "centerY": -83,
              "_$child": [
                {
                  "_$id": "3uh1ijc4",
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