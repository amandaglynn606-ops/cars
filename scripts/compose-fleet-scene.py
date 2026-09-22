"""Place original vehicle cutouts into the approved G 63 Brabus street scene.

Only resizing and alpha compositing are applied to the car pixels. Originals
and the vehicle database are never modified. Run with the isolated bg-env.
"""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--limit', type=int, default=0)
args = parser.parse_args()
items = json.loads((ROOT / '.local/cutout-inventory.json').read_text('utf-8'))
plate = Image.open(ROOT / '.local/fleet-background/brabus-clean-plate.png').convert('RGBA')
plate = ImageOps.fit(plate, (1600, 900), method=Image.Resampling.LANCZOS)
output = ROOT / 'public/fleet-scene'
output.mkdir(parents=True, exist_ok=True)
manifest = {}
reviews = []
for item in items[:args.limit or None]:
    filename, src = item['filename'], item['src']
    # Keep the reference photograph intact.
    if src == '/fleet/mercedes-benz-g-63-brabus/01-brabus-2.webp':
        manifest[src] = src
        continue
    car = Image.open(ROOT / 'public/fleet-cutouts' / filename).convert('RGBA')
    bounds = car.getchannel('A').point(lambda value: 255 if value > 30 else 0).getbbox()
    if not bounds:
        raise ValueError('Empty vehicle mask: ' + src)
    car = car.crop(bounds)
    ratio = min(1150 / car.width, 570 / car.height)
    car = car.resize((round(car.width * ratio), round(car.height * ratio)), Image.Resampling.LANCZOS)
    x, y = (1600 - car.width) // 2, 765 - car.height
    canvas = plate.copy()
    shadow = Image.new('RGBA', canvas.size)
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((x + car.width * .08, 710, x + car.width * .94, 786), fill=(0, 0, 0, 75))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(23)))
    # Follow the vehicle's lower silhouette so the far wheels also meet the road.
    contact = Image.new('RGBA', canvas.size)
    contact_draw = ImageDraw.Draw(contact)
    alpha = car.getchannel('A')
    for column in range(car.width):
        strip = alpha.crop((column, 0, column + 1, car.height)).point(lambda value: 255 if value > 100 else 0).getbbox()
        if strip and strip[3] > car.height * .58:
            base = y + strip[3]
            contact_draw.line((x + column, base - 9, x + column, base + 15), fill=(0, 0, 0, 145))
    canvas.alpha_composite(contact.filter(ImageFilter.GaussianBlur(10)))
    canvas.alpha_composite(car, (x, y))
    canvas.convert('RGB').save(output / filename, 'WEBP', quality=94, method=6)
    manifest[src] = '/fleet-scene/' + filename
    reviews.append((src, canvas.convert('RGB')))

for start in range(0, len(reviews), 24):
    sheet = Image.new('RGB', (1200, 6 * 196), '#eee')
    draw = ImageDraw.Draw(sheet)
    for index, (src, picture) in enumerate(reviews[start:start+24]):
        x, y = (index % 4) * 300, (index // 4) * 196
        sheet.paste(picture.resize((300, 169)), (x, y))
        draw.text((x + 3, y + 171), src.split('/')[2][:38], fill='#111')
    sheet.save(ROOT / f'.local/fleet-background/review-{start//24+1}.jpg', quality=90)

if not args.limit:
    (ROOT / 'data/car-scene.json').write_text(json.dumps(manifest, indent=2) + '\n', 'utf-8')
print(f'Composited {len(reviews)} images; {len(manifest)} source mappings.')
