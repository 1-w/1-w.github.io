$(function(){function k(){y=m.clientWidth/canvas.width;z=m.clientHeight/canvas.height;canvas=createHiDPICanvas(0<window.innerWidth?window.innerWidth:m.clientWidth,0<window.innerHeight?window.innerHeight:m.clientHeight);for(var a=y,b=z,c=0;c<d.length;c++)for(var e=0;e<d[c].length;e++)d[c][e].x*=a,d[c][e].y*=b,d[c][e].goalX=0,d[c][e].goalY=0;$(".lineTop").css("top",1/LayerSize.length*.5*canvas.height);$(".lineBot").css("top",1/LayerSize.length*(LayerSize.length-.5)*canvas.height)}function n(){for(i=
v=0;i<d.length;i++)v+=d[i].length;tmp=g(1,100);tmp<Math.max(5,v/10)&&(layerID=g(1,LayerSize.length-1)-1,f.push(new A(layerID,layerID+1,g(1,LayerSize[layerID])-1,g(0,d[layerID+1].length-1))));G();H();I();if(0<h.length)for(r&&(h.splice(0,1E3),B(),r=!1),i=0;i<h.length;i++)L=Math.max(canvas.width,canvas.height),dist=w(d[h[i].layerID][h[i].startID],e[0]),thick=dist>.2*L?0:dist<.02*L?3:Math.sqrt(.2*L/Math.max(.02*L,dist)-1),h[i].thickness=thick;ctx.clearRect(0,0,canvas.width,canvas.height);J();K();M();
0!=e.length&&(ctx.globalAlpha=1,C(e[0],"#F00"),ctx.globalAlpha=.8);N();setTimeout(function(){requestAnimationFrame(n)},1E3/60)}function p(a){neuron1=new D(a.clientX,a.clientY,1);e.push(neuron1);E(a);B()}function E(a){e[0].x=a.clientX;e[0].y=a.clientY;for(i=1;i<t-2;i++){if(e[0].y<O*i){e[0].layer=i;u!=e[0].layer&&(u=$.extend({},e[0].layer),r=!0);break}e[0].layer=t-2;u!=e[0].layer&&(u=$.extend({},e[0].layer),r=!0)}}function B(){currLayer=e[0].layer;for(j=0;j<d[currLayer-1].length;j++)synapseIn=new x(currLayer-
1,j,0),h.push(synapseIn);for(l=0;l<d[currLayer+1].length;l++)synapseOut=new x(currLayer+1,l,0),h.push(synapseOut)}function D(a,b,c){this.x=a;this.y=b;this.layer=this.connections=this.goalY=this.goalX=0;this.moving=!0}function C(a,b){ctx.fillStyle=b;ctx.strokeStyle=b;ctx.lineWidth=.1;ctx.beginPath();ctx.arc(a.x,a.y,.1,0,2*Math.PI,!1);ctx.closePath();ctx.fill();ctx.stroke()}function x(a,b,c){this.layerID=a;this.startID=b;this.endID=c;this.thickness=1}function F(){q=[];for(var a=0;a<d.length-1;a++)for(var b=
0;b<d[a].length;b++)for(var c=0;c<d[a+1].length;c++)synapse1=new x(a,b,c),q.push(synapse1)}function A(a,b,c,d){this.startLayer=a;this.destLayer=b;this.startID=c;this.endID=d;this.percent=0;this.speed=g(1,4);this.delay=g(1,5);this.arrived=this.started=!1;this.thickness=.1;this.alpha=.5}function G(){for(var a=0;a<d.length;a++)for(var b=0;b<d[a].length;b++){var c=d[a][b];if(c.moving){if(0==c.goalX||.1>Math.abs(c.goalX-c.x))c.goalX=g(c.x-.05*canvas.width,c.x+.05*canvas.width),c.goalY=g(c.y-.05*canvas.height,
c.y+.05*canvas.height);.1>c.x&&(c.goalX=g(5,15)/100*canvas.width);c.x>canvas.width-.1&&(c.goalX=g(85,95)/100*canvas.width);.1>c.y&&(c.goalY=g(5,15)/100*canvas.height);c.y>canvas.height-.1&&(c.goalY=g(85,95)/100*canvas.height);direction_x=c.goalX-c.x;direction_y=c.goalY-c.y;c.x+=.01*direction_x;c.y+=.01*direction_y}}}function H(){for(var a=0;a<q.length;a++){var b=q[a];L=Math.max(canvas.width,canvas.height);dist=w(d[b.layerID][b.startID],d[b.layerID+1][b.endID]);thick=dist>.2*L?0:dist<.02*L?3:Math.sqrt(.2*
L/Math.max(.02*L,dist)-1);b.thickness=4/3*thick}}function I(){for(var a=f.length-1;0<=a;a--){var b=f[a];L=Math.max(canvas.width,canvas.height);dist=w(d[b.startLayer][b.startID],d[b.destLayer][b.endID]);thick=dist>.2*L?0:dist<.02*L?3:Math.sqrt(.2*L/Math.max(.02*L,dist)-1);b.thickness=thick;0!=b.thickness&&(.01<b.delay?b.delay-=1/60:(b.started=!0,100<=b.percent?b.arrived=!0:(b.percent+=100*b.speed/60,b.alpha=.5-b.percent*b.percent*b.percent*b.percent*b.percent*b.percent/2E12)));0==f[a].thickness?f.splice(a,
1):f[a].arrived&&(f[a].destLayer==t-1?f.splice(a,1):(tmp=g(1,10),tmp=10>tmp||1==f[a].destLayer?1:-1,signal1=$.extend(!0,{},new A(f[a].destLayer,f[a].destLayer+tmp,f[a].endID,g(0,d[Math.max(1,f[a].destLayer+tmp)].length-1))),f.splice(a,1,signal1)))}}function J(){for(var a=0;a<d.length;a++)for(var b=0;b<d[a].length;b++)C(d[a][b],"#212121")}function K(){for(var a=0;a<q.length;a++){var b=q[a];0!=b.thickness&&(ctx.lineWidth=b.thickness,ctx.beginPath(),ctx.moveTo(d[b.layerID][b.startID].x,d[b.layerID][b.startID].y),
ctx.lineTo(d[b.layerID+1][b.endID].x,d[b.layerID+1][b.endID].y),ctx.strokeStyle="#212121",ctx.globalAlpha=.8,ctx.stroke())}}function M(){for(var a=f.length-1;0<=a;a--)if(f[a].started&&0!=f[a].thickness){var b=f[a];if(0!=b.thickness){var c=b.percent/100;dt=yPos=0*Math.abs(Math.pow(1-c,3))+3*Math.pow(1-c,2)*c*.05+3*Math.abs(1-c)*Math.pow(c,2)*.98+1*Math.abs(Math.pow(c,3));dx=dt*(d[b.destLayer][b.endID].x-d[b.startLayer][b.startID].x);dy=dt*(d[b.destLayer][b.endID].y-d[b.startLayer][b.startID].y);color=
"rgba(255,255,255, "+b.alpha+")";ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=b.thickness/4;ctx.beginPath();ctx.arc(d[b.startLayer][b.startID].x+dx,d[b.startLayer][b.startID].y+dy,b.thickness/4,0,2*Math.PI,!1);ctx.closePath();ctx.fill();ctx.stroke()}}}function N(){if(0<h.length)for(var a=0;a<h.length;a++){var b=h[a];0!=b.thickness&&(ctx.globalAlpha=1,ctx.lineWidth=b.thickness,ctx.beginPath(),ctx.moveTo(d[b.layerID][b.startID].x,d[b.layerID][b.startID].y),ctx.lineTo(e[0].x,e[0].y),ctx.strokeStyle=
"#943800",ctx.stroke(),ctx.globalAlpha=.8)}}function w(a,b){dx=b.x-a.x;dy=b.y-a.y;return dist=Math.sqrt(dx*dx+dy*dy)}function g(a,b){return Math.floor(Math.random()*(b-a+1)+a)}$("#typed").typed({strings:["$ ^700Hi,^1400 I^100'm^200 Lennart^20 Walger^200."],typeSpeed:30,callback:function(){var a=document.getElementsByClassName("typed-cursor")[0];setTimeout(function(){a.remove()},2E3);window.setTimeout(function(){$("#typed2").typed({strings:["$ ^700I'm^100 an^100 engineer."],typeSpeed:30,startDelay:0})},
2E3)}});var P=function(){var a=document.getElementById("canvas").getContext("2d");return(window.devicePixelRatio||1)/(a.webkitBackingStorePixelRatio||a.mozBackingStorePixelRatio||a.msBackingStorePixelRatio||a.oBackingStorePixelRatio||a.backingStorePixelRatio||1)}();createHiDPICanvas=function(a,b,c){c||(c=P);var d=document.getElementById("canvas");d.width=a*c;d.height=b*c;d.style.width=a+"px";d.style.height=b+"px";d.getContext("2d").setTransform(c,0,0,c,0,0);return d};canvas=document.getElementById("canvas");
ctx=canvas.getContext("2d");ctx.translate(.5,.5);ctx.globalAlpha=.2;var m=document.getElementById("container");addEvent(window,"resize",function(a){k()});var z=m.clientHeight/canvas.height,y=m.clientWidth/canvas.width;canvas.onmousein=function(a){p(a)};canvas.onmousemove=function(a){0==e.length?p(a):E(a)};canvas.onmouseout=function(a){e.splice(0,1);h.splice(0,1E3)};canvas.onmouseup=function(a){prevNeuron=$.extend(!0,{},e[0]);prevNeuron.goalX=prevNeuron.x+.17;prevNeuron.goalY=prevNeuron.y+.17;prevNeuron.moving=
!0;d[prevNeuron.layer].push(prevNeuron);F()};ctx.imageSmoothingEnabled=!0;(function(a){a.style.width="100%";a.style.height="100%";a.width=a.offsetWidth;a.height=a.offsetHeight})(canvas);var e=[],h=[],d=[[],[],[],[],[],[]],q=[],f=[],u=0,r=!0,v=0;LayerSize=[5,30,5,20,20,5];var t=d.length,O=canvas.height/(t-2);for(j=0;j<LayerSize.length;j++)for(i=0;i<LayerSize[j];i++)neuron1=$.extend(!0,{},new D(g(1,LayerSize[j])*(1/LayerSize[j])*canvas.width,1/LayerSize.length*(j+.5)*canvas.height,j)),neuron1.moving=
!0,d[j].push(neuron1);F();k();n()});var addEvent=function(k,n,p){null!=k&&"undefined"!=typeof k&&(k.addEventListener?k.addEventListener(n,p,!1):k.attachEvent?k.attachEvent("on"+n,p):k["on"+n]=p)};