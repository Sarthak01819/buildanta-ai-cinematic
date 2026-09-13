"""Physical-scale finishes for the hero's imported furniture and small props."""
import bpy
from materials import math, mix_rgb, plain_material


def input_value(nt, socket):
    return socket.links[0].from_socket if socket.is_linked else socket.default_value


def grain(material, scale=220, distance=0.0002, strength=0.12, roughness=0.035):
    """Add quiet mould/brush detail in metre-based UVs, including imported glTF parts."""
    nt = material.node_tree; b = nt.nodes.get("Principled BSDF")
    if b is None or nt.nodes.get("Surface grain"):
        return
    uv = nt.nodes.new("ShaderNodeUVMap"); uv.uv_map = "BoxUV"
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.name = "Surface grain"
    noise.inputs["Scale"].default_value = scale; noise.inputs["Detail"].default_value = 2
    nt.links.new(uv.outputs[0], noise.inputs["Vector"])
    original = input_value(nt, b.inputs["Roughness"])
    variation = math(nt, "MULTIPLY_ADD", noise.outputs["Fac"], roughness * 2, -roughness)
    rough = math(nt, "ADD", original, variation)
    rough = math(nt, "MINIMUM", math(nt, "MAXIMUM", rough, 0.08), 0.95)
    nt.links.new(rough, b.inputs["Roughness"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Distance"].default_value = distance; bump.inputs["Strength"].default_value = strength
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    if b.inputs["Normal"].is_linked:
        nt.links.new(b.inputs["Normal"].links[0].from_socket, bump.inputs["Normal"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])


def set_color(material, color):
    nt = material.node_tree; b = nt.nodes.get("Principled BSDF")
    if b is None:
        return
    for link in list(b.inputs["Base Color"].links):
        nt.links.remove(link)
    b.inputs["Base Color"].default_value = (*color, 1)


def directional_noise(nt, stretch, name):
    """Use metric, object-attached UVs so fine finishes stay fixed during motion."""
    uv = nt.nodes.new("ShaderNodeUVMap"); uv.uv_map = "BoxUV"
    mapping = nt.nodes.new("ShaderNodeVectorMath"); mapping.operation = "MULTIPLY"
    mapping.inputs[1].default_value = stretch
    nt.links.new(uv.outputs[0], mapping.inputs[0])
    noise = nt.nodes.new("ShaderNodeTexNoise"); noise.name = name
    noise.inputs["Scale"].default_value = 1
    noise.inputs["Detail"].default_value = 2
    nt.links.new(mapping.outputs[0], noise.inputs["Vector"])
    return noise.outputs["Fac"]


def finish_bump(material, height, distance, strength):
    nt = material.node_tree; b = nt.nodes["Principled BSDF"]
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Distance"].default_value = distance
    bump.inputs["Strength"].default_value = strength
    nt.links.new(height, bump.inputs["Height"])
    if b.inputs["Normal"].is_linked:
        nt.links.new(b.inputs["Normal"].links[0].from_socket, bump.inputs["Normal"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])


def woven_finish(material, density=450):
    nt = material.node_tree; b = nt.nodes["Principled BSDF"]
    warp = directional_noise(nt, (density, 35, 1), "Fabric warp")
    weft = directional_noise(nt, (35, density, 1), "Fabric weft")
    weave = math(nt, "MULTIPLY", warp, weft)
    finish_bump(material, weave, 0.00035, 0.24)
    base = input_value(nt, b.inputs["Base Color"])
    tint = mix_rgb(nt, weave, (0.72, 0.74, 0.75), (1.08, 1.08, 1.08))
    nt.links.new(mix_rgb(nt, 0.5, base, tint, "MULTIPLY"), b.inputs["Base Color"])
    b.inputs["Sheen Weight"].default_value = 0.22
    b.inputs["Sheen Roughness"].default_value = 0.7


def brushed_finish(material):
    nt = material.node_tree; b = nt.nodes["Principled BSDF"]
    brushing = directional_noise(nt, (8, 650, 1), "Brushed metal")
    finish_bump(material, brushing, 0.00006, 0.12)
    rough = input_value(nt, b.inputs["Roughness"])
    nt.links.new(math(nt, "ADD", rough, math(nt, "MULTIPLY_ADD", brushing, 0.10, -0.05)), b.inputs["Roughness"])
    b.inputs["Anisotropic"].default_value = 0.25


def painted_room():
    wall = bpy.data.materials.get("OfficeWall")
    if wall:
        nt = wall.node_tree; b = nt.nodes["Principled BSDF"]
        for node in nt.nodes:
            if node.type == "NORMAL_MAP": node.inputs["Strength"].default_value = 0.10
            if node.type == "BUMP": node.inputs["Distance"].default_value = 0.0003
        base = input_value(nt, b.inputs["Base Color"])
        nt.links.new(mix_rgb(nt, 0.22, base, (0.68, 0.67, 0.63)), b.inputs["Base Color"])
        b.inputs["Specular IOR Level"].default_value = 0.3
        grain(wall, scale=160, distance=0.00018, strength=0.1, roughness=0.025)
    carpet = bpy.data.materials.get("Carpet")
    if carpet:
        for node in carpet.node_tree.nodes:
            if node.type == "NORMAL_MAP": node.inputs["Strength"].default_value = 0.45
            if node.type == "BUMP": node.inputs["Distance"].default_value = 0.002
        woven_finish(carpet, density=260)


def refine_surfaces(desk):
    painted_room()
    # Satin furniture has grain under a thin finish, not deeply embossed shiny ridges.
    for name in ("DeskWood", "DeskWoodTop", "ShelfWood"):
        m = bpy.data.materials.get(name)
        if not m:
            continue
        nt = m.node_tree; b = nt.nodes["Principled BSDF"]
        b.inputs["Coat Weight"].default_value = 0.22
        b.inputs["Coat Roughness"].default_value = 0.27
        b.inputs["Specular IOR Level"].default_value = 0.5
        for n in nt.nodes:
            if n.type == "NORMAL_MAP": n.inputs["Strength"].default_value = 0.16
            if n.type == "BUMP": n.inputs["Distance"].default_value = 0.0005
            if n.type == "MAPPING":
                n.inputs["Scale"].default_value = (1.15, 0.9, 1.0)
        color = input_value(nt, b.inputs["Base Color"])
        saturation = nt.nodes.new("ShaderNodeHueSaturation")
        saturation.inputs["Saturation"].default_value = 0.72
        nt.links.new(color, saturation.inputs["Color"])
        color = mix_rgb(nt, 0.20, saturation.outputs[0], (0.15, 0.09, 0.052))
        nt.links.new(color, b.inputs["Base Color"])
        rough = input_value(nt, b.inputs["Roughness"])
        nt.links.new(math(nt, "MULTIPLY_ADD", rough, 0.62, 0.24), b.inputs["Roughness"])
        grain(m, scale=320, distance=0.00012, strength=0.08, roughness=0.025)

    for name in ("ChairLeather", "ChairLeatherDark"):
        m = bpy.data.materials.get(name)
        if not m: continue
        b = m.node_tree.nodes["Principled BSDF"]
        b.inputs["Sheen Weight"].default_value = 0.08
        for n in m.node_tree.nodes:
            if n.type == "MAPPING": n.inputs["Scale"].default_value = (2.5, 2.5, 2.5)
            if n.type == "NORMAL_MAP": n.inputs["Strength"].default_value = 0.55
            if n.type == "BUMP": n.inputs["Distance"].default_value = 0.0015

    pad = plain_material("WovenMousepad", (0.022, 0.025, 0.027, 1), rough=0.86, spec=0.25)
    grain(pad, scale=420, distance=0.00035, strength=0.2, roughness=0.05)
    woven_finish(pad)
    mouse = plain_material("MouseABS", (0.06, 0.065, 0.062, 1), rough=0.42)
    grain(mouse, scale=280)
    processed = set()
    for obj in desk:
        if obj.type != "MESH": continue
        for i, m in enumerate(obj.data.materials):
            if not m or not m.use_nodes: continue
            name = m.name.lower()
            if name.startswith("mousepad"):
                obj.data.materials[i] = pad; continue
            if name.startswith("computermouse"):
                obj.data.materials[i] = mouse; continue
            if m.name in processed: continue
            processed.add(m.name)
            b = m.node_tree.nodes.get("Principled BSDF")
            if b is None: continue
            if "laptop bag" in obj.name.lower():
                b.inputs["Metallic"].default_value = 0
                b.inputs["Roughness"].default_value = 0.82
                set_color(m, (0.026, 0.029, 0.028) if name.startswith("03___default") else (0.045, 0.052, 0.048))
                woven_finish(m, density=320)
            elif name.startswith("black."):
                # The black lamp shade and base are enamel over metal.
                b.inputs["Metallic"].default_value = 0
                b.inputs["Roughness"].default_value = 0.33
                b.inputs["Coat Weight"].default_value = 0.18
                b.inputs["Coat Roughness"].default_value = 0.22
                grain(m, scale=280, distance=0.0001, roughness=0.02)
            elif "plastic" in name or name.startswith("mat.065"):
                b.inputs["Metallic"].default_value = 0
                b.inputs["Roughness"].default_value = 0.48
                grain(m)
            elif name.startswith("metaldark"):
                set_color(m, (0.025, 0.029, 0.028))
                b.inputs["Metallic"].default_value = 0.15; b.inputs["Roughness"].default_value = 0.34
                grain(m, scale=300, roughness=0.02)
            elif "metal" in name or name.startswith("executive__3"):
                b.inputs["Roughness"].default_value = 0.3
                grain(m, scale=360, distance=0.0001, roughness=0.025)
                brushed_finish(m)

    # Existing Kenney plant parts keep their geometry, but get natural pigment and ceramic grain.
    for m in list(bpy.data.materials):
        if not m.use_nodes or "Principled BSDF" not in m.node_tree.nodes: continue
        if m.name.lower().split('.')[0] == "plant":
            set_color(m, (0.045, 0.14, 0.028))
            b = m.node_tree.nodes["Principled BSDF"]
            b.inputs["Roughness"].default_value = 0.52; b.inputs["Subsurface Weight"].default_value = 0.035
            grain(m, scale=85, distance=0.0003, roughness=0.05)
        elif m.name.lower().split('.')[0] in ("wood", "wooddark"):
            # Kenney pots use these palette names; the actual wood furniture was replaced above.
            set_color(m, (0.36, 0.28, 0.19) if m.name.lower().startswith("wooddark") else (0.65, 0.58, 0.45))
            grain(m, scale=150, distance=0.0004, strength=0.15)

    for name in ("FrameMetal", "Skirting", "SillStone"):
        m = bpy.data.materials.get(name)
        if m: grain(m, scale=250, distance=0.00015, roughness=0.03)
        if m and name == "FrameMetal": brushed_finish(m)

    glass = bpy.data.materials.get("ShardGlass")
    if glass:
        # Thin architectural shards transmit most light; the old blue/metallic
        # alpha-0.55 finish looked like opaque plastic after leaving the window.
        b = glass.node_tree.nodes["Principled BSDF"]
        b.inputs["Base Color"].default_value = (0.17, 0.25, 0.24, 1)
        b.inputs["Metallic"].default_value = 0.08
        b.inputs["Roughness"].default_value = 0.035
        b.inputs["Alpha"].default_value = 0.22
        b.inputs["Coat Weight"].default_value = 0.6
        b.inputs["Coat Roughness"].default_value = 0.04
