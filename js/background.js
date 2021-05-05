function init() {
  const e = document.querySelector("#canvas");
  (camera = new PerspectiveCamera(
    85,
    window.innerWidth / window.innerHeight,
    10,
    500
  )),
    ((scene = new Scene()).background = bgColor),
    (renderer = new WebGLRenderer({
      canvas: e,
      antialias: !1,
      alpha: !1,
      stencil: !1,
      depth: !1,
      preserveDrawingBuffer: !1,
    })).setPixelRatio(window.devicePixelRatio),
    renderer.setSize(window.innerWidth, window.innerHeight),
    (renderer.gammaFactor = 2.2),
    (renderer.outputEncoding = sRGBEncoding),
    window.addEventListener("resize", onWindowResize),
    (cameraPath = new Curves.KnotCurve()),
    (cameraPathGeom = new TubeGeometry(cameraPath, 100, 2, 3, !0));
  let o = new GLTFLoader();
  const a = new DRACOLoader();
  a.setDecoderPath("./js/draco/gltf/"),
    o.setDRACOLoader(a),
    o.load(
      "./img/gmDraco.gltf",
      function (e) {
        let o = e.scene.children[0].geometry;
        o.center();
        const a = new PointsMaterial({
          color: gmColor,
          size: 1.2,
          blending: NoBlending,
          transparent: !1,
          sizeAttenuation: !1,
          vertexColors: !1,
        });
        a.color.convertSRGBToLinear();
        let t = new Points(o, a);
        (t.rotation.x = (90 * Math.PI) / 180),
          (t.rotation.y = (200 * Math.PI) / 180),
          (t.rotation.z = (80 * Math.PI) / 180),
          (t.position.x += 20),
          (t.position.y += 50),
          (t.position.z += 60),
          (t.matrixAutoUpdate = !1),
          t.scale.multiplyScalar(3),
          t.updateMatrixWorld(),
          t.updateMatrix(),
          scene.add(t);
      },
      function () {},
      function () {}
    );
  let t = new GLTFLoader();
  const r = new DRACOLoader();
  r.setDecoderPath("./js/draco/gltf/"),
    t.setDRACOLoader(r),
    t.load(
      "/img/wmDraco.gltf",
      function (e) {
        let o = e.scene.children[0].geometry;
        o.center();
        const a = new PointsMaterial({
          color: wmColor,
          size: 1,
          blending: NoBlending,
          transparent: !1,
          sizeAttenuation: !1,
          vertexColors: !1,
        });
        a.color.convertSRGBToLinear();
        let t = new Points(o, a);
        (t.rotation.x = (90 * Math.PI) / 180),
          (t.rotation.y = (200 * Math.PI) / 180),
          (t.rotation.z = (80 * Math.PI) / 180),
          (t.position.x += 20.1),
          (t.position.y += 50.1),
          (t.position.z += 60.1),
          (t.matrixAutoUpdate = !1),
          t.scale.multiplyScalar(3),
          t.updateMatrixWorld(),
          t.updateMatrix(),
          scene.add(t);
      },
      function () {},
      function () {}
    );
}
function animate() {
  requestAnimationFrame(animate), window.paused || animateCamera();
}
function animateCamera() {
  const e = (Date.now() % looptime) / looptime;
  cameraPathGeom.parameters.path.getPointAt(e, cameraPosition);
  const o = cameraPathGeom.tangents.length,
    a = e * o,
    t = Math.floor(a),
    r = (t + 1) % o;
  binormal.subVectors(cameraPathGeom.binormals[r], cameraPathGeom.binormals[t]),
    binormal.multiplyScalar(a - t).add(cameraPathGeom.binormals[t]),
    cameraPathGeom.parameters.path.getTangentAt(e, direction),
    normal.copy(binormal).cross(direction),
    cameraPosition.add(normal.clone().multiplyScalar(0));
  const n = cameraPosition.distanceTo(oldCameraPosition);
  cameraPosition.x - oldCameraPosition.x == 0 && (cameraPosition.x += 0.1),
    cameraPosition.y - oldCameraPosition.y == 0 && (cameraPosition.y += 0.1),
    cameraPosition.z - oldCameraPosition.z == 0 && (cameraPosition.z += 0.1),
    camera.position.copy(cameraPosition),
    cameraPathGeom.parameters.path.getPointAt(
      (e + 30 / cameraPathGeom.parameters.path.getLength()) % 1,
      lookAt
    );
  let i = new Vector3(0, 10, 0);
  lookAt.copy(cameraPosition).add(i),
    camera.matrix.lookAt(camera.position, lookAt, i),
    camera.quaternion.setFromRotationMatrix(camera.matrix),
    Math.abs(n) > 0.01 &&
      (oldCameraPosition.copy(cameraPosition), renderer.render(scene, camera));
}
function onWindowResize() {
  (camera.aspect = window.innerWidth / window.innerHeight),
    camera.updateProjectionMatrix(),
    renderer.setSize(window.innerWidth, window.innerHeight);
}
import {
  Vector3,
  PerspectiveCamera,
  Group,
  Scene,
  Color,
  WebGLRenderer,
  TubeGeometry,
  PointsMaterial,
  NoBlending,
  Points,
  sRGBEncoding,
} from "./three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";
import { DRACOLoader } from "./DRACOLoader.js";
import { Curves } from "./CurveExtras.js";
const bgColor = new Color(4742254);
bgColor.convertSRGBToLinear();
const gmColor = new Color(16730441);
gmColor.convertSRGBToLinear();
const wmColor = new Color(4849481);
let camera, scene, renderer, group, cameraPath, cameraPathGeom;
wmColor.convertSRGBToLinear();
const looptime = 8e4,
  cameraPosition = new Vector3(),
  binormal = new Vector3(),
  direction = new Vector3(),
  normal = new Vector3(),
  lookAt = new Vector3(),
  oldCameraPosition = new Vector3();
init(), animate();
