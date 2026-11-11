class_name BenchSim
extends RefCounted
## Simulação da bancada: movimento em 8 direções + máquina de estados das animações.
## Tradução linha a linha de threejs/src/sim.js (a mesma lógica nas quatro variantes).
## Anda em passos fixos (config "step", 1/60 s): o modo demonstração é determinístico.

const HOLD := ["crouch", "sit", "lie"]  # poses que ficam no último quadro até outra tecla

var cfg: Dictionary
var iso: Iso
var dur: Dictionary  # duração de cada animação NESTA rota (3D: do clipe; 2D: quadros / fps)
var dt: float

var x := 0.0
var z := 0.0
var dir := 4
var yaw_deg := 0.0
var mode := "loco"
var vx := 0.0
var vz := 0.0
var frame := 0
var serial := 0  # muda toda vez que uma animação (re)começa; nunca volta a zero
var anim := "idle"
var anim_time := 0.0
var anim_fade := 0.0
var anim_start := 0.0


func _init(p_cfg: Dictionary, p_iso: Iso, p_dur: Dictionary) -> void:
	cfg = p_cfg
	iso = p_iso
	# animação que faltar no arquivo de arte ganha a duração do contrato, para a simulação não travar nela
	dur = {}
	for n in cfg.sprites.defaults.keys():
		var d: Dictionary = cfg.sprites.defaults[n]
		dur[n] = float(p_dur[n]) if (p_dur.has(n) and float(p_dur[n]) > 0.0) else float(d.frames) / float(d.fps)
	dt = float(cfg.step)
	reset({"e": 0.0, "n": 0.0, "dir": "S"})


func reset(start: Dictionary) -> void:
	var p := iso.en_to_world(float(start.e), float(start.n))
	x = p[0]
	z = p[1]
	dir = maxi(0, Iso.DIRS.find(String(start.dir)))
	yaw_deg = iso.dir_yaw_deg(dir)
	mode = "loco"
	vx = 0.0
	vz = 0.0
	frame = 0
	_play("idle", 0.0, 0.0)  # fade 0 = corte seco (reinício)


func _play(nome: String, fade: float, start := 0.0) -> void:
	anim = nome
	anim_time = start
	anim_fade = fade
	anim_start = start
	serial += 1


func _ciclo(a: String) -> bool:
	return a == "walk" or a == "run"


func _loco(k: int, run: bool, fade := -1.0) -> void:
	var m: Dictionary = cfg.movement
	var want := "idle" if k < 0 else ("run" if run else "walk")
	if k >= 0:
		dir = k
		var d := iso.dir_vec(k)
		var sp := float(m.runSpeed) if run else float(m.walkSpeed)
		x += d[0] * sp * dt
		z += d[1] * sp * dt
	if want != anim:
		var start := 0.0
		# entre andar e correr mantém a fase da passada
		if _ciclo(want) and _ciclo(anim) and float(dur[anim]) > 0.0:
			start = fposmod(anim_time / float(dur[anim]), 1.0) * float(dur[want])
		_play(want, fade if fade >= 0.0 else float(cfg.animations[want].fade), start)


## inp: { mx, my (-1..1, y para cima na tela), run (bool), press ("jump" | "crouch" | "sit" | "lie" | "") }
func step(inp: Dictionary) -> void:
	var m: Dictionary = cfg.movement
	var k := -1
	var mx := float(inp.mx)
	var my := float(inp.my)
	var press := String(inp.press)
	var run := bool(inp.run)
	if sqrt(mx * mx + my * my) > float(m.deadzone):
		k = posmod(roundi(atan2(mx, my) / (PI / 4.0)), 8)

	if mode == "jump":
		x += vx * dt
		z += vz * dt
		if anim_time >= float(dur.jump) - 1e-6:
			mode = "loco"
			_loco(k, run)
	elif mode in HOLD:
		if k >= 0 or press == mode or press == "jump":
			mode = "loco"
			_loco(k, run, float(cfg.standUpFade))
		elif press in HOLD:
			mode = press
			_play(press, float(cfg.animations[press].fade))
	elif press == "jump":
		mode = "jump"
		vx = 0.0
		vz = 0.0
		if k >= 0:
			dir = k
			var d := iso.dir_vec(k)
			var sp := float(m.runSpeed) if run else float(m.walkSpeed)
			vx = d[0] * sp
			vz = d[1] * sp
		_play("jump", float(cfg.animations.jump.fade))
	elif press in HOLD:
		mode = press
		_play(press, float(cfg.animations[press].fade))
	else:
		_loco(k, run)

	# limites: fica dentro da área visível em qualquer formato de tela
	var en := iso.world_to_en(x, z)
	var e := clampf(en[0], -float(m.limitE), float(m.limitE))
	var n := clampf(en[1], -float(m.limitN), float(m.limitN))
	var p := iso.en_to_world(e, n)
	x = p[0]
	z = p[1]

	# giro suave (só a rota 3D usa; no 2D a direção troca de uma vez)
	var alvo := iso.dir_yaw_deg(dir)
	var dif := fposmod(fposmod(alvo - yaw_deg, 360.0) + 540.0, 360.0) - 180.0
	var maximo := float(m.turnDegPerSec) * dt
	yaw_deg += clampf(dif, -maximo, maximo)

	anim_time += dt
	frame += 1
