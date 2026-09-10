# BUILDANTA hero flythrough. Blender 5.1, background mode.
#   blender -b --python scripts/hero/build_hero.py -- MODE OUTDIR KENNEY_DIR MODELS_DIR LOGO_PNG [start-end]
# KENNEY_DIR holds the unzipped kenney_furniture-kit (CC0, kenney.nl). MODELS_DIR holds
# Launch_Building_Coon_Building.glb, "Desk by dook - EtJlOllzbf.glb" (CC-BY 3.0, poly.pizza/m/EtJlOllzbf)
# and "Apartment by Poly by Google - 9KCtRDLgVV0.glb" (CC-BY 3.0, poly.pizza/m/9KCtRDLgVV0).
# Those model files are not in this repository; see the licence notes in the commit that added this script.
# Output: 600 PNG frames, 1536x864, 24 fps, 25 s. Then scripts/hero/encode.sh turns them into the site's assets.
# MODE: stills  -> key frames at reduced size, for composition checks
#       anim    -> full PNG sequence (optionally a frame range)
#       blend   -> just save the .blend
import bpy, bmesh, math, os, sys, json, random
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:]
MODE, OUT, ASSETS, DL, LOGO = argv[:5]
RANGE = argv[5] if len(argv) > 5 else None
os.makedirs(OUT, exist_ok=True)
random.seed(7)

FPS, T = 24, 25.0
NF = int(T * FPS)                     # 600 frames
W, H = 1536, 864
def f(t): return int(round(t * FPS)) + 1

# ------------------------------------------------------------------ scene
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS; sc.frame_start = 1; sc.frame_end = NF
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.resolution_percentage = 100
sc.render.film_transparent = False
try: sc.render.engine = "BLENDER_EEVEE_NEXT"
except Exception: sc.render.engine = "BLENDER_EEVEE"
ee = sc.eevee
def setp(obj, name, val):
    try: setattr(obj, name, val); return True
    except Exception: return False
setp(ee, "taa_render_samples", 40 if MODE == "anim" else 32)
setp(ee, "use_shadows", True); setp(ee, "shadow_ray_count", 2); setp(ee, "shadow_step_count", 4)
setp(ee, "use_raytracing", True)
try: ee.ray_tracing_options.resolution_scale = "2"; ee.ray_tracing_options.trace_max_roughness = 0.5
except Exception: pass
setp(ee, "volumetric_tile_size", "8"); setp(ee, "volumetric_samples", 32)
setp(ee, "volumetric_start", 0.5); setp(ee, "volumetric_end", 60.0)
sc.render.use_motion_blur = False
vs = sc.view_settings
for vt in ("AgX", "Filmic"):
    if setp(vs, "view_transform", vt): break
for look in ("AgX - Punchy", "AgX - Medium High Contrast", "None"):
    if setp(vs, "look", look): break
vs.exposure = 0.45; vs.gamma = 1.0

# ------------------------------------------------------------------ helpers
def link(o):
    sc.collection.objects.link(o); return o
