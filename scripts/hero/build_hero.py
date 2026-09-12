# BUILDANTA hero flythrough, city version. Blender 5.1, background mode.
#   blender -b --python build_hero.py -- MODE OUTDIR KENNEY_DIR MODELS_DIR LOGO_PNG [start-end]
# MODE: anim (600 frames), stills (STILLS=t,t,... seconds), scene (save only), sunprobe (sky check).
# Hero building: generated in place, a concrete-and-glass office tower whose curtain wall is a procedural
# grid, so the two windows the camera flies through are the facade's own cells on its own floor line.
# City: procedurally generated office towers on a street grid, kept clear of the camera line.
# Surfaces: Poly Haven CC0 photo textures (fetch_textures.py -> TEX_DIR) on box-projected UVs, an HDRI sky.
# Desk: "Desk by dook" (CC-BY 3.0, poly.pizza/m/EtJlOllzbf). Plants and shelf: Kenney Furniture Kit (CC0).
# Sign texture: MARK_PNG env var (white mark on transparent). Monitor texture: LOGO_PNG argument.
# Output: 600 frames, 1536x864, 24 fps, 25 s.
import bpy, math, os, sys, json, random
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from materials import (TEXDIR, setp, box_uv, pbr_material, plain_material, road_material, curtain_wall_material,
                       ceiling_material, carpet_material)
argv = sys.argv[sys.argv.index("--") + 1:]
MODE, OUT, ASSETS, DL, LOGO = argv[:5]
RANGE = argv[5] if len(argv) > 5 else None
os.makedirs(OUT, exist_ok=True)
random.seed(11)
FPS, T = 24, 25.0
NF = int(T * FPS)
W, H = 1536, 864
def f(t): return int(round(t * FPS)) + 1
# ------------------------------------------------------------------ scene
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS; sc.frame_start = 1; sc.frame_end = NF
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.resolution_percentage = 100
try: sc.render.engine = "BLENDER_EEVEE_NEXT"
except Exception: sc.render.engine = "BLENDER_EEVEE"
ee = sc.eevee
setp(ee, "taa_render_samples", 48 if MODE == "anim" else 32)
setp(ee, "use_shadows", True); setp(ee, "shadow_ray_count", 2); setp(ee, "shadow_step_count", 4)
setp(ee, "use_raytracing", True)
try:
    ee.ray_tracing_options.resolution_scale = os.environ.get("RT_SCALE", "2"); ee.ray_tracing_options.trace_max_roughness = 0.6
except Exception: pass
setp(ee, "use_fast_gi", True); setp(ee, "fast_gi_method", "GLOBAL_ILLUMINATION"); setp(ee, "fast_gi_resolution", "2")
setp(ee, "volumetric_tile_size", "8"); setp(ee, "volumetric_samples", 32)
setp(ee, "volumetric_start", 0.3); setp(ee, "volumetric_end", 40.0)
setp(ee, "clamp_surface_indirect", 12.0)
sc.render.use_motion_blur = False
vs = sc.view_settings
for vt in ("AgX", "Filmic"):
    if setp(vs, "view_transform", vt): break
for look in ("AgX - Punchy", "AgX - Medium High Contrast", "None"):
    if setp(vs, "look", look): break
vs.exposure = float(os.environ.get("EXPOSURE", "0.5")); vs.gamma = 1.0
# ------------------------------------------------------------------ helpers
def link(o):
    sc.collection.objects.link(o); return o
def cube(name, loc, dims, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object; o.name = name; o.scale = dims
    bpy.ops.object.transform_apply(scale=True); o.data.materials.append(mat); box_uv(o); return o
def import_glb(path):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]; bpy.context.view_layer.update(); return new
def world_bbox(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs if o.type == "MESH" for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi
def group(objs, name):
    root = bpy.data.objects.new(name, None); link(root)
    for o in [o for o in objs if o.parent is None or o.parent not in objs]:
        mw = o.matrix_world.copy(); o.parent = root; o.matrix_world = mw
    return root
def place_group(root, objs, location, rot_z=0.0, scale=1.0, floor=True):
    root.rotation_euler = (0, 0, rot_z); root.scale = (scale,) * 3
    bpy.context.view_layer.update()
    lo, hi = world_bbox(objs)
    off = Vector(location) - Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z if floor else (lo.z + hi.z) / 2))
    root.location = root.location + off; bpy.context.view_layer.update()
    return world_bbox(objs)
def key(o, path, frame, value=None):
    if value is not None: setattr(o, path, value)
    o.keyframe_insert(data_path=path, frame=frame)
def smooth_keys(o):
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
def set_material(objs, pred, mat):
    for o in objs:
        if o.type != "MESH": continue
        for i, m in enumerate(o.data.materials):
            if m and pred(m.name): o.data.materials[i] = mat
# ------------------------------------------------------------------ sky, sun, mist
SUN_AZ, SUN_EL = -24.0, 12.0
SUN_DIR = Vector((math.cos(math.radians(SUN_EL)) * math.cos(math.radians(SUN_AZ)),
                  math.cos(math.radians(SUN_EL)) * math.sin(math.radians(SUN_AZ)),
                  math.sin(math.radians(SUN_EL)))).normalized()
