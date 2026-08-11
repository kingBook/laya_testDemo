{
  "_$ver": 1,
  "_$id": "ed57652l",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene2D",
  "width": 750,
  "height": 1600,
  "_$child": [
    {
      "_$id": "n9gjxcltvl",
      "_$type": "Scene3D",
      "name": "Scene3D",
      "skyRenderer": {
        "meshType": "dome",
        "material": {
          "_$uuid": "793cffc6-730a-4756-a658-efe98c230292",
          "_$type": "Material"
        }
      },
      "ambientColor": {
        "_$type": "Color",
        "r": 0.424308,
        "g": 0.4578516,
        "b": 0.5294118
      },
      "fogStart": 0,
      "fogEnd": 300,
      "fogColor": {
        "_$type": "Color",
        "r": 0.5,
        "g": 0.5,
        "b": 0.5
      },
      "_$child": [
        {
          "_$id": "6jx8h8bvc6",
          "_$type": "Camera",
          "name": "Main Camera",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "y": 0.19539771853468757,
              "z": 2.624820630414078
            }
          },
          "nearPlane": 0.3,
          "farPlane": 1000,
          "clearFlag": 1,
          "clearColor": {
            "_$type": "Color",
            "r": 0.3921,
            "g": 0.5843,
            "b": 0.9294
          }
        },
        {
          "_$id": "6ni3p096l5",
          "_$type": "Sprite3D",
          "name": "Direction Light",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": 5,
              "y": 5,
              "z": 5
            },
            "localRotation": {
              "_$type": "Quaternion",
              "x": -0.40821789367673483,
              "y": 0.23456971600980447,
              "z": 0.109381654946615,
              "w": 0.875426098065593
            }
          },
          "_$comp": [
            {
              "_$type": "DirectionLightCom",
              "color": {
                "_$type": "Color",
                "r": 0.6,
                "g": 0.6,
                "b": 0.6
              }
            }
          ]
        },
        {
          "_$id": "0koyfvj1",
          "_$type": "Sprite3D",
          "name": "UI3d",
          "transform": {
            "localRotation": {
              "_$type": "Quaternion",
              "y": -0.15246523735484024,
              "w": 0.9883088340181586
            }
          },
          "_$comp": [
            {
              "_$type": "UI3D",
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "prefab": {
                "_$uuid": "92a668b5-4c41-40be-ac61-e1f57b3d8856",
                "_$type": "Prefab"
              },
              "resolutionRate": 512,
              "scale": {
                "_$type": "Vector2",
                "x": 1,
                "y": 0.5
              },
              "billboard": false,
              "enableHit": true,
              "renderMode": 2
            }
          ]
        }
      ]
    },
    {
      "_$id": "e7e74v5a",
      "_$type": "Image",
      "name": "Image",
      "x": 6,
      "y": 6,
      "width": 512,
      "height": 256,
      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
      "useSourceSize": true,
      "color": "#ffffff"
    }
  ]
}