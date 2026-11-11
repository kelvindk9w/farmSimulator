class_name BenchRunner
extends Node
## Laço da bancada, comum às rotas 3D e 2D: passos fixos de simulação, demonstração, interface,
## números de desempenho e ganchos para as ferramentas de captura (na Web, via JavaScript).
##
## A "vista" (cena 3D ou 2D) fornece: iso, duracoes, rotulo(), quantos_visuais(), nome_visual(i),
## definir_visual(i), passo(sim, dt), desenhar(sim), ajustar_tela(tamanho), estatisticas().

var vista: Node
var cfg: Dictionary
var iso: Iso
var sim: BenchSim
var demo: BenchDemo
var hud: BenchHud

var demo_ligada := false
var passo := false
var passos_demo := 0  # passos dados desde que a demonstração foi ligada (não zera quando o roteiro recomeça)
var visual := 0

var _acc := 0.0
var _primeiro := false
var _t_stats := 0.0


func iniciar(p_vista: Node) -> void:
	vista = p_vista
	cfg = Bench.cfg
	iso = vista.iso
	# a interface usa "pixels lógicos": escala = densidade da tela (no navegador, devicePixelRatio)
	get_tree().root.content_scale_factor = maxf(1.0, DisplayServer.screen_get_scale())

	var camada := CanvasLayer.new()
	camada.layer = 10
	camada.visible = Bench.opts.hud
	add_child(camada)
	hud = BenchHud.new()
	hud.controles = Bench.opts.ui
	hud.rotulo = vista.rotulo()
	hud.texto_modo = "Ver em 3D" if Bench.opts.modo == "2d" else "Ver em 2D"
	camada.add_child(hud)
	hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hud.botao.connect(_ao_botao)

	sim = BenchSim.new(cfg, iso, vista.duracoes)
	demo = BenchDemo.new(cfg)
	demo_ligada = Bench.opts.demo
	passo = Bench.opts.passo
	visual = int(Bench.opts.visual) % vista.quantos_visuais()
	vista.definir_visual(visual)
	hud.visual_nome = vista.nome_visual(visual)
	_reiniciar()
	get_viewport().size_changed.connect(_ao_redimensionar)
	_ao_redimensionar()


func _reiniciar() -> void:
	sim.reset(demo.start if demo_ligada else {"e": 0.0, "n": 0.0, "dir": "S"})
	demo.reset()
	hud.demo_ligada = demo_ligada
	hud.legenda = ("Demonstração · " + demo.label) if demo_ligada else ""
	hud.atualizar()


func _ao_redimensionar() -> void:
	vista.ajustar_tela(get_viewport().get_visible_rect().size)


func _ao_botao(nome: String) -> void:
	match nome:
		"modo":
			Bench.opts.modo = "3d" if Bench.opts.modo == "2d" else "2d"
			Bench.opts.visual = 0
			Bench.opts.demo = demo_ligada
			Bench.js("history.replaceState(null, '', '?modo=%s%s')" % [Bench.opts.modo, "&demo=1" if demo_ligada else ""])
			get_tree().change_scene_to_file.call_deferred(Bench.CENAS[Bench.opts.modo])
		"visual":
			visual = (visual + 1) % vista.quantos_visuais()
			vista.definir_visual(visual)
			hud.visual_nome = vista.nome_visual(visual)
			hud.atualizar()
		"demo":
			demo_ligada = not demo_ligada
			passos_demo = 0
			_reiniciar()


func _um_passo() -> void:
	var inp: Dictionary
	if demo_ligada:
		if demo.ended():
			_reiniciar()
		inp = demo.next()
		var leg := "Demonstração · " + demo.label
		if leg != hud.legenda:
			hud.legenda = leg
			hud.queue_redraw()
		passos_demo += 1
	else:
		inp = hud.amostra()
	sim.step(inp)
	vista.passo(sim, sim.dt)


func _info() -> Dictionary:
	return {
		"frame": passos_demo if demo_ligada else sim.frame, "anim": sim.anim, "animTime": snappedf(sim.anim_time, 0.0001),
		"dir": Iso.DIRS[sim.dir], "x": snappedf(sim.x, 0.0001), "z": snappedf(sim.z, 0.0001), "label": demo.label if demo_ligada else "",
		"visual": visual,
	}


func _process(delta: float) -> void:
	if passo:
		# modo captura: só anda até o passo pedido pela ferramenta (window.__benchAlvo)
		var alvo := 0
		var v = Bench.js("window.__benchAlvo || 0")
		if v != null:
			alvo = int(v)
		var n := 0
		while passos_demo < alvo and n < 4000:
			_um_passo()
			n += 1
	else:
		_acc += minf(delta, 0.1)
		var n := 0
		while _acc >= sim.dt and n < 6:
			_um_passo()
			_acc -= sim.dt
			n += 1
		if n == 6:
			_acc = 0.0
	vista.desenhar(sim)
	if passo or Bench.opts.info:
		Bench.js("window.__benchQuadro = %d; window.__benchInfo = %s;" % [passos_demo, JSON.stringify(_info())])

	_t_stats += delta
	if _t_stats >= 0.5:
		_t_stats = 0.0
		var s: Dictionary = vista.estatisticas()
		s["fps"] = Engine.get_frames_per_second()
		if not passo:  # no modo captura a linha de números fica de fora (muda a cada execução)
			hud.linha = "%d qps · %d chamadas de desenho · %s triângulos" % [s.fps, s.drawCalls, _milhar(int(s.triangles))]
			hud.queue_redraw()
		s["info"] = _info()
		Bench.js("window.__benchStats = %s;" % JSON.stringify(s))

	if not _primeiro:
		_primeiro = true
		await RenderingServer.frame_post_draw
		# primeiro quadro desenhado: avisa a página (medição de tempo de carga)
		Bench.js("window.__benchPrimeiroQuadro = performance.now(); window.__benchVariante = %s; window.__benchTotalDemo = %d; window.__benchPronto = true;" % [JSON.stringify(vista.rotulo()), demo.total])


func _milhar(n: int) -> String:
	var s := str(n)
	var out := ""
	while s.length() > 3:
		out = "." + s.substr(s.length() - 3) + out
		s = s.substr(0, s.length() - 3)
	return s + out
