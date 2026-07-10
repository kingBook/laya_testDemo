{
  "_$ver": 1,
  "_$id": "271okh7t",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestMelt",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "8379747d-7d2f-4aae-8918-384fdad8eb4c",
      "scriptPath": "demos/shader/d2/消融/TestShader.ts",
      "sp": {
        "_$ref": "sdl9k3pf"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "sdl9k3pf",
      "_$type": "Sprite",
      "name": "Sprite",
      "width": 512,
      "height": 256,
      "texture": {
        "_$uuid": "c13c1b8e-c516-4a0f-98ad-e356f45f0365",
        "_$type": "Texture"
      },
      "material": {
        "_$uuid": "5213ec1e-4cb3-4e42-abfb-e557f5f4796a",
        "_$type": "Material"
      }
    },
    {
      "_$id": "e9h9kh1i",
      "_$type": "Image",
      "name": "Image",
      "y": 256,
      "width": 512,
      "height": 256,
      "material": {
        "_$uuid": "5213ec1e-4cb3-4e42-abfb-e557f5f4796a",
        "_$type": "Material"
      },
      "left": 0,
      "top": 256,
      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
      "useSourceSize": true,
      "color": "#ffffff"
    },
    {
      "_$id": "66slxme8",
      "_$type": "Box",
      "name": "Box",
      "x": 72,
      "y": 721,
      "width": 537,
      "height": 463,
      "cacheAs": "bitmap",
      "material": {
        "_$uuid": "5213ec1e-4cb3-4e42-abfb-e557f5f4796a",
        "_$type": "Material"
      },
      "_$child": [
        {
          "_$id": "h3u1u85h",
          "_$type": "Image",
          "name": "Image_1",
          "x": 5,
          "y": 9,
          "width": 512,
          "height": 256,
          "left": 5,
          "top": 9,
          "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
          "useSourceSize": true,
          "color": "#ffffff"
        },
        {
          "_$id": "9is1v9fk",
          "_$type": "ComboBox",
          "name": "combobox",
          "x": 106,
          "y": 292,
          "width": 256,
          "height": 70,
          "skin": "res://f64d4387-f2c7-4e48-bea1-a0dfd22a109d",
          "labels": "item1,item2",
          "labelSize": 20,
          "itemSize": 18,
          "itemColors": "#5e95b6,#ffffff,#000000,#8fa4b1,#ffffff",
          "selectedIndex": 0,
          "selectedLabel": "item1",
          "defaultLabel": ""
        },
        {
          "_$id": "ytla0bv2",
          "_$type": "Sprite",
          "name": "hero-pro",
          "x": 322,
          "y": 392,
          "width": 319,
          "height": 334,
          "anchorX": 0.727,
          "anchorY": 1,
          "_$comp": [
            {
              "_$type": "Spine2DRenderNode",
              "layer": 0,
              "useFastRender": false,
              "source": "res://866c1471-644a-435e-a1df-b16f5cf481c2",
              "animationName": "attack",
              "preview": true,
              "physicsUpdate": 2
            }
          ]
        }
      ]
    }
  ]
}