w = bpy.data.worlds.new("World"); sc.world = w; w.use_nodes = True
nt = w.node_tree; bg = nt.nodes["Background"]
HDRI = os.environ.get("HDRI") or os.path.join(TEXDIR, "hdri", "kloppenheim_06_puresky_2k.hdr")
SKY = "procedural"
if os.path.exists(HDRI):
    import numpy as np
    env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(HDRI)
    # find the sky's own sun so the lamp, the highlight in the glass and the sky agree
    iw, ih = env.image.size
    px = np.array(env.image.pixels[:], dtype=np.float32).reshape(ih, iw, 4)
    lum = px[:, :, 0] * 0.2126 + px[:, :, 1] * 0.7152 + px[:, :, 2] * 0.0722
    jj, ii = np.unravel_index(np.argmax(lum), lum.shape)
    hdri_az = -((ii + 0.5) / iw - 0.5) * 360.0
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0, 0, math.radians(-(SUN_AZ - hdri_az)))
    nt.links.new(tc.outputs["Generated"], mp.inputs[0]); nt.links.new(mp.outputs[0], env.inputs[0])
    # the lamp is the only hard sun: the sky's disc is clamped to a warm glow the glass can mirror
    vm = nt.nodes.new("ShaderNodeVectorMath"); vm.operation = "MINIMUM"; vm.inputs[1].default_value = (float(os.environ.get("SKY_CLAMP", "6")),) * 3
    nt.links.new(env.outputs[0], vm.inputs[0]); nt.links.new(vm.outputs[0], bg.inputs[0])
    bg.inputs[1].default_value = float(os.environ.get("SKY_STRENGTH", "0.7"))
    band_lo, band_hi = int(ih * 0.50), int(ih * 0.56)
    HAZE_COL = [float(px[band_lo:band_hi, :, k].mean()) * bg.inputs[1].default_value * 0.75 for k in range(3)]
    SKY = "%s az=%.1f" % (os.path.basename(HDRI), hdri_az)
