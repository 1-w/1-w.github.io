$(function() {

  $("#typed").typed({
    stringsElement: $('#typed-strings')
  });

  var fps = 60;
  var percent=0;
  var direction=1;

  var canvas = document.getElementById("canvas");

  var ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  fitToContainer(canvas);

  var neurons = [[],[],[],[],[]];
  var synapses = [];
  var signales = [];

//neural network

//layer 1
  neuron1 = new Neuron(0.5 * canvas.width,0.2 * canvas.height);
  neurons[0].push(neuron1);
  neuron1 = new Neuron(0.5 * canvas.width,0.2 * canvas.height);
  neurons[0].push(neuron1);
  neuron1 = new Neuron(0.5 * canvas.width,0.2 * canvas.height);
  neurons[0].push(neuron1);

//layer 2
  neuron1 = new Neuron(0.4 * canvas.width,0.4 * canvas.height);
  neurons[1].push(neuron1);
  neuron1 = new Neuron(0.63 * canvas.width,0.4 * canvas.height);
  neurons[1].push(neuron1);
  neuron1 = new Neuron(0.44 * canvas.width,0.4 * canvas.height);
  neurons[1].push(neuron1);
  neuron1 = new Neuron(0.6 * canvas.width,0.4 * canvas.height);
  neurons[1].push(neuron1);
  neuron1 = new Neuron(0.46 * canvas.width,0.4 * canvas.height);
  neurons[1].push(neuron1);
  neuron1 = new Neuron(0.66 * canvas.width,0.4 * canvas.height);
  neurons[1].push(neuron1);
  neuron1 = new Neuron(0.48 * canvas.width,0.4 * canvas.height);
  neurons[1].push(neuron1);
  neuron1 = new Neuron(0.69 * canvas.width,0.4 * canvas.height);
  neurons[1].push(neuron1);

//layer 3
  neuron1 = new Neuron(0.4 * canvas.width,0.6 * canvas.height);
  neurons[2].push(neuron1);
  neuron1 = new Neuron(0.63 * canvas.width,0.6 * canvas.height);
  neurons[2].push(neuron1);
  neuron1 = new Neuron(0.44 * canvas.width,0.6 * canvas.height);
  neurons[2].push(neuron1);
  neuron1 = new Neuron(0.6 * canvas.width,0.6 * canvas.height);
  neurons[2].push(neuron1);
  neuron1 = new Neuron(0.46 * canvas.width,0.6 * canvas.height);
  neurons[2].push(neuron1);
  neuron1 = new Neuron(0.66 * canvas.width,0.6 * canvas.height);
  neurons[2].push(neuron1);
  neuron1 = new Neuron(0.48 * canvas.width,0.6 * canvas.height);
  neurons[2].push(neuron1);
  neuron1 = new Neuron(0.69 * canvas.width,0.6 * canvas.height);
  neurons[2].push(neuron1);

//layer 4
  neuron1 = new Neuron(0.53 * canvas.width,0.8 * canvas.height);
  neurons[3].push(neuron1);
  neuron1 = new Neuron(0.56 * canvas.width,0.8 * canvas.height);
  neurons[3].push(neuron1);
  neuron1 = new Neuron(0.59 * canvas.width,0.8 * canvas.height);
  neurons[3].push(neuron1);

//layer 5
  neuron1 = new Neuron(0.5 * canvas.width,0.9 * canvas.height);
  neurons[4].push(neuron1);


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

  //draw everything
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawNeurons();
  drawSynapses();

  setTimeout(function() {
    requestAnimationFrame(animate);
  }, 1000 / fps);
}

// creators for the three classes

function Neuron(x, y){
  /* Parameters:
      x,y;
      */
      this.x = x;
      this.y = y;
      this.goalX = 0;
      this.goalY = 0;
      this.connections = 0;

    }

    function updateNeuron(neuron){
      if(neuron.goalX == 0 || Math.abs(neuron.goalX - neuron.x) < 0.1){
        neuron.goalX = random(neuron.x - 0.05 * canvas.width, neuron.x + 0.05 * canvas.width);
        neuron.goalY = random(neuron.y - 0.05 * canvas.height, neuron.y + 0.05 * canvas.height);
      };

      direction_x = neuron.goalX - neuron.x;
      direction_y = neuron.goalY - neuron.y;

      neuron.x = neuron.x + 0.01 * direction_x;
      neuron.y = neuron.y + 0.01 * direction_y;
    }

    function drawNeuron(neuron){
      ctx.fillStyle="black";
      ctx.strokeStyle="black";
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

function drawSynapse(synapse){
  if(synapse.thickness!=0){
    ctx.lineWidth=synapse.thickness;
    ctx.beginPath();
    ctx.moveTo(neurons[synapse.layerID][synapse.startID].x, neurons[synapse.layerID][synapse.startID].y);
    ctx.lineTo(neurons[synapse.layerID+1][synapse.endID].x, neurons[synapse.layerID+1][synapse.endID].y);
    ctx.strokeStyle = 'black';
    ctx.stroke();
  };
}

function createSynapses(){
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
  console.log(synapse.thickness);
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
        drawNeuron(neurons[i][j]);
    }

    function drawSynapses(){
      for(var i = 0; i < synapses.length; i++)
        drawSynapse(synapses[i]);
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