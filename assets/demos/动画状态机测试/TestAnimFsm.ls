{
  "_$ver": 1,
  "_$id": "lwpr42bh",
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
              "y": 1,
              "z": 5
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
        }
      ]
    },
    {
      "_$id": "1nzllbbx",
      "_$type": "Image",
      "name": "Image",
      "x": 369,
      "y": 894,
      "width": 512,
      "height": 256,
      "anchorX": 0.5,
      "anchorY": 0.5,
      "_mouseState": 2,
      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
      "useSourceSize": true,
      "color": "#ffffff",
      "_$comp": [
        {
          "_$type": "Animator2D",
          "controller": {
            "_$uuid": "f2f3f6b6-e51b-4c2e-870b-ccd8ff5ddf48",
            "_$type": "AnimationController2D"
          },
          "controllerLayers": [
            {
              "_$type": "AnimatorControllerLayer2D",
              "name": "Base Layer",
              "states": [
                {
                  "_$type": "AnimatorState2D",
                  "name": "rotation",
                  "clipStart": 0,
                  "clip": {
                    "_$uuid": "99b552a2-9e0c-4526-86c4-287c4a6deaeb",
                    "_$type": "AnimationClip2D"
                  },
                  "loop": 0,
                  "soloTransitions": []
                },
                {
                  "_$type": "AnimatorState2D",
                  "name": "scale",
                  "clipStart": 0,
                  "clip": {
                    "_$uuid": "cea0885e-8f87-481f-8560-4ed4986a6e1a",
                    "_$type": "AnimationClip2D"
                  },
                  "loop": 0,
                  "soloTransitions": []
                }
              ],
              "defaultStateName": "scale"
            }
          ]
        }
      ]
    },
    {
      "_$id": "446kpsi2",
      "_$type": "Sprite",
      "name": "TestAnimFsm",
      "x": 453,
      "y": 820,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$type": "54ab079a-b450-40a6-9466-bdab9197718f",
          "scriptPath": "demos/动画状态机测试/TestAnimFsm.ts",
          "_animator": {
            "_$ref": "1nzllbbx",
            "_$type": "Animator2D"
          }
        }
      ]
    }
  ]
}