else:
    sky = nt.nodes.new("ShaderNodeTexSky")
    try: sky.sky_type = "HOSEK_WILKIE"; sky.sun_direction = SUN_DIR; sky.turbidity = 4.5; sky.ground_albedo = 0.25
    except Exception: sky.sky_type = "PREETHAM"; sky.sun_direction = SUN_DIR; sky.turbidity = 4.5
    nt.links.new(sky.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = 2.0
    HAZE_COL = [0.78, 0.62, 0.50]
setp(w, "sun_threshold", 0.0)
w.mist_settings.start = float(os.environ.get("MIST_START", "80")); w.mist_settings.depth = float(os.environ.get("MIST_DEPTH", "700")); setp(w.mist_settings, "falloff", "QUADRATIC")
setp(sc.view_layers[0], "use_pass_mist", True); setp(sc.view_layers[0], "use_pass_z", True)
sun = link(bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN")))
sun.data.energy = float(os.environ.get("SUN_ENERGY", "12.0")); sun.data.color = (1.0, 0.78, 0.55); sun.data.angle = math.radians(1.2)
sun.rotation_euler = (-SUN_DIR).to_track_quat("-Z", "Y").to_euler()
# ------------------------------------------------------------------ ground, streets, lots
ground_mat = pbr_material("Ground", "asphalt_02", tile=14.0, bump=0.1, tint=(0.55, 0.55, 0.56), rough_add=0.08)
pavement = pbr_material("Pavement", "concrete_pavement_02", tile=3.0, bump=0.35, bump_dist=0.02, tint=(0.92, 0.91, 0.88), rough_add=0.05)
bpy.ops.mesh.primitive_plane_add(size=1600, location=(0, 0, -0.02))
ground = bpy.context.active_object; ground.name = "Ground"; ground.data.materials.append(ground_mat); box_uv(ground)
BLOCK, STREET = 46.0, 14.0
GRID_I, GRID_J = range(-5, 8), range(-5, 6)
road_x = road_material("RoadAlongY", along="y", width=STREET)
road_y = road_material("RoadAlongX", along="x", width=STREET)
avenue_mat = road_material("Avenue", along="x", width=STREET + 14, lanes=4)
def street(name, loc, dims, mat):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    o = bpy.context.active_object; o.name = name; o.scale = (dims[0], dims[1], 1)
    bpy.ops.object.transform_apply(scale=True); o.data.materials.append(mat); box_uv(o); return o
for i in range(min(GRID_I) - 1, max(GRID_I) + 1):
    street(f"StreetX{i}", ((i + 0.5) * BLOCK, 0, 0.005), (STREET, 1600), road_x)
for j in range(min(GRID_J) - 1, max(GRID_J) + 1):
    street(f"StreetY{j}", (0, (j + 0.5) * BLOCK, 0.005), (1600, STREET), road_y)
street("Avenue", (BLOCK * 4.0, 0, 0.012), (BLOCK * 8, STREET + 14), avenue_mat)
# raised paved lots, so the streets read as streets from the air
KERB = 0.14
for i in range(min(GRID_I) - 1, max(GRID_I) + 2):
    for j in range(min(GRID_J) - 1, max(GRID_J) + 2):
        if (i, j) == (0, 0) or (j == 0 and i >= 1): continue
        cube(f"Lot_{i}_{j}", (i * BLOCK, j * BLOCK, KERB / 2), (BLOCK - STREET, BLOCK - STREET, KERB), pavement)
# ------------------------------------------------------------------ the hero tower (generated, so its windows are its own)
office = curtain_wall_material("OfficeCurtainWall")
FACADES = [office,
           curtain_wall_material("FacadeSmooth", win_w=2.4, floor_h=3.3, lit_fraction=0.08, concrete_key="white_plaster_02"),
           curtain_wall_material("FacadeStone", win_w=3.4, floor_h=3.8, lit_fraction=0.04, concrete_key="precast_concrete_wall")]
roof_mat = pbr_material("Roof", "white_plaster_02", tile=4.0, bump=0.2, tint=(0.62, 0.62, 0.61), rough_add=0.1)
WIN_PITCH, FLOOR_PITCH = 3.0, 3.6                      # the grid curtain_wall_material draws, in metres
TOWER_D, TOWER_W, FLOORS = 24.0, 30.0, 13
TOWER_H = FLOORS * FLOOR_PITCH
FX = TOWER_D / 2                                       # the front face the camera flies at
SHELL = 0.35
tower = cube("HeroTower", (0, 0, TOWER_H / 2), (TOWER_D, TOWER_W, TOWER_H), office)
shell = tower.modifiers.new("shell", "SOLIDIFY"); shell.thickness = SHELL; shell.offset = -1
bpy.context.view_layer.objects.active = tower; bpy.ops.object.modifier_apply(modifier="shell")
cube("Podium", (0, 0, FLOOR_PITCH), (TOWER_D + 10, TOWER_W + 10, FLOOR_PITCH * 2), office)
cube("Plaza", (0, 0, KERB / 2), (TOWER_W + 14, TOWER_W + 14, KERB), pavement)
cube("RoofSlab", (0, 0, TOWER_H + 0.25), (TOWER_D + 0.4, TOWER_W + 0.4, 0.5), roof_mat)
cube("RoofBox", (-3, 3, TOWER_H + 2.0), (8, 10, 3.2), roof_mat)
# the two window cells the camera uses: floor FLOOR_N, cells k=-1 and k=0 on the +x face, exactly where the material draws glass
FLOOR_N = 4
FLOOR_Z = FLOOR_N * FLOOR_PITCH
SILL = FLOOR_Z + 0.20 * FLOOR_PITCH
WIN_TOP = FLOOR_Z + 0.86 * FLOOR_PITCH
CELLS = [(-WIN_PITCH + 0.10 * WIN_PITCH, -WIN_PITCH + 0.90 * WIN_PITCH), (0.10 * WIN_PITCH, 0.90 * WIN_PITCH)]
WY = 0.0; WIN_H = WIN_TOP - SILL
WC = Vector((FX, WY, (SILL + WIN_TOP) / 2))
PANE = Vector((FX, (CELLS[0][0] + CELLS[0][1]) / 2, (SILL + WIN_TOP) / 2))
ROOM_D, ROOM_W, ROOM_H = 6.4, 9.0, 3.4
CEIL_Z = FLOOR_Z + ROOM_H
for (ya, yb) in CELLS:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(FX, (ya + yb) / 2, (SILL + WIN_TOP) / 2))
    cutter = bpy.context.active_object; cutter.scale = (1.6, yb - ya, WIN_TOP - SILL)
    bpy.context.view_layer.update()
    m = tower.modifiers.new("cut", "BOOLEAN"); m.operation = "DIFFERENCE"; m.object = cutter; m.solver = "EXACT"
    bpy.context.view_layer.objects.active = tower
    try: bpy.ops.object.modifier_apply(modifier="cut")
    except Exception:
        m.solver = "FAST"; bpy.ops.object.modifier_apply(modifier="cut")
    bpy.data.objects.remove(cutter)
box_uv(tower)   # the boolean and the shell made new faces
# the company mark near the top of the front face
MARK = os.environ.get("MARK_PNG")
if MARK and os.path.exists(MARK):
    sm = bpy.data.materials.new("SignMat"); sm.use_nodes = True; snt = sm.node_tree; sb = snt.nodes["Principled BSDF"]
    st = snt.nodes.new("ShaderNodeTexImage"); st.image = bpy.data.images.load(MARK)
    sb.inputs["Base Color"].default_value = (0.95, 0.95, 0.93, 1); sb.inputs["Roughness"].default_value = 0.4
    sb.inputs["Emission Color"].default_value = (1.0, 0.96, 0.88, 1); sb.inputs["Emission Strength"].default_value = 1.4
    snt.links.new(st.outputs["Alpha"], sb.inputs["Alpha"])
    setp(sm, "surface_render_method", "BLENDED"); setp(sm, "blend_method", "BLEND")
    bpy.ops.mesh.primitive_plane_add(size=6.5, location=(FX + 0.03, TOWER_W / 2 - 5.5, TOWER_H - 5.0), rotation=(math.pi / 2, 0, math.pi / 2))
    sign = bpy.context.active_object; sign.name = "Sign"; sign.data.materials.append(sm)
# ------------------------------------------------------------------ the office behind the windows
wall = pbr_material("OfficeWall", "plastered_wall_02", tile=3.0, bump=0.15, bump_dist=0.01, tint=(0.97, 0.96, 0.93), rough_add=0.05, ao=0.4, interp="Cubic")
carpet = carpet_material("Carpet")
ceilm = ceiling_material("Ceiling")
panel_light = plain_material("PanelLight", (1, 1, 1, 1), rough=0.5, emit=(1.0, 0.97, 0.90, 1), emit_strength=3.5)
part_glass = plain_material("PartitionGlass", (0.85, 0.92, 0.92, 1), rough=0.04, alpha=0.14)
metal_frame = plain_material("FrameMetal", (0.08, 0.08, 0.085, 1), rough=0.4, metal=0.9)
RX1 = FX - SHELL; RX0 = RX1 - ROOM_D
RY0, RY1 = WY - ROOM_W / 2, WY + ROOM_W / 2
TH = 0.30
cube("RoomFloor", ((RX0 + RX1) / 2, WY, FLOOR_Z - 0.05), (ROOM_D + 0.6, ROOM_W + 2.6, 0.1), carpet)
cube("RoomCeiling", ((RX0 + RX1) / 2, WY, CEIL_Z + 0.05), (ROOM_D + 0.6, ROOM_W + 2.6, 0.1), ceilm)
cube("RoomBack", (RX0 - TH / 2, WY + 1.0, (FLOOR_Z + CEIL_Z) / 2), (TH, ROOM_W + 2.6, ROOM_H), wall)
cube("RoomSideA", ((RX0 + RX1) / 2, RY0 - TH / 2, (FLOOR_Z + CEIL_Z) / 2), (ROOM_D + 0.6, TH, ROOM_H), wall)
PY = RY1
for k in range(4):
    cube(f"PartPost{k}", ((RX0 + 0.3) + k * (ROOM_D - 0.6) / 3, PY, (FLOOR_Z + CEIL_Z) / 2), (0.06, 0.06, ROOM_H), metal_frame)
cube("PartRail", ((RX0 + RX1) / 2, PY, CEIL_Z - 0.03), (ROOM_D + 0.6, 0.08, 0.06), metal_frame)
cube("PartBase", ((RX0 + RX1) / 2, PY, FLOOR_Z + 0.03), (ROOM_D + 0.6, 0.08, 0.06), metal_frame)
cube("PartGlass", ((RX0 + RX1) / 2, PY, (FLOOR_Z + CEIL_Z) / 2), (ROOM_D + 0.6, 0.012, ROOM_H - 0.12), part_glass)
cube("CorridorWall", ((RX0 + RX1) / 2, PY + 2.0 + TH / 2, (FLOOR_Z + CEIL_Z) / 2), (ROOM_D + 0.6, TH, ROOM_H), wall)
# skirting along the walls, the kind of small thing a real room has
skirt = plain_material("Skirting", (0.16, 0.15, 0.14, 1), rough=0.5)
cube("SkirtBack", (RX0 + 0.02, WY + 1.0, FLOOR_Z + 0.05), (0.04, ROOM_W + 2.6, 0.10), skirt)
cube("SkirtSide", ((RX0 + RX1) / 2, RY0 + 0.02, FLOOR_Z + 0.05), (ROOM_D + 0.6, 0.04, 0.10), skirt)
# the inside face of the window wall: sill, head, the piers between and beside the two cells
wx = RX1 - TH / 2
cube("WinWallBelow", (wx, WY + 1.0, (FLOOR_Z + SILL) / 2), (TH, ROOM_W + 2.6, SILL - FLOOR_Z), wall)
cube("WinWallAbove", (wx, WY + 1.0, (WIN_TOP + CEIL_Z) / 2), (TH, ROOM_W + 2.6, CEIL_Z - WIN_TOP), wall)
cube("WinWallL", (wx, (RY0 - 0.3 + CELLS[0][0]) / 2, (FLOOR_Z + CEIL_Z) / 2), (TH, CELLS[0][0] - (RY0 - 0.3), ROOM_H), wall)
cube("WinWallPier", (wx, (CELLS[0][1] + CELLS[1][0]) / 2, (FLOOR_Z + CEIL_Z) / 2), (TH, CELLS[1][0] - CELLS[0][1], ROOM_H), wall)
cube("WinWallR", (wx, (CELLS[1][1] + RY1 + 2.3) / 2, (FLOOR_Z + CEIL_Z) / 2), (TH, (RY1 + 2.3) - CELLS[1][1], ROOM_H), wall)
sill_mat = plain_material("SillStone", (0.82, 0.80, 0.76, 1), rough=0.35, spec=0.6)
cube("SillBoard", (RX1 - 0.16, WY, SILL - 0.015), (0.36, CELLS[1][1] - CELLS[0][0] + 0.5, 0.03), sill_mat)
for k, (px, py) in enumerate([(RX0 + 1.6, WY + 0.2), (RX0 + 4.4, WY + 0.2), (RX0 + 3.0, WY - 3.2), (RX0 + 3.0, WY + 3.4)]):
    cube(f"Panel{k}", (px, py, CEIL_Z - 0.02), (1.2, 0.6, 0.04), panel_light)
    L = link(bpy.data.objects.new(f"PanelLight{k}", bpy.data.lights.new(f"PanelLight{k}", "AREA")))
    L.location = (px, py, CEIL_Z - 0.06); L.data.energy = float(os.environ.get("PANEL_W", "14")); L.data.size = 1.2; L.data.size_y = 0.6; L.data.color = (1.0, 0.96, 0.9)

# slim metal frames around each cell, sitting in the reveal like the rest of the facade would
FT = 0.07
for (ya, yb) in CELLS:
    cy = (ya + yb) / 2; cw = yb - ya
    cube("CellFrameTop", (FX - 0.12, cy, WIN_TOP - FT / 2), (0.24, cw, FT), metal_frame)
    cube("CellFrameBottom", (FX - 0.12, cy, SILL + FT / 2), (0.24, cw, FT), metal_frame)
    cube("CellFrameL", (FX - 0.12, ya + FT / 2, (SILL + WIN_TOP) / 2), (0.24, FT, WIN_H), metal_frame)
    cube("CellFrameR", (FX - 0.12, yb - FT / 2, (SILL + WIN_TOP) / 2), (0.24, FT, WIN_H), metal_frame)

# the glass in those two cells is the facade's own reflective glass, broken into shards that stay put until the shatter
shard_glass = plain_material("ShardGlass", (0.10, 0.16, 0.20, 1), rough=0.06, metal=0.5, alpha=0.55, spec=0.8)
# dithered transparency: no per-shard sorting, several times cheaper than blended with this many overlapping panes
setp(shard_glass, "surface_render_method", "BLENDED"); setp(shard_glass, "blend_method", "BLEND"); setp(shard_glass, "use_backface_culling", False)
setp(part_glass, "surface_render_method", "DITHERED"); setp(part_glass, "blend_method", "HASHED")
T_SHATTER = 10.0
for (ya, yb) in CELLS:
    NX, NZ = 6, 6
    gy = [ya + FT + (yb - ya - 2 * FT) * i / NX for i in range(NX + 1)]
    gz = [SILL + FT + (WIN_H - 2 * FT) * j / NZ for j in range(NZ + 1)]
    verts = {}
    for i in range(NX + 1):
        for j in range(NZ + 1):
            jy = random.uniform(-0.3, 0.3) * (yb - ya) / NX if 0 < i < NX else 0
            jz = random.uniform(-0.3, 0.3) * WIN_H / NZ if 0 < j < NZ else 0
            verts[(i, j)] = Vector((FX - 0.05, gy[i] + jy, gz[j] + jz))
    for i in range(NX):
        for j in range(NZ):
            quad = [verts[(i, j)], verts[(i + 1, j)], verts[(i + 1, j + 1)], verts[(i, j + 1)]]
            c = sum(quad, Vector()) / 4
            me = bpy.data.meshes.new("Shard"); me.from_pydata([v - c for v in quad], [], [[0, 1, 2, 3]]); me.update()
            o = link(bpy.data.objects.new("Shard", me)); o.location = c; o.data.materials.append(shard_glass)
            sol = o.modifiers.new("thick", "SOLIDIFY"); sol.thickness = 0.008; sol.offset = 0
            o.visible_shadow = False   # seventy moving shadow casters doubled the frame time
            f0 = f(T_SHATTER) + random.randint(0, 3)
            key(o, "location", f0); key(o, "rotation_euler", f0)
            speed = random.uniform(1.0, 1.8)
            p1 = o.location + Vector((-random.uniform(1.5, 3.0) * speed, random.uniform(-0.6, 0.6), random.uniform(-0.3, 0.2)))
            key(o, "location", f0 + 10, p1); key(o, "rotation_euler", f0 + 10, (random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1)))
            p2 = p1 + Vector((-random.uniform(0.8, 2.0) * speed, random.uniform(-0.8, 0.8), 0)); p2.z = FLOOR_Z + 0.01
            key(o, "location", f0 + 40, p2); key(o, "rotation_euler", f0 + 40, (random.uniform(-4, 4), random.uniform(-4, 4), random.uniform(-4, 4)))
            key(o, "location", f0 + 60, p2)
            smooth_keys(o)

