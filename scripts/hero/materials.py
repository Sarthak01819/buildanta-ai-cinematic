# Materials for the hero flythrough: photographic PBR sets from Poly Haven (CC0) on box-projected
# UVs, plus the procedural curtain wall and the road markings. Imported by build_hero.py.
# Texture sets live in TEX_DIR (see fetch_textures.py): <key>/<key>_{diff,nor_gl,arm,disp}_2k.jpg
import bpy, os
from mathutils import Matrix

TEXDIR = os.environ.get("TEX_DIR") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "textures")

def setp(obj, name, val):
    try: setattr(obj, name, val); return True
    except Exception: return False

def tex_path(key, suffix):
    aliases = ("diff", "albedo", "basecolor", "base_color") if suffix == "diff" else (suffix,)
    for res in ("2k", "4k", "1k"):
        for label in aliases:
            p = os.path.join(TEXDIR, key, "%s_%s_%s.jpg" % (key, label, res))
            if os.path.exists(p): return p
    return None

def load_img(path, colorspace):
    img = bpy.data.images.load(path, check_existing=True)
    try: img.colorspace_settings.name = colorspace
    except Exception: pass
    return img

def box_uv(o, space="world"):
    """Writes a BoxUV corner attribute in metres: each face projected along its dominant axis, so one
    texture runs seamlessly across every cube that shares a plane. Object space for things that move."""
    me = o.data
    if me.attributes.get("BoxUV") is None: me.attributes.new("BoxUV", "FLOAT2", "CORNER")
    attr = me.attributes["BoxUV"]
    if space == "world":
        bpy.context.view_layer.update(); mw = o.matrix_world.copy()
    elif space == "object":
        # glTF furniture carries its scale on objects and parents (the desk is
        # about 10,000x). Keep the grain attached, but measure it in real metres.
        bpy.context.view_layer.update()
        scale = o.matrix_world.to_scale()
        mw = Matrix.Diagonal((scale.x, scale.y, scale.z, 1.0))
    else:
        raise ValueError("BoxUV space must be world or object")
    m3 = mw.to_3x3().inverted_safe().transposed()
    vs = me.vertices; loops = me.loops
    for poly in me.polygons:
        n = m3 @ poly.normal
        ax = max(range(3), key=lambda k: abs(n[k]))
        for li in poly.loop_indices:
            p = mw @ vs[loops[li].vertex_index].co
            if ax == 0: attr.data[li].vector = (p.y, p.z)
            elif ax == 1: attr.data[li].vector = (p.x, p.z)
            else: attr.data[li].vector = (p.x, p.y)

def math(nt, op, a, b=None, c=None):
    n = nt.nodes.new("ShaderNodeMath"); n.operation = op
    for i, v in enumerate((a, b, c)):
        if v is None: continue
        if hasattr(v, "is_output"): nt.links.new(v, n.inputs[i])
        else: n.inputs[i].default_value = v
    return n.outputs[0]

def mix_rgb(nt, fac, a, b, blend="MIX"):
    n = nt.nodes.new("ShaderNodeMix"); n.data_type = "RGBA"; n.blend_type = blend
    for sock, v in ((n.inputs[0], fac), (n.inputs[6], a), (n.inputs[7], b)):
        if hasattr(v, "is_output"): nt.links.new(v, sock)
        elif sock.type == "RGBA": sock.default_value = (v[0], v[1], v[2], 1) if len(v) == 3 else v
        else: sock.default_value = v
    return n.outputs[2]

