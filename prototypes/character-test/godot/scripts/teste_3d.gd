extends Node3D
## Rota 3D em Godot: o mesmo personagem.glb, AnimationPlayer com mistura entre clipes
## e troca de cabelo/barba em BoneAttachment3D. Os clipes são achados PELO NOME e nenhum
## nome de osso é fixo, a não ser o da cabeça (configurável ou detectado).

const BASE := "res://assets/3d/"
const SHADER_COR := preload("res://shaders/cor_por_vertice.gdshader")
const VISUAIS := [["A", false], ["B", false], ["C", false], ["A", true], ["B", true], ["C", true]]

var cfg: Dictionary
var iso: Iso
var duracoes := {}

var camera: Camera3D
var suporte: Node3D
var sombra: MeshInstance3D
var personagem: Node3D
var player: AnimationPlayer
var esqueleto: Skeleton3D
var clipes := {}  # nome do contrato -> nome real no AnimationPlayer
var faltando: Array[String] = []
var osso_cabeca := -1
var cabelo_original: Array[Node3D] = []
var barba_original: Array[Node3D] = []
var pecas := {}  # arquivo -> Node3D preso à cabeça
var serial := -1
var materiais_trocados := 0
var runner: BenchRunner


func _ready() -> void:
	cfg = Bench.cfg
	iso = Iso.new(cfg.camera)
	_ambiente()
	_chao()
	_carregar_personagem()
	runner = BenchRunner.new()
	add_child(runner)
	runner.iniciar(self)


func rotulo() -> String:
	return "Godot · 3D"


func quantos_visuais() -> int:
	return VISUAIS.size()


func nome_visual(i: int) -> String:
	return "cabelo %s%s" % [VISUAIS[i][0], " + barba" if VISUAIS[i][1] else ""]


# ---------- cena ----------
func _ambiente() -> void:
	var l: Dictionary = cfg.light
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Bench.cor(cfg.ground.background)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Bench.cor(l.ambientColor)
	env.ambient_light_energy = float(l.ambientIntensity) / PI  # config na convenção do Three.js
	env.tonemap_mode = Environment.TONE_MAPPER_LINEAR
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)

	var sol := DirectionalLight3D.new()
	sol.light_color = Bench.cor(l.sunColor)
	sol.light_energy = float(l.sunIntensity) / PI
	sol.light_specular = 0.0
	sol.shadow_enabled = false
	add_child(sol)
	var el := deg_to_rad(float(l.sunElDeg))
	var az := deg_to_rad(float(l.sunAzDeg))
	sol.look_at_from_position(Vector3(cos(el) * sin(az), sin(el), cos(el) * cos(az)) * 20.0, Vector3.ZERO, Vector3.UP)

	camera = Camera3D.new()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.near = 0.1
	camera.far = 100.0
	add_child(camera)
	var alvo := Vector3(0.0, float(cfg.camera.lookAtY), 0.0)
	camera.look_at_from_position(alvo + iso.cam_dir() * 30.0, alvo, Vector3.UP)
	camera.make_current()


func _plano(quads: Array, y: float, cor: Color) -> MeshInstance3D:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for q in quads:
		for i in [0, 1, 2, 0, 2, 3]:
			st.add_vertex(Vector3(q[i].x, y, q[i].y))
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED  # fica exatamente na cor configurada
	mat.albedo_color = cor
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	if cor.a < 1.0:
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	var mi := MeshInstance3D.new()
	mi.mesh = st.commit()
	mi.material_override = mat
	add_child(mi)
	return mi


func _chao() -> void:
	var g: Dictionary = cfg.ground
	var q := BenchChao.quads(g)
	_plano(q.base, 0.0, Bench.cor(g.color))
	_plano(q.linhas, 0.002, Bench.cor(g.gridColor))
	_plano(q.borda, 0.003, Bench.cor(g.borderColor))
	# sombra de contato simples (um disco escuro), igual nas quatro variantes
	var r := float(cfg.shadow.radius)
	var disco := []
	for i in 28:
		var a0 := TAU * i / 28.0
		var a1 := TAU * (i + 1) / 28.0
		disco.append([Vector2.ZERO, Vector2(cos(a0), sin(a0)) * r, Vector2(cos(a1), sin(a1)) * r, Vector2(cos(a1), sin(a1)) * r])
	sombra = _plano(disco, 0.0, Color(0, 0, 0, float(cfg.shadow.opacity)))


