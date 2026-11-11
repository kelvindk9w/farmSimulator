shader_type spatial;
// Material para modelos coloridos só por vértice (COLOR_0 do glTF, que vem em espaço linear).
// No renderizador Compatibility o albedo é esperado em sRGB e convertido para linear pelo próprio
// motor; sem a conversão abaixo as cores por vértice saem escuras e saturadas demais.
// Difuso de Lambert, como no glTF/Three.js, para as quatro variantes da bancada ficarem parecidas.
render_mode diffuse_lambert;

uniform vec4 albedo : source_color = vec4(1.0);
uniform float roughness : hint_range(0.0, 1.0) = 1.0;
uniform float metallic : hint_range(0.0, 1.0) = 0.0;
uniform float specular : hint_range(0.0, 1.0) = 0.5;

void fragment() {
	vec3 c = COLOR.rgb;
	if (OUTPUT_IS_SRGB) {
		c = mix(pow(c, vec3(1.0 / 2.4)) * 1.055 - vec3(0.055), c * 12.92, lessThan(c, vec3(0.0031308)));
	}
	ALBEDO = albedo.rgb * c;
	ROUGHNESS = roughness;
	METALLIC = metallic;
	SPECULAR = specular;
}
