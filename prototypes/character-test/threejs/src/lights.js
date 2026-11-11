// Luz da bancada: um sol vindo do azimute da câmera + luz ambiente lisa.
// (O gerador dos sprites provisórios usa esta mesma função, para 2D e 3D saírem com a mesma luz.)
import { AmbientLight, DirectionalLight } from 'three';

export function addBenchLights(scene, L) {
  const amb = new AmbientLight(L.ambientColor, L.ambientIntensity);
  const sun = new DirectionalLight(L.sunColor, L.sunIntensity);
  const el = (L.sunElDeg * Math.PI) / 180, az = (L.sunAzDeg * Math.PI) / 180;
  sun.position.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).multiplyScalar(20);
  scene.add(amb, sun, sun.target);
  return { amb, sun };
}
