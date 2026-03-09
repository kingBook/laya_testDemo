{
  "_$ver": 1,
  "_$id": "q0hlqgfp",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestParticle2D",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "ee977bd4-47f4-4582-93c3-87ce759062ce",
      "scriptPath": "demos/粒子/TestParticle2D.ts",
      "_particle2Dnode": {
        "_$ref": "0114fbi1",
        "_$type": "ShurikenParticle2DRenderer"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "0114fbi1",
      "_$type": "Sprite",
      "name": "Particle",
      "x": 331,
      "y": 756,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$type": "ShurikenParticle2DRenderer",
          "layer": 0,
          "sharedMaterial": {
            "_$uuid": "6dba557e-722d-4862-9f0e-f1ab7cac8f23",
            "_$type": "Material"
          },
          "particleSystem": {
            "main": {
              "duration": 10,
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
                "mode": 2,
                "constantMin": 0.2,
                "constantMax": 1.5,
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
                "constantMax": 0.8,
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
                "mode": 2,
                "colorMin": {
                  "_$type": "Color",
                  "g": 0,
                  "b": 0
                },
                "colorMax": {
                  "_$type": "Color",
                  "r": 0,
                  "b": 0.0390625
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
              },
              "gravityModifier": 0.09,
              "simulationSpace": 1
            },
            "emission": {
              "rateOverTime": 50
            },
            "shape": {
              "_$type": "Shape2DModule",
              "shape": {
                "_$type": "Circle2DShape",
                "radius": 0.1
              }
            },
            "size2DOverLifetime": {
              "_$type": "Size2DOverLifetimeModule",
              "x": {
                "_$type": "ParticleMinMaxCurve",
                "mode": 1,
                "constantMin": 1,
                "constantMax": 1,
                "curveMin": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      1,
                      1,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 4
                },
                "curveMax": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      0.5053763389587402,
                      0.6272189617156982,
                      1,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 8,
                  "_curveMin": 0,
                  "_curveMax": 1
                }
              },
              "y": {
                "_$type": "ParticleMinMaxCurve",
                "mode": 1,
                "constantMin": 1,
                "constantMax": 1,
                "curveMin": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      1,
                      1,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 4
                },
                "curveMax": {
                  "_$type": "GradientDataNumber",
                  "_elements": {
                    "_$type": "Float32Array",
                    "value": [
                      0,
                      0,
                      1,
                      1,
                      0,
                      0,
                      0,
                      0
                    ]
                  },
                  "_currentLength": 4
                }
              }
            }
          }
        }
      ]
    }
  ]
}