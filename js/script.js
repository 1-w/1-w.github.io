  

var XlayerOffset = 25;
var startX = 25;
var layerNum = 0;
var layer1 = [{x:(startX+XlayerOffset*layerNum), y:170}, {x:(startX+XlayerOffset*layerNum), y:185}, {x:(startX+XlayerOffset*layerNum), y:200}, {x:(startX+XlayerOffset*layerNum), y:215}, {x:(startX+XlayerOffset*layerNum), y:230}];
layerNum++;
/*
var layer2 = [{x:(startX+XlayerOffset*layerNum), y:110}, {x:(startX+XlayerOffset*layerNum), y:140}, {x:(startX+XlayerOffset*layerNum), y:170}, {x:(startX+XlayerOffset*layerNum), y:200}, {x:(startX+XlayerOffset*layerNum), y:230}, {x:(startX+XlayerOffset*layerNum), y:260}, {x:(startX+XlayerOffset*layerNum), y:290}];
layerNum++;
*/
var layer2 = [{x:(startX+XlayerOffset*layerNum), y:50}, {x:(startX+XlayerOffset*layerNum), y:80}, {x:(startX+XlayerOffset*layerNum), y:110}, {x:(startX+XlayerOffset*layerNum), y:140}, {x:(startX+XlayerOffset*layerNum), y:170}, {x:(startX+XlayerOffset*layerNum), y:200}, {x:(startX+XlayerOffset*layerNum), y:230}, {x:(startX+XlayerOffset*layerNum), y:260}, {x:(startX+XlayerOffset*layerNum), y:290}, {x:(startX+XlayerOffset*layerNum), y:320}, {x:(startX+XlayerOffset*layerNum), y:350}];
layerNum++;
var layer3 = [{x:(startX+XlayerOffset*layerNum), y:50}, {x:(startX+XlayerOffset*layerNum), y:80}, {x:(startX+XlayerOffset*layerNum), y:110}, {x:(startX+XlayerOffset*layerNum), y:140}, {x:(startX+XlayerOffset*layerNum), y:170}, {x:(startX+XlayerOffset*layerNum), y:200}, {x:(startX+XlayerOffset*layerNum), y:230}, {x:(startX+XlayerOffset*layerNum), y:260}, {x:(startX+XlayerOffset*layerNum), y:290}, {x:(startX+XlayerOffset*layerNum), y:320}, {x:(startX+XlayerOffset*layerNum), y:350}];
layerNum++;
var layer4 = [{x:(startX+XlayerOffset*layerNum), y:155}, {x:(startX+XlayerOffset*layerNum), y:185}, {x:(startX+XlayerOffset*layerNum), y:215}, {x:(startX+XlayerOffset*layerNum), y:245}];
layerNum++;
var layer5 = [{x:(startX+XlayerOffset*layerNum), y:50}, {x:(startX+XlayerOffset*layerNum), y:80}, {x:(startX+XlayerOffset*layerNum), y:110}, {x:(startX+XlayerOffset*layerNum), y:140}, {x:(startX+XlayerOffset*layerNum), y:170}, {x:(startX+XlayerOffset*layerNum), y:200}, {x:(startX+XlayerOffset*layerNum), y:230}, {x:(startX+XlayerOffset*layerNum), y:260}, {x:(startX+XlayerOffset*layerNum), y:290}, {x:(startX+XlayerOffset*layerNum), y:320}, {x:(startX+XlayerOffset*layerNum), y:350}];
layerNum++;
var layer6 = [{x:(startX+XlayerOffset*layerNum), y:50}, {x:(startX+XlayerOffset*layerNum), y:80}, {x:(startX+XlayerOffset*layerNum), y:110}, {x:(startX+XlayerOffset*layerNum), y:140}, {x:(startX+XlayerOffset*layerNum), y:170}, {x:(startX+XlayerOffset*layerNum), y:200}, {x:(startX+XlayerOffset*layerNum), y:230}, {x:(startX+XlayerOffset*layerNum), y:260}, {x:(startX+XlayerOffset*layerNum), y:290}, {x:(startX+XlayerOffset*layerNum), y:320}, {x:(startX+XlayerOffset*layerNum), y:350}];
layerNum++;
var layer7 = [{x:(startX+XlayerOffset*layerNum), y:200}];