def new_mat(name, color=(0.8,0.8,0.8,1), rough=0.6, metal=0.0, emit=None, emit_strength=0.0, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit is not None:
        bsdf.inputs["Emission Color"].default_value = emit
        bsdf.inputs["Emission Strength"].default_value = emit_strength
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        setp(m, "surface_render_method", "BLENDED"); setp(m, "blend_method", "BLEND")
        setp(m, "use_backface_culling", False)
    return m
def cube(name, loc, dims, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object; o.name = name; o.scale = dims
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(mat); return o
def import_glb(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    bpy.context.view_layer.update()
    return new
def world_bbox(objs):
    pts = []
    for o in objs:
        if o.type != "MESH": continue
        pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi
def group(objs, name):
    """Parent a set of imported objects to one empty so they move together."""
    root = bpy.data.objects.new(name, None); link(root)
    tops = [o for o in objs if o.parent is None or o.parent not in objs]
    for o in tops:
        mw = o.matrix_world.copy(); o.parent = root; o.matrix_world = mw
    return root
def place_group(root, objs, location, rot_z=0.0, scale=1.0, floor=True):
    root.rotation_euler = (0, 0, rot_z); root.scale = (scale,)*3
    bpy.context.view_layer.update()
    lo, hi = world_bbox(objs)
    off = Vector(location) - Vector(((lo.x+hi.x)/2, (lo.y+hi.y)/2, lo.z if floor else (lo.z+hi.z)/2))
    root.location = root.location + off
    bpy.context.view_layer.update()
    return world_bbox(objs)
def key(o, path, frame, value=None):
    if value is not None: setattr(o, path, value)
    o.keyframe_insert(data_path=path, frame=frame)
def smooth_keys(o):
    """Bezier + auto-clamped is already the factory default for new keys; this only tidies where the API allows."""
    ad = o.animation_data
    if not ad or not ad.action: return
    fcs = []
    try: fcs = list(ad.action.fcurves)
    except Exception:
        try:
            for layer in ad.action.layers:
                for strip in layer.strips:
                    for cb in strip.channelbags: fcs += list(cb.fcurves)
        except Exception: fcs = []
    for fc in fcs:
        for kp in fc.keyframe_points:
            kp.interpolation = "BEZIER"; kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"

# ------------------------------------------------------------------ world + sun
SUN_DIR = Vector((math.cos(math.radians(11)) * math.cos(math.radians(-28)),
                  math.cos(math.radians(11)) * math.sin(math.radians(-28)),
                  math.sin(math.radians(11)))).normalized()      # towards the sun: low, from +x / slightly -y
w = bpy.data.worlds.new("World"); sc.world = w; w.use_nodes = True
nt = w.node_tree; bg = nt.nodes["Background"]
sky = nt.nodes.new("ShaderNodeTexSky")
try:
    sky.sky_type = "HOSEK_WILKIE"; sky.sun_direction = SUN_DIR; sky.turbidity = 4.2; sky.ground_albedo = 0.3
except Exception:
    sky.sky_type = "PREETHAM"; sky.sun_direction = SUN_DIR; sky.turbidity = 3.2
nt.links.new(sky.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = 1.35
sun = link(bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN")))
sun.data.energy = 7.0; sun.data.color = (1.0, 0.78, 0.55); sun.data.angle = math.radians(1.2)
sun.rotation_euler = (-SUN_DIR).to_track_quat("-Z", "Y").to_euler()

# ground
bpy.ops.mesh.primitive_plane_add(size=900, location=(0, 0, -0.02))
ground = bpy.context.active_object; ground.name = "Ground"
gm = bpy.data.materials.new("Grass"); gm.use_nodes = True
gn = gm.node_tree; gb = gn.nodes["Principled BSDF"]
noise = gn.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 0.35; noise.inputs["Detail"].default_value = 6
ramp = gn.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.12, 0.17, 0.07, 1); ramp.color_ramp.elements[1].color = (0.30, 0.37, 0.16, 1)
gn.links.new(noise.outputs["Fac"], ramp.inputs[0]); gn.links.new(ramp.outputs[0], gb.inputs["Base Color"])
gb.inputs["Roughness"].default_value = 1.0
ground.data.materials.append(gm)

# ------------------------------------------------------------------ the hall
hall = import_glb(os.path.join(DL, "Launch_Building_Coon_Building.glb"))
WIN_W, WIN_H, SILL, WY, WX = 6.0, 3.2, 3.0, 2.0, 14.1
WC = Vector((WX, WY, SILL + WIN_H / 2))
bpy.ops.mesh.primitive_cube_add(size=1, location=(WX, WY, SILL + WIN_H / 2))
cutter = bpy.context.active_object; cutter.name = "Cutter"; cutter.scale = (1.8, WIN_W, WIN_H)
bpy.context.view_layer.update()
for name in ("Launch_Building_Coon_Exterior_Wall", "Launch_Building_Coon_Interior_Wall"):
    o = bpy.data.objects[name]
    m = o.modifiers.new("cut", "BOOLEAN"); m.operation = "DIFFERENCE"; m.object = cutter; m.solver = "EXACT"
    bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier="cut")
bpy.data.objects.remove(cutter)

# window frame
frame_mat = new_mat("Frame", (0.05, 0.035, 0.025, 1), rough=0.45, metal=0.3)
TH, DEPTH = 0.16, 0.5
cube("FrameTop", (WX, WY, SILL + WIN_H + TH/2), (DEPTH, WIN_W + 2*TH, TH), frame_mat)
cube("FrameBottom", (WX, WY, SILL - TH/2), (DEPTH, WIN_W + 2*TH, TH), frame_mat)
cube("FrameL", (WX, WY - WIN_W/2 - TH/2, SILL + WIN_H/2), (DEPTH, TH, WIN_H), frame_mat)
cube("FrameR", (WX, WY + WIN_W/2 + TH/2, SILL + WIN_H/2), (DEPTH, TH, WIN_H), frame_mat)
cube("Mullion", (WX, WY, SILL + WIN_H/2), (0.08, 0.06, WIN_H), frame_mat)
cube("Transom", (WX, WY, SILL + WIN_H * 0.62), (0.08, WIN_W, 0.06), frame_mat)

# glass shards: a jittered grid across the pane, at rest until the shatter frame
glass = new_mat("Glass", (0.92, 0.98, 0.96, 1), rough=0.02, metal=0.0, alpha=0.07)
glass.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.3
NX, NZ = 12, 7
gy = [WY - WIN_W/2 + WIN_W * i / NX for i in range(NX + 1)]
gz = [SILL + WIN_H * j / NZ for j in range(NZ + 1)]
verts = {}
for i in range(NX + 1):
    for j in range(NZ + 1):
        jy = random.uniform(-0.3, 0.3) * WIN_W / NX if 0 < i < NX else 0
        jz = random.uniform(-0.3, 0.3) * WIN_H / NZ if 0 < j < NZ else 0
        verts[(i, j)] = Vector((WX, gy[i] + jy, gz[j] + jz))
T_SHATTER = 10.0
shards = []
for i in range(NX):
    for j in range(NZ):
        quad = [verts[(i, j)], verts[(i+1, j)], verts[(i+1, j+1)], verts[(i, j+1)]]
        c = sum(quad, Vector()) / 4
        me = bpy.data.meshes.new(f"Shard{i}_{j}")
        me.from_pydata([v - c for v in quad], [], [[0, 1, 2, 3]]); me.update()
        o = link(bpy.data.objects.new(me.name, me)); o.location = c
        o.data.materials.append(glass)
        sol = o.modifiers.new("thick", "SOLIDIFY"); sol.thickness = 0.005; sol.offset = 0
        shards.append(o)
for o in shards:
    f0 = f(T_SHATTER) + random.randint(0, 3)
    key(o, "location", f0); key(o, "rotation_euler", f0)
    speed = random.uniform(1.0, 1.8)
    p1 = o.location + Vector((-random.uniform(2.0, 4.0) * speed, random.uniform(-0.8, 0.8), random.uniform(-0.3, 0.2)))
    key(o, "location", f0 + 10, p1); key(o, "rotation_euler", f0 + 10, (random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1)))
    p2 = p1 + Vector((-random.uniform(2.0, 5.0) * speed, random.uniform(-1.0, 1.0), -p1.z - random.uniform(0.0, 0.4)))
    p2.z = max(p2.z, 0.01)
    key(o, "location", f0 + 42, p2); key(o, "rotation_euler", f0 + 42, (random.uniform(-4, 4), random.uniform(-4, 4), random.uniform(-4, 4)))
    key(o, "location", f0 + 60, p2)
    smooth_keys(o)

# interior volume for sun shafts through the window
vol = cube("Haze", (0, 5, 5.2), (27.5, 36.5, 9.3), bpy.data.materials.new("HazeMat"))
vm = vol.data.materials[0]; vm.use_nodes = True
vnt = vm.node_tree
for n in list(vnt.nodes): vnt.nodes.remove(n)
outn = vnt.nodes.new("ShaderNodeOutputMaterial"); vsc = vnt.nodes.new("ShaderNodeVolumeScatter")
vsc.inputs["Density"].default_value = 0.015; vsc.inputs["Anisotropy"].default_value = 0.55
vnt.links.new(vsc.outputs[0], outn.inputs["Volume"])
vol.display_type = "WIRE"

# ------------------------------------------------------------------ neighbours: towers only
apt_src = import_glb(os.path.join(DL, "Apartment by Poly by Google - 9KCtRDLgVV0.glb"))
trees = [o for o in apt_src if o.type == "MESH" and o.name.startswith("Sphere")]
apt_src = [o for o in apt_src if o not in trees]
for o in trees: bpy.data.objects.remove(o)
for o in apt_src:
    if o.type != "MESH": continue
    bm = bmesh.new(); bm.from_mesh(o.data)
    lo_z = min(v.co.z for v in bm.verts); hi_z = max(v.co.z for v in bm.verts)
    cut = lo_z + (hi_z - lo_z) * 0.06
    kill = [fc for fc in bm.faces if all(v.co.z < cut for v in fc.verts)]
    bmesh.ops.delete(bm, geom=kill, context="FACES")
    bm.to_mesh(o.data); bm.free()
aroot = group(apt_src, "Apartment")
lo, hi = place_group(aroot, apt_src, (-58, 34, 0), rot_z=math.radians(20), scale=0.34)
tower_h = hi.z - lo.z
copies = [((-62, -20, 0), math.radians(-35), 0.30), ((-30, 70, 0), math.radians(60), 0.36), ((28, 78, 0), math.radians(-15), 0.28)]
for loc, rz, s in copies:
    news = []
    for o in apt_src:
        d = o.copy(); d.data = o.data; link(d); news.append(d)
    r = group(news, "ApartmentCopy"); place_group(r, news, loc, rot_z=rz, scale=s)

# ------------------------------------------------------------------ the desk
desk = import_glb(os.path.join(DL, "Desk by dook - EtJlOllzbf.glb"))
droot = group(desk, "DeskSet")
bpy.context.view_layer.update()
def obj_center(name_part):
    os_ = [o for o in desk if name_part.lower() in o.name.lower() and o.type == "MESH"]
    lo, hi = world_bbox(os_); return (lo + hi) / 2
chair_c = obj_center("chair"); all_lo, all_hi = world_bbox(desk); set_c = (all_lo + all_hi) / 2
v = chair_c - set_c; v.z = 0
ang = math.atan2(v.y, v.x)                       # direction from the set centre towards the chair
DESK_ROT = math.pi - ang                         # chair on the hall side (-x); the desk stands against the wall and the screen faces the room
DESK_AT = (12.85, -4.6, 0.0)
lo, hi = place_group(droot, desk, DESK_AT, rot_z=DESK_ROT, scale=1.0)
bpy.context.view_layer.update()
# pull the chair out to the side so the camera can push straight into the screen
for o in [o for o in desk if "chair" in o.name.lower() and o.type == "MESH"]:
    c = obj_center("chair")
    o.matrix_world = Matrix.Translation(c + Vector((-0.35, 1.15, 0))) @ Matrix.Rotation(math.radians(-40), 4, "Z") @ Matrix.Translation(-c) @ o.matrix_world
bpy.context.view_layer.update()

# the monitor face -> a dedicated logo plane with clean UVs
screen_obj = [o for o in desk if "screen" in o.name.lower() and o.type == "MESH"][0]
me = screen_obj.data
mat_idx = [i for i, m in enumerate(me.materials) if m and m.name.lower().startswith("screen")]
polys = [p for p in me.polygons if p.material_index in mat_idx]
if not polys:  # fall back: the largest flat face on the screen object
    polys = sorted(me.polygons, key=lambda p: -p.area)[:1]
mw = screen_obj.matrix_world
pts = [mw @ me.vertices[i].co for p in polys for i in p.vertices]
nrm = (mw.to_3x3() @ polys[0].normal).normalized()
if nrm.dot(Vector((-1, 0, 0))) < 0: nrm = -nrm     # screen must face the hall (-x)
up = Vector((0, 0, 1)); up = (up - nrm * up.dot(nrm)).normalized(); right = up.cross(nrm).normalized()
ctr = sum(pts, Vector()) / len(pts)
us = [ (p - ctr).dot(right) for p in pts ]; vsx = [ (p - ctr).dot(up) for p in pts ]
umin, umax, vmin, vmax = min(us), max(us), min(vsx), max(vsx)
SCREEN_W, SCREEN_H = umax - umin, vmax - vmin
MC = ctr + right * (umin + umax) / 2 + up * (vmin + vmax) / 2 + nrm * 0.004
corners = [MC + right * a + up * b for a, b in ((-SCREEN_W/2, -SCREEN_H/2), (SCREEN_W/2, -SCREEN_H/2), (SCREEN_W/2, SCREEN_H/2), (-SCREEN_W/2, SCREEN_H/2))]
lme = bpy.data.meshes.new("LogoScreen"); lme.from_pydata([c - MC for c in corners], [], [[0, 1, 2, 3]]); lme.update()
uvattr = lme.attributes.new("UVMap", "FLOAT2", "CORNER")
for li, uv in zip(range(4), ((0, 0), (1, 0), (1, 1), (0, 1))): uvattr.data[li].vector = uv
print("SCREEN_NORMAL", [round(v,2) for v in nrm], "MC", [round(v,2) for v in MC]); print("LOGO_UVS", [tuple(round(c, 2) for c in d.vector) for d in uvattr.data])
logo = link(bpy.data.objects.new("LogoScreen", lme)); logo.location = MC
lm = bpy.data.materials.new("LogoMat"); lm.use_nodes = True; lnt = lm.node_tree
lb = lnt.nodes["Principled BSDF"]; lb.inputs["Base Color"].default_value = (0.01, 0.01, 0.012, 1); lb.inputs["Roughness"].default_value = 0.18
tex = lnt.nodes.new("ShaderNodeTexImage"); tex.image = bpy.data.images.load(LOGO)
lnt.links.new(tex.outputs["Color"], lb.inputs["Emission Color"])
lb.inputs["Emission Strength"].default_value = 0.0
logo.data.materials.append(lm)
for m in me.materials:
    if m and m.name.lower().startswith("screen") and m.use_nodes and "Principled BSDF" in m.node_tree.nodes:
        m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.005, 0.005, 0.006, 1)
T_LOGO_ON, T_LOGO_FULL = 16.0, 17.6
lb.inputs["Emission Strength"].default_value = 0.0; lb.inputs["Emission Strength"].keyframe_insert("default_value", frame=f(T_LOGO_ON))
lb.inputs["Emission Strength"].default_value = 3.8; lb.inputs["Emission Strength"].keyframe_insert("default_value", frame=f(T_LOGO_FULL))

# desk lamp light + fill
lamp_objs = [o for o in desk if "light" in o.name.lower() and o.type == "MESH"]
if lamp_objs:
    llo, lhi = world_bbox(lamp_objs); lamp_pos = Vector(((llo.x+lhi.x)/2, (llo.y+lhi.y)/2, lhi.z - 0.05))
else:
    lamp_pos = MC + Vector((0, 0.7, 0.2))
pl = link(bpy.data.objects.new("DeskLamp", bpy.data.lights.new("DeskLamp", "POINT")))
pl.location = lamp_pos + Vector((-0.05, 0, -0.03)); pl.data.energy = 90; pl.data.color = (1.0, 0.72, 0.45); pl.data.shadow_soft_size = 0.12
fill = link(bpy.data.objects.new("Fill", bpy.data.lights.new("Fill", "AREA")))
fill.location = (9.5, -4.6, 5.5); fill.data.energy = 520; fill.data.size = 4.0; fill.data.color = (1.0, 0.93, 0.85)
fill.rotation_euler = (Vector((12.4, -4.6, 1.0)) - fill.location).to_track_quat("-Z", "Y").to_euler()
bounce = link(bpy.data.objects.new("WindowBounce", bpy.data.lights.new("WindowBounce", "AREA")))
bounce.location = (12.0, WY, SILL + WIN_H / 2); bounce.data.energy = 450; bounce.data.size = 5.0; bounce.data.color = (1.0, 0.82, 0.62)
bounce.rotation_euler = (Vector((0, -2, 1.5)) - bounce.location).to_track_quat("-Z", "Y").to_euler()

# Kenney dressing (CC0), scaled up to the executive desk's real-world size
KF = os.path.join(ASSETS, "kenney_furniture-kit", "Models", "GLTF format")
def kenney(name, loc, rot_z=0.0, scale=1.55, recolor=None):
    objs = import_glb(os.path.join(KF, name + ".glb"))
    r = group(objs, "K_" + name); place_group(r, objs, loc, rot_z=rot_z, scale=scale)
    if recolor:
        m = new_mat("K_" + name + "_mat", recolor, rough=0.85)
        for o in objs:
            if o.type == "MESH": o.data.materials.clear(); o.data.materials.append(m)
    return objs
shelf_objs = kenney("bookcaseOpen", (13.45, -8.6, 0), rot_z=math.radians(90), scale=1.7)
shelf_lo, shelf_hi = world_bbox(shelf_objs)
kenney("books", (13.45, -8.6, shelf_lo.z + (shelf_hi.z - shelf_lo.z) * 0.52), rot_z=math.radians(90), scale=1.7)
kenney("plantSmall2", (13.45, -8.3, shelf_hi.z), scale=1.7)          # on top of the bookcase, whatever its real height
kenney("pottedPlant", (13.35, -1.9, 0), scale=1.8)
kenney("pottedPlant", (13.35, -7.0, 0), scale=1.5)
kenney("rugRectangle", (12.2, -4.6, 0.005), rot_z=math.radians(90), scale=2.6, recolor=(0.30, 0.40, 0.19, 1))
kenney("plantSmall1", (11.7, -3.55, 0.76), scale=1.3)

# dust motes drifting in the lamp light and the sun shafts, keyframed rather than simulated so any frame range renders alone
mote_mat = new_mat("Mote", (1.0, 0.95, 0.85, 1), rough=0.6, emit=(1.0, 0.9, 0.7, 1), emit_strength=1.6)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.0, location=(0, 0, -50))
mote_src = bpy.context.active_object; mote_src.name = "MoteSrc"; mote_src.data.materials.append(mote_mat); mote_src.hide_render = True
def motes(n, box, rmin, rmax, avoid=None):
    for i in range(n):
        p = None
        for _ in range(12):
            p = Vector((random.uniform(box[0][0], box[1][0]), random.uniform(box[0][1], box[1][1]), random.uniform(box[0][2], box[1][2])))
            if not avoid or (p - avoid[0]).length > avoid[1]: break
        m = link(bpy.data.objects.new("Mote_%d_%d" % (n, i), mote_src.data))
        m.scale = (random.uniform(rmin, rmax),) * 3
        m.location = p; key(m, "location", 1)
        for fr in (200, 400, 600):
            p = p + Vector((random.uniform(-0.25, 0.25), random.uniform(-0.25, 0.25), random.uniform(-0.18, 0.12)))
            key(m, "location", fr, p)
        smooth_keys(m)
