$(function() {

  $("#typed").typed({
    stringsElement: $('#typed-strings')
  });


  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  var container = document.getElementById("container");

  addEvent(window, "resize", function(event) {
    console.log(container.clientWidth,container.clientHeight);

    scaleY = container.clientHeight/canvas.height;
    scaleX = container.clientWidth/canvas.width;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    repositionNeurons(scaleX,scaleY);
  });


  var fps = 60;
  var percent=0;
  var direction=1;

    var scaleY = container.clientHeight/canvas.height;
    var scaleX = container.clientWidth/canvas.width;

  canvas.onmousein = function(event){
    createPreviewNeuron(event);
  };

  canvas.onmousemove = function(event){
    if(previewNeuron.length == 0){
      createPreviewNeuron(event);
    }else{
    //console.log(previewNeuron.length, previewNeuron[0]);
    updatePreviewNeuron(event);
  };
  };

  canvas.onmouseout = function(event){
    previewNeuron.splice(0,1);
    previewSynapses.splice(0,1000);
  };


  canvas.onmouseup = function(event){
    //console.log(event);
    //console.log(previewNeuron[0].layer);
    prevNeuron = $.extend(true, {}, previewNeuron[0]);

    prevNeuron.goalX = prevNeuron.x+0.17;
    prevNeuron.goalY = prevNeuron.y+0.17;

    neurons[prevNeuron.layer].push(prevNeuron);
    createSynapses();
  }
  

  ctx.imageSmoothingEnabled = true;
  fitToContainer(canvas);

  var previewNeuron = [];
  var previewSynapses = [];
  var neurons = [[],[],[],[],[]];
  var synapses = [];
  var signals = [];

  var currentLayer = 1;
  var lastLayer =  0;
  var layerChanged = true;

//neural network
LayerSize = [10, 30, 30, 30, 10]
var numLayers = neurons.length;
var intervals = canvas.height/(numLayers-2);


//layer 1
for(j = 0; j < LayerSize.length; j++){
  for(i = 0; i<LayerSize[j];i++){
    neuron1 = $.extend(true, {}, new Neuron((i+0.5)*(1/LayerSize[j]) * canvas.width,(j+0.5)*(1/LayerSize.length) * canvas.height, j));
    neurons[j].push(neuron1);
  }
}



createSynapses();

      // start the animation

      //testing

      animate();

      function animate(){
  //update neuronLocations
  updateNeurons();
  //update synapseLocations
  updateSynapses();
  //update signalLocations

  //update preview
  updatePreviewSynapses();

  //draw everything
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawNeurons();
  drawSynapses();
  drawPreviewNeuron();
  drawPreviewSynapses();

  setTimeout(function() {
    requestAnimationFrame(animate);
  }, 1000 / fps);
}

// creators for the three classes

function createPreviewNeuron(e){
  //ctx.moveTo(e.clientX, e.clientY);
  //console.log("mousemove");
  neuron1 = new Neuron(e.clientX, e.clientY, 1);
  previewNeuron.push(neuron1); 

  updatePreviewNeuron(e);
  createPreviewSynapses();
}

function updatePreviewNeuron(e){
  previewNeuron[0].x = e.clientX;
  previewNeuron[0].y = e.clientY;
  for(i = 1; i < numLayers-2;i++){
    if(previewNeuron[0].y < intervals*i){
      previewNeuron[0].layer = i;
      if(lastLayer != previewNeuron[0].layer){
        lastLayer = $.extend( {}, previewNeuron[0].layer);
        layerChanged = true;
      };
      //console.log("Layer:", previewNeuron[0].layer);
      return;
    };
    previewNeuron[0].layer = numLayers-2;
    if(lastLayer != previewNeuron[0].layer){
      lastLayer = $.extend( {}, previewNeuron[0].layer);
      layerChanged = true;
    };
  }
      //console.log("Layer:", previewNeuron[0].layer);
    }

    function drawPreviewNeuron(){
      if(previewNeuron.length != 0){
        drawNeuron(previewNeuron[0],"grey");
      };
    }

    function createPreviewSynapses(){
      currLayer = previewNeuron[0].layer;
      for(j=0;j<neurons[currLayer-1].length;j++){
        sinapseIn = new Synapse(currLayer-1, j, 0);
        previewSynapses.push(sinapseIn);
      }

      for(l=0;l<neurons[currLayer+1].length;l++){
        sinapseOut = new Synapse(currLayer+1, l, 0);
        previewSynapses.push(sinapseOut);
      }
      //console.log("mouseSynapses length:",mouseSynapses.length)
      //var lastLayer = $.extend( {}, previewNeuron.layer);
  }


function updatePreviewSynapses(){
  if(previewSynapses.length > 0){
    if(layerChanged){
      previewSynapses.splice(0,1000);
      createPreviewSynapses();
      layerChanged = false;
    };

    for(i = 0; i < previewSynapses.length;i++){
      L = Math.max(canvas.width,canvas.height);
      dist = distance(neurons[previewSynapses[i].layerID][previewSynapses[i].startID],previewNeuron[0]);
      if(dist>0.2 * L){ 
        thick = 0;
      }
      else{
        if(dist < 0.02 * L){
          thick = 3;
        }
        else{
          thick = Math.sqrt(((0.2 * L) / Math.max(0.02 * L , dist))-1);
        };
      };
      previewSynapses[i].thickness = thick;
    }
  };

  /*else{
  //console.log("update mouse synapses", intervals);

  for(i = 2; i < numLayers;i++){

    if(previewNeuron[0].y < intervals*i){
      //console.log("Layer:", i);

      for(j=0;j<neurons[i-2].length;j++){
        sinapseIn = new Synapse(i-2, j, 0);
        previewSynapses.push(sinapseIn);
      }

      for(l=0;l<neurons[i].length;l++){
        sinapseOut = new Synapse(i, l, 0);
        previewSynapses.push(sinapseOut);
      }
      //console.log("mouseSynapses length:",mouseSynapses.length)
      return;
    };
  }
  for(j=0;j<neurons[numLayers-3].length;j++){
        sinapseIn = new Synapse(numLayers-3, j, 0);
        previewSynapses.push(sinapseIn);
      }

      for(l=0;l<neurons[numLayers-1].length;l++){
        sinapseOut = new Synapse(numLayers-1, l, 0);
        previewSynapses.push(sinapseOut);
      }
    }*/
  }


  function drawPreviewSynapse(synapse,color){
    if(synapse.thickness!=0){
      //console.log("drawing");
      ctx.lineWidth=synapse.thickness;
      ctx.beginPath();
      ctx.moveTo(neurons[synapse.layerID][synapse.startID].x, neurons[synapse.layerID][synapse.startID].y);
      ctx.lineTo(previewNeuron[0].x, previewNeuron[0].y);
      ctx.strokeStyle = color;
      ctx.stroke();
    };
  }



  function Neuron(x, y, layer){
  /* Parameters:
      x,y;
      */
      this.x = x;
      this.y = y;
      this.goalX = 0;
      this.goalY = 0;
      this.connections = 0;
      this.layer = 0;

    }

    function updateNeuron(neuron){
      if(neuron.goalX == 0 || Math.abs(neuron.goalX - neuron.x) < 0.1){
        neuron.goalX = random(neuron.x - 0.05 * canvas.width, neuron.x + 0.05 * canvas.width);
        neuron.goalY = random(neuron.y - 0.05 * canvas.height, neuron.y + 0.05 * canvas.height);
      };

      if(neuron.x < 0.1){
        neuron.goalX = (random(5,15)/100)*canvas.width;
      };
      if(neuron.x > canvas.width-0.1){
        neuron.goalX = (random(85,95)/100)*canvas.width;
      };
      if(neuron.y < 0.1){
        neuron.goalY = (random(5,15)/100)*canvas.height;
      };
      if(neuron.y > canvas.height-0.1){
        neuron.goalY = (random(85,95)/100)*canvas.height;
      };



      direction_x = neuron.goalX - neuron.x;
      direction_y = neuron.goalY - neuron.y;

      neuron.x = neuron.x + 0.01 * direction_x;
      neuron.y = neuron.y + 0.01 * direction_y;
    }

    function drawNeuron(neuron,color){
      ctx.fillStyle=color;
      ctx.strokeStyle=color;
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.arc(neuron.x,neuron.y,2,0,Math.PI*2,false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }



    function Synapse(layerID, startNeuronID, endNeuronID){
  /* Parameters:
  startNeuron ID,
  endNeuron ID,
  */
  this.layerID = layerID;
  this.startID = startNeuronID;
  this.endID = endNeuronID;
  this.thickness = 1;

}

function drawSynapse(synapse,color){
  if(synapse.thickness!=0){
    ctx.lineWidth=synapse.thickness;
    ctx.beginPath();
    ctx.moveTo(neurons[synapse.layerID][synapse.startID].x, neurons[synapse.layerID][synapse.startID].y);
    ctx.lineTo(neurons[synapse.layerID+1][synapse.endID].x, neurons[synapse.layerID+1][synapse.endID].y);
    ctx.strokeStyle = color;
    ctx.stroke();
  };
}

function createSynapses(){
  synapses = [];
  for(var i = 0; i < neurons.length-1; i++){
    for(var j = 0; j < neurons[i].length; j++){
      for(var l = 0; l < neurons[i+1].length; l++){
        synapse1 = new Synapse(i,j,l);
        synapses.push(synapse1);
      }
    }
  }
}

function updateSynapse(synapse){
  L = Math.max(canvas.width,canvas.height);
  dist = distance(neurons[synapse.layerID][synapse.startID],neurons[synapse.layerID+1][synapse.endID]);
  if(dist>0.2 * L){ 
    thick = 0;
  }
  else{
    if(dist < 0.02 * L){
      thick = 3;
    }
    else{
      thick = Math.sqrt(((0.2 * L) / Math.max(0.02 * L , dist))-1);
    };
  };
  synapse.thickness = thick;
  //console.log(synapse.thickness);
}


function Signal(layerID, startNeuronID, endNeuronID){
  /* Parameters:

  */
  this.x = neurons[layerID][startNeuronID].x;
  this.y = neurons[layerID][startNeuronID].y;
  this.synapseID = synapseID;
  this.percent = 0;
  this.speed = random(250,1000)/250;

}

function drawSignal(signal){


}






function updateNeurons(){
  for(var i = 0; i < neurons.length; i++)
    for(var j = 0; j < neurons[i].length; j++)
      updateNeuron(neurons[i][j]);
  }

  function updateSynapses(){
    for(var i = 0; i < synapses.length; i++)
      updateSynapse(synapses[i]);
  }

  function drawNeurons(){
    for(var i = 0; i < neurons.length; i++)
      for(var j = 0; j < neurons[i].length; j++)
        drawNeuron(neurons[i][j],"black");
    }

    function drawSynapses(){
      for(var i = 0; i < synapses.length; i++)
        drawSynapse(synapses[i],"black");
    }

    function drawPreviewSynapses(){
      //console.log(previewSynapses.length);
      if(previewSynapses.length > 0){
        for(var i = 0; i < previewSynapses.length; i++)
          drawPreviewSynapse(previewSynapses[i],"grey");
      };
    }


    function repositionNeurons(scaleX,scaleY){
      for(var i = 0; i < neurons.length; i++){
        for(var j = 0; j < neurons[i].length; j++){
          //console.log(i,j,neurons[i].length,neurons[i][j]);
          neurons[i][j].x = neurons[i][j].x * scaleX;
          neurons[i][j].y = neurons[i][j].y * scaleY;
          neurons[i][j].goalX = 0;
          neurons[i][j].goalY = 0;
        }
      }
    }



    function distance(neuron1,neuron2){
      dx = neuron2.x-neuron1.x;
      dy = neuron2.y-neuron1.y;
      dist = Math.sqrt(dx*dx + dy*dy);
      return dist;
    }


    function random(min,max)
    {
      return Math.floor(Math.random()*(max-min+1)+min);
    }

    function fitToContainer(canvas){
      canvas.style.width='100%';
      canvas.style.height='100%';
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }



  });

var addEvent = function(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
    }
};