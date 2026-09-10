# Downloads the Poly Haven texture sets and the sky that build_hero.py renders with, into
# scripts/hero/textures (or TEX_DIR). Everything on Poly Haven is CC0, so nothing here needs a credit.
#   python scripts/hero/fetch_textures.py
import json, os, sys, urllib.request

TEXDIR = os.environ.get("TEX_DIR") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "textures")
SETS = ["concrete_pavement_02", "asphalt_02", "concrete_panels", "white_plaster_02", "precast_concrete_wall",
        "plastered_wall_02", "dirty_carpet", "ceiling_interior", "dark_wood", "wood_table_001", "brown_leather"]
MAPS = ["Diffuse", "nor_gl", "arm", "Displacement"]
HDRI = "kloppenheim_06_puresky"
RES = "2k"
UA = {"User-Agent": "buildanta-hero/1.0"}

def get_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA)) as r:
        return json.load(r)

def download(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return "cached"
    tmp = path + ".part"
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA)) as r, open(tmp, "wb") as f:
        while True:
            chunk = r.read(1 << 20)
            if not chunk: break
            f.write(chunk)
    os.replace(tmp, path)
    return "%d bytes" % os.path.getsize(path)

def main():
    for key in SETS:
        files = get_json("https://api.polyhaven.com/files/" + key)
        folder = os.path.join(TEXDIR, key); os.makedirs(folder, exist_ok=True)
        for m in MAPS:
            try: url = files[m][RES]["jpg"]["url"]
            except KeyError: print(key, m, "not offered"); continue
            print(key, m, download(url, os.path.join(folder, os.path.basename(url))))
    files = get_json("https://api.polyhaven.com/files/" + HDRI)
    folder = os.path.join(TEXDIR, "hdri"); os.makedirs(folder, exist_ok=True)
    url = files["hdri"][RES]["hdr"]["url"]
    print(HDRI, download(url, os.path.join(folder, os.path.basename(url))))
    print("textures in", TEXDIR)

if __name__ == "__main__":
    try: main()
    except KeyboardInterrupt: sys.exit(1)