# ---------- personagem ----------
static func _norm(s: Variant) -> String:
	return BenchSprites._norm(s)


func _carregar_personagem() -> void:
	suporte = Node3D.new()
	add_child(suporte)
	var cena := load(BASE + String(cfg.model.file)) as PackedScene
	if cena == null:
		push_error("Não foi possível carregar " + BASE + String(cfg.model.file))
		return
	personagem = cena.instantiate()
	suporte.add_child(personagem)
	var ps := personagem.find_children("*", "AnimationPlayer", true, false)
	var es := personagem.find_children("*", "Skeleton3D", true, false)
	if ps.is_empty() or es.is_empty():
		push_error("O GLB precisa ter um esqueleto e animações.")
		return
	player = ps[0]
	esqueleto = es[0]

	# clipes pelo nome; o modo de repetição vem do contrato, não do arquivo
	for nome in cfg.animations.keys():
		var real := _achar_clipe(nome)
		if real == "":
			faltando.append(nome)
			continue
		clipes[nome] = real
		var a := player.get_animation(real)
		a.loop_mode = Animation.LOOP_LINEAR if cfg.animations[nome].loop else Animation.LOOP_NONE
		duracoes[nome] = a.length
	if not faltando.is_empty():
		push_warning("[bancada] clipes não encontrados no GLB: %s | existentes: %s" % [", ".join(faltando), ", ".join(player.get_animation_list())])
	# o tempo das animações é comandado pela simulação (passos fixos), não pelo relógio do motor
	player.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	player.deterministic = true  # ossos sem trilha num clipe voltam à pose de repouso em vez de ficarem "presos"

	osso_cabeca = _achar_cabeca()
	_usar_cores_de_vertice(personagem)
	for n in personagem.find_children("*", "MeshInstance3D", true, false):
		var nomes := [_norm(n.name), _norm(n.get_parent().name)]
		var pedido_barba := String(cfg.model.beardMesh)
		var pedido_cabelo := String(cfg.model.hairMesh)
		if (pedido_barba != "auto" and _norm(pedido_barba) in nomes) or (pedido_barba == "auto" and (nomes[0].contains("beard") or nomes[0].contains("barba"))):
			barba_original.append(n)
		elif (pedido_cabelo != "auto" and _norm(pedido_cabelo) in nomes) or (pedido_cabelo == "auto" and (nomes[0].contains("hair") or nomes[0].contains("cabelo"))):
			cabelo_original.append(n)
	if cabelo_original.is_empty() and String(cfg.model.hairMesh) == "auto":
		# sem nome reconhecível: malhas sem skinning presas ao osso da cabeça
		for att in personagem.find_children("*", "BoneAttachment3D", true, false):
			if att.bone_idx == osso_cabeca:
				for n in att.find_children("*", "MeshInstance3D", true, false):
					if not (n in barba_original):
						cabelo_original.append(n)


func _chave(a: String) -> String:
	var s := a.get_slice("/", a.get_slice_count("/") - 1)
	return _norm(s.get_slice("|", s.get_slice_count("|") - 1))


func _achar_clipe(nome: String) -> String:
	var lista := player.get_animation_list()
	if nome in lista:
		return nome
	for a in lista:
		if _chave(a) == nome.to_lower():
			return a
	for a in lista:
		var k := _chave(a)
		if k.ends_with(nome.to_lower()):
			return a
	return ""