vol = cube("Haze", ((RX0 + RX1) / 2, WY, (FLOOR_Z + CEIL_Z) / 2), (ROOM_D - 0.1, ROOM_W - 0.1, ROOM_H - 0.1), bpy.data.materials.new("HazeMat"))
vm = vol.data.materials[0]; vm.use_nodes = True; vnt = vm.node_tree
for n in list(vnt.nodes): vnt.nodes.remove(n)
outn = vnt.nodes.new("ShaderNodeOutputMaterial"); vsc = vnt.nodes.new("ShaderNodeVolumeScatter")
vsc.inputs["Density"].default_value = 0.02; vsc.inputs["Anisotropy"].default_value = 0.55
vnt.links.new(vsc.outputs[0], outn.inputs["Volume"]); vol.display_type = "WIRE"

# ------------------------------------------------------------------ the generated city
OUTDOOR = [(0.0, Vector((170, -20, 40))), (4.2, Vector((110, -12, 28))), (8.3, Vector((40, PANE.y + 1.0, PANE.z + 2.2))), (10.0, Vector((FX + 3.2, PANE.y, PANE.z)))]
samples = []
for (ta, pa), (tb, pb) in zip(OUTDOOR, OUTDOOR[1:]):
    n = max(2, int((tb - ta) / 0.15))
    samples += [pa.lerp(pb, k / n) for k in range(n + 1)]
