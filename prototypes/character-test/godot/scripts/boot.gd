extends Node
## Cena inicial: só escolhe a rota (3D ou 2D) conforme as opções.


func _ready() -> void:
	get_tree().change_scene_to_file.call_deferred(Bench.CENAS[Bench.opts.modo])