func _achar_cabeca() -> int:
	var pedido := String(cfg.model.headBone)
	if pedido != "auto":
		for i in esqueleto.get_bone_count():
			if esqueleto.get_bone_name(i) == pedido or _norm(esqueleto.get_bone_name(i)) == _norm(pedido):
				return i
		push_warning("[bancada] osso da cabeça \"%s\" não encontrado; tentando detectar" % pedido)
	var cands: Array[int] = []
	for i in esqueleto.get_bone_count():
		var n := _norm(esqueleto.get_bone_name(i))
		if n == "head" or n == "cabeca":
			return i
		if n.contains("head") or n.contains("cabeca"):
			cands.append(i)
	var melhor := -1
	for passada in 2:
		for i in cands:
			var n := _norm(esqueleto.get_bone_name(i))
			var ponta := n.contains("end") or n.contains("top") or n.contains("tip") or n.contains("nub")
			if passada == 0 and ponta:
				continue
			if melhor < 0 or n.length() < _norm(esqueleto.get_bone_name(melhor)).length():
				melhor = i
		if melhor >= 0:
			return melhor
	# último recurso: o osso mais alto
	var y := -INF
	for i in esqueleto.get_bone_count():
		var o := esqueleto.get_bone_global_rest(i).origin
		if o.y > y:
			y = o.y
			melhor = i
	push_warning("[bancada] nenhum osso com \"head\" no nome; usando o mais alto: %s" % esqueleto.get_bone_name(melhor))
	return melhor


## Modelos coloridos só por vértice (COLOR_0 do glTF): o importador do Godot (4.7.2) traz as cores
## na malha, mas o material importado não as usa (o modelo aparece branco) e, no renderizador
## Compatibility, elas seriam lidas como sRGB (o modelo aparece escuro). Troca o material dessas
## superfícies por um shader pequeno que resolve as duas coisas. Materiais com textura não mudam.
func _usar_cores_de_vertice(raiz: Node) -> void:
	var malhas := raiz.find_children("*", "MeshInstance3D", true, false)
	if raiz is MeshInstance3D:
		malhas.append(raiz)
	for mi in malhas:
		var malha := mi.mesh as ArrayMesh
		if malha == null:
			continue
		for s in malha.get_surface_count():
			var mat := mi.get_active_material(s) as BaseMaterial3D
			if mat == null or mat.albedo_texture != null:
				continue
			if malha.surface_get_format(s) & Mesh.ARRAY_FORMAT_COLOR:
				var sm := ShaderMaterial.new()
				sm.shader = SHADER_COR
				sm.set_shader_parameter("albedo", mat.albedo_color)
				sm.set_shader_parameter("roughness", mat.roughness)
				sm.set_shader_parameter("metallic", mat.metallic)
				sm.set_shader_parameter("specular", mat.metallic_specular)
				mi.set_surface_override_material(s, sm)
				materiais_trocados += 1


## matriz que leva do espaço do modelo (pose de ligação) para o espaço local do osso da cabeça
func _inversa_cabeca() -> Transform3D:
	for mi in personagem.find_children("*", "MeshInstance3D", true, false):
		var sk: Skin = mi.skin
		if sk == null:
			continue
		for i in sk.get_bind_count():
			var nome := String(sk.get_bind_name(i))
			var osso := esqueleto.find_bone(nome) if nome != "" else sk.get_bind_bone(i)
			if osso == osso_cabeca:
				return sk.get_bind_pose(i)
	return esqueleto.get_bone_global_rest(osso_cabeca).affine_inverse()


func _centro(raiz: Node3D) -> Vector3:
	var caixa := AABB()
	var primeiro := true
	var malhas := raiz.find_children("*", "MeshInstance3D", true, false)
	if raiz is MeshInstance3D:
		malhas.append(raiz)
	for mi in malhas:
		var xf := Transform3D.IDENTITY
		var n: Node = mi
		while n != null and n != raiz.get_parent():
			if n is Node3D:
				xf = n.transform * xf
			n = n.get_parent()
		var a: AABB = xf * mi.get_aabb()
		caixa = a if primeiro else caixa.merge(a)
		primeiro = false
	return caixa.get_center()


