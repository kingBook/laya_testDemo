{
  "_$ver": 1,
  "_$id": "o2xljarm",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestListDistortion",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "af3cf053-e26a-4c20-b2de-72ac66a3b267",
      "scriptPath": "demos/shader/d2/列表扭曲/TestListDistortion.ts",
      "_list": {
        "_$ref": "c8u0es93"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "q815apor",
      "_$type": "Box",
      "name": "box",
      "x": 275,
      "y": 500,
      "width": 200,
      "height": 600,
      "visible": false,
      "centerX": 0,
      "centerY": 0,
      "_$child": [
        {
          "_$id": "c8u0es93",
          "_$type": "List",
          "name": "list",
          "width": 200,
          "height": 600,
          "cacheAs": "bitmap",
          "material": {
            "_$uuid": "b75e36b9-9285-47eb-a1e0-84776ff59393",
            "_$type": "Material"
          },
          "left": 0,
          "right": 0,
          "top": 0,
          "bottom": 0,
          "itemTemplate": {
            "_$ref": "9tt9say9",
            "_$tmpl": "itemRender"
          },
          "repeatX": 1,
          "repeatY": 5,
          "scrollType": 2,
          "_$child": [
            {
              "_$id": "9tt9say9",
              "_$type": "Box",
              "name": "item",
              "width": 200,
              "height": 200,
              "_$child": [
                {
                  "_$id": "n5mmwyc5",
                  "_$type": "Image",
                  "name": "Image",
                  "width": 200,
                  "height": 200,
                  "skin": "res://63142bf4-b894-4f47-b8e4-7cea71a7d2b1",
                  "color": "#ffffff"
                },
                {
                  "_$id": "hzcapn63",
                  "_$type": "Image",
                  "name": "sp_8",
                  "x": 10,
                  "y": 10,
                  "width": 180,
                  "height": 180,
                  "centerX": 0,
                  "centerY": 0,
                  "skin": "res://73a480c9-00c7-4318-b7f5-48a3a0e17329",
                  "color": "#ffffff"
                },
                {
                  "_$id": "gbqyrufo",
                  "_$type": "Sprite",
                  "name": "win",
                  "x": 130,
                  "y": 46,
                  "width": 244,
                  "height": 199,
                  "anchorX": 0.772,
                  "anchorY": 0.356,
                  "scaleX": 0.5,
                  "scaleY": 0.5,
                  "_$comp": [
                    {
                      "_$type": "Spine2DRenderNode",
                      "layer": 0,
                      "source": "res://f7598c89-281d-450c-9f8e-d474379d7c2f",
                      "animationName": "loop",
                      "preview": true,
                      "physicsUpdate": 2
                    }
                  ]
                },
                {
                  "_$id": "m6v7acrl",
                  "_$type": "Label",
                  "name": "Label",
                  "x": 40,
                  "y": 155,
                  "width": 120,
                  "height": 28,
                  "bottom": 17,
                  "centerX": 0,
                  "text": "5000",
                  "fontSize": 30,
                  "color": "#ffef00",
                  "align": "center",
                  "valign": "middle"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "_$id": "2u7oh0ey",
      "_$type": "Image",
      "name": "Image",
      "x": 375,
      "y": 800,
      "width": 512,
      "height": 313,
      "anchorX": 0.5,
      "anchorY": 0.5,
      "material": {
        "_$uuid": "b75e36b9-9285-47eb-a1e0-84776ff59393",
        "_$type": "Material"
      },
      "centerX": 0,
      "centerY": 0,
      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
      "useSourceSize": true,
      "color": "#ffffff"
    },
    {
      "_$id": "1u2kqkev",
      "_$type": "Image",
      "name": "Image_1",
      "x": 995,
      "y": 1436,
      "width": 512,
      "height": 313,
      "anchorX": 0.5,
      "anchorY": 0.5,
      "centerX": 620,
      "centerY": 636,
      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
      "useSourceSize": true,
      "color": "#ffffff"
    }
  ]
}