def pbr_nodes(nt, key, tile=2.0, bump=0.3, bump_dist=0.02, tint=(1, 1, 1), rough_mul=1.0, rough_add=0.0,
              ao=0.7, interp="Linear", uv="BoxUV", vector=None, normal_strength=1.0):
    """Builds the texture network inside `nt`. Returns (color, roughness, normal) sockets, any of which
    may be None when the set lacks that map. `vector` overrides the UV lookup with any vector socket."""
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.0 / tile, 1.0 / tile, 1.0 / tile)
    if vector is not None: nt.links.new(vector, mp.inputs[0])
    else:
        uvn = nt.nodes.new("ShaderNodeUVMap"); uvn.uv_map = uv; nt.links.new(uvn.outputs[0], mp.inputs[0])
    def tex(suffix, cs):
        p = tex_path(key, suffix)
        if not p: return None
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = load_img(p, cs); t.interpolation = interp
        if vector is not None: t.projection = "BOX"; t.projection_blend = 0.25
        nt.links.new(mp.outputs[0], t.inputs[0]); return t
    color = rough = normal = None
    d = tex("diff", "sRGB")
    if d is None:
        raise FileNotFoundError("Missing colour map for %s in %s; run fetch_textures.py" % (key, TEXDIR))
    if d:
        color = mix_rgb(nt, 1.0, d.outputs["Color"], tint, "MULTIPLY")
    arm = tex("arm", "Non-Color")
    if arm:
        sep = nt.nodes.new("ShaderNodeSeparateColor"); nt.links.new(arm.outputs["Color"], sep.inputs[0])
        if color is not None and ao > 0: color = mix_rgb(nt, ao, color, sep.outputs[0], "MULTIPLY")
        rough = math(nt, "MULTIPLY_ADD", sep.outputs[1], rough_mul, rough_add)
    nor = tex("nor_gl", "Non-Color")
    if nor and vector is None:
        nm = nt.nodes.new("ShaderNodeNormalMap"); nm.uv_map = uv
        nm.inputs["Strength"].default_value = normal_strength
        nt.links.new(nor.outputs["Color"], nm.inputs["Color"]); normal = nm.outputs["Normal"]
    disp = tex("disp", "Non-Color")
    if disp and bump > 0:
        bm = nt.nodes.new("ShaderNodeBump"); bm.inputs["Strength"].default_value = bump; bm.inputs["Distance"].default_value = bump_dist
        nt.links.new(disp.outputs["Color"], bm.inputs["Height"])
        if normal is not None: nt.links.new(normal, bm.inputs["Normal"])
        normal = bm.outputs["Normal"]
    return color, rough, normal

def pbr_material(name, key, spec=0.5, metallic=0.0, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    color, rough, normal = pbr_nodes(nt, key, **kw)
    if color is not None: nt.links.new(color, b.inputs["Base Color"])
    if rough is not None: nt.links.new(rough, b.inputs["Roughness"])
    if normal is not None: nt.links.new(normal, b.inputs["Normal"])
    b.inputs["Metallic"].default_value = metallic; b.inputs["Specular IOR Level"].default_value = spec
    return m

def plain_material(name, color=(0.8, 0.8, 0.8, 1), rough=0.6, metal=0.0, emit=None, emit_strength=0.0, alpha=1.0, spec=0.5):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color; b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    b.inputs["Specular IOR Level"].default_value = spec
    if emit is not None:
        b.inputs["Emission Color"].default_value = emit; b.inputs["Emission Strength"].default_value = emit_strength
    if alpha < 1.0:
        b.inputs["Alpha"].default_value = alpha
        setp(m, "surface_render_method", "BLENDED"); setp(m, "blend_method", "BLEND"); setp(m, "use_backface_culling", False)
    return m

def road_material(name, along="y", width=14.0, lanes=2):
    """Cracked asphalt with a dashed centre line, edge lines and, for four lanes, lane dashes. Markings
    are drawn in object space, so the street plane's own origin is the road's centre line."""
    m = pbr_material(name, "asphalt_02", tile=7.0, bump=0.25, tint=(0.80, 0.80, 0.82), rough_add=0.04)
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["Object"], sp.inputs[0])
    across = sp.outputs[1] if along == "x" else sp.outputs[0]
    alongv = sp.outputs[0] if along == "x" else sp.outputs[1]
    dash = math(nt, "LESS_THAN", math(nt, "FRACT", math(nt, "DIVIDE", alongv, 6.0)), 0.5)
    absx = math(nt, "ABSOLUTE", across)
    centre = math(nt, "MULTIPLY", math(nt, "LESS_THAN", absx, 0.07), dash)
    edge = math(nt, "LESS_THAN", math(nt, "ABSOLUTE", math(nt, "SUBTRACT", absx, width / 2 - 0.5)), 0.06)
    mask = math(nt, "ADD", centre, edge)
    if lanes == 4:
        lane = math(nt, "MULTIPLY", math(nt, "LESS_THAN", math(nt, "ABSOLUTE", math(nt, "SUBTRACT", absx, width / 4)), 0.06), dash)
        mask = math(nt, "ADD", mask, lane)
    wear = nt.nodes.new("ShaderNodeTexNoise"); wear.inputs["Scale"].default_value = 0.35; wear.inputs["Detail"].default_value = 3
    nt.links.new(tc.outputs["Object"], wear.inputs["Vector"])
    fade = math(nt, "MULTIPLY_ADD", wear.outputs["Fac"], 0.5, 0.35)
    mask = math(nt, "MULTIPLY", math(nt, "MINIMUM", mask, 1.0), fade)
    base = b.inputs["Base Color"].links[0].from_socket
    nt.links.new(mix_rgb(nt, mask, base, (0.72, 0.68, 0.56)), b.inputs["Base Color"])
    return m

