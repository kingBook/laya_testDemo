{
  "_$ver": 1,
  "_$id": "3ynmo338",
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
              "x": 0.22005888058037307,
              "y": 1.2023995964771916,
              "z": 0.3811531352625605
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
          "_$id": "ufk3hu4o",
          "_$type": "Sprite3D",
          "name": "Cone_PBR",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": -1.150782823562622
            }
          },
          "_$comp": [
            {
              "_$type": "MeshFilter",
              "sharedMesh": {
                "_$uuid": "51cd3a71-c75c-42b4-ae4e-dd493b26290b",
                "_$type": "Mesh"
              }
            },
            {
              "_$type": "MeshRenderer",
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "sharedMaterials": [
                {
                  "_$uuid": "2412a3a6-86f2-4b57-8f6e-01750f1cf756",
                  "_$type": "Material"
                }
              ]
            }
          ]
        },
        {
          "_$id": "se5xs76r",
          "_$type": "Sprite3D",
          "name": "Cone_NormalMapTS",
          "_$comp": [
            {
              "_$type": "MeshFilter",
              "sharedMesh": {
                "_$uuid": "51cd3a71-c75c-42b4-ae4e-dd493b26290b",
                "_$type": "Mesh"
              }
            },
            {
              "_$type": "MeshRenderer",
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "sharedMaterials": [
                {
                  "_$uuid": "0d48200b-c8f5-49be-8b7b-4c740057e510",
                  "_$type": "Material"
                }
              ]
            }
          ]
        },
        {
          "_$id": "hmhxzrdo",
          "_$type": "Sprite3D",
          "name": "Cube_NormalMapTS",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": 1.4571121803107387
            }
          },
          "_$comp": [
            {
              "_$type": "MeshFilter",
              "sharedMesh": {
                "_$uuid": "6e013e32-fec7-4397-80d1-f918a07607be",
                "_$type": "Mesh"
              }
            },
            {
              "_$type": "MeshRenderer",
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "sharedMaterials": [
                {
                  "_$uuid": "0d48200b-c8f5-49be-8b7b-4c740057e510",
                  "_$type": "Material"
                }
              ]
            }
          ]
        },
        {
          "_$id": "kpa72dkv",
          "_$type": "Sprite3D",
          "name": "Cone_NormalMapWS",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "z": 1.148435081457586
            }
          },
          "_$comp": [
            {
              "_$type": "MeshFilter",
              "sharedMesh": {
                "_$uuid": "51cd3a71-c75c-42b4-ae4e-dd493b26290b",
                "_$type": "Mesh"
              }
            },
            {
              "_$type": "MeshRenderer",
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "sharedMaterials": [
                {
                  "_$uuid": "0d48200b-c8f5-49be-8b7b-4c740057e510",
                  "_$type": "Material"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}