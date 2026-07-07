{
  "_$ver": 1,
  "_$id": "51gz7xzq",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestMesh2dGraphics",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "1ed7d8b0-6493-44f7-be4a-dee5a4b8439d",
      "scriptPath": "demos/火箭图表测试/TestMesh2dGraphics.ts",
      "_meshGraphics": {
        "_$ref": "82xsw9ie",
        "_$type": "03fab6c1-9262-46bb-a21d-81a2a9cdac59"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "82xsw9ie",
      "_$type": "Sprite",
      "name": "mesh2dGraphics",
      "x": 100,
      "y": 100,
      "width": 100,
      "height": 100,
      "_gcmds": [
        {
          "_$type": "DrawRectCmd",
          "lineWidth": 1,
          "lineColor": "#19ff46"
        },
        {
          "_$type": "DrawLinesCmd",
          "x": 0,
          "y": 0,
          "points": [
            0,
            0,
            100,
            50,
            200,
            0
          ],
          "lineWidth": 1,
          "lineColor": "#ffff00"
        }
      ],
      "_$comp": [
        {
          "_$type": "03fab6c1-9262-46bb-a21d-81a2a9cdac59",
          "scriptPath": "demos/火箭图表测试/chart/Mesh2dGraphics.ts"
        }
      ]
    }
  ]
}