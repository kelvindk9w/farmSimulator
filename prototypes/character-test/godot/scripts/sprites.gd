class_name BenchSprites
extends RefCounted
## Leitura tolerante do sprites.json do pacote 2D (tradução de threejs/src/sprites.js).
## O contrato diz O QUE o arquivo traz, mas não os nomes das chaves: aceitamos alguns sinônimos
## (inglês/português) e, no que faltar, caímos nos valores do contrato (config "sprites").

const DIR_ALIAS := {
	"s": "S", "sul": "S", "south": "S", "frente": "S", "se": "SE", "sudeste": "SE", "southeast": "SE",
	"e": "E", "l": "E", "leste": "E", "east": "E", "perfil": "E", "ne": "NE", "nordeste": "NE", "northeast": "NE",
	"n": "N", "norte": "N", "north": "N", "costas": "N", "sw": "SW", "so": "SW", "sudoeste": "SW",
	"w": "W", "o": "W", "oeste": "W", "west": "W", "nw": "NW", "no": "NW", "noroeste": "NW",
}


static func _norm(s: Variant) -> String:
	var t := String(s).to_lower()
	for par in [["á", "a"], ["à", "a"], ["â", "a"], ["ã", "a"], ["é", "e"], ["ê", "e"], ["í", "i"], ["ó", "o"], ["ô", "o"], ["õ", "o"], ["ú", "u"], ["ç", "c"]]:
		t = t.replace(par[0], par[1])
	var out := ""
	for ch in t:
		if (ch >= "a" and ch <= "z") or (ch >= "0" and ch <= "9"):
			out += ch
	return out


static func _pick(obj: Variant, nomes: Array) -> Variant:
	if not (obj is Dictionary):
		return null
	for n in nomes:
		for k in obj.keys():
			if _norm(k) == _norm(n):
				return obj[k]
	return null


## número, [x, y] ou dicionário -> [x, y] (ou null)
static func _par(v: Variant, nx: Array, ny: Array) -> Variant:
	if v is float or v is int:
		return [float(v), float(v)]
	if v is Array and v.size() >= 2:
		return [float(v[0]), float(v[1])]
	if v is Dictionary:
		var x = _pick(v, nx)
		var y = _pick(v, ny)
		if x != null and y != null:
			return [float(x), float(y)]
	return null


static func normalizar(bruto: Variant, sp: Dictionary, anim_cfg: Dictionary) -> Dictionary:
	var avisos: Array[String] = []
	var cell = _par(_pick(bruto, ["cell", "cellSize", "celula", "tamanhoDaCelula", "tamanhoCelula", "frameSize", "quadro"]), ["width", "largura", "x", "w"], ["height", "altura", "y", "h"])
	if cell == null:
		avisos.append("tamanho da célula")
		cell = [float(sp.cell[0]), float(sp.cell[1])]
	var anchor = _par(_pick(bruto, ["anchor", "ancora", "pontoDeApoio", "apoio", "pivot", "origin", "origem"]), ["x"], ["y"])
	if anchor == null:
		avisos.append("ponto de apoio")
		anchor = [float(sp.anchor[0]), float(sp.anchor[1])]
	var dirs: Array = []
	var d = _pick(bruto, ["directions", "direcoes", "ordemDasDirecoes", "dirs", "rows", "linhas"])
	if d is Array:
		for item in d:
			var nome = _pick(item, ["name", "nome", "id"]) if item is Dictionary else item
			var chave := _norm(nome)
			if DIR_ALIAS.has(chave):
				dirs.append(DIR_ALIAS[chave])
	if dirs.is_empty():
		avisos.append("ordem das direções")
		dirs = sp.directions.duplicate()
	var ppu = _pick(bruto, ["pixelsPerUnit", "pixelsPorUnidade"])
	if ppu == null or float(ppu) <= 0.0:
		ppu = sp.pixelsPerUnit

	var anims = _pick(bruto, ["animations", "animacoes", "anims"])
	if anims is Array:
		var mapa := {}
		for a in anims:
			mapa[String(_pick(a, ["name", "nome", "id"]))] = a
		anims = mapa
	var animacoes := {}
	for nome in anim_cfg.keys():
		var a = _pick(anims, [nome])
		if a == null:
			avisos.append("animação \"%s\"" % nome)
			a = {}
		var padrao: Dictionary = sp.defaults.get(nome, {})
		var arquivo = _pick(a, ["file", "arquivo", "image", "imagem", "src"])
		var quadros = _pick(a, ["frames", "quadros", "frameCount", "numeroDeQuadros", "count"])
		var fps = _pick(a, ["fps", "quadrosPorSegundo", "frameRate", "fpsSugerido"])
		var repete = _pick(a, ["loop", "repete", "repetir", "repeat", "ciclo"])
		animacoes[nome] = {
			"file": String(arquivo) if arquivo != null else "sprites/%s.png" % nome,
			"frames": int(quadros) if quadros != null else 0,  # 0 = deduz da largura da imagem
			"fps": float(fps) if (fps != null and float(fps) > 0.0) else float(padrao.get("fps", 8)),
			"loop": bool(repete) if repete is bool else bool(anim_cfg[nome].loop),
		}
	if not avisos.is_empty():
		push_warning("[bancada] sprites.json sem %s: usando os valores do contrato" % ", ".join(avisos))
	return {"cell": cell, "anchor": anchor, "directions": dirs, "pixelsPerUnit": float(ppu), "animations": animacoes}


## direção de tela (N, NE, ...) -> [linha da folha, nome da direção desenhada, espelhar?]
static func linha_para(meta: Dictionary, dir_nome: String) -> Array:
	var dirs: Array = meta.directions
	var linha := dirs.find(dir_nome)
	if linha >= 0:
		return [linha, dir_nome, false]
	var esp: String = Iso.ESPELHO.get(dir_nome, "")
	linha = dirs.find(esp)
	if linha >= 0:
		return [linha, esp, true]
	return [0, String(dirs[0]), false]


## quadro da animação no instante t (segundos desde que ela começou)
static func quadro_em(a: Dictionary, t: float) -> int:
	var n := int(a.frames)
	var i := int(floor(t * float(a.fps) + 1e-6))
	if bool(a.loop):
		return posmod(i, n)
	return clampi(i, 0, n - 1)
