{
  "_$ver": 1,
  "_$id": "0ip9gzgx",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestChart",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "53ff027d-3d78-489c-818b-d61ccdbbb14a",
      "scriptPath": "demos/火箭图表测试/TestChart.ts"
    }
  ],
  "_$child": [
    {
      "_$id": "xu5la9vr",
      "_$type": "Box",
      "name": "Chart",
      "x": 72,
      "y": 19,
      "width": 600,
      "height": 400,
      "bgColor": "#385163",
      "_$comp": [
        {
          "_$type": "a49eb932-cb92-4e35-9b5b-b1eebd1fdef7",
          "scriptPath": "demos/火箭图表测试/chart/Chart.ts",
          "_canvas": {
            "_$ref": "oxyf25e9"
          },
          "_lineHead": {
            "_$ref": "xd0dxqjx"
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
              "_$id": "xd0dxqjx",
              "_$type": "Sprite",
              "name": "lineHead",
              "x": 7,
              "y": 345,
              "width": 30,
              "height": 30,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "_gcmds": [
                {
                  "_$type": "DrawCircleCmd",
                  "x": 0.5,
                  "y": 0.5,
                  "radius": 0.5,
                  "percent": true,
                  "lineWidth": 1,
                  "lineColor": "#000000",
                  "fillColor": "#ffffff"
                },
                {
                  "_$type": "DrawLineCmd",
                  "fromX": 0,
                  "fromY": 0.5,
                  "toX": -2,
                  "toY": 0.5,
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