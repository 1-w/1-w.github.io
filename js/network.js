$(function(){function n(){G=u.clientWidth/canvas.width;H=u.clientHeight/canvas.height;canvas=createHiDPICanvas(0<window.innerWidth?window.innerWidth:u.clientWidth,0<window.innerHeight?window.innerHeight:u.clientHeight);for(var a=G,b=H,c=0;c<d.length;c++)for(var e=0;e<d[c].length;e++)d[c][e].x*=a,d[c][e].y*=b,d[c][e].goalX=0,d[c][e].goalY=0;q=800>canvas.width?!1:!0;y=600>canvas.height||800>canvas.width?!0:!1;a=document.getElementById("about-me-div");y&&$(a).css("overflow-y","scroll")}function v(){if(!r){for(i=
D=0;i<d.length;i++)D+=d[i].length;tmp=h(1,100);tmp<Math.max(5,D/10)&&(layerID=h(1,LayerSize.length-1)-1,g.push(new I(layerID,layerID+1,h(1,LayerSize[layerID])-1,h(0,d[layerID+1].length-1))));N();O();P();if(0<m.length)for(z&&(m.splice(0,1E3),J(),z=!1),i=0;i<m.length;i++)L=Math.max(canvas.width,canvas.height),dist=E(d[m[i].layerID][m[i].startID],f[0]),thick=dist>.2*L?0:dist<.02*L?3:Math.sqrt(.2*L/Math.max(.02*L,dist)-1),m[i].thickness=thick;ctx.clearRect(0,0,canvas.width,canvas.height);Q();R();S();
0!=f.length&&(ctx.globalAlpha=1,K(f[0],"#FF6D00"),ctx.globalAlpha=.8);T()}setTimeout(function(){requestAnimationFrame(v)},1E3/60)}function t(a){neuron1=new x(a.clientX,0,a.clientY,0,1);f.push(neuron1);M(a);J()}function M(a){f[0].x=a.clientX;f[0].y=a.clientY;for(i=1;i<A-2;i++){if(f[0].y<U*i)return f[0].layer=i,B!=f[0].layer&&(B=$.extend({},f[0].layer),z=!0),0;f[0].layer=A-2;B!=f[0].layer&&(B=$.extend({},f[0].layer),z=!0)}}function J(){currLayer=f[0].layer;if(0<currLayer)for(j=0;j<d[currLayer-1].length;j++)synapseIn=
new F(currLayer-1,j,0),m.push(synapseIn);if(currLayer<d.length-1)for(l=0;l<d[currLayer+1].length;l++)synapseOut=new F(currLayer+1,l,0),m.push(synapseOut)}function x(a,b,c,d,f){this.x=a;this.y=c;this.goalX=b;this.goalY=d;this.connections=0;this.layer=f;this.moving=!0;this.speed=.01}function K(a,b){ctx.fillStyle=b;ctx.strokeStyle=b;ctx.lineWidth=.1;ctx.beginPath();ctx.arc(a.x,a.y,.1,0,2*Math.PI,!1);ctx.closePath();ctx.fill();ctx.stroke()}function F(a,b,c){this.layerID=a;this.startID=b;this.endID=c;
this.thickness=1}function C(){w=[];for(var a=0;a<d.length-1;a++)for(var b=0;b<d[a].length;b++)for(var c=0;c<d[a+1].length;c++)synapse1=new F(a,b,c),w.push(synapse1)}function I(a,b,c,d){this.startLayer=a;this.destLayer=b;this.startID=c;this.endID=d;this.percent=0;this.speed=h(1,4);this.delay=h(1,5);this.arrived=this.started=!1;this.thickness=.1;this.alpha=.5}function N(){for(var a=0;a<d.length;a++)for(var b=0;b<d[a].length;b++)a:{var c=d[a][b];if(c.moving){if(0==c.goalX||.1>Math.abs(c.goalX-c.x))if(c.speed=
.01,p){var e=c.layer;if(19==e||18==e||-17==e||-16==e||15==e||14==e||-13==e||12==e||11==e||-10==e||9==e||8==e||7==e||6==e||5==e||4==e||3==e||2==e||1==e||0==e){c.moving=!1;break a}else c.goalX=h(c.x-.05*canvas.width,c.x+.05*canvas.width),c.goalY=h(c.y-.05*canvas.height,c.y+.05*canvas.height)}else c.goalX=h(c.x-.05*canvas.width,c.x+.05*canvas.width),c.goalY=h(c.y-.05*canvas.height,c.y+.05*canvas.height);.1>c.x&&(c.goalX=h(5,15)/100*canvas.width);c.x>canvas.width-.1&&(c.goalX=h(85,95)/100*canvas.width);
.1>c.y&&(c.goalY=h(5,15)/100*canvas.height);c.y>canvas.height-.1&&(c.goalY=h(85,95)/100*canvas.height);direction_x=c.goalX-c.x;direction_y=c.goalY-c.y;c.x+=(p?Math.min(c.speed,.1):Math.max(c.speed,.01))*direction_x;c.y+=(p?Math.min(c.speed,.1):Math.max(c.speed,.01))*direction_y}}}function O(){for(var a=0;a<w.length;a++){var b=w[a];L=Math.max(canvas.width,canvas.height);dist=E(d[b.layerID][b.startID],d[b.layerID+1][b.endID]);thick=dist>.2*L?0:dist<.02*L?3:Math.sqrt(.2*L/Math.max(.02*L,dist)-1);b.thickness=
4/3*thick}}function P(){for(var a=g.length-1;0<=a;a--){var b=g[a];L=Math.max(canvas.width,canvas.height);try{dist=E(d[b.startLayer][b.startID],d[b.destLayer][b.endID])}catch(c){}thick=dist>.2*L?0:dist<.02*L?3:Math.sqrt(.2*L/Math.max(.02*L,dist)-1);b.thickness=thick;0!=b.thickness&&(.01<b.delay?b.delay-=1/60:(b.started=!0,100<=b.percent?b.arrived=!0:(b.percent+=100*b.speed/60,b.alpha=.5-b.percent*b.percent*b.percent*b.percent*b.percent*b.percent/2E12)));0==g[a].thickness?g.splice(a,1):g[a].arrived&&
(g[a].destLayer==A-1?g.splice(a,1):(tmp=h(1,10),tmp=10>tmp||1==g[a].destLayer?1:-1,signal1=$.extend(!0,{},new I(g[a].destLayer,g[a].destLayer+tmp,g[a].endID,h(0,d[Math.max(1,g[a].destLayer+tmp)].length-1))),g.splice(a,1,signal1)))}}function Q(){for(var a=0;a<d.length;a++)for(var b=0;b<d[a].length;b++)K(d[a][b],"#212121")}function R(){for(var a=0;a<w.length;a++){var b=w[a];0!=b.thickness&&(ctx.lineWidth=b.thickness,ctx.beginPath(),ctx.moveTo(d[b.layerID][b.startID].x,d[b.layerID][b.startID].y),ctx.lineTo(d[b.layerID+
1][b.endID].x,d[b.layerID+1][b.endID].y),ctx.strokeStyle="#212121",ctx.globalAlpha=.8,ctx.stroke())}}function S(){for(var a=g.length-1;0<=a;a--)if(g[a].started&&0!=g[a].thickness){var b=g[a];try{if(0!=b.thickness){var c=b.percent/100;dt=yPos=0*Math.abs(Math.pow(1-c,3))+3*Math.pow(1-c,2)*c*.05+3*Math.abs(1-c)*Math.pow(c,2)*.98+1*Math.abs(Math.pow(c,3));dx=dt*(d[b.destLayer][b.endID].x-d[b.startLayer][b.startID].x);dy=dt*(d[b.destLayer][b.endID].y-d[b.startLayer][b.startID].y);color="rgba(255,255,255, "+
b.alpha+")";ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=b.thickness/4;ctx.beginPath();ctx.arc(d[b.startLayer][b.startID].x+dx,d[b.startLayer][b.startID].y+dy,b.thickness/4,0,2*Math.PI,!1);ctx.closePath();ctx.fill();ctx.stroke()}}catch(e){}}}function T(){if(0<m.length)for(var a=0;a<m.length;a++){var b=m[a];if(0!=b.thickness){var c=ctx.createLinearGradient(f[0].x,f[0].y,d[b.layerID][b.startID].x,d[b.layerID][b.startID].y);c.addColorStop(0,"#FF6D00");c.addColorStop(1,"#473120");ctx.lineWidth=
b.thickness;ctx.beginPath();ctx.moveTo(d[b.layerID][b.startID].x,d[b.layerID][b.startID].y);ctx.lineTo(f[0].x,f[0].y);ctx.strokeStyle=c;ctx.stroke()}}}function E(a,b){dx=b.x-a.x;dy=b.y-a.y;return dist=Math.sqrt(dx*dx+dy*dy)}function h(a,b){return Math.floor(Math.random()*(b-a+1)+a)}canvas=document.getElementById("canvas");ctx=canvas.getContext("2d");ctx.translate(.5,.5);ctx.globalAlpha=.2;var r=!1,p=!1,u=document.getElementById("canvas-container"),H=u.clientHeight/canvas.height,G=u.clientWidth/canvas.width;
ctx.imageSmoothingEnabled=!0;(function(a){a.style.width="100%";a.style.height="100%";a.width=a.offsetWidth;a.height=a.offsetHeight;q=800>a.width?!1:!0;y=600>a.height||800>a.width?!0:!1})(canvas);var f=[],m=[],d=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],k=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],w=[],g=[],B=0,z=!0,D=0;LayerSize=[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10];var A=d.length,U=canvas.height/(A-2),q=!1;800<canvas.width&&(q=!0);var y=
!1;600>canvas.height&&(y=!0);for(j=0;j<LayerSize.length;j++)for(i=0;i<LayerSize[j];i++)neuron1=$.extend(!0,{},new x((h(1,LayerSize[j])-.5)*(1/LayerSize[j])*canvas.width,0,1/LayerSize.length*(j+.5)*canvas.height,0,j)),neuron1.moving=!0,d[j].push(neuron1);C();v();$(document.getElementById("about-me")).click(function(){document.getElementById("about-me").getElementsByTagName("i");var a=document.getElementById("main-container"),b=document.getElementById("header-container");document.getElementsByClassName("row");
var c=document.getElementById("about-me-div"),e=document.getElementById("divider"),f=document.getElementById("about-me-symb");if(p){if(q){console.log(d[2][2],k[2][2],Object.keys(k).length);for(i=0;i<Object.keys(k).length;i++){for(j=0;j<k[i].length;j++)d[i].length>j?(d[i][j].goalX=k[i][j].goalX,d[i][j].goalY=k[i][j].goalY,d[i][j].moving=!0,d[i][j].speed=.1):(neuron1=0==d[i].length?$.extend(!0,{},new x(d[0][j].x,k[i][j].goalX,d[0][j].y,k[i][j].goalY,k[i][j].layer)):$.extend(!0,{},new x(d[i][j-1].x,
k[i][j].goalX,d[i][j-1].y,k[i][j].goalY,k[i][j].layer)),neuron1.moving=!0,neuron1.speed=.1,d[i].push(neuron1));d[i].splice(k[i].length,1E3)}console.log(d[2][2],k[2][2]);p=!1;C();g.splice(0,g.length)}else p=!1;$(f).toggleClass("fa-bars fa-arrow-left");setTimeout(function(){$(b).css("top","50%");q&&$(a).css("left","50%");$(c).css("top","calc(50vh + 25px)")},500);setTimeout(function(){$(b).css("max-height","calc(3*(12px + 2vw))")},200);setTimeout(function(){$(e).css("visibility","hidden")},200);$(e).css("animation",
"disappear 200ms");$(c).css("visibility","hidden");$(c).css("animation","disappear 300ms");$(a).toggleClass("ease-in ease-out");$(b).toggleClass("ease-in ease-out")}else if(q&&$(a).css("left","30%"),$(f).toggleClass("fa-bars fa-arrow-left"),$(b).css("top","calc(50px + 10vh + 5vw)"),$(c).css("top","calc(10px)"),setTimeout(function(){$(b).css("max-height","500px")},200),setTimeout(function(){$(e).css("visibility","visible");$(e).css("animation","appear 300ms")},400),setTimeout(function(){$(c).css("visibility",
"visible");$(c).css("animation","appear 300ms");$(document.getElementById("about-me")).hover=!1},600),$(a).toggleClass("ease-in ease-out"),$(b).toggleClass("ease-in ease-out"),q){ratio=Math.min(canvas.width/1365,canvas.height/800);tmpFaceNeurons=[[1119*ratio,572*ratio,0],[950*canvas.width/1365,535*ratio,0],[986*canvas.width/1365,563*ratio,0],[1021*canvas.width/1365,565*ratio,0],[1062*canvas.width/1365,543*ratio,0],[1024*canvas.width/1365,536*ratio,0],[1008*canvas.width/1365,540*ratio,0],[991*canvas.width/
1365,532*ratio,0],[838*canvas.width/1365,181*ratio,1],[791*canvas.width/1365,201*ratio,1],[765*canvas.width/1365,316*ratio,1],[752*canvas.width/1365,387*ratio,1],[1111*canvas.width/1365,672*ratio,1],[978*canvas.width/1365,536*ratio,1],[991*canvas.width/1365,547*ratio,1],[1021*canvas.width/1365,566*ratio,1],[1040*canvas.width/1365,563*ratio,1],[967*canvas.width/1365,547*ratio,1],[787*canvas.width/1365,376*ratio,2],[838*canvas.width/1365,250*ratio,2],[926*canvas.width/1365,181*ratio,2],[959*canvas.width/
1365,740*ratio,2],[1066*canvas.width/1365,541*ratio,2],[962*canvas.width/1365,175*ratio,3],[883*canvas.width/1365,221*ratio,3],[861*canvas.width/1365,258*ratio,3],[841*canvas.width/1365,313*ratio,3],[813*canvas.width/1365,398*ratio,3],[829*canvas.width/1365,469*ratio,3],[997*canvas.width/1365,167*ratio,3],[1080*canvas.width/1365,169*ratio,3],[1128*canvas.width/1365,208*ratio,3],[1053*canvas.width/1365,764*ratio,3],[910*canvas.width/1365,679*ratio,3],[1008*canvas.width/1365,649*ratio,4],[910*canvas.width/
1365,579*ratio,4],[875*canvas.width/1365,511*ratio,4],[867*canvas.width/1365,435*ratio,4],[871*canvas.width/1365,359*ratio,4],[889*canvas.width/1365,291*ratio,4],[928*canvas.width/1365,244*ratio,4],[992*canvas.width/1365,223*ratio,4],[1027*canvas.width/1365,219*ratio,4],[1091*canvas.width/1365,214*ratio,4],[1033*canvas.width/1365,775*ratio,4],[1067*canvas.width/1365,750*ratio,4],[1118*canvas.width/1365,372*ratio,4],[1059*canvas.width/1365,376*ratio,4],[1090*canvas.width/1365,362*ratio,4],[1097*canvas.width/
1365,378*ratio,4],[953*canvas.width/1365,230*ratio,5],[880*canvas.width/1365,306*ratio,5],[864*canvas.width/1365,412*ratio,5],[882*canvas.width/1365,542*ratio,5],[949*canvas.width/1365,621*ratio,5],[974*canvas.width/1365,642*ratio,5],[934*canvas.width/1365,718*ratio,5],[1124*canvas.width/1365,643*ratio,5],[1083*canvas.width/1365,374*ratio,5],[1079*canvas.width/1365,363*ratio,5],[1101*canvas.width/1365,587*ratio,6],[1145*canvas.width/1365,460*ratio,6],[1147*canvas.width/1365,353*ratio,6],[1136*canvas.width/
1365,257*ratio,6],[1052*canvas.width/1365,218*ratio,6],[1068*canvas.width/1365,104*ratio,6],[1156*canvas.width/1365,156*ratio,6],[1227*canvas.width/1365,284*ratio,6],[1241*canvas.width/1365,404*ratio,6],[1095*canvas.width/1365,216*ratio,7],[1143*canvas.width/1365,280*ratio,7],[1149*canvas.width/1365,352*ratio,7],[1027*canvas.width/1365,220*ratio,7],[1151*canvas.width/1365,409*ratio,7],[1138*canvas.width/1365,491*ratio,7],[1135*canvas.width/1365,525*ratio,7],[1108*canvas.width/1365,580*ratio,7],[1067*
canvas.width/1365,626*ratio,7],[1009*canvas.width/1365,652*ratio,7],[1222*canvas.width/1365,423*ratio,7],[1205*canvas.width/1365,231*ratio,7],[979*canvas.width/1365,116*ratio,7],[902*canvas.width/1365,150*ratio,7],[1123*canvas.width/1365,565*ratio,7],[930*canvas.width/1365,106*ratio,8],[1170*canvas.width/1365,421*ratio,8],[1181*canvas.width/1365,293*ratio,8],[1111*canvas.width/1365,168*ratio,8],[914*canvas.width/1365,370*ratio,8],[945*canvas.width/1365,362*ratio,8],[1116*canvas.width/1365,113*ratio,
9],[1191*canvas.width/1365,155*ratio,9],[1261*canvas.width/1365,339*ratio,9],[1267*canvas.width/1365,444*ratio,9],[1217*canvas.width/1365,533*ratio,9],[1184*canvas.width/1365,522*ratio,9],[901*canvas.width/1365,371*ratio,9],[938*canvas.width/1365,361*ratio,9],[953*canvas.width/1365,374*ratio,9],[1150*canvas.width/1365,347*ratio,10],[1150*canvas.width/1365,147*ratio,10],[1150*canvas.width/1365,147*ratio,10],[750*canvas.width/1365,247*ratio,10],[850*canvas.width/1365,100*ratio,10],[1050*canvas.width/
1365,100*ratio,10],[950*canvas.width/1365,100*ratio,10],[971*canvas.width/1365,472*ratio,11],[977*canvas.width/1365,494*ratio,11],[997*canvas.width/1365,388*ratio,11],[975*canvas.width/1365,373*ratio,12],[996*canvas.width/1365,398*ratio,12],[987*canvas.width/1365,442*ratio,12],[970*canvas.width/1365,478*ratio,12],[974*canvas.width/1365,497*ratio,12],[988*canvas.width/1365,491*ratio,12],[1008*canvas.width/1365,503*ratio,12],[1024*canvas.width/1365,499*ratio,12],[1039*canvas.width/1365,494*ratio,12],
[1053*canvas.width/1365,497*ratio,12],[1054*canvas.width/1365,473*ratio,12],[1050*canvas.width/1365,464*ratio,12],[919*canvas.width/1365,529*ratio,12],[1094*canvas.width/1365,533*ratio,12],[1068*canvas.width/1365,394*ratio,14],[1071*canvas.width/1365,408*ratio,14],[1091*canvas.width/1365,410*ratio,14],[1094*canvas.width/1365,394*ratio,14],[1050*canvas.width/1365,405*ratio,15],[1070*canvas.width/1365,409*ratio,15],[1088*canvas.width/1365,411*ratio,15],[1106*canvas.width/1365,404*ratio,15],[1095*canvas.width/
1365,394*ratio,15],[1081*canvas.width/1365,392*ratio,15],[1066*canvas.width/1365,395*ratio,15],[1050*canvas.width/1365,406*ratio,15],[949*canvas.width/1365,399*ratio,18],[940*canvas.width/1365,387*ratio,18],[943*canvas.width/1365,406*ratio,18],[915*canvas.width/1365,398*ratio,19],[926*canvas.width/1365,392*ratio,19],[941*canvas.width/1365,390*ratio,19],[954*canvas.width/1365,391*ratio,19],[973*canvas.width/1365,401*ratio,19],[950*canvas.width/1365,404*ratio,19],[931*canvas.width/1365,403*ratio,19],
[916*canvas.width/1365,399*ratio,19]];faceNeurons=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];k=$.extend(!0,{},d);console.log(k);for(i=0;i<tmpFaceNeurons.length;i++)faceNeurons[tmpFaceNeurons[i][2]].push(tmpFaceNeurons[i]);for(i=0;i<faceNeurons.length;i++){for(j=0;j<faceNeurons[i].length;j++)d[i].length>j?(d[i][j].goalX=faceNeurons[i][j][0],d[i][j].goalY=faceNeurons[i][j][1],d[i][j].speed=.1):(neuron1=$.extend(!0,{},new x(d[i][j-1].x,faceNeurons[i][j][0],d[i][j-1].y,faceNeurons[i][j][1],
faceNeurons[i][j][2])),neuron1.speed=.1,neuron1.moving=!0,d[i].push(neuron1));d[i].splice(faceNeurons[i].length,1E3)}p=!0;C();g.splice(0,g.length)}else p=!0});$(document.getElementsByClassName("btn_social")).hover(function(){$(this).toggleClass("shadow-5")});$(document.getElementsByClassName("btn_play")).hover(function(){$(this).toggleClass("shadow-3")});$(".play_button").click(function(){(r=!r)?document.getElementById("playpause").className="fa fa-fw fa-play":document.getElementById("playpause").className=
"fa fa-fw fa-pause"});$("#typed1").typed({strings:" researcher^120;n explorer^130; fisherman^100; passenger ^250 lala^100lala^100; thinker^100; dreamer^100.^200.^300.^;".split(";"),typeSpeed:30,startDelay:500,shuffle:!1,backDelay:1E3,loopCount:0,callback:function(){document.getElementsByClassName("typed-cursor")[0].remove();$("#typed2").typed({strings:["n "],callback:function(){document.getElementsByClassName("typed-cursor")[0].remove();$("#typed3").typed({strings:["engineer^500."],typeSpeed:30,startDelay:10,
shuffle:!1,loopCount:0,callback:function(){var a=document.getElementsByClassName("typed-cursor")[0];setTimeout(function(){a.remove()},100)}})}})}});var V=function(){var a=document.getElementById("canvas").getContext("2d");return(window.devicePixelRatio||1)/(a.webkitBackingStorePixelRatio||a.mozBackingStorePixelRatio||a.msBackingStorePixelRatio||a.oBackingStorePixelRatio||a.backingStorePixelRatio||1)}();createHiDPICanvas=function(a,b,c){c||(c=V);var d=document.getElementById("canvas");d.width=a*c;
d.height=b*c;d.style.width=a+"px";d.style.height=b+"px";d.getContext("2d").setTransform(c,0,0,c,0,0);return d};n();addEvent(window,"resize",function(a){n()});canvas.addEventListener("touchstart",function(a){},!1);canvas.addEventListener("touchend",function(a){a=new MouseEvent("mouseup",{});canvas.dispatchEvent(a);f.splice(0,1);m.splice(0,1E3)},!1);canvas.addEventListener("touchmove",function(a){a=a.touches[0];a=new MouseEvent("mousemove",{clientX:a.clientX,clientY:a.clientY});canvas.dispatchEvent(a)},
!1);canvas.onmousein=function(a){r||t(a)};canvas.onmousemove=function(a){r||(0==f.length?t(a):M(a))};canvas.onmouseout=function(a){r||(f.splice(0,1),m.splice(0,1E3))};canvas.onmouseup=function(a){r||(0==f.length?t(a):(prevNeuron=$.extend(!0,{},f[0]),prevNeuron.goalX=prevNeuron.x+.17,prevNeuron.goalY=prevNeuron.y+.17,prevNeuron.moving=!0,d[prevNeuron.layer].push(prevNeuron),C()))}});
var addEvent=function(n,v,t){null!=n&&"undefined"!=typeof n&&(n.addEventListener?n.addEventListener(v,t,!1):n.attachEvent?n.attachEvent("on"+v,t):n["on"+v]=t)};