var layers = [layer1, layer2, layer3, layer4, layer5, layer6, layer7];
//console.log("layers[0][0]");
//console.log(layers[0][0]);
var numLayers = layers.length;
console.log(numLayers);
var signals =[];
//var signalsToAdd = [];

var thresholds = $.extend( true, {}, layers);
/*console.log("thresholds[0][0]");
console.log(thresholds[0][0]);
*/
for(i = 0; i < thresholds[0].length; i++) {
  thresholds[0][i].x = 1;
  thresholds[0][i].y = 0;

}
for(j = 1; j < numLayers-2; j++){
 for(i = 0; i < thresholds[j].length; i++) {
  thresholds[j][i].x = 2;//randomIntFromInterval(1,4);
  thresholds[j][i].y = 1;//randomIntFromInterval(1,thresholds[j][i].x-1);
}
}
for(i = 0; i < thresholds[numLayers-2].length; i++) {
  thresholds[numLayers-2][i].x = 1;
  thresholds[numLayers-2][i].y = 0;

}


/*
console.log("layers[0][0]");
console.log(layers[0][0]);

console.log("layers[2][2]");
console.log(layers[2][2]);
console.log("layers[4][5]");
console.log(layers[4][3]);


console.log(thresholds[0][0]);
console.log(thresholds[1][3]);
*/



   // delete layer1,layer2,layer3,layer4,layer5,layer6,layer7;

/*
function Signal (startLayer,startInd,endInd) {
    this.currentLayer =  startLayer;
    this.startInd= startInd;
    this.endInd = endInd;
    this.x = layers[startLayer][startInd].x;
    this.y = layers[startLayer][startInd].y;
    var xyDir = calcDirection(startLayer,startInd,endInd);
    this.xDirection = xyDir.x;
    this.yDirection = xyDir.y;
}

function calcDirection(startLayer, startInd, endInd){
    var a = layers[startLayer+1][endInd].x - layers[startLayer][startInd].x;
    var b = layers[startLayer+1][endInd].y - layers[startLayer][startInd].y;
    var magnitude = Math.sqrt( a*a + b*b);
    a = a/magnitude;
    b = b/magnitude;
        return( {x:a,y:b} );
}

function drawSignal(signal,ctx){
    signal.x = signal.x + signal.xDirection;
    signal.y = signal.y + signal.yDirection;

    var xy = {signal.x,signal.y};
    drawDot(xy,"red",ctx);
}
*/


