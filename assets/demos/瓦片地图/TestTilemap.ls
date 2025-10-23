{
  "_$ver": 1,
  "_$id": "rffsiq00",
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
      "_$id": "otqifel4",
      "_$type": "Sprite",
      "name": "box",
      "x": 309,
      "y": 361,
      "width": 100,
      "height": 100,
      "texture": {
        "_$uuid": "3225dc27-5bcb-446e-8b66-27df87624835",
        "_$type": "Texture"
      },
      "_$comp": [
        {
          "_$id": "6e8d",
          "_$type": "RigidBody",
          "applyOwnerColliderComponent": false,
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 0,
              "y": 0,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "width": 100,
              "height": 100
            }
          ]
        }
      ]
    },
    {
      "_$id": "1rziii7f",
      "_$type": "Sprite",
      "name": "tilemap",
      "x": 8,
      "y": -80,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$type": "TileMapLayer",
          "layer": 0,
          "tileSet": {
            "_$uuid": "16cc7871-f6c0-45c8-a227-8410326a2a35",
            "_$type": "TileSet"
          },
          "physicsEnable": true,
          "chunkDatas": {
            "0": {
              "0": {
                "_$type": "TileMapChunkData",
                "chunkX": 0,
                "chunkY": 0,
                "compressData": {
                  "0": [
                    1019,
                    1020,
                    1021
                  ],
                  "_$type": "Record"
                }
              },
              "_$type": "Record"
            },
            "1": {
              "0": {
                "_$type": "TileMapChunkData",
                "chunkX": 0,
                "chunkY": 1,
                "compressData": {
                  "0": [
                    358,
                    359,
                    360,
                    361,
                    362,
                    363,
                    364,
                    365,
                    366,
                    367,
                    368,
                    369,
                    370,
                    371,
                    372,
                    373,
                    374,
                    375,
                    376,
                    377,
                    378,
                    379,
                    380,
                    381,
                    382,
                    383,
                    390,
                    391,
                    392,
                    393,
                    394,
                    395,
                    396,
                    397,
                    398,
                    399,
                    400,
                    401,
                    402,
                    403,
                    404,
                    405,
                    406,
                    407,
                    408,
                    409,
                    410,
                    411,
                    412,
                    413,
                    414,
                    415,
                    422,
                    423,
                    424,
                    425,
                    426,
                    427,
                    428,
                    429,
                    430,
                    431,
                    432,
                    433,
                    434,
                    435,
                    436,
                    437,
                    438,
                    439,
                    440,
                    441,
                    442,
                    443,
                    444,
                    445,
                    446,
                    447,
                    216,
                    184,
                    152,
                    120,
                    121,
                    89,
                    58,
                    26,
                    27,
                    29,
                    30,
                    31,
                    63,
                    95,
                    94,
                    126,
                    125,
                    157,
                    189,
                    221,
                    222,
                    254,
                    255,
                    215,
                    214,
                    213,
                    212,
                    211
                  ],
                  "_$type": "Record"
                }
              },
              "1": {
                "_$type": "TileMapChunkData",
                "chunkX": 1,
                "chunkY": 1,
                "compressData": {
                  "0": [
                    352,
                    353,
                    354,
                    355,
                    356,
                    357,
                    358,
                    359,
                    384,
                    385,
                    386,
                    387,
                    388,
                    389,
                    390,
                    391,
                    416,
                    417,
                    418,
                    419,
                    420,
                    421,
                    422,
                    423,
                    64,
                    224,
                    225,
                    226,
                    195,
                    196,
                    164,
                    165,
                    133,
                    101
                  ],
                  "_$type": "Record"
                }
              },
              "_$type": "Record"
            },
            "2": {
              "0": {
                "_$type": "TileMapChunkData",
                "chunkX": 0,
                "chunkY": 2,
                "compressData": {
                  "_$type": "Record"
                }
              },
              "1": {
                "_$type": "TileMapChunkData",
                "chunkX": 1,
                "chunkY": 2,
                "compressData": {
                  "_$type": "Record"
                }
              },
              "_$type": "Record"
            },
            "_$type": "Record"
          }
        }
      ]
    }
  ]
}