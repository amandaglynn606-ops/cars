"""Non-generative car cutouts: retain original RGB pixels, replace alpha only."""
import os, json, pathlib, time, argparse
os.environ.setdefault('OMP_NUM_THREADS', '4')
ROOT = pathlib.Path(__file__).resolve().parent.parent
os.environ['U2NET_HOME'] = str(ROOT / '.local' / 'background-models')
from PIL import Image, ImageOps
from rembg import new_session
parser = argparse.ArgumentParser()
parser.add_argument('--limit', type=int, default=0)
args = parser.parse_args()
session = new_session('birefnet-general', providers=['CPUExecutionProvider'])
items = json.loads((ROOT / '.local' / 'cutout-inventory.json').read_text('utf-8'))
outdir = ROOT / 'public' / 'fleet-cutouts'
outdir.mkdir(parents=True, exist_ok=True)
manifest_path = ROOT / 'data' / 'car-cutouts.json'
manifest = json.loads(manifest_path.read_text('utf-8')) if manifest_path.exists() else {}
for index, item in enumerate(items[:args.limit or None]):
    src, filename = item['src'], item['filename']
    target = outdir / filename
    if src in manifest and target.exists():
        continue
    input_path = (ROOT / 'public' / src.lstrip('/')).resolve()
    if not input_path.is_relative_to((ROOT / 'public').resolve()):
        raise ValueError('Unexpected image path')
    started = time.monotonic()
    original = ImageOps.exif_transpose(Image.open(input_path)).convert('RGBA')
    mask = session.predict(original.convert('RGB'))[0]
    original.putalpha(mask)
    # Lossless RGBA keeps paint and all opaque vehicle pixels unchanged.
    original.save(target, 'WEBP', lossless=True, method=4)
    manifest[src] = '/fleet-cutouts/' + filename
    manifest_path.write_text(json.dumps(manifest, indent=2)+'\n', 'utf-8')
    print(f'{index+1}/{len(items)} {filename} {time.monotonic()-started:.1f}s', flush=True)
