extends Node2D
## Rota 2D em Godot: as mesmas folhas de sprites + sprites.json viram um SpriteFrames montado
## em tempo de execução; o personagem é um AnimatedSprite2D e as direções viradas para a
## esquerda saem por flip_h. Não carrega o GLB.

const BASE := "res://assets/2d/"

var cfg: Dictionary
var iso: Iso
var duracoes := {}

var meta: Dictionary
var mundo: Node2D  # filhos em unidades de mundo já projetadas; a escala do nó é pixels por unidade
var sombra: Polygon2D
var sprite: AnimatedSprite2D
var quadros_a: SpriteFrames
var quadros_b: SpriteFrames  # variante B (só o andar), montada na primeira troca
var visual := 0
var bytes_textura := 0
var folhas := 0
var runner: BenchRunner


func _ready() -> void:
	cfg = Bench.cfg
	iso = Iso.new(cfg.camera)
	mundo = Node2D.new()
	add_child(mundo)
	_chao()
	_carregar_folhas()
	runner = BenchRunner.new()
	add_child(runner)
	runner.iniciar(self)


func rotulo() -> String:
	return "Godot · 2D"


func quantos_visuais() -> int:
	return 2


func nome_visual(i: int) -> String:
	return "B (só no andar)" if i == 1 else "A"


# ---------- cena ----------
func _tela(x: float, z: float) -> Vector2:
	var p := iso.project(x, 0.0, z)
	return Vector2(p.x, -p.y)  # no 2D do Godot o y cresce para baixo


func _poligonos(quads: Array, cor: Color) -> Polygon2D:
	var pts := PackedVector2Array()
	var polis := []
	for q in quads:
		var b := pts.size()
		for p in q:
			pts.append(_tela(p.x, p.y))
		polis.append(PackedInt32Array([b, b + 1, b + 2, b + 3]))
	var pg := Polygon2D.new()
	pg.polygon = pts
	pg.polygons = polis
	pg.color = cor
	mundo.add_child(pg)
	return pg


func _chao() -> void:
	var g: Dictionary = cfg.ground
	var q := BenchChao.quads(g)
	_poligonos(q.base, Bench.cor(g.color))
	_poligonos(q.linhas, Bench.cor(g.gridColor))
	_poligonos(q.borda, Bench.cor(g.borderColor))
	# sombra de contato: o mesmo disco das outras variantes, achatado pela câmera
	var r := float(cfg.shadow.radius)
	var pts := PackedVector2Array()
	for i in 28:
		var a := TAU * i / 28.0
		pts.append(Vector2(cos(a) * r, sin(a) * r * iso.sin_e))
	sombra = Polygon2D.new()
	sombra.polygon = pts
	sombra.color = Color(0, 0, 0, float(cfg.shadow.opacity))
	mundo.add_child(sombra)


# ---------- folhas de sprites ----------
func _textura(arquivo: String) -> Texture2D:
	var t := load(BASE + arquivo) as Texture2D
	if t == null:
		push_error("Não foi possível carregar " + BASE + arquivo)
		return null
	bytes_textura += t.get_width() * t.get_height() * 4
	folhas += 1
	return t


## acrescenta a um SpriteFrames as animações "<nome>_<direção>" recortadas de uma folha
func _recortar(sf: SpriteFrames, nome: String, a: Dictionary, tex: Texture2D) -> void:
	var cw := float(meta.cell[0])
	var ch := float(meta.cell[1])
	var dirs: Array = meta.directions
	var linhas := int(round(tex.get_height() / ch))
	if linhas != dirs.size():
		push_warning("[bancada] %s: %d linhas, esperava %d" % [a.file, linhas, dirs.size()])
	for r in mini(linhas, dirs.size()):
		var chave := "%s_%s" % [nome, dirs[r]]
		if sf.has_animation(chave):
			sf.clear(chave)
		else:
			sf.add_animation(chave)
		sf.set_animation_speed(chave, float(a.fps))
		sf.set_animation_loop(chave, bool(a.loop))
		for c in int(a.frames):
			var at := AtlasTexture.new()
			at.atlas = tex
			at.region = Rect2(c * cw, r * ch, cw, ch)
			at.filter_clip = true  # não deixa a célula vizinha vazar na filtragem
			sf.add_frame(chave, at)


