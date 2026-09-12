"""Compositing and frame export shared by hero previews and production renders."""
import bpy, os, math, json
from mathutils import Vector
from materials import setp

def configure_compositor(sc, HAZE_COL):
    COMP = "none"
    try:
        if hasattr(sc, "compositing_node_group"):
            tree = bpy.data.node_groups.new("HeroComp", "CompositorNodeTree"); sc.compositing_node_group = tree
            setp(sc.render, "use_compositing", True)
            try: tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
            except Exception: pass
            outn = tree.nodes.new("NodeGroupOutput")
        else:
            sc.use_nodes = True; tree = sc.node_tree
            for n in list(tree.nodes): tree.nodes.remove(n)
            outn = tree.nodes.new("CompositorNodeComposite")
        rl = tree.nodes.new("CompositorNodeRLayers"); rl.scene = sc
        img = rl.outputs["Image"]
        # distance haze from the mist pass: the far city dissolves into the sky the way real air does
        if "Mist" in rl.outputs:
            try:
                amt = tree.nodes.new("ShaderNodeMath"); amt.operation = "MULTIPLY"; amt.inputs[1].default_value = float(os.environ.get("HAZE", "0.32"))
                tree.links.new(rl.outputs["Mist"], amt.inputs[0])
                geo = tree.nodes.new("ShaderNodeMath"); geo.operation = "LESS_THAN"; geo.inputs[1].default_value = 1.0e5   # the sky's depth is effectively infinite
                tree.links.new(rl.outputs["Depth"] if "Depth" in rl.outputs else rl.outputs["Z"], geo.inputs[0])
                amt2 = tree.nodes.new("ShaderNodeMath"); amt2.operation = "MULTIPLY"; tree.links.new(amt.outputs[0], amt2.inputs[0]); tree.links.new(geo.outputs[0], amt2.inputs[1])
                amt = amt2
                hz = tree.nodes.new("ShaderNodeMix"); hz.data_type = "RGBA"; hz.inputs[7].default_value = (HAZE_COL[0], HAZE_COL[1], HAZE_COL[2], 1)
                tree.links.new(amt.outputs[0], hz.inputs[0]); tree.links.new(img, hz.inputs[6]); img = hz.outputs[2]
                COMP = "haze "
            except Exception as e:
                COMP = "nohaze(%s) " % str(e)[:60]
        def glare(kind, **kw):
            g = tree.nodes.new("CompositorNodeGlare"); setp(g, "glare_type", kind)
            for k, v in kw.items():
                done = False
                if k in g.inputs:
                    try: g.inputs[k].default_value = v; done = True
                    except Exception: pass
                if not done: setp(g, k, v)
            return g
        g1 = glare("STREAKS", **{"Threshold": 2.6, "Strength": 0.22, "Streaks": 4, "Streaks Angle": math.radians(20), "Size": 7, "threshold": 2.6, "mix": -0.4, "streaks": 4, "angle_offset": math.radians(20), "iterations": 4})
        g2 = glare("FOG_GLOW", **{"Threshold": 1.8, "Strength": 0.10, "Size": 7, "threshold": 1.8, "mix": -0.7, "size": 7})
        tree.links.new(img, g1.inputs["Image"]); tree.links.new(g1.outputs["Image"], g2.inputs["Image"]); tree.links.new(g2.outputs["Image"], outn.inputs[0])
        COMP += "ok"
    except Exception as e:
        COMP = "failed: " + str(e)[:120]
    return COMP

def write_scene(sc, MODE, OUT, RANGE, NF, f, info, cam, tgt, SUN_DIR):
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(os.path.join(OUT, "hero-city.blend")), relative_remap=False)
    sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGB"
    if MODE == "stills":
        sc.render.resolution_percentage = int(os.environ.get("PCT", "50"))
        times = [0.0, 4.2, 8.3, 9.6, 10.4, 11.2, 12.6, 14.5, 15.6, 17.0, 18.8, 21.6, 25.0]
        if os.environ.get("STILLS"): times = [float(x) for x in os.environ["STILLS"].split(",")]
        import time as _time
        for t in times:
            t0 = _time.time(); sc.frame_set(f(t)); sc.render.filepath = os.path.join(OUT, "still_%05.2f.png" % t); bpy.ops.render.render(write_still=True)
            print("STILL t=%.2f took %.1fs" % (t, _time.time() - t0))
    elif MODE == "sunprobe":
        # a very wide frame straight at the lamp's sun: the sky's bright spot should sit dead centre
        sc.render.resolution_percentage = 25; cam.animation_data_clear(); tgt.animation_data_clear()
        cam.location = (0, 0, 140); tgt.location = Vector((0, 0, 140)) + SUN_DIR * 100; cam.data.lens = 12; cam.data.dof.use_dof = False
        sc.render.filepath = os.path.join(OUT, "sunprobe.png"); bpy.ops.render.render(write_still=True)
    elif MODE == "anim":
        fd = os.path.join(OUT, "frames"); os.makedirs(fd, exist_ok=True)
        a, b = (int(x) for x in RANGE.split("-")) if RANGE else (1, NF)
        sc.frame_start, sc.frame_end = a, b
        sc.render.use_overwrite = False; sc.render.use_placeholder = False
        sc.render.filepath = os.path.join(fd, "f_"); bpy.ops.render.render(animation=True)
    print("INFO_JSON=" + json.dumps(info))
