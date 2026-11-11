extends Node
## Autoload "Bench": configuração compartilhada (config/bench.json), opções da execução
## e a ponte com o navegador (quando exportado para a Web).
##
## Opções — na Web pela URL (?modo=2d&demo=1), no computador depois de "--"
## (godot --path godot -- --modo=2d --demo):
##   modo=3d|2d   demo=1 (roteiro fixo)   visual=N (visual inicial)   ui=0 (sem controles)
##   hud=0 (sem nada por cima)   passo=1 (a ferramenta de captura comanda o tempo)
##   info=1 (publica o estado da simulação a cada quadro em window.__benchInfo; usado pelos testes)

const CENAS := {"3d": "res://cenas/teste_3d.tscn", "2d": "res://cenas/teste_2d.tscn"}

var cfg: Dictionary = {}
var opts := {"modo": "3d", "demo": false, "passo": false, "ui": true, "hud": true, "visual": 0, "info": false}
var is_web := OS.has_feature("web")


func _enter_tree() -> void:
	var c = load_json("res://config/bench.json")
	if c is Dictionary:
		cfg = c
	else:
		push_error("config/bench.json não encontrado. Rode 'node tools/sync.mjs' na pasta prototypes/character-test.")
	_ler_opcoes()


func load_json(caminho: String) -> Variant:
	if not FileAccess.file_exists(caminho):
		return null
	return JSON.parse_string(FileAccess.get_file_as_string(caminho))


func js(codigo: String) -> Variant:
	if not is_web:
		return null
	return JavaScriptBridge.eval(codigo, true)


func cor(hex: String) -> Color:
	return Color.html(hex)


func _ler_opcoes() -> void:
	var pares := {}
	if is_web:
		var q = js("window.location.search")
		if q is String:
			for parte in q.trim_prefix("?").split("&", false):
				var kv: PackedStringArray = parte.split("=")
				pares[kv[0]] = kv[1].uri_decode() if kv.size() > 1 else "1"
	for a in OS.get_cmdline_user_args():
		var kv: PackedStringArray = a.trim_prefix("--").split("=")
		pares[kv[0]] = kv[1] if kv.size() > 1 else "1"
	if String(pares.get("modo", "3d")).to_lower() == "2d":
		opts.modo = "2d"
	opts.demo = pares.has("demo") and pares["demo"] != "0"
	opts.passo = pares.get("passo", "0") == "1"
	opts.ui = pares.get("ui", "1") != "0"
	opts.hud = pares.get("hud", "1") != "0"
	opts.visual = maxi(0, int(pares.get("visual", "0")))
	opts.info = pares.get("info", "0") == "1"