def curtain_wall_material(name, win_w=3.0, floor_h=3.6, lit_fraction=0.06, concrete_key="concrete_panels"):
    """Precast concrete grid with aluminium mullions and reflective glass, some panes lit warm. Drawn in
    world space so any box wearing it becomes an office building; the concrete is a real texture on
    the BoxUV attribute every building carries. Per-object random shifts the tint and the lights."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    geo = nt.nodes.new("ShaderNodeNewGeometry"); oi = nt.nodes.new("ShaderNodeObjectInfo")
    sp = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], sp.inputs[0])
    sn = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Normal"], sn.inputs[0])
    absx = math(nt, "ABSOLUTE", sn.outputs[0]); is_x = math(nt, "GREATER_THAN", absx, 0.5)
    is_top = math(nt, "GREATER_THAN", sn.outputs[2], 0.5)
    mixu = nt.nodes.new("ShaderNodeMix"); mixu.data_type = "FLOAT"
    nt.links.new(is_x, mixu.inputs[0]); nt.links.new(sp.outputs[0], mixu.inputs[2]); nt.links.new(sp.outputs[1], mixu.inputs[3])
    u = mixu.outputs[0]
    fu = math(nt, "FRACT", math(nt, "DIVIDE", u, win_w)); fv = math(nt, "FRACT", math(nt, "DIVIDE", sp.outputs[2], floor_h))
    def band(v, lo, hi): return math(nt, "MULTIPLY", math(nt, "GREATER_THAN", v, lo), math(nt, "LESS_THAN", v, hi))
    not_top = math(nt, "SUBTRACT", 1.0, is_top)
    is_open = math(nt, "MULTIPLY", math(nt, "MULTIPLY", band(fu, 0.10, 0.90), band(fv, 0.20, 0.86)), not_top)   # frame + glass
    is_win = math(nt, "MULTIPLY", math(nt, "MULTIPLY", band(fu, 0.135, 0.865), band(fv, 0.235, 0.825)), not_top)  # glass only
    # per-cell randoms, salted by the object's random value
    cu = math(nt, "FLOOR", math(nt, "DIVIDE", u, win_w)); cz = math(nt, "FLOOR", math(nt, "DIVIDE", sp.outputs[2], floor_h))
    def cell_noise(salt_mul):
        comb = nt.nodes.new("ShaderNodeCombineXYZ"); nt.links.new(cu, comb.inputs[0]); nt.links.new(cz, comb.inputs[1])
        nt.links.new(math(nt, "MULTIPLY", oi.outputs["Random"], salt_mul), comb.inputs[2])
        wn = nt.nodes.new("ShaderNodeTexWhiteNoise"); wn.noise_dimensions = "3D"; nt.links.new(comb.outputs[0], wn.inputs["Vector"])
        return wn.outputs["Value"]
    r_lit, r_tone, r_tint = cell_noise(97.0), cell_noise(41.0), cell_noise(13.0)
    lit = math(nt, "MULTIPLY", math(nt, "GREATER_THAN", r_lit, 1.0 - lit_fraction), is_win)
    # glass: dark reflective, per-pane tint and a low-frequency wobble in the reflections
    glass = nt.nodes.new("ShaderNodeBsdfPrincipled")
    glass.inputs["Metallic"].default_value = 0.35
    glass.inputs["Specular IOR Level"].default_value = 0.5
    glass.inputs["Coat Weight"].default_value = 0.65; glass.inputs["Coat Roughness"].default_value = 0.08
    nt.links.new(math(nt, "MULTIPLY_ADD", r_tone, 0.09, 0.065), glass.inputs["Roughness"])
    nt.links.new(mix_rgb(nt, r_tint, (0.025, 0.040, 0.045), (0.055, 0.075, 0.078)), glass.inputs["Base Color"])
    nt.links.new(mix_rgb(nt, math(nt, "GREATER_THAN", r_tone, 0.72), (1.0, 0.80, 0.52), (0.82, 0.90, 1.0)), glass.inputs["Emission Color"])
    nt.links.new(math(nt, "MULTIPLY", lit, math(nt, "MULTIPLY_ADD", r_tone, 1.2, 0.7)), glass.inputs["Emission Strength"])
    wob = nt.nodes.new("ShaderNodeTexNoise"); wob.inputs["Scale"].default_value = 0.45; wob.inputs["Detail"].default_value = 1.5
    nt.links.new(geo.outputs["Position"], wob.inputs["Vector"])
    gb = nt.nodes.new("ShaderNodeBump"); gb.inputs["Strength"].default_value = 0.035; gb.inputs["Distance"].default_value = 0.025
    nt.links.new(wob.outputs["Fac"], gb.inputs["Height"]); nt.links.new(gb.outputs["Normal"], glass.inputs["Normal"])
    # mullions: dark anodised aluminium
    frame = nt.nodes.new("ShaderNodeBsdfPrincipled")
    frame.inputs["Base Color"].default_value = (0.16, 0.16, 0.17, 1); frame.inputs["Metallic"].default_value = 0.9; frame.inputs["Roughness"].default_value = 0.38
    # concrete: the texture set, tinted per object
    conc = nt.nodes.new("ShaderNodeBsdfPrincipled"); conc.inputs["Specular IOR Level"].default_value = 0.4
    color, rough, normal = pbr_nodes(nt, concrete_key, tile=floor_h, bump=0.35, bump_dist=0.03, tint=(0.86, 0.85, 0.83), rough_add=0.05)
    if color is not None:
        tint = mix_rgb(nt, oi.outputs["Random"], (0.78, 0.76, 0.73), (1.0, 0.99, 0.96))
        varied = mix_rgb(nt, 1.0, color, tint, "MULTIPLY")
        # Quiet per-panel variation and rain deposits at the sill break the perfect grid.
        panel_tone = mix_rgb(nt, r_tint, (0.84, 0.83, 0.81), (1.0, 1.0, 1.0))
        varied = mix_rgb(nt, 0.5, varied, panel_tone, "MULTIPLY")
        rain = math(nt, "MULTIPLY", band(fv, 0.12, 0.235), band(fu, 0.10, 0.90))
        rain = math(nt, "MULTIPLY", rain, math(nt, "MULTIPLY_ADD", r_tone, 0.13, 0.02))
        nt.links.new(mix_rgb(nt, rain, varied, (0.48, 0.47, 0.43), "MULTIPLY"), conc.inputs["Base Color"])
    else:
        conc.inputs["Base Color"].default_value = (0.6, 0.58, 0.55, 1)
    if rough is not None: nt.links.new(rough, conc.inputs["Roughness"])
    else: conc.inputs["Roughness"].default_value = 0.85
    if normal is not None: nt.links.new(normal, conc.inputs["Normal"])
    inner = nt.nodes.new("ShaderNodeMixShader"); nt.links.new(is_win, inner.inputs[0]); nt.links.new(frame.outputs[0], inner.inputs[1]); nt.links.new(glass.outputs[0], inner.inputs[2])
    outer = nt.nodes.new("ShaderNodeMixShader"); nt.links.new(is_open, outer.inputs[0]); nt.links.new(conc.outputs[0], outer.inputs[1]); nt.links.new(inner.outputs[0], outer.inputs[2])
    nt.links.new(outer.outputs[0], out.inputs["Surface"])
    return m

def ceiling_material(name, tile=0.6, gap=0.012):
    """Mineral-fibre ceiling tiles: the painted-ceiling set for grain, a world-space grid for the joints."""
    m = pbr_material(name, "ceiling_interior", tile=1.8, bump=0.12, bump_dist=0.01, tint=(1.16, 1.16, 1.14), rough_add=0.1, ao=0.3, spec=0.3)
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    geo = nt.nodes.new("ShaderNodeNewGeometry"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], sp.inputs[0])
    gx = math(nt, "LESS_THAN", math(nt, "ABSOLUTE", math(nt, "SUBTRACT", math(nt, "FRACT", math(nt, "DIVIDE", sp.outputs[0], tile)), 0.5)), 0.5 - gap / tile)
    gy = math(nt, "LESS_THAN", math(nt, "ABSOLUTE", math(nt, "SUBTRACT", math(nt, "FRACT", math(nt, "DIVIDE", sp.outputs[1], tile)), 0.5)), 0.5 - gap / tile)
    in_tile = math(nt, "MULTIPLY", gx, gy)
    base = b.inputs["Base Color"].links[0].from_socket
    nt.links.new(mix_rgb(nt, in_tile, (0.45, 0.45, 0.44), base), b.inputs["Base Color"])
    return m

def carpet_material(name):
    m = pbr_material(name, "dirty_carpet", tile=2.6, bump=0.3, bump_dist=0.008, tint=(0.80, 0.84, 0.92), rough_add=0.1, ao=0.4, spec=0.15, interp="Cubic")
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    geo = nt.nodes.new("ShaderNodeNewGeometry"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], sp.inputs[0])
    # carpet tiles: every second 0.5 m tile turned, read as a faint checker in the shading
    cx = math(nt, "FLOOR", math(nt, "DIVIDE", sp.outputs[0], 0.5)); cy = math(nt, "FLOOR", math(nt, "DIVIDE", sp.outputs[1], 0.5))
    chk = math(nt, "MODULO", math(nt, "ADD", cx, cy), 2.0)
    base = b.inputs["Base Color"].links[0].from_socket
    base = mix_rgb(nt, 0.55, base, (0.20, 0.21, 0.23))   # the photo is fleck-heavy; half of it is enough at this distance
    nt.links.new(mix_rgb(nt, math(nt, "MULTIPLY", chk, 0.10), base, (0.5, 0.52, 0.55), "MULTIPLY"), b.inputs["Base Color"])
    return m
