{
  "_$ver": 1,
  "_$id": "sk9knog7",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene2D",
  "width": 640,
  "height": 1136,
  "componentElementDatasMap": {
    "_$type": "Record",
    "navMesh2D": {
      "_$type": "any",
      "value": {
        "agents": [
          {
            "agentName": "humanoid",
            "cellSize": 1,
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
            "cost": 1
          },
          {
            "name": "walk",
            "index": 1,
            "cost": 1
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
  "_$child": [
    {
      "_$id": "8hpksg8n",
      "_$type": "Sprite",
      "name": "surface",
      "width": 640,
      "height": 1136,
      "_$comp": [
        {
          "_$id": "ev2q",
          "_$type": "NavMesh2DSurface",
          "agentType": "humanoid",
          "areaFlag": "walk",
          "asyn": false,
          "datas": {
            "_$uuid": "7a85e292-5dd7-4d39-b636-da9904ac5706",
            "_$type": "TextResource"
          },
          "_editorConfig": {
            "_$type": "Record",
            "rootIds": {
              "_$type": "any",
              "value": [
                "104"
              ]
            },
            "config": {
              "_$type": "any",
              "value": {
                "104": {
                  "active": true,
                  "hoix": false,
                  "renderMode": 3
                },
                "105": {
                  "active": true,
                  "hoix": false,
                  "renderMode": 2
                },
                "107": {
                  "active": false,
                  "hoix": false,
                  "renderMode": 2
                }
              }
            }
          },
          "areas": [],
          "obstacles": [
            {
              "_$type": "NavMesh2DObstacles",
              "position": {
                "_$type": "Vector2",
                "x": 377,
                "y": 713
              },
              "areaFlag": "unwalk",
              "size": {
                "_$type": "Vector2",
                "x": 100,
                "y": 123
              }
            },
            {
              "_$type": "NavMesh2DObstacles",
              "position": {
                "_$type": "Vector2",
                "x": 40.87,
                "y": 58.7
              },
              "areaFlag": "unwalk",
              "meshType": 2,
              "datas": {
                "_$uuid": "ce0e92de-e7c2-474a-a46b-40259243db6a",
                "_$type": "TextResource"
              },
              "_editorConfig": {
                "_$type": "Record",
                "rootIds": {
                  "_$type": "any",
                  "value": [
                    "107"
                  ]
                },
                "config": {
                  "_$type": "any",
                  "value": {
                    "107": {
                      "active": true,
                      "hoix": false,
                      "renderMode": 2
                    }
                  }
                }
              }
            }
          ],
          "navMeshLink": []
        }
      ],
      "_$child": [
        {
          "_$id": "ikh7r2d6",
          "_$type": "Sprite",
          "name": "Sprite",
          "x": 259,
          "y": 546,
          "width": 100,
          "height": 100,
          "_gcmds": [
            {
              "_$type": "DrawPolyCmd",
              "x": 0,
              "y": 0,
              "points": [
                -218.12791863076825,
                499.9614681548844,
                -198.22966676984672,
                240.31497094106987,
                -17.96232688434759,
                121.05575519994179,
                -131.3599118559493,
                0.40514891722835955,
                -131,
                -191,
                -187.36233676226198,
                -473.181168381131,
                46.81835674012797,
                -487.29638125419405,
                232.90540707997422,
                -435.12382524376767,
                89.75801534535015,
                -290.0083947840585,
                37.8367147758095,
                -105.83811760960617,
                169.9116496155777,
                -16.02191271033429,
                344.4819796295657,
                -90.89801710544542,
                337,
                105,
                322.0416292266081,
                282.0246246807825,
                165.10103439616933,
                297.9378322453921,
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
                -71,
                554
              ],
              "lineWidth": 1,
              "lineColor": "#000000",
              "fillColor": "#ffffff"
            }
          ]
        },
        {
          "_$id": "0p0u8y5z",
          "_$type": "Sprite",
          "name": "obstacle",
          "x": 120,
          "y": 812,
          "width": 100,
          "height": 100,
          "visible": false,
          "_gcmds": [
            {
              "_$type": "DrawPolyCmd",
              "x": 0,
              "y": 0,
              "points": [
                0,
                0,
                211,
                37,
                142.02054939867958,
                167.34457529802458,
                0,
                100
              ],
              "lineWidth": 1,
              "lineColor": "#000000",
              "fillColor": "#ffffff"
            }
          ]
        }
      ]
    },
    {
      "_$id": "ny7uiw9x",
      "_$type": "Sprite",
      "name": "player",
      "x": 252,
      "y": 524,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$type": "Nav2DAgent",
          "agentType": "humanoid",
          "maxAcceleration": 10,
          "areaMask": 1
        }
      ]
    }
  ]
}