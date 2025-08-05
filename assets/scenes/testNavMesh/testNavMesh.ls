{
  "_$ver": 1,
  "_$id": "sk9knog7",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestNavMesh",
  "width": 750,
  "height": 1600,
  "componentElementDatasMap": {
    "_$type": "Record",
    "navMesh2D": {
      "_$type": "any",
      "value": {
        "agents": [
          {
            "agentName": "humanoid",
            "cellSize": 10,
            "cellHeight": 0,
            "agentMaxSlope": 0,
            "agentHeight": 0,
            "agentRadius": 10,
            "agentMaxClimb": 10,
            "tileSize": 256
          }
        ],
        "areas": [
          {
            "name": "unwalk",
            "index": 0,
            "cost": "10000"
          },
          {
            "name": "walk",
            "index": 1,
            "cost": "1"
          },
          {
            "name": "jump",
            "index": 2,
            "cost": 1
          }
        ]
      }
    }
  },
  "_$comp": [
    {
      "_$type": "b51e9368-e797-426c-977e-2772fdaa70ff",
      "scriptPath": "../src/kingBook/test/testNavMesh/TestNavMesh.ts",
      "navMesh2DSurface": {
        "_$ref": "8hpksg8n",
        "_$type": "NavMesh2DSurface"
      },
      "mouseHit": {
        "_$ref": "pmpxar7d"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "8hpksg8n",
      "_$type": "Sprite",
      "name": "surface",
      "x": 21,
      "y": 100,
      "width": 640,
      "height": 1136,
      "_$comp": [
        {
          "_$id": "vcs7",
          "_$type": "NavMesh2DSurface",
          "agentType": "humanoid",
          "areaFlag": "walk",
          "asyn": false,
          "datas": {
            "_$uuid": "a9ad5609-ecf7-4efb-a692-93803e36b618",
            "_$type": "TextResource"
          },
          "_editorConfig": {
            "_$type": "Record",
            "rootIds": {
              "_$type": "any",
              "value": [
                "105"
              ]
            },
            "config": {
              "_$type": "any",
              "value": {
                "105": {
                  "active": true,
                  "hoix": false,
                  "renderMode": 2
                }
              }
            }
          },
          "obstacles": [
            {
              "_$type": "NavMesh2DObstacles",
              "position": {
                "_$type": "Vector2",
                "x": 236,
                "y": 1085
              },
              "areaFlag": "unwalk",
              "_editorConfig": null
            }
          ],
          "navMeshLink": []
        }
      ],
      "_$child": [
        {
          "_$id": "ikh7r2d6",
          "_$type": "Sprite",
          "name": "ground",
          "x": 326,
          "y": 530,
          "width": 89,
          "height": 87,
          "_gcmds": [
            {
              "_$type": "DrawPolyCmd",
              "x": 0,
              "y": 0,
              "points": [
                -290.12791863076825,
                380.9614681548844,
                -59.34284955808181,
                323.1280729871887,
                122.77033323015328,
                120.31497094106987,
                96.03767311565241,
                52.055755199941785,
                -131.3599118559493,
                0.40514891722835955,
                -131,
                -191,
                -345.362336762262,
                -358.181168381131,
                -227.18164325987203,
                -406.29638125419405,
                -115.09459292002578,
                -358.12382524376767,
                -10.25513622636231,
                -442.8981629769597,
                315.95682194969606,
                -453.2946177894403,
                401.9861585987303,
                -298.7621247834139,
                321.4126263001682,
                -178.07584617703645,
                226.03385404983277,
                -91.91710257372964,
                119.63402369454673,
                -108.94581532918556,
                164.44243594075945,
                -216.04878828974057,
                272.6699740470409,
                -332.48103004645793,
                89.75801534535015,
                -290.0083947840585,
                37.8367147758095,
                -105.83811760960617,
                169.9116496155777,
                -16.02191271033429,
                344.4819796295657,
                -90.89801710544542,
                249,
                103,
                149.0416292266081,
                203.0246246807825,
                45.101034396169325,
                336.9378322453921,
                190.68250911968627,
                436.4930737179131,
                329.14198422732363,
                536.5382868134132,
                190.12777047423552,
                560.1712613620659,
                77.08789489854217,
                536.8109909806185,
                -14.151504300664584,
                462.2316983665195,
                28.042391695286852,
                635.0628462644218,
                346.4376457399029,
                616.493817081078,
                354.01203737427124,
                880.0068257805133,
                230.1598376707405,
                861.5319975894729,
                -73.38920182991501,
                935.9980335103684,
                -328.36239862248124,
                781.065036392475,
                -304.53087401265736,
                644.8107425924505,
                -88.5083608038465,
                822.3726801667268,
                175.5615824451707,
                758.3789864341054,
                -90.01672785244625,
                698.7560113585937,
                -230,
                485
              ],
              "lineWidth": 1,
              "lineColor": "#000000",
              "fillColor": "#5e7880"
            }
          ]
        },
        {
          "_$id": "i99fhj9o",
          "_$type": "Sprite",
          "name": "player",
          "x": 558,
          "y": 325,
          "width": 100,
          "height": 100,
          "_gcmds": [
            {
              "_$type": "DrawCircleCmd",
              "x": 0,
              "y": 0,
              "radius": 10,
              "lineWidth": 1,
              "lineColor": "#000000",
              "fillColor": "#ffffff"
            },
            {
              "_$type": "DrawPolyCmd",
              "x": 0,
              "y": 0,
              "points": [
                0,
                -50,
                20,
                -38,
                -1,
                -1
              ],
              "lineWidth": 1,
              "lineColor": "#ff0000",
              "fillColor": "rgba(254,255,72,0.5019607843137255)"
            }
          ],
          "_$comp": [
            {
              "_$type": "Nav2DAgent",
              "agentType": "humanoid",
              "speed": 200,
              "maxAcceleration": 1000,
              "quality": 4,
              "areaMask": 7
            }
          ]
        },
        {
          "_$id": "pmpxar7d",
          "_$type": "Sprite",
          "name": "mouseHit",
          "x": 331,
          "y": 908,
          "width": 100,
          "height": 100,
          "_gcmds": [
            {
              "_$type": "DrawCircleCmd",
              "x": 0,
              "y": 0,
              "radius": 0.1,
              "percent": true,
              "lineWidth": 1,
              "lineColor": "#000000",
              "fillColor": "#c22a2a"
            }
          ]
        }
      ]
    }
  ]
}