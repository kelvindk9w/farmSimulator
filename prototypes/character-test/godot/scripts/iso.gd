class_name Iso
extends RefCounted
## Projeção da câmera do jogo (ortográfica, yaw 45°, elevação ~35°) e as 8 direções de tela.
## Tradução de threejs/src/iso.js. Os pares [x, z] são Arrays de float para manter precisão dupla.

const DIRS := ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]  # sentido horário a partir do norte da tela
const ESPELHO := {"SW": "SE", "W": "E", "NW": "NE", "SE": "SW", "E": "W", "NE": "NW"}

var sin_e: float
var cos_e: float
var sin_y: float
var cos_y: float


func _init(cam: Dictionary) -> void:
	var yaw := deg_to_rad(float(cam.yawDeg))
	var elev := deg_to_rad(float(cam.elevDeg))
	sin_e = sin(elev)
	cos_e = cos(elev)
	sin_y = sin(yaw)
	cos_y = cos(yaw)


## direção de tela k (0 = N ... 7 = NW) -> vetor unitário no chão do mundo [x, z]
func dir_vec(k: int) -> Array:
	var a := k * PI / 4.0
	return en_to_world(sin(a), cos(a))


## coordenadas "leste/norte de tela" (unidades de mundo, no chão) -> mundo [x, z]
func en_to_world(e: float, n: float) -> Array:
	return [e * cos_y - n * sin_y, -e * sin_y - n * cos_y]


func world_to_en(x: float, z: float) -> Array:
	return [x * cos_y - z * sin_y, -x * sin_y - z * cos_y]


## giro em Y (graus) que faz o personagem (frente em +Z) olhar para a direção k
func dir_yaw_deg(k: int) -> float:
	var v := dir_vec(k)
	return rad_to_deg(atan2(v[0], v[1]))


## mundo -> tela, em unidades de mundo (x para a direita, y para CIMA), relativo ao ponto (0,0,0)
func project(x: float, y: float, z: float) -> Vector2:
	return Vector2(x * cos_y - z * sin_y, y * cos_e - (x * sin_y + z * cos_y) * sin_e)


## vetor do alvo até a câmera
func cam_dir() -> Vector3:
	return Vector3(cos_e * sin_y, sin_e, cos_e * cos_y)
