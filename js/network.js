$(function(){function v(){tmp=W(1,100),tmp<5&&p.push(new J(0,1,W(1,LayerSize[0])-1,W(0,n[1].length-1))),N(),O(),P(),A(),ctx.clearRect(0,0,canvas.width,canvas.height),Q(),R(),S(),y(),T(),setTimeout(function(){requestAnimationFrame(v)},1e3/d)}function w(a){neuron1=new C(a.clientX,a.clientY,1),k.push(neuron1),x(a),z()}function x(a){for(k[0].x=a.clientX,k[0].y=a.clientY,i=1;i<t-2;i++){if(k[0].y<u*i)return k[0].layer=i,void(r!=k[0].layer&&(r=$.extend({},k[0].layer),s=!0));k[0].layer=t-2,r!=k[0].layer&&(r=$.extend({},k[0].layer),s=!0)}}function y(){0!=k.length&&E(k[0],"#F00")}function z(){for(currLayer=k[0].layer,j=0;j<n[currLayer-1].length;j++)synapseIn=new F(currLayer-1,j,0),m.push(synapseIn);for(l=0;l<n[currLayer+1].length;l++)synapseOut=new F(currLayer+1,l,0),m.push(synapseOut)}function A(){if(m.length>0)for(s&&(m.splice(0,1e3),z(),s=!1),i=0;i<m.length;i++)L=Math.max(canvas.width,canvas.height),dist=V(n[m[i].layerID][m[i].startID],k[0]),dist>.2*L?thick=0:dist<.02*L?thick=3:thick=Math.sqrt(.2*L/Math.max(.02*L,dist)-1),m[i].thickness=thick}function B(a,b){0!=a.thickness&&(ctx.lineWidth=a.thickness,ctx.beginPath(),ctx.moveTo(n[a.layerID][a.startID].x,n[a.layerID][a.startID].y),ctx.lineTo(k[0].x,k[0].y),ctx.strokeStyle=b,ctx.stroke())}function C(a,b,c){this.x=a,this.y=b,this.goalX=0,this.goalY=0,this.connections=0,this.layer=0,this.moving=!0}function D(a){a.moving&&((0==a.goalX||Math.abs(a.goalX-a.x)<.1)&&(a.goalX=W(a.x-.05*canvas.width,a.x+.05*canvas.width),a.goalY=W(a.y-.05*canvas.height,a.y+.05*canvas.height)),a.x<.1&&(a.goalX=W(5,15)/100*canvas.width),a.x>canvas.width-.1&&(a.goalX=W(85,95)/100*canvas.width),a.y<.1&&(a.goalY=W(5,15)/100*canvas.height),a.y>canvas.height-.1&&(a.goalY=W(85,95)/100*canvas.height),direction_x=a.goalX-a.x,direction_y=a.goalY-a.y,a.x=a.x+.01*direction_x,a.y=a.y+.01*direction_y)}function E(a,b){ctx.fillStyle=b,ctx.strokeStyle=b,ctx.lineWidth=.1,ctx.beginPath(),ctx.arc(a.x,a.y,.1,0,2*Math.PI,!1),ctx.closePath(),ctx.fill(),ctx.stroke()}function F(a,b,c){this.layerID=a,this.startID=b,this.endID=c,this.thickness=1}function G(a,b){0!=a.thickness&&(ctx.lineWidth=a.thickness,ctx.beginPath(),ctx.moveTo(n[a.layerID][a.startID].x,n[a.layerID][a.startID].y),ctx.lineTo(n[a.layerID+1][a.endID].x,n[a.layerID+1][a.endID].y),ctx.strokeStyle=b,ctx.stroke())}function H(){o=[];for(var a=0;a<n.length-1;a++)for(var b=0;b<n[a].length;b++)for(var c=0;c<n[a+1].length;c++)synapse1=new F(a,b,c),o.push(synapse1)}function I(a){L=Math.max(canvas.width,canvas.height),dist=V(n[a.layerID][a.startID],n[a.layerID+1][a.endID]),dist>.2*L?thick=0:dist<.02*L?thick=3:thick=Math.sqrt(.2*L/Math.max(.02*L,dist)-1),a.thickness=thick}function J(a,b,c,d){this.startLayer=a,this.destLayer=b,this.startID=c,this.endID=d,this.percent=0,this.speed=W(1e3,1001)/5,this.delay=W(1,5),this.started=!1,this.arrived=!1,this.thickness=.1,this.alpha=.9}function K(a){if(L=Math.max(canvas.width,canvas.height),dist=V(n[a.startLayer][a.startID],n[a.destLayer][a.endID]),dist>.2*L?thick=0:dist<.02*L?thick=3:thick=Math.sqrt(.2*L/Math.max(.02*L,dist)-1),a.thickness=thick,0!=a.thickness){if(a.delay>.01)return void(a.delay-=1/d);if(a.started=!0,a.percent>=100)return void(a.arrived=!0);a.percent+=(2+a.speed-a.percent/100*(a.percent/100)*(a.percent/100)*(a.percent/100)*a.speed)/d,a.alpha=.95-a.percent*a.percent*a.percent*a.percent*a.percent*a.percent/1e12}}function M(a){0!=a.thickness&&(dx=a.percent/100*(n[a.destLayer][a.endID].x-n[a.startLayer][a.startID].x),dy=a.percent/100*(n[a.destLayer][a.endID].y-n[a.startLayer][a.startID].y),color="rgba(242,147,60, "+a.alpha+")",ctx.fillStyle=color,ctx.strokeStyle=color,ctx.lineWidth=a.thickness/4,ctx.beginPath(),ctx.arc(n[a.startLayer][a.startID].x+dx,n[a.startLayer][a.startID].y+dy,a.thickness/4,0,2*Math.PI,!1),ctx.closePath(),ctx.fill(),ctx.stroke())}function N(){for(var a=0;a<n.length;a++)for(var b=0;b<n[a].length;b++)D(n[a][b])}function O(){for(var a=0;a<o.length;a++)I(o[a])}function P(){for(var a=p.length-1;a>=0;a--)K(p[a]),0==p[a].thickness?p.splice(a,1):p[a].arrived&&(p[a].destLayer==t-1?p.splice(a,1):(tmp=W(1,10),tmp<10||1==p[a].destLayer?tmp=1:tmp=-1,signal1=$.extend(!0,{},new J(p[a].destLayer,p[a].destLayer+tmp,p[a].endID,W(0,n[Math.max(1,p[a].destLayer+tmp)].length-1))),p.splice(a,1,signal1)))}function Q(){for(var a=0;a<n.length;a++)for(var b=0;b<n[a].length;b++)E(n[a][b],"#060706")}function R(){for(var a=0;a<o.length;a++)G(o[a],"#060706")}function S(){for(var a=p.length-1;a>=0;a--)p[a].started&&0!=p[a].thickness&&M(p[a])}function T(){if(m.length>0)for(var a=0;a<m.length;a++)B(m[a],"#F00")}function V(a,b){return dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy),dist}function W(a,b){return Math.floor(Math.random()*(b-a+1)+a)}function X(a){a.style.width="100%",a.style.height="100%",a.width=a.offsetWidth,a.height=a.offsetHeight}$("#typed").typed({stringsElement:$("#typed-strings")});var a=function(){var a=document.getElementById("canvas").getContext("2d"),b=window.devicePixelRatio||1,c=a.webkitBackingStorePixelRatio||a.mozBackingStorePixelRatio||a.msBackingStorePixelRatio||a.oBackingStorePixelRatio||a.backingStorePixelRatio||1;return b/c}();createHiDPICanvas=function(b,c,d){d||(d=a);var e=document.createElement("canvas");return e.width=b*d,e.height=c*d,e.style.width=b+"px",e.style.height=c+"px",e.getContext("2d").setTransform(d,0,0,d,0,0),e},canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d"),ctx.globalAlpha=.3;var b=document.getElementById("container");addEvent(window,"resize",function(a){canvas=createHiDPICanvas(b.clientWidth,b.clientHeight)});var c=!0,d=60;b.clientHeight/canvas.height,b.clientWidth/canvas.width;canvas.onmousein=function(a){w(a)},canvas.onmousemove=function(a){0==k.length?w(a):x(a)},canvas.onmouseout=function(a){k.splice(0,1),m.splice(0,1e3)},canvas.onmouseup=function(a){prevNeuron=$.extend(!0,{},k[0]),prevNeuron.goalX=prevNeuron.x+.17,prevNeuron.goalY=prevNeuron.y+.17,prevNeuron.moving=c,n[prevNeuron.layer].push(prevNeuron),H()},ctx.imageSmoothingEnabled=!0,X(canvas);var k=[],m=[],n=[[],[],[],[],[],[]],o=[],p=[],r=0,s=!0;LayerSize=[5,30,5,20,20,5];var t=n.length,u=canvas.height/(t-2);for(j=0;j<LayerSize.length;j++)for(i=0;i<LayerSize[j];i++)neuron1=$.extend(!0,{},new C(W(1,LayerSize[j])*(1/LayerSize[j])*canvas.width,(j+.5)*(1/LayerSize.length)*canvas.height,j)),neuron1.moving=c,n[j].push(neuron1);for(i=0;i<LayerSize[0];i++)n[0][i].moving=!1,n[0][i].x=(i+1)*(1/(LayerSize[0]+1))*canvas.width;for(i=0;i<LayerSize[LayerSize.length-1];i++)n[LayerSize.length-1][i].moving=!1,n[LayerSize.length-1][i].x=(i+1)*(1/(LayerSize[LayerSize.length-1]+1))*canvas.width;H(),v()});var addEvent=function(a,b,c){null!=a&&"undefined"!=typeof a&&(a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):a["on"+b]=c)};