func _carregar_folhas() -> void:
	var bruto = Bench.load_json(BASE + String(cfg.sprites.json))
	if bruto == null:
		push_warning("[bancada] sprites.json não pôde ser lido")
	meta = BenchSprites.normalizar(bruto, cfg.sprites, cfg.animations)
	quadros_a = SpriteFrames.new()
	if quadros_a.has_animation("default"):
		quadros_a.remove_animation("default")
	for nome in meta.animations.keys():
		var a: Dictionary = meta.animations[nome]
		var tex := _textura(a.file)
		if tex == null:
			a.frames = maxi(1, int(a.frames))
			duracoes[nome] = float(a.frames) / float(a.fps)
			continue
		if int(a.frames) <= 0:
			a.frames = maxi(1, int(round(tex.get_width() / float(meta.cell[0]))))  # sem contagem no JSON: deduz da largura
		_recortar(quadros_a, nome, a, tex)
		duracoes[nome] = float(a.frames) / float(a.fps)

	sprite = AnimatedSprite2D.new()
	sprite.sprite_frames = quadros_a
	sprite.centered = false
	sprite.offset = Vector2(-float(meta.anchor[0]), -float(meta.anchor[1]))  # ponto de apoio na origem do nó
	sprite.scale = Vector2.ONE / float(meta.pixelsPerUnit)
	# as folhas são importadas com alfa pré-multiplicado (ver [importer_defaults] no project.godot):
	# bordas limpas na filtragem e arquivos bem menores do que com "fix alpha border"
	var mat := CanvasItemMaterial.new()
	mat.blend_mode = CanvasItemMaterial.BLEND_MODE_PREMULT_ALPHA
	sprite.material = mat
	mundo.add_child(sprite)


func definir_visual(i: int) -> void:
	visual = i % 2
	if visual == 1 and quadros_b == null:
		var tex := _textura(String(cfg.sprites.variantWalk))
		if tex != null:
			quadros_b = quadros_a.duplicate()
			_recortar(quadros_b, "walk", meta.animations.walk, tex)
	sprite.sprite_frames = quadros_b if (visual == 1 and quadros_b != null) else quadros_a


# ---------- laço ----------
func ajustar_tela(tam: Vector2) -> void:
	var ppu := minf(tam.x, tam.y) / float(cfg.camera.viewUnits)  # o menor lado da tela mostra viewUnits
	mundo.scale = Vector2(ppu, ppu)
	# mesmo enquadramento da câmera 3D (que olha para um ponto um pouco acima do chão)
	mundo.position = tam / 2.0 + Vector2(0.0, float(cfg.camera.lookAtY) * iso.cos_e * ppu)


func passo(_sim: BenchSim, _dt: float) -> void:
	pass  # nada: o quadro sai direto do relógio da simulação


func desenhar(sim: BenchSim) -> void:
	var a: Dictionary = meta.animations[sim.anim]
	var l := BenchSprites.linha_para(meta, Iso.DIRS[sim.dir])
	var chave := "%s_%s" % [sim.anim, l[1]]
	var espelhar: bool = l[2]
	if sprite.sprite_frames.has_animation(chave):
		if sprite.animation != chave:
			sprite.animation = chave
		# o quadro vem do relógio da simulação (e não de play()) para as quatro variantes ficarem em sincronia
		sprite.frame = BenchSprites.quadro_em(a, sim.anim_time)
	sprite.flip_h = espelhar
	# se o ponto de apoio não estiver no meio da célula, o espelhamento precisa compensar
	var ax := float(meta.anchor[0])
	sprite.offset.x = -(float(meta.cell[0]) - ax) if espelhar else -ax
	var p := _tela(sim.x, sim.z)
	sprite.position = p
	sombra.position = p


func estatisticas() -> Dictionary:
	var rs := RenderingServer
	var vp := get_viewport().get_viewport_rid()
	var s := {
		"drawCalls": rs.get_rendering_info(rs.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME),
		"triangles": rs.get_rendering_info(rs.RENDERING_INFO_TOTAL_PRIMITIVES_IN_FRAME),
		"objects": rs.get_rendering_info(rs.RENDERING_INFO_TOTAL_OBJECTS_IN_FRAME),
		"textureMem": rs.get_rendering_info(rs.RENDERING_INFO_TEXTURE_MEM_USED),
		"bufferMem": rs.get_rendering_info(rs.RENDERING_INFO_BUFFER_MEM_USED),
		"videoMem": rs.get_rendering_info(rs.RENDERING_INFO_VIDEO_MEM_USED),
		"textureBytes": bytes_textura, "sheets": folhas,
	}
	# desenho 2D: contado à parte pelo motor
	s["canvasDrawCalls"] = rs.viewport_get_render_info(vp, rs.VIEWPORT_RENDER_INFO_TYPE_CANVAS, rs.VIEWPORT_RENDER_INFO_DRAW_CALLS_IN_FRAME)
	s["canvasPrimitives"] = rs.viewport_get_render_info(vp, rs.VIEWPORT_RENDER_INFO_TYPE_CANVAS, rs.VIEWPORT_RENDER_INFO_PRIMITIVES_IN_FRAME)
	return s