sun_samples = [WC + SUN_DIR * d for d in range(0, 700, 3)]
def clear_of_camera(cx, cy, wdt, dep, hgt, margin=8.0):
    for s in samples:
        if abs(s.x - cx) < wdt / 2 + margin and abs(s.y - cy) < dep / 2 + margin and s.z < hgt + 6.0:
            return False
    for s in sun_samples:
        if abs(s.x - cx) < wdt / 2 + 5.0 and abs(s.y - cy) < dep / 2 + 5.0 and s.z < hgt + 3.0:
            return False
    return True
placed = 0
def office_block(name, cx, cy, wdt, dep, hgt):
    o = cube(name, (cx, cy, hgt / 2), (wdt, dep, hgt), random.choice(FACADES))
    # roof plant box on anything tall
    if hgt > 30:
        cube(name + "_roof", (cx + random.uniform(-wdt * 0.2, wdt * 0.2), cy + random.uniform(-dep * 0.2, dep * 0.2), hgt + 1.5), (wdt * 0.3, dep * 0.3, 3.0), roof_mat)
    return o
for i in GRID_I:
    for j in GRID_J:
        if (i, j) == (0, 0): continue
        if j == 0 and i >= 1: continue                      # the avenue
        dist = math.hypot(i, j)
        if dist <= 1.5:
            hgt = random.uniform(11, 20)                     # low around the tower so it stands out
        elif dist <= 2.6:
            hgt = random.uniform(18, 42)
        else:
            hgt = random.uniform(28, 95) if random.random() < 0.6 else random.uniform(16, 40)
        wdt = random.uniform(16, 30); dep = random.uniform(16, 30)
        cx = i * BLOCK + random.uniform(-4, 4); cy = j * BLOCK + random.uniform(-4, 4)
        if not clear_of_camera(cx, cy, wdt, dep, hgt): continue
        office_block(f"Office_{i}_{j}", cx, cy, wdt, dep, hgt)
        if random.random() < 0.35:                          # a second, smaller building on the same lot
            bx = cx + random.choice([-1, 1]) * (wdt / 2 + 6); by = cy + random.uniform(-6, 6); bw = random.uniform(8, 14); bd = random.uniform(10, 16); bh = random.uniform(8, 18)
            if clear_of_camera(bx, by, bw, bd, bh): office_block(f"Office_{i}_{j}b", bx, by, bw, bd, bh)
        placed += 1