func _peca(arquivo: String) -> Node3D:
	if pecas.has(arquivo):
		return pecas[arquivo]
	var cena := load(BASE + arquivo) as PackedScene
	if cena == null or osso_cabeca < 0:
		push_warning("[bancada] peça não carregada: " + arquivo)
		return null
	var peca: Node3D = cena.instantiate()
	_usar_cores_de_vertice(peca)
	var att := BoneAttachment3D.new()
	att.name = "Peca_" + arquivo.get_basename().replace("-", "_")
	esqueleto.add_child(att)
	att.bone_idx = osso_cabeca
	var apoio := Node3D.new()
	att.add_child(apoio)
	apoio.add_child(peca)
	var inv := _inversa_cabeca()
	var espaco := String(cfg.model.pieceSpace)
	if espaco == "auto":
		# peça exportada na altura da cabeça do modelo em pé ("model") ou já relativa ao osso ("bone")?
		var c := _centro(peca)
		espaco = "model" if c.distance_to(inv.affine_inverse().origin) < c.length() else "bone"
	if espaco == "model":
		apoio.transform = inv
	apoio.visible = false
	pecas[arquivo] = apoio
	return apoio


## cabelo: "A" (o que vem no GLB), "B" ou "C" (arquivos avulsos); barba: liga/desliga
func definir_visual(i: int) -> void:
	if personagem == null:
		return
	var cab: String = VISUAIS[i][0]
	var barba: bool = VISUAIS[i][1]
	var peca_cabelo: Node3D = null if cab == "A" else _peca(String(cfg.model.hairs[cab]))
	var peca_barba: Node3D = _peca(String(cfg.model.beard)) if (barba and barba_original.is_empty()) else null
	for m in cabelo_original:
		m.visible = cab == "A"
	for m in barba_original:
		m.visible = barba
	for k in pecas:
		pecas[k].visible = pecas[k] == peca_cabelo or pecas[k] == peca_barba


# ---------- laço ----------
func ajustar_tela(tam: Vector2) -> void:
	# o menor lado da tela mostra viewUnits
	camera.keep_aspect = Camera3D.KEEP_HEIGHT if tam.x >= tam.y else Camera3D.KEEP_WIDTH
	camera.size = float(cfg.camera.viewUnits)


func passo(sim: BenchSim, dt: float) -> void:
	if player == null:
		return
	if sim.serial != serial:
		serial = sim.serial
		if clipes.has(sim.anim):
			if sim.anim_fade <= 0.0:
				player.stop()  # corte seco (reinício)
			player.play(clipes[sim.anim], sim.anim_fade)
			if sim.anim_start > 0.0:
				player.seek(sim.anim_start, false)  # mantém a fase da passada entre andar e correr
			player.advance(0.0)  # o Godot não avança o tempo no quadro em que a animação começa
	player.advance(dt)


func desenhar(sim: BenchSim) -> void:
	suporte.position = Vector3(sim.x, 0.0, sim.z)
	suporte.rotation.y = deg_to_rad(sim.yaw_deg)
	sombra.position = Vector3(sim.x, 0.006, sim.z)


func estatisticas() -> Dictionary:
	var rs := RenderingServer
	return {
		"drawCalls": rs.get_rendering_info(rs.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME),
		"triangles": rs.get_rendering_info(rs.RENDERING_INFO_TOTAL_PRIMITIVES_IN_FRAME),
		"objects": rs.get_rendering_info(rs.RENDERING_INFO_TOTAL_OBJECTS_IN_FRAME),
		"textureMem": rs.get_rendering_info(rs.RENDERING_INFO_TEXTURE_MEM_USED),
		"bufferMem": rs.get_rendering_info(rs.RENDERING_INFO_BUFFER_MEM_USED),
		"videoMem": rs.get_rendering_info(rs.RENDERING_INFO_VIDEO_MEM_USED),
		"clipes": clipes.values(), "faltando": faltando,
		"ossoCabeca": esqueleto.get_bone_name(osso_cabeca) if esqueleto != null and osso_cabeca >= 0 else "",
		"ossos": esqueleto.get_bone_count() if esqueleto != null else 0,
		"materiaisCorPorVertice": materiais_trocados,
	}
