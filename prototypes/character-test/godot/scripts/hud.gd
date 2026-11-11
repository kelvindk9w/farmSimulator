class_name BenchHud
extends Control
## Interface da bancada, desenhada à mão: rótulo da variante, botões e controles de toque
## (alavanca + ações). Cada dedo é tratado separadamente, então dá para segurar a alavanca
## e apertar um botão ao mesmo tempo. O mouse funciona como um dedo (emulate_touch_from_mouse).

signal botao(nome: String)  # "modo" | "visual" | "demo"

const ESCURO := Color("1f2a30")
const CLARO := Color(1, 1, 1, 0.9)
const VERDE := Color("2f6f3e")
const ACOES := [["run", "Correr"], ["lie", "Deitar"], ["sit", "Sentar"], ["crouch", "Agachar"], ["jump", "Pular"]]
const ESTREITA := 480.0  # largura (px lógicos) abaixo da qual os botões de ação ficam em duas colunas
const MEDIA := 600.0  # abaixo disso o rótulo desce para baixo da fileira de botões
const AJUDA := "WASD ou setas: andar · Shift: correr · Espaço: pular · C: agachar · X: sentar · Z: deitar"

var rotulo := ""
var legenda := ""
var linha := ""
var visual_nome := ""
var texto_modo := "Ver em 2D"
var controles := true
var demo_ligada := false
var correr_ligado := false
var manche := Vector2.ZERO  # x para a direita, y para CIMA
var fila: Array[String] = []  # ações apertadas, uma por passo da simulação

var _fonte: Font
var _ret := {}  # id -> Rect2 dos botões
var _centro := Vector2.ZERO
var _raio := 66.0
var _dedo_manche := -1
var _toque := false  # tela de toque: esconde a linha de ajuda do teclado


func _ready() -> void:
	_fonte = ThemeDB.fallback_font
	if Bench.is_web:
		var r = Bench.js("window.matchMedia('(pointer: coarse)').matches ? 1 : 0")
		_toque = r != null and float(r) > 0.5
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	resized.connect(_layout)
	_layout()


func atualizar() -> void:
	_layout()
	queue_redraw()


func _largura(t: String, tam: int) -> float:
	return _fonte.get_string_size(t, HORIZONTAL_ALIGNMENT_LEFT, -1, tam).x


func _layout() -> void:
	_ret.clear()
	if not controles:
		return
	# canto superior direito: modo, visual, demonstração
	var x := size.x - 10.0
	for par in [["demo", "Demonstração"], ["visual", "Trocar visual"], ["modo", texto_modo]]:
		var w := _largura(par[1], 14) + 28.0
		x -= w
		_ret[par[0]] = Rect2(x, 10, w, 40)
		x -= 6.0
	# canto inferior direito: ações (em tela estreita, duas colunas para não encostar na alavanca)
	var bw := 84.0
	var bh := 48.0
	var g := 8.0
	var y0 := size.y - 18.0 - (bh * 3 + g * 2)
	if size.x < ESTREITA:
		var x0 := size.x - 14.0 - (bw * 2 + g)
		_ret["run"] = Rect2(x0, y0, bw * 2 + g, bh)
		_ret["lie"] = Rect2(x0, y0 + bh + g, bw, bh)
		_ret["sit"] = Rect2(x0 + bw + g, y0 + bh + g, bw, bh)
		_ret["crouch"] = Rect2(x0, y0 + (bh + g) * 2, bw, bh)
		_ret["jump"] = Rect2(x0 + bw + g, y0 + (bh + g) * 2, bw, bh)
	else:
		var x0 := size.x - 14.0 - (bw * 3 + g * 2)
		_ret["run"] = Rect2(x0, y0, bw * 3 + g * 2, bh)
		_ret["lie"] = Rect2(x0, y0 + bh + g, bw, bh)
		_ret["sit"] = Rect2(x0 + bw + g, y0 + bh + g, bw, bh)
		_ret["crouch"] = Rect2(x0, y0 + (bh + g) * 2, bw, bh)
		_ret["jump"] = Rect2(x0 + (bw + g) * 2, y0 + bh + g, bw, bh * 2 + g)
	_centro = Vector2(18.0 + _raio, size.y - 18.0 - _raio)
	if Bench.is_web and Bench.opts.info:
		# para o teste automático saber onde tocar (px lógicos = px de CSS)
		var pos := {"manche": [_centro.x, _centro.y, _raio]}
		for id in _ret:
			pos[id] = [_ret[id].position.x, _ret[id].position.y, _ret[id].size.x, _ret[id].size.y]
		Bench.js("window.__benchBotoes = %s;" % JSON.stringify(pos))


func _caixa(r: Rect2, fundo: Color, borda := 0.0, raio := 12.0) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = fundo
	sb.set_corner_radius_all(int(raio))
	if borda > 0.0:
		sb.set_border_width_all(int(borda))
		sb.border_color = ESCURO
	sb.anti_aliasing = true
	draw_style_box(sb, r)