# ------------------------------------------------------------------ the desk (against the back wall, screen facing the window)
desk = import_glb(os.path.join(DL, "Desk by dook - EtJlOllzbf.glb"))
droot = group(desk, "DeskSet"); bpy.context.view_layer.update()
def obj_center(part):
    os_ = [o for o in desk if part.lower() in o.name.lower() and o.type == "MESH"]
    lo, hi = world_bbox(os_); return (lo + hi) / 2
chair_c = obj_center("chair"); all_lo, all_hi = world_bbox(desk); set_c = (all_lo + all_hi) / 2
v = chair_c - set_c; v.z = 0
DESK_ROT = -math.atan2(v.y, v.x)
lo, hi = place_group(droot, desk, (RX0 + 1.05, WY + 0.2, FLOOR_Z), rot_z=DESK_ROT, scale=1.0)
for o in [o for o in desk if "chair" in o.name.lower() and o.type == "MESH"]:
    c = obj_center("chair")
    o.matrix_world = Matrix.Translation(c + Vector((0.35, 1.15, 0))) @ Matrix.Rotation(math.radians(40), 4, "Z") @ Matrix.Translation(-c) @ o.matrix_world
bpy.context.view_layer.update()
# real surfaces on the low-poly set: wood on the desk, leather on the chair, honest plastics and metals elsewhere
for o in desk:
    if o.type == "MESH": box_uv(o, space="object")