$(function() {


$("#typed").typed({
            stringsElement: $('#typed-strings')
        });




var canvas1=document.getElementById("canvas1");
  var ctx1=canvas1.getContext("2d");
  fitToContainer(canvas1);

  var canvas2=document.getElementById("canvas2");
  var ctx2=canvas2.getContext("2d");
  fitToContainer(canvas2);

/*
      var canvas2=document.getElementById("canvas2");
      var ctx2=canvas2.getContext("2d");

      var canvas3=document.getElementById("canvas3");
      var ctx3=canvas3.getContext("2d");
      */
      //var numNeurons = layer1.length;

      // set starting values
      var fps = 60;
      var percent=0;
      var direction=1;
      drawNet(canvas1,ctx1);


      var signal1 = new Signal(0,0,1);
      signals.push(signal1);

      var signal1 = new Signal(0,3,5);
      signals.push(signal1);
      // start the animation
      animate();

      function animate() {

          // set the animation position (0-100)
          percent+=direction;
          if(percent<0){ percent=0; direction=1; };
          if(percent>1000){ percent=1000; direction=-1; };

          //draw(percent,canvas2,ctx2);
          for(var i = signals.length-1;i>=0;i--){

            if(!updateSignal(signals[i]))
            {
              var removed = signals.splice(i,1);
            };
          }
/*
        for(var i = 0; i<signalsToAdd.length;i++){
        signals.push(signalsToAdd[i]);
      }
        signalsToAdd = [];
        */
        var createSignal = randomIntFromInterval(1,100);
        if(createSignal<5 && signals.length < 100){
          var signal1 = new Signal(0,randomIntFromInterval(1,layers[0].length)-1,randomIntFromInterval(1,layers[1].length)-1);
          signals.push(signal1);
        };
        

        ctx2.clearRect(0,0,canvas2.width,canvas2.height);

        for(var i = 0;i<signals.length;i++){
          drawSignal(signals[i],ctx2);
        }
        

          //draw(percent,canvas2,ctx2);
          //draw(percent,canvas3,ctx3);

          // request another frame
          setTimeout(function() {
            requestAnimationFrame(animate);
          }, 1000 / fps);

          //console.log(thresholds[numLayers-1][0], thresholds[numLayers-1][1], thresholds[numLayers-1][2], thresholds[numLayers-1][3], thresholds[numLayers-1][4]);

        }


      // draw the current frame based on sliderValue
      /*function draw(sliderValue,canvas,ctx){

          ctx.clearRect(0,0,canvas.width,canvas.height);


          var scaleX = canvas.width/600;
          var scaleY = canvas.height/400;

// rescale the neurons

ctx.lineWidth = 5;
/*
ctx.beginPath();
ctx.moveTo(100*scaleX, 100*scaleY);
ctx.lineTo(200*scaleX, 260*scaleY);
ctx.strokeStyle = 'red';
ctx.stroke();

ctx.beginPath();
ctx.moveTo(200*scaleX, 160*scaleY);
ctx.quadraticCurveTo(230*scaleX, 200*scaleY, 250*scaleX, 120*scaleY);
ctx.strokeStyle = 'green';
ctx.stroke();

ctx.beginPath();
ctx.moveTo(250*scaleX,120*scaleY);
ctx.bezierCurveTo(290*scaleX, -40*scaleY, 300*scaleX, 200*scaleY, 400*scaleX, 150*scaleY);
ctx.strokeStyle = 'blue';
ctx.stroke();

ctx.beginPath();
ctx.moveTo(400*scaleX, 150*scaleY);
ctx.lineTo(500*scaleX, 90*scaleY);
ctx.strokeStyle = 'gold';
ctx.stroke();
*/
          // draw the tracking rectangle
          /*
          var xy;

          if(sliderValue<250){
              var percent=sliderValue/249;
              xy=getLineXYatPercent({x:100*scaleX,y:100*scaleY},{x:200*scaleX,y:260*scaleY},percent);
          }
          else if(sliderValue<500){
              var percent=(sliderValue-250)/249
              xy=getQuadraticBezierXYatPercent({x:200*scaleX,y:160*scaleY},{x:230*scaleX,y:200*scaleY},{x:250*scaleX,y:120*scaleY},percent);
          }
          else if(sliderValue<750){
              var percent=(sliderValue-500)/249
              xy=getCubicBezierXYatPercent({x:250*scaleX,y:120*scaleY},{x:290*scaleX,y:-40*scaleY},{x:300*scaleX,y:200*scaleY},{x:400*scaleX,y:150*scaleY},percent);
          }
          else {
              var percent=(sliderValue-750)/250
              xy=getLineXYatPercent({x:400*scaleX,y:150*scaleY},{x:500*scaleX,y:90*scaleY},percent);
          }
          drawDot(xy,"blue",ctx);
          
      }
      */

      function drawNet(canvas,ctx){

        // rescale the neurons
        var scaleX = canvas.width/600;
        var scaleY = canvas.height/400;

        for(j = 0; j < numLayers; j++){
         for(i = 0; i < layers[j].length; i++) {

          layers[j][i].x=layers[j][i].x*scaleX;
          layers[j][i].x=layers[j][i].x*scaleX;

        }
      }


          // redraw beginPath
          //ctx.clearRect(0,0,canvas.width,canvas.height);



          for(j = 0; j < numLayers-1; j++){
           for(i = 0; i < layers[j].length; i++) {
            for(var m = 0; m < layers[j+1].length; m++) {
              drawSynapse(layers[j][i],layers[j+1][m],"black",ctx);
            }       
          }

        }

        for(var j = 0; j < numLayers; j++){
         for(var i = 0; i < layers[j].length; i++) {
          drawNeuron(layers[j][i],"black",ctx);               
        }
      }

    }

    function Signal (startLayer,startInd,endInd) {
      this.currentLayer =  startLayer;
      this.startInd= startInd;
      this.endInd = endInd;
      this.x = layers[startLayer][startInd].x;
      this.y = layers[startLayer][startInd].y;
      var xyDir = calcDirection(startLayer,startInd,endInd);
      this.xDirection = xyDir.x;
      this.yDirection = xyDir.y;
    }



    function calcDirection(startLayer, startInd, endInd){

      //console.log(startLayer, startInd, endInd, layers[startLayer+1][endInd]);
      var a = layers[startLayer+1][endInd].x - layers[startLayer][startInd].x;
      var b = layers[startLayer+1][endInd].y - layers[startLayer][startInd].y;
      var magnitude = Math.sqrt( a*a + b*b);
      a = a/magnitude;
      b = b/magnitude;
      return( {x:a,y:b} );
    }

    function updateSignal(signal){

      signal.x = signal.x + 4*signal.xDirection;
      signal.y = signal.y + 4*signal.yDirection;

      var endNeuron = layers[signal.currentLayer+1][signal.endInd];

      if(Math.abs(signal.x - endNeuron.x)<3 && Math.abs(signal.y - endNeuron.y) < 3){
        return signalArrived(signal);
      };

      return true;
    }

    function signalArrived(signal){
      signal.currentLayer++;

      if(signal.currentLayer == numLayers-1){
        console.log("finished");
        return false;
      };

      thresholds[signal.currentLayer][signal.endInd].y++;
      if(thresholds[signal.currentLayer][signal.endInd].x == thresholds[signal.currentLayer][signal.endInd].y){
        thresholds[signal.currentLayer][signal.endInd].y=0;
        signal1 = new Signal(signal.currentLayer,signal.endInd,randomIntFromInterval(1,layers[signal.currentLayer+1].length)-1);
        signals.push(signal1);
      };
      return false;
    }


    function drawSignal(TempSignal,ctx){

      ctx.fillStyle="black";
      ctx.strokeStyle="black";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.arc(TempSignal.x,TempSignal.y,2,0,Math.PI*2,false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }





      // draw tracking rect at xy
      function drawRect(point,color,ctx){
        ctx.fillStyle="cyan";
        ctx.strokeStyle="gray";
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.rect(point.x-13,point.y-8,25,15);
        ctx.fill();
        ctx.stroke();
      }

      // draw tracking dot at xy
      function drawDot(point,color,ctx){
        ctx.fillStyle=color;
        ctx.strokeStyle="black";
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.arc(point.x,point.y,8,0,Math.PI*2,false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      function drawNeuron(point,color,ctx){
        ctx.fillStyle="white";
        ctx.strokeStyle="black";
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.arc(point.x,point.y,8,0,Math.PI*2,false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      function drawHead(point,ctx){
        ctx.fillStyle="white";
        ctx.strokeStyle="black";
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.arc(point.x,point.y,8,0,Math.PI*2,false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      function drawSynapse(startP,endP,color,ctx){
        ctx.lineWidth=1;
        
        ctx.beginPath();
        ctx.moveTo(startP.x, startP.y);
        ctx.lineTo(endP.x, endP.y);
        ctx.strokeStyle = 'black';
        ctx.stroke();
        
      }

      // line: percent is 0-1
      function getLineXYatPercent(startPt,endPt,percent) {
        var dx = endPt.x-startPt.x;
        var dy = endPt.y-startPt.y;
        var X = startPt.x + dx*percent;
        var Y = startPt.y + dy*percent;
        return( {x:X,y:Y} );
      }

      // quadratic bezier: percent is 0-1
      function getQuadraticBezierXYatPercent(startPt,controlPt,endPt,percent) {
        var x = Math.pow(1-percent,2) * startPt.x + 2 * (1-percent) * percent * controlPt.x + Math.pow(percent,2) * endPt.x; 
        var y = Math.pow(1-percent,2) * startPt.y + 2 * (1-percent) * percent * controlPt.y + Math.pow(percent,2) * endPt.y; 
        return( {x:x,y:y} );
      }

      // cubic bezier percent is 0-1
      function getCubicBezierXYatPercent(startPt,controlPt1,controlPt2,endPt,percent){
        var x=CubicN(percent,startPt.x,controlPt1.x,controlPt2.x,endPt.x);
        var y=CubicN(percent,startPt.y,controlPt1.y,controlPt2.y,endPt.y);
        return({x:x,y:y});
      }

      // cubic helper formula at percent distance
      function CubicN(pct, a,b,c,d) {
        var t2 = pct * pct;
        var t3 = t2 * pct;
        return a + (-a * 3 + pct * (3 * a - a * pct)) * pct
        + (3 * b + pct * (-6 * b + b * 3 * pct)) * pct
        + (c * 3 - c * 3 * pct) * t2
        + d * t3;
      }


  });   // end $(function(){});

  function fitToContainer(canvas){
    canvas.style.width='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function randomIntFromInterval(min,max)
  {
    return Math.floor(Math.random()*(max-min+1)+min);
  }