motes(120, ((9.0, -8.5, 0.3), (13.8, -1.0, 3.2)), 0.004, 0.009, avoid=(MC, 0.8))
motes(90, ((9.5, -1.5, 1.5), (14.0, 5.5, 6.5)), 0.005, 0.011)

# ------------------------------------------------------------------ camera
cam = link(bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera")))
cam.data.lens = 32; cam.data.sensor_width = 36; cam.data.clip_start = 0.02; cam.data.clip_end = 3000
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 11.0
tgt = link(bpy.data.objects.new("CamTarget", None))
con = cam.constraints.new("TRACK_TO"); con.target = tgt; con.track_axis = "TRACK_NEGATIVE_Z"; con.up_axis = "UP_Y"
cam.data.dof.focus_object = tgt
sc.camera = cam
hfov = 2 * math.atan(cam.data.sensor_width / (2 * cam.data.lens))
FILL_D = SCREEN_W / (2 * math.tan(hfov / 2)) * 0.97      # distance at which the screen fills the frame width
CLOSE = MC + nrm * FILL_D                                 # nrm points into the room, so the close camera sits in front of the screen
HOLD_CAM = Vector((MC.x - 3.1, MC.y + 0.55, MC.z + 0.45)) # the wide desk shot
path = [  # (t, camera location, target location, f-stop)
    (0.0,  (54, -42, 11),   (0, 4, 5.0),         11),
    (4.2,  (40, -20, 8.5),  (6, 3, 5.2),         11),
    (8.3,  (26, 2.5, 5.2),  (WC.x, WY, WC.z),    11),
    (10.0, (16.8, 2.1, 4.7),(WC.x - 12, 1.5, 3.8), 11),
    (11.8, (10.8, 1.2, 4.0),(3.0, -3.5, 2.2),    11),
    (13.6, (7.6, -1.9, 2.5),(11.5, -4.4, 1.3),   9),
    (15.6, (HOLD_CAM.x, HOLD_CAM.y, HOLD_CAM.z), (MC.x, MC.y, MC.z), 6),
    (18.6, (CLOSE.x, CLOSE.y, CLOSE.z), (MC.x, MC.y, MC.z), 4),
    (19.9, (CLOSE.x, CLOSE.y, CLOSE.z), (MC.x, MC.y, MC.z), 4),
    (21.6, (HOLD_CAM.x, HOLD_CAM.y, HOLD_CAM.z), (MC.x, MC.y, MC.z), 5),
    (25.0, (HOLD_CAM.x, HOLD_CAM.y, HOLD_CAM.z), (MC.x, MC.y, MC.z), 5),
]
for t, loc, tg, fs in path:
    key(cam, "location", f(t), loc); key(tgt, "location", f(t), tg)
    cam.data.dof.aperture_fstop = fs; cam.data.dof.keyframe_insert("aperture_fstop", frame=f(t))
smooth_keys(cam); smooth_keys(tgt)

# ------------------------------------------------------------------ compositor: flare + glow
COMP = "none"
try:
    tree = None
    if hasattr(sc, "compositing_node_group"):          # Blender 5.x: the compositor is its own node group
        tree = bpy.data.node_groups.new("HeroComp", "CompositorNodeTree"); sc.compositing_node_group = tree
        setp(sc.render, "use_compositing", True)
        try: tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        except Exception: pass
        outn = tree.nodes.new("NodeGroupOutput")
    else:                                              # 4.x
        sc.use_nodes = True; tree = sc.node_tree
        for n in list(tree.nodes): tree.nodes.remove(n)
        outn = tree.nodes.new("CompositorNodeComposite")
    rl = tree.nodes.new("CompositorNodeRLayers"); rl.scene = sc
    def glare(kind, **kw):
        g = tree.nodes.new("CompositorNodeGlare")
        setp(g, "glare_type", kind)
        for k, v in kw.items():
            done = False
            if k in g.inputs:
                try: g.inputs[k].default_value = v; done = True
                except Exception: pass
            if not done: setp(g, k, v)
        return g
    g1 = glare("STREAKS", **{"Threshold": 2.6, "Strength": 0.22, "Streaks": 4, "Streaks Angle": math.radians(20), "Size": 7, "threshold": 2.6, "mix": -0.4, "streaks": 4, "angle_offset": math.radians(20), "iterations": 4})
    g2 = glare("FOG_GLOW", **{"Threshold": 1.8, "Strength": 0.10, "Size": 7, "threshold": 1.8, "mix": -0.7, "size": 7})
    tree.links.new(rl.outputs["Image"], g1.inputs["Image"]); tree.links.new(g1.outputs["Image"], g2.inputs["Image"])
    tree.links.new(g2.outputs["Image"], outn.inputs[0])
    COMP = "5x-nodegroup" if hasattr(sc, "compositing_node_group") else "4x-scene"
except Exception as e:
    COMP = "failed: " + str(e)[:120]
print("COMPOSITOR:", COMP)

# ------------------------------------------------------------------ output
info = {"frames": NF, "fps": FPS, "screen_w": round(SCREEN_W, 3), "screen_h": round(SCREEN_H, 3), "monitor_center": [round(v, 3) for v in MC],
        "fill_distance": round(FILL_D, 3), "desk_bbox": [[round(v, 2) for v in lo], [round(v, 2) for v in hi]], "desk_rot_deg": round(math.degrees(DESK_ROT), 1),
        "tower_height": round(tower_h, 1), "engine": sc.render.engine, "view": vs.view_transform, "look": vs.look}
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "hero.blend"))
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGB"
if MODE == "stills":
    sc.render.resolution_percentage = 50
    for t in ([17.6, 18.6, 9.6] if os.environ.get("STILLS_SUBSET") else [0.0, 4.2, 8.3, 9.6, 10.4, 11.0, 12.6, 14.5, 15.6, 17.0, 18.8, 21.6, 25.0]):
        sc.frame_set(f(t)); sc.render.filepath = os.path.join(OUT, "still_%05.2f.png" % t)
        bpy.ops.render.render(write_still=True)
elif MODE == "anim":
    fd = os.path.join(OUT, "frames"); os.makedirs(fd, exist_ok=True)
    a, b = (int(x) for x in RANGE.split("-")) if RANGE else (1, NF)
    sc.frame_start, sc.frame_end = a, b
    sc.render.use_overwrite = False; sc.render.use_placeholder = False   # rerunning resumes where it stopped
    sc.render.filepath = os.path.join(fd, "f_")
    bpy.ops.render.render(animation=True)
print("INFO_JSON=" + json.dumps(info))