desk_wood = pbr_material("DeskWood", "dark_wood", tile=1.6, bump=0.12, bump_dist=0.005, tint=(0.80, 0.74, 0.68), rough_mul=0.55, rough_add=0.12, spec=0.6, interp="Cubic")
desk_wood2 = pbr_material("DeskWoodTop", "wood_table_001", tile=1.4, bump=0.12, bump_dist=0.005, tint=(1.05, 1.0, 0.95), rough_mul=0.5, rough_add=0.14, spec=0.6, interp="Cubic")
leather = pbr_material("ChairLeather", "brown_leather", tile=0.9, bump=0.25, bump_dist=0.004, tint=(0.62, 0.55, 0.50), rough_add=0.05, spec=0.45, interp="Cubic")
leather_dark = pbr_material("ChairLeatherDark", "brown_leather", tile=0.9, bump=0.25, bump_dist=0.004, tint=(0.16, 0.14, 0.13), rough_add=0.05, spec=0.4, interp="Cubic")
set_material(desk, lambda n: n.startswith("DarkWood"), desk_wood)
set_material(desk, lambda n: n.startswith("Wood."), desk_wood2)
set_material(desk, lambda n: n == "Executive.003", leather)
set_material(desk, lambda n: n == "Executive__2.003", leather_dark)
for o in desk:
    if o.type != "MESH": continue
    for m in o.data.materials:
        if not m or not m.use_nodes or "Principled BSDF" not in m.node_tree.nodes or m.name in ("DeskWood", "DeskWoodTop", "ChairLeather", "ChairLeatherDark"): continue
        b = m.node_tree.nodes["Principled BSDF"]; n = m.name.lower()
        if "metal" in n or n.startswith("executive__3") or n.startswith("black."):
            b.inputs["Metallic"].default_value = 0.9; b.inputs["Roughness"].default_value = 0.32
        elif n.startswith("screen") and "phone" in o.name.lower():
            b.inputs["Metallic"].default_value = 0.0; b.inputs["Base Color"].default_value = (0.02, 0.03, 0.03, 1); b.inputs["Roughness"].default_value = 0.15
            b.inputs["Emission Color"].default_value = (0.35, 0.75, 0.55, 1); b.inputs["Emission Strength"].default_value = 0.6
        else:
            b.inputs["Metallic"].default_value = 0.0
            if b.inputs["Roughness"].default_value >= 0.97: b.inputs["Roughness"].default_value = 0.55

screen_obj = [o for o in desk if "screen" in o.name.lower() and o.type == "MESH"][0]
me = screen_obj.data
mat_idx = [i for i, m in enumerate(me.materials) if m and m.name.lower().startswith("screen")]
polys = [p for p in me.polygons if p.material_index in mat_idx] or sorted(me.polygons, key=lambda p: -p.area)[:1]
mw = screen_obj.matrix_world
pts = [mw @ me.vertices[i].co for p in polys for i in p.vertices]
nrm = (mw.to_3x3() @ polys[0].normal).normalized()
if nrm.dot(Vector((1, 0, 0))) < 0: nrm = -nrm
up = Vector((0, 0, 1)); up = (up - nrm * up.dot(nrm)).normalized(); right = up.cross(nrm).normalized()
ctr = sum(pts, Vector()) / len(pts)
us = [(p - ctr).dot(right) for p in pts]; vsx = [(p - ctr).dot(up) for p in pts]
SCREEN_W, SCREEN_H = max(us) - min(us), max(vsx) - min(vsx)
MC = ctr + right * (min(us) + max(us)) / 2 + up * (min(vsx) + max(vsx)) / 2 + nrm * 0.004
corners = [MC + right * a + up * b for a, b in ((-SCREEN_W / 2, -SCREEN_H / 2), (SCREEN_W / 2, -SCREEN_H / 2), (SCREEN_W / 2, SCREEN_H / 2), (-SCREEN_W / 2, SCREEN_H / 2))]
lme = bpy.data.meshes.new("LogoScreen"); lme.from_pydata([c - MC for c in corners], [], [[0, 1, 2, 3]]); lme.update()
uvattr = lme.attributes.new("UVMap", "FLOAT2", "CORNER")
for li, uv in zip(range(4), ((0, 0), (1, 0), (1, 1), (0, 1))): uvattr.data[li].vector = uv
logo = link(bpy.data.objects.new("LogoScreen", lme)); logo.location = MC
lm = bpy.data.materials.new("LogoMat"); lm.use_nodes = True; lnt = lm.node_tree
lb = lnt.nodes["Principled BSDF"]; lb.inputs["Base Color"].default_value = (0.01, 0.01, 0.012, 1); lb.inputs["Roughness"].default_value = 0.18
tex = lnt.nodes.new("ShaderNodeTexImage"); tex.image = bpy.data.images.load(LOGO)
lnt.links.new(tex.outputs["Color"], lb.inputs["Emission Color"])
lb.inputs["Emission Strength"].default_value = 0.0; lb.inputs["Emission Strength"].keyframe_insert("default_value", frame=f(16.0))
lb.inputs["Emission Strength"].default_value = 3.8; lb.inputs["Emission Strength"].keyframe_insert("default_value", frame=f(17.6))
logo.data.materials.append(lm)
for m in me.materials:
    if m and m.name.lower().startswith("screen") and m.use_nodes and "Principled BSDF" in m.node_tree.nodes:
        m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.005, 0.005, 0.006, 1)

lamp_objs = [o for o in desk if "light" in o.name.lower() and o.type == "MESH"]
if lamp_objs:
    llo, lhi = world_bbox(lamp_objs); lamp_pos = Vector(((llo.x + lhi.x) / 2, (llo.y + lhi.y) / 2, lhi.z - 0.05))
else:
    lamp_pos = MC + Vector((0, 0.7, 0.2))
pl = link(bpy.data.objects.new("DeskLamp", bpy.data.lights.new("DeskLamp", "POINT")))
pl.location = lamp_pos + Vector((0.05, 0, -0.03)); pl.data.energy = 60; pl.data.color = (1.0, 0.72, 0.45); pl.data.shadow_soft_size = 0.12

