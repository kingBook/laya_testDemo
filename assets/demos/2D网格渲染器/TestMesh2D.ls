{
  "_$ver": 1,
  "_$id": "ijazluyk",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestMesh2D",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "7978596a-0efa-4cba-856f-195d2faf9645",
      "scriptPath": "demos/2D网格渲染器/TestMesh2D.ts"
    }
  ],
  "_$child": [
    {
      "_$id": "72x9xqwk",
      "_$type": "Sprite",
      "name": "bearSprite",
      "x": 192,
      "y": 48,
      "width": 422,
      "height": 540,
      "_filters": [],
      "_$comp": [
        {
          "_$type": "Mesh2DRender",
          "layer": 0,
          "sharedMesh": {
            "_$uuid": "501fba72-4c9e-4477-aaee-115ff10b58cc",
            "_$type": "Mesh2D"
          },
          "color": {
            "_$type": "Color"
          },
          "textureRange": {
            "_$type": "Vector4",
            "z": 1,
            "w": 1
          }
        }
      ]
    },
    {
      "_$id": "bxw6u5xb",
      "_$type": "Sprite",
      "name": "fillTexture",
      "x": 270,
      "y": 484,
      "width": 422,
      "height": 540,
      "_gcmds": [
        {
          "_$type": "FillTextureCmd",
          "texture": {
            "_$uuid": "c13c1b8e-c516-4a0f-98ad-e356f45f0365",
            "_$type": "Texture"
          },
          "y": -0.076,
          "height": 1.384,
          "type": "repeat-y",
          "offset": {
            "_$type": "Point",
            "y": -29
          }
        }
      ],
      "mask": {
        "_$ref": "imhsaqbi"
      },
      "_filters": [],
      "_$child": [
        {
          "_$id": "imhsaqbi",
          "_$type": "Sprite",
          "name": "mask",
          "width": 422,
          "height": 540,
          "_gcmds": [
            {
              "_$type": "DrawLineCmd",
              "fromX": 0,
              "fromY": 0,
              "toX": 1,
              "toY": 1,
              "percent": true,
              "lineWidth": 44,
              "lineColor": "#c33131"
            },
            {
              "_$type": "DrawPolyCmd",
              "x": 0,
              "y": 0,
              "points": [
                192.44887178363967,
                315.5535365878416,
                123.93869955697366,
                243.6108854385194,
                67.00733402130246,
                107.12054021893692,
                0,
                0,
                314,
                261,
                192,
                565
              ],
              "lineWidth": 1,
              "lineColor": "#000000",
              "fillColor": "#ffffff"
            }
          ],
          "_filters": []
        }
      ]
    }
  ]
}