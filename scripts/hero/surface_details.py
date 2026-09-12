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


def refine_surfaces(desk):
    # Satin furniture has grain under a thin finish, not deeply embossed shiny ridges.
    for name in ("DeskWood", "DeskWoodTop", "ShelfWood"):
        m = bpy.data.materials.get(name)
        if not m:
            continue
        nt = m.node_tree; b = nt.nodes["Principled BSDF"]
        b.inputs["Coat Weight"].default_value = 0.16
        b.inputs["Coat Roughness"].default_value = 0.30
        b.inputs["Specular IOR Level"].default_value = 0.5
        for n in nt.nodes:
            if n.type == "NORMAL_MAP": n.inputs["Strength"].default_value = 0.35
            if n.type == "BUMP": n.inputs["Distance"].default_value = 0.0012
            if n.type == "MAPPING":
                n.inputs["Scale"].default_value = (0.75, 1.4, 1.0)
        color = input_value(nt, b.inputs["Base Color"])
        saturation = nt.nodes.new("ShaderNodeHueSaturation")
        saturation.inputs["Saturation"].default_value = 0.72
        nt.links.new(color, saturation.inputs["Color"])
        nt.links.new(saturation.outputs[0], b.inputs["Base Color"])
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
            if "plastic" in name or name.startswith(("mat.065", "02___default", "03___default", "_crayfish")):
                b.inputs["Metallic"].default_value = 0
                b.inputs["Roughness"].default_value = 0.48
                if name.startswith("03___default"): set_color(m, (0.055, 0.06, 0.055))
                grain(m)
            elif name.startswith("metaldark"):
                set_color(m, (0.025, 0.029, 0.028))
                b.inputs["Metallic"].default_value = 0.15; b.inputs["Roughness"].default_value = 0.34
                grain(m, scale=300, roughness=0.02)
            elif "metal" in name or name.startswith("black."):
                b.inputs["Roughness"].default_value = 0.3
                grain(m, scale=360, distance=0.0001, roughness=0.025)

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
