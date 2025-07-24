{
  "_$ver": 1,
  "_$id": "31qhp5zb",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestPromiseAfterDestroy",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "9156b128-341d-4e5a-9b75-5f112362cd8f",
      "scriptPath": "../src/kingBook/test/promise/TestPromiseAfterDestroy.ts"
    }
  ],
  "_$child": [
    {
      "_$id": "z89gc1el",
      "_$type": "Label",
      "name": "tips",
      "x": 20,
      "y": 20,
      "width": 710,
      "height": 196,
      "left": 20,
      "right": 20,
      "top": 20,
      "text": "按 J, 测试销毁后，promise 没执行完，owner 是否为空，是否还在舞台\n\n按 K, 测试从舞台移除后，promise 没执行完，owner 是否为空，是否还在舞台\n",
      "fontSize": 30,
      "color": "#ffffff",
      "fitContent": "height",
      "wordWrap": true
    }
  ]
}