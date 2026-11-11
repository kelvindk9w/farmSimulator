class_name BenchChao
extends RefCounted
## Chão simples: quadrado liso com grade clara e borda, descrito como quadriláteros no plano do mundo.
## Tradução de threejs/src/ground.js. Cada quadrilátero é um Array de 4 Vector2 (x, z).


static func quads(g: Dictionary) -> Dictionary:
	var h := float(g.size) / 2.0
	var w := float(g.lineWidth) / 2.0
	var b := float(g.borderWidth)
	var passo := float(g.gridStep)
	var base := [[Vector2(-h, -h), Vector2(h, -h), Vector2(h, h), Vector2(-h, h)]]
	var linhas := []
	var i := -h + passo
	while i < h - 1e-6:
		linhas.append([Vector2(i - w, -h), Vector2(i + w, -h), Vector2(i + w, h), Vector2(i - w, h)])
		linhas.append([Vector2(-h, i - w), Vector2(h, i - w), Vector2(h, i + w), Vector2(-h, i + w)])
		i += passo
	var borda := [
		[Vector2(-h, -h), Vector2(h, -h), Vector2(h, -h + b), Vector2(-h, -h + b)],
		[Vector2(-h, h - b), Vector2(h, h - b), Vector2(h, h), Vector2(-h, h)],
		[Vector2(-h, -h), Vector2(-h + b, -h), Vector2(-h + b, h), Vector2(-h, h)],
		[Vector2(h - b, -h), Vector2(h, -h), Vector2(h, h), Vector2(h - b, h)],
	]
	return {"base": base, "linhas": linhas, "borda": borda}
