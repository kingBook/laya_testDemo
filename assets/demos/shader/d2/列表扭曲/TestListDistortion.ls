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
      "_mat": {
        "_$uuid": "b75e36b9-9285-47eb-a1e0-84776ff59393",
        "_$type": "Material"
      },
      "_list": {
        "_$ref": "c8u0es93"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "td6gvzax",
      "_$type": "Image",
      "name": "img_desk_v2",
      "x": 110,
      "y": 633,
      "width": 750,
      "height": 327,
      "centerY": -4,
      "skin": "res://3534762b-5b57-4cad-9aa5-c738188d57b5",
      "color": "#ffffff"
    },
    {
      "_$id": "hpzx3ej2",
      "_$type": "Box",
      "name": "Box",
      "x": 295,
      "y": 603,
      "width": 160,
      "height": 394,
      "centerX": 0,
      "centerY": 0,
      "_$child": [
        {
          "_$id": "c8u0es93",
          "_$type": "List",
          "name": "list",
          "width": 160,
          "height": 394,
          "centerX": 0,
          "centerY": 0,
          "itemTemplate": {
            "_$ref": "9tt9say9",
            "_$tmpl": "itemRender"
          },
          "repeatX": 1,
          "repeatY": 3,
          "spaceY": 5,
          "scrollType": 2,
          "_$child": [
            {
              "_$id": "9tt9say9",
              "_$type": "Box",
              "name": "item",
              "width": 160,
              "height": 128,
              "cacheAs": "bitmap",
              "_$child": [
                {
                  "_$id": "n5mmwyc5",
                  "_$type": "Image",
                  "name": "Image",
                  "width": 160,
                  "height": 128,
                  "skin": "res://63142bf4-b894-4f47-b8e4-7cea71a7d2b1",
                  "color": "#ffffff"
                },
                {
                  "_$id": "hzcapn63",
                  "_$type": "Image",
                  "name": "sp_8",
                  "x": 17,
                  "y": -8,
                  "width": 180,
                  "height": 180,
                  "scaleX": 0.7,
                  "scaleY": 0.8,
                  "centerX": 0,
                  "centerY": 0,
                  "skin": "res://73a480c9-00c7-4318-b7f5-48a3a0e17329",
                  "color": "#ffffff"
                },
                {
                  "_$id": "gbqyrufo",
                  "_$type": "Sprite",
                  "name": "win",
                  "x": 106,
                  "y": 28,
                  "width": 244,
                  "height": 199,
                  "anchorX": 0.772,
                  "anchorY": 0.356,
                  "scaleX": 0.3,
                  "scaleY": 0.3,
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
                  "x": 20,
                  "y": 90,
                  "width": 120,
                  "height": 28,
                  "bottom": 10,
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
        },
        {
          "_$id": "xvfsxj9v",
          "_$type": "Image",
          "name": "mask",
          "x": -15,
          "y": 106,
          "width": 190,
          "height": 183,
          "visible": false,
          "centerX": 0,
          "centerY": 0,
          "skin": "res://67b34652-e0cb-453b-a998-1f38d708811c",
          "useSourceSize": true,
          "color": "#ffffff"
        }
      ]
    },
    {
      "_$id": "rj6rd5g7",
      "_$type": "Image",
      "name": "Image",
      "x": 236,
      "y": 1007,
      "width": 512,
      "height": 313,
      "material": {
        "_$uuid": "b75e36b9-9285-47eb-a1e0-84776ff59393",
        "_$type": "Material"
      },
      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
      "useSourceSize": true,
      "color": "#ffffff"
    }
  ]
}