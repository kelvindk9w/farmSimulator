class_name BenchDemo
extends RefCounted
## Roteiro fixo da demonstração (config "demo"): devolve a entrada de cada passo.

var steps: Array
var start: Dictionary
var total := 0
var i := 0
var f := 0
var label := ""


func _init(cfg: Dictionary) -> void:
	steps = cfg.demo.steps
	start = cfg.demo.start
	for p in steps:
		total += int(p.frames)
	reset()


func reset() -> void:
	i = 0
	f = 0
	label = String(steps[0].get("label", ""))


## verdadeiro quando o roteiro acabou (quem chama reinicia a simulação)
func ended() -> bool:
	return i >= steps.size()


func next() -> Dictionary:
	var p: Dictionary = steps[i]
	var inp := {"mx": 0.0, "my": 0.0, "run": bool(p.get("run", false)), "press": String(p.get("press", "")) if f == 0 else ""}
	if p.has("move"):
		var a := Iso.DIRS.find(String(p.move)) * PI / 4.0
		inp.mx = sin(a)
		inp.my = cos(a)
	label = String(p.get("label", ""))
	f += 1
	if f >= int(p.frames):
		f = 0
		i += 1
	return inp