KF = os.path.join(ASSETS, "kenney_furniture-kit", "Models", "GLTF format")
shelf_wood = pbr_material("ShelfWood", "wood_table_001", tile=0.8, bump=0.1, bump_dist=0.004, tint=(0.55, 0.50, 0.46), rough_mul=0.6, rough_add=0.15, spec=0.5, interp="Cubic")
def kenney(name, loc, rot_z=0.0, scale=1.55, material=None):
    objs = import_glb(os.path.join(KF, name + ".glb"))
    r = group(objs, "K_" + name); place_group(r, objs, loc, rot_z=rot_z, scale=scale)
    for o in objs:
        if o.type != "MESH": continue
        box_uv(o, space="object")
        if material:
            o.data.materials.clear(); o.data.materials.append(material)
        for m in o.data.materials:
            if m and m.use_nodes and "Principled BSDF" in m.node_tree.nodes and m is not material:
                b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Metallic"].default_value = 0.0
                b.inputs["Roughness"].default_value = 0.62; b.inputs["Specular IOR Level"].default_value = 0.35
    return objs
shelf = kenney("bookcaseClosedWide", (RX0 + 0.45, WY - 3.3, FLOOR_Z), rot_z=math.radians(-90), scale=1.6, material=shelf_wood)
slo, shi = world_bbox(shelf)
kenney("plantSmall2", (RX0 + 0.45, WY - 3.0, shi.z), scale=1.7)
kenney("pottedPlant", (RX0 + 0.6, WY + 2.6, FLOOR_Z), scale=1.8)
kenney("pottedPlant", (RX1 - 0.9, WY - 3.9, FLOOR_Z), scale=1.5)
kenney("plantSmall1", (RX0 + 1.3, WY + 1.25, FLOOR_Z + 0.76), scale=1.3)

mote_mat = plain_material("Mote", (1.0, 0.95, 0.85, 1), rough=0.6, emit=(1.0, 0.9, 0.7, 1), emit_strength=1.6)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.0, location=(0, 0, -50))
mote_src = bpy.context.active_object; mote_src.name = "MoteSrc"; mote_src.data.materials.append(mote_mat); mote_src.hide_render = True
for i in range(170):
    p = None
    for _ in range(12):
        p = Vector((random.uniform(RX0 + 0.3, RX1 - 0.3), random.uniform(RY0 + 0.3, RY1 - 0.3), random.uniform(FLOOR_Z + 0.2, CEIL_Z - 0.3)))
        if (p - MC).length > 0.8: break
    m = link(bpy.data.objects.new(f"Mote{i}", mote_src.data)); m.scale = (random.uniform(0.004, 0.009),) * 3; m.visible_shadow = False
    m.location = p; key(m, "location", 1)
    for fr in (200, 400, 600):
        p = p + Vector((random.uniform(-0.2, 0.2), random.uniform(-0.2, 0.2), random.uniform(-0.15, 0.1)))
        key(m, "location", fr, p)
    smooth_keys(m)

# ------------------------------------------------------------------ camera
cam = link(bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera")))
cam.data.lens = 32; cam.data.sensor_width = 36; cam.data.clip_start = 0.02; cam.data.clip_end = 4000
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 11.0
tgt = link(bpy.data.objects.new("CamTarget", None))
con = cam.constraints.new("TRACK_TO"); con.target = tgt; con.track_axis = "TRACK_NEGATIVE_Z"; con.up_axis = "UP_Y"
cam.data.dof.focus_object = tgt; sc.camera = cam
hfov = 2 * math.atan(cam.data.sensor_width / (2 * cam.data.lens))
FILL_D = SCREEN_W / (2 * math.tan(hfov / 2)) * 0.97
CLOSE = MC + nrm * FILL_D
HOLD_CAM = Vector((MC.x + 3.0, MC.y + 0.5, MC.z + 0.45))
path = [
    (0.0,  tuple(OUTDOOR[0][1]),    (0, 0, TOWER_H * 0.6),          11),
    (4.2,  tuple(OUTDOOR[1][1]),    (5, WY, TOWER_H * 0.45),        11),
    (8.3,  tuple(OUTDOOR[2][1]),    (FX, PANE.y, PANE.z),           11),
    (10.0, tuple(OUTDOOR[3][1]),    (FX - 8, PANE.y - 0.2, PANE.z - 0.8), 11),
    (11.8, (FX - 2.2, PANE.y + 0.2, PANE.z - 0.35), (RX0 + 1.0, WY + 0.1, FLOOR_Z + 1.2), 11),
    (13.6, (FX - 3.0, WY + 0.9, FLOOR_Z + 1.75), (MC.x, MC.y, MC.z + 0.1), 9),
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

from render_output import configure_compositor, write_scene
COMP = configure_compositor(sc, HAZE_COL)

# ------------------------------------------------------------------ output
from surface_details import refine_surfaces
refine_surfaces(desk)
info = {"tower_h": round(TOWER_H, 1), "window_center": [round(v, 2) for v in WC],
        "pane": [round(v, 2) for v in PANE], "floor_z": round(FLOOR_Z, 2), "room": [round(RX0, 2), round(RX1, 2), round(RY0, 2), round(RY1, 2)],
        "monitor": [round(v, 2) for v in MC], "buildings": placed, "compositor": COMP, "sky": SKY, "textures": TEXDIR}
write_scene(sc, MODE, OUT, RANGE, NF, f, info, cam, tgt, SUN_DIR)
