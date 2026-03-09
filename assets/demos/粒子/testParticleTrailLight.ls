{
  "_$ver": 1,
  "_$id": "su0ipp34",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene2D",
  "active": false,
  "width": 750,
  "height": 1600,
  "_$child": [
    {
      "_$id": "dy9sd4aj",
      "_$type": "Scene3D",
      "name": "Scene3D",
      "skyRenderer": {
        "meshType": "dome"
      },
      "ambientColor": {
        "_$type": "Color",
        "r": 0.212,
        "g": 0.227,
        "b": 0.259
      },
      "_$child": [
        {
          "_$id": "tev9nu0x",
          "_$type": "Sprite3D",
          "name": "DirectionLight",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": 0.015797754749655724,
              "y": -0.06572549045085907,
              "z": 0.9634122252464294
            },
            "localRotation": {
              "_$type": "Quaternion",
              "x": -0.1356931171105402,
              "y": 0.3785333543605315,
              "z": 0.056205929992567794,
              "w": 0.9138603673642163
            },
            "localScale": {
              "_$type": "Vector3",
              "x": 0.999999982885729,
              "y": 1,
              "z": 0.999999982885729
            }
          },
          "_$comp": [
            {
              "_$type": "DirectionLightCom",
              "lightmapBakedType": 0,
              "shadowMode": 2,
              "strength": 1,
              "angle": 0.526,
              "maxBounces": 1024
            }
          ]
        },
        {
          "_$id": "5lx51zvy",
          "_$type": "Sprite3D",
          "name": "Plane",
          "transform": {
            "localScale": {
              "_$type": "Vector3",
              "x": 100,
              "y": 1,
              "z": 100
            }
          },
          "_$comp": [
            {
              "_$type": "MeshFilter",
              "sharedMesh": {
                "_$uuid": "4a4afb22-ef83-40a2-a6a8-212a2d20c52f",
                "_$type": "Mesh"
              }
            },
            {
              "_$type": "MeshRenderer",
              "receiveShadow": true,
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "sharedMaterials": [
                {
                  "_$uuid": "6f90bbb0-bcb2-4311-8a9d-3d8277522098",
                  "_$type": "Material"
                }
              ]
            }
          ]
        },
        {
          "_$id": "kc21v6es",
          "_$type": "Sprite3D",
          "name": "Cube_firstMat",
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
              "receiveShadow": true,
              "castShadow": true,
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "sharedMaterials": [
                {
                  "_$uuid": "dc2cccfb-6197-4114-bc3c-487e8ffc12a6",
                  "_$type": "Material"
                }
              ]
            }
          ]
        },
        {
          "_$id": "wid81i2u",
          "_$type": "Sprite3D",
          "name": "Cube_BlinnPhongMat",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": 1.991179704931243
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
              "receiveShadow": true,
              "castShadow": true,
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "sharedMaterials": [
                {
                  "_$uuid": "d3c3f7f3-a3c4-46ea-93cd-4f10aa17ce76",
                  "_$type": "Material"
                }
              ]
            }
          ]
        },
        {
          "_$id": "9ujz655l",
          "_$type": "Sprite3D",
          "name": "Cube_blueprint",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": -1.558059862030261,
              "y": 0.1898623078556385
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
              "castShadow": true,
              "lightmapScaleOffset": {
                "_$type": "Vector4"
              },
              "sharedMaterials": [
                {
                  "_$uuid": "8e2d8060-4e9d-4ebe-a9aa-387c04dd39c7",
                  "_$type": "Material"
                }
              ]
            }
          ]
        },
        {
          "_$id": "vah2wy1c",
          "_$type": "Sprite3D",
          "name": "Plane_mask",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": -1.0824195414321807,
              "y": 2.6473722285732415,
              "z": 4.437829342701769
            },
            "localRotation": {
              "_$type": "Quaternion",
              "x": 0.2179388791360838,
              "w": 0.9759624198507377
            }
          },
          "_$comp": [
            {
              "_$type": "MeshFilter",
              "sharedMesh": {
                "_$uuid": "4a4afb22-ef83-40a2-a6a8-212a2d20c52f",
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
                  "_$uuid": "9b2a0ead-9f74-4261-8f7b-c2983e5e112b",
                  "_$type": "Material"
                }
              ]
            }
          ]
        },
        {
          "_$id": "bncnfkdz",
          "_$type": "Camera",
          "name": "Camera",
          "transform": {
            "localPosition": {
              "_$type": "Vector3",
              "x": -0.6417852568202888,
              "y": 2.9459824687285376,
              "z": 3.942949000594911
            },
            "localRotation": {
              "_$type": "Quaternion",
              "x": -0.3888924101699816,
              "w": 0.9212831775910069
            }
          },
          "fieldOfView": 84,
          "nearPlane": 0.3,
          "farPlane": 1000,
          "clearColor": {
            "_$type": "Color",
            "r": 0.39215686274509803,
            "g": 0.5843137254901961,
            "b": 0.9294117647058824
          }
        }
      ]
    },
    {
      "_$id": "t2kig7nx",
      "_$type": "Sprite",
      "name": "Particle",
      "x": 431,
      "y": 842,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$type": "ShurikenParticle2DRenderer",
          "layer": 0,
          "sharedMaterial": {
            "_$uuid": "431b4fee-be8e-467a-828b-0222ed185a44",
            "_$type": "Material"
          },
          "particleSystem": {
            "main": {
              "startDelay": {
                "_$type": "ParticleMinMaxCurve",
                "curveMin": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                },
                "curveMax": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                }
              },
              "startLifetime": {
                "_$type": "ParticleMinMaxCurve",
                "constantMax": 5,
                "curveMin": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                },
                "curveMax": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                }
              },
              "startSpeed": {
                "_$type": "ParticleMinMaxCurve",
                "constantMax": 5,
                "curveMin": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                },
                "curveMax": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                }
              },
              "startSizeX": {
                "_$type": "ParticleMinMaxCurve",
                "constantMax": 0.5,
                "curveMin": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                },
                "curveMax": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                }
              },
              "startSizeY": {
                "_$type": "ParticleMinMaxCurve",
                "constantMax": 0.5,
                "curveMin": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                },
                "curveMax": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                }
              },
              "startRotation": {
                "_$type": "ParticleMinMaxCurve",
                "curveMin": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                },
                "curveMax": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 0
                }
              },
              "startColor": {
                "_$type": "ParticleMinMaxGradient",
                "colorMin": {
                  "_$type": "Color"
                },
                "colorMax": {
                  "_$type": "Color"
                },
                "gradientMin": {
                  "_$type": "Gradient",
                  "_colorAlphaKeysCount": 0,
                  "_colorRGBKeysCount": 0
                },
                "gradientMax": {
                  "_$type": "Gradient",
                  "_colorAlphaKeysCount": 0,
                  "_colorRGBKeysCount": 0
                }
              }
            },
            "emission": {
              "bursts": []
            },
            "shape": {
              "_$type": "Shape2DModule",
              "shape": {
                "_$type": "FanShape"
              }
            }
          }
        }
      ]
    },
    {
      "_$id": "3gtu5fa1",
      "_$type": "Sprite",
      "name": "Trail",
      "x": 430,
      "y": 793,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$type": "Trail2DRender",
          "layer": 0,
          "time": 0.5,
          "minVertexDistance": 0.1,
          "widthMultiplier": 50,
          "widthCurve": [
            {
              "_$type": "FloatKeyframe",
              "inTangent": 0,
              "outTangent": 3.009836065573771,
              "value": 0,
              "inWeight": 0.33333,
              "outWeight": 0.33333,
              "weightedMode": 0,
              "time": 0
            },
            {
              "_$type": "FloatKeyframe",
              "inTangent": -4.815737704918031,
              "outTangent": 0,
              "value": 0,
              "inWeight": 0.33333,
              "outWeight": 0.33333,
              "weightedMode": 0,
              "time": 1
            }
          ],
          "color": {
            "_$type": "Color"
          },
          "colorGradient": {
            "_$type": "Gradient",
            "_alphaElements": {
              "_$type": "Float32Array",
              "value": [
                0,
                1,
                1,
                1
              ]
            },
            "_colorAlphaKeysCount": 2,
            "_rgbElements": {
              "_$type": "Float32Array",
              "value": [
                0,
                1,
                1,
                1,
                1,
                1,
                0.9531247615814209,
                0
              ]
            },
            "_colorRGBKeysCount": 2
          },
          "texture": {
            "_$uuid": "00000000-0000-0000-0001-000000000000",
            "_$type": "Texture2D"
          }
        }
      ]
    },
    {
      "_$id": "vwelsrqv",
      "_$type": "Sprite",
      "name": "Sprite",
      "x": 25,
      "y": 570,
      "width": 813,
      "height": 1259,
      "anchorX": -0.011235955056179775,
      "anchorY": -0.009852216748768473,
      "scaleX": 0.718,
      "scaleY": 0.667,
      "_$comp": [
        {
          "_$type": "Mesh2DRender",
          "layer": 0,
          "sharedMaterial": {
            "_$uuid": "9aaf8fc9-389d-412e-8cd2-cc4ce02e343f",
            "_$type": "Material"
          },
          "sharedMesh": {
            "_$uuid": "08d56c7c-d358-4dcb-b5cc-dcbc1076c7a6",
            "_$type": "Mesh2D"
          },
          "color": {
            "_$type": "Color"
          },
          "texture": {
            "_$uuid": "328253e0-e522-4beb-ab2f-864b457dfe14",
            "_$type": "Texture"
          },
          "textureRange": {
            "_$type": "Vector4",
            "z": 1,
            "w": 1
          },
          "lightReceive": true
        }
      ]
    },
    {
      "_$id": "9kuq1bwt",
      "_$type": "Sprite",
      "name": "DirectionLight",
      "x": 421,
      "y": 1092,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$type": "DirectionLight2D",
          "color": {
            "_$type": "Color",
            "r": 0.1780057784438374,
            "g": 0.8152454731076263,
            "b": 0.7903529936752569
          },
          "intensity": 2.502,
          "layerMask": 1,
          "shadowStrength": 0.5,
          "shadowColor": {
            "_$type": "Color",
            "r": 0,
            "g": 0,
            "b": 0
          },
          "shadowLayerMask": 1,
          "shadowFilterSmooth": 1,
          "directionAngle": 0,
          "directionVector": {
            "_$type": "Vector2",
            "x": 1
          }
        }
      ]
    },
    {
      "_$id": "0fi78ms9",
      "_$type": "Sprite",
      "name": "SpotLight",
      "x": 421,
      "y": 1092,
      "width": 100,
      "height": 100,
      "rotation": -1186,
      "_$comp": [
        {
          "_$type": "SpotLight2D",
          "color": {
            "_$type": "Color"
          },
          "intensity": 1,
          "layerMask": 1,
          "shadowStrength": 1.567,
          "shadowColor": {
            "_$type": "Color",
            "r": 0,
            "g": 0,
            "b": 0
          },
          "shadowLayerMask": 1,
          "shadowFilterSmooth": 1,
          "innerRadius": 371.23,
          "outerRadius": 602.23,
          "innerAngle": 0,
          "outerAngle": 92,
          "falloffIntensity": 1.149
        }
      ]
    }
  ]
}