func _texto(r: Rect2, t: String, tam: int, cor: Color, alinhar := HORIZONTAL_ALIGNMENT_CENTER) -> void:
	var y := r.position.y + r.size.y / 2.0 + (_fonte.get_ascent(tam) - _fonte.get_descent(tam)) / 2.0
	draw_string(_fonte, Vector2(r.position.x, y), t, alinhar, r.size.x, tam, cor)


func _pilula(pos: Vector2, t: String, tam: int, fundo: Color, cor: Color, alt: float, direita := false) -> float:
	var w := _largura(t, tam) + alt * 0.75
	var r := Rect2(pos.x - (w if direita else 0.0), pos.y, w, alt)
	_caixa(r, fundo, 0.0, alt / 2.0)
	_texto(r, t, tam, cor)
	return alt + 4.0


func _draw() -> void:
	# canto superior esquerdo: variante, legenda da demonstração, números, ajuda
	# (em tela estreita começa abaixo da fileira de botões)
	var y := 56.0 if (controles and size.x < MEDIA) else 10.0
	y += _pilula(Vector2(10, y), rotulo, 16, ESCURO, Color.WHITE, 32.0)
	if legenda != "":
		y += _pilula(Vector2(10, y), legenda, 13, VERDE, Color.WHITE, 24.0)
	if linha != "":
		y += _pilula(Vector2(10, y), linha, 12, Color(1, 1, 1, 0.78), ESCURO, 20.0)
	if not controles:
		return
	if not _toque:
		# quebra a ajuda em linhas que caibam em 60% da largura
		var atual := ""
		for parte in AJUDA.split(" · "):
			var tentativa: String = parte if atual == "" else atual + " · " + parte
			if atual != "" and _largura(tentativa, 12) + 15.0 > size.x * 0.6:
				y += _pilula(Vector2(10, y), atual, 12, Color(1, 1, 1, 0.78), ESCURO, 20.0) - 2.0
				atual = parte
			else:
				atual = tentativa
		if atual != "":
			_pilula(Vector2(10, y), atual, 12, Color(1, 1, 1, 0.78), ESCURO, 20.0)
	if visual_nome != "":
		_pilula(Vector2(size.x - 10.0, 62.0 if size.x < MEDIA else 56.0), "Visual: " + visual_nome, 12, Color(1, 1, 1, 0.78), ESCURO, 20.0, true)
	var nomes := {"modo": texto_modo, "visual": "Trocar visual", "demo": "Demonstração"}
	for a in ACOES:
		nomes[a[0]] = a[1]
	for id in _ret:
		var ligado: bool = (id == "demo" and demo_ligada) or (id == "run" and correr_ligado)
		_caixa(_ret[id], ESCURO if ligado else CLARO, 2.0)
		_texto(_ret[id], nomes[id], 14, Color.WHITE if ligado else ESCURO)
	# alavanca
	draw_circle(_centro, _raio, Color(1, 1, 1, 0.55))
	draw_arc(_centro, _raio, 0.0, TAU, 48, Color(ESCURO, 0.7), 2.0, true)
	draw_circle(_centro + Vector2(manche.x, -manche.y) * _raio * 0.55, 28.0, Color(ESCURO, 0.85))


func _input(event: InputEvent) -> void:
	if not controles:
		return
	if event is InputEventScreenTouch:
		var p: Vector2 = make_input_local(event).position
		if event.pressed:
			if p.distance_to(_centro) <= _raio * 1.25 and _dedo_manche < 0:
				_dedo_manche = event.index
				_mover_manche(p)
				get_viewport().set_input_as_handled()
				return
			for id in _ret:
				if _ret[id].has_point(p):
					get_viewport().set_input_as_handled()
					_apertar(id)
					return
		elif event.index == _dedo_manche:
			_dedo_manche = -1
			manche = Vector2.ZERO
			queue_redraw()
	elif event is InputEventScreenDrag and event.index == _dedo_manche:
		_mover_manche(make_input_local(event).position)


func _mover_manche(p: Vector2) -> void:
	var v := (p - _centro) / _raio
	if v.length() > 1.0:
		v = v.normalized()
	manche = Vector2(v.x, -v.y)
	queue_redraw()


func _apertar(id: String) -> void:
	if id == "run":
		correr_ligado = not correr_ligado
		queue_redraw()
	elif id in ["modo", "visual", "demo"]:
		botao.emit(id)
	else:
		fila.append(id)


func _unhandled_key_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		match event.physical_keycode:
			KEY_SPACE:
				fila.append("jump")
			KEY_C:
				fila.append("crouch")
			KEY_X:
				fila.append("sit")
			KEY_Z:
				fila.append("lie")


## entrada de um passo da simulação: teclado primeiro, depois a alavanca
func amostra() -> Dictionary:
	var mx := float(Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT)) - float(Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT))
	var my := float(Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP)) - float(Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN))
	if mx == 0.0 and my == 0.0:
		mx = manche.x
		my = manche.y
	var press := ""
	if not fila.is_empty():
		press = fila.pop_front()
	return {"mx": mx, "my": my, "run": Input.is_physical_key_pressed(KEY_SHIFT) or correr_ligado, "press": press}
