{
  "_$ver": 1,
  "_$id": "wnbt32u5",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Test3dUI",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "f465e7e5-31f0-4b76-8c12-47de245ac220",
      "scriptPath": "demos/test3dUI/Test3DUI.ts"
    }
  ],
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
              "z": 120
            }
          },
          "orthographicVerticalSize": 5,
          "fieldOfView": 10,
          "nearPlane": 0.3,
          "farPlane": 1000,
          "clearColor": {
            "_$type": "Color",
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0
          },
          "depthTextureFormat": -1
        },
        {
          "_$id": "l92y2j4j",
          "_$type": "Sprite3D",
          "name": "LeftUI",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": -3.3
            },
            "localRotation": {
              "_$type": "Quaternion",
              "x": -0.01695334980425729,
              "y": 0.6291706298387066,
              "z": 0.013728551980657252,
              "w": 0.7769610217631862
            },
            "localScale": {
              "_$type": "Vector3",
              "x": 10,
              "y": 10,
              "z": 1
            }
          },
          "_$comp": [
            {
              "_$type": "UI3D",
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "prefab": {
                "_$uuid": "e23313ef-5b76-4483-a492-35de22fd6bb4",
                "_$type": "Prefab"
              },
              "resolutionRate": 1024,
              "scale": {
                "_$type": "Vector2",
                "x": 0.173828125,
                "y": 0.6298828125
              },
              "billboard": false,
              "enableHit": true,
              "cameraPlaneDistance": 0,
              "renderMode": 2
            }
          ]
        },
        {
          "_$id": "b0bkkb4e",
          "_$type": "Sprite3D",
          "name": "RightUI",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": 3.1
            },
            "localRotation": {
              "_$type": "Quaternion",
              "y": -0.6293203910498374,
              "w": 0.7771459614569709
            },
            "localScale": {
              "_$type": "Vector3",
              "x": 15,
              "y": 15,
              "z": 1
            }
          },
          "_$comp": [
            {
              "_$type": "UI3D",
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "prefab": {
                "_$uuid": "6f695534-2524-4371-b7cb-51e981c603f0",
                "_$type": "Prefab"
              },
              "resolutionRate": 1024,
              "scale": {
                "_$type": "Vector2",
                "x": 0.2197265625,
                "y": 0.830078125
              },
              "billboard": false,
              "enableHit": true,
              "cameraPlaneDistance": 0,
              "renderMode": 2
            }
          ]
        },
        {
          "_$id": "thjr3uk5",
          "_$type": "Sprite3D",
          "name": "BgUI",
          "transform": {
            "localScale": {
              "_$type": "Vector3",
              "x": 7.5,
              "y": 16,
              "z": 1
            }
          },
          "_$comp": [
            {
              "_$type": "UI3D",
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "prefab": {
                "_$uuid": "ff97610f-dfec-4da2-91af-da3e4a830280",
                "_$type": "Prefab"
              },
              "resolutionRate": 2048,
              "scale": {
                "_$type": "Vector2",
                "x": 0.3662109375,
                "y": 0.78125
              },
              "billboard": false,
              "cameraPlaneDistance": 100,
              "attachCamera": {
                "_$ref": "6jx8h8bvc6"
              }
            },
            {
              "_$type": "87941eff-991a-4925-b163-7d057bb105c5",
              "scriptPath": "demos/test3dUI/BgUI.ts",
              "_camera": {
                "_$ref": "6jx8h8bvc6"
              }
            }
          ]
        }
      ]
    },
    {
      "_$id": "ui0ngwha",
      "_$type": "Image",
      "name": "imgRole",
      "width": 750,
      "height": 1600,
      "_mouseState": 1,
      "centerX": 0,
      "centerY": 0,
      "skin": "res://9d20bd15-7f1f-4c35-9167-2551afdbe2e9",
      "useSourceSize": true,
      "color": "#ffffff"
    }
  ]
}