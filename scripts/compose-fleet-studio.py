"""Use the user's black-background reference with original vehicle cutouts.

No vehicle is generated. Preserve paint hues, geometry, badges and original
files; decontaminate only translucent edge pixels and add contact shadows.
"""
import argparse, json
from pathlib import Path
import numpy as np
from scipy.ndimage import distance_transform_edt
from PIL import Image, ImageOps, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--limit', type=int, default=0)
args = parser.parse_args()
items = json.loads((ROOT / '.local/cutout-inventory.json').read_text('utf-8'))
plate = ImageOps.fit(Image.open(ROOT / 'public/fleet-backgrounds/black-studio.png').convert('RGBA'), (1600,900), method=Image.Resampling.LANCZOS)
output = ROOT / 'public/fleet-studio'
output.mkdir(exist_ok=True)
manifest, reviews = {}, []
for index,item in enumerate(items[:args.limit or None]):
    car = Image.open(ROOT / 'public/fleet-cutouts' / item['filename']).convert('RGBA')
    bounds = car.getchannel('A').point(lambda value: 255 if value>30 else 0).getbbox()
    if not bounds: raise ValueError(item['src'])
    car = car.crop(bounds)
    pixels = np.array(car)
    alpha = pixels[:,:,3]
    solid = alpha > 245
    # Borrow nearby opaque vehicle colour only at mixed edges, avoiding a pale
    # fringe from the original outdoor/indoor backdrop against the black studio.
    _, nearest = distance_transform_edt(~solid, return_indices=True)
    edges = (alpha > 0) & (alpha < 230)
    pixels[:,:,:3][edges] = pixels[nearest[0][edges],nearest[1][edges],:3]
    pixels[:,:,3][alpha < 8] = 0
    car = Image.fromarray(pixels)
    ratio = min(1240/car.width,630/car.height)
    car = car.resize((round(car.width*ratio),round(car.height*ratio)),Image.Resampling.LANCZOS)
    x,y = (1600-car.width)//2, 766-car.height
    canvas = plate.copy()
    shadow = Image.new('RGBA',canvas.size)
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((x+car.width*.04,710,x+car.width*.97,804),fill=(0,0,0,220))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(26)))
    contact = Image.new('RGBA',canvas.size)
    draw = ImageDraw.Draw(contact)
    alpha = np.array(car.getchannel('A'))
    for column in range(car.width):
        occupied = np.flatnonzero(alpha[:,column]>100)
        if len(occupied) and occupied[-1]>car.height*.56:
            base = y+int(occupied[-1])
            draw.line((x+column,base-8,x+column,base+15),fill=(0,0,0,235))
    canvas.alpha_composite(contact.filter(ImageFilter.GaussianBlur(9)))
    canvas.alpha_composite(car,(x,y))
    canvas.convert('RGB').save(output/item['filename'],'WEBP',quality=95,method=5)
    manifest[item['src']]='/fleet-studio/'+item['filename']
    reviews.append((item['src'],canvas.resize((300,169)).convert('RGB')))
    if (index+1)%24==0: print(f'{index+1}/{len(items)} studio images',flush=True)
for start in range(0,len(reviews),24):
    sheet=Image.new('RGB',(1200,1176),'#191919')
    draw=ImageDraw.Draw(sheet)
    for index,(src,picture) in enumerate(reviews[start:start+24]):
        x,y=(index%4)*300,(index//4)*196
        sheet.paste(picture,(x,y))
        draw.text((x+4,y+171),src.split('/')[2][:38],fill='#eee')
    sheet.save(ROOT/f'.local/fleet-background/studio-review-{start//24+1}.jpg',quality=92)
if not args.limit:
    (ROOT/'data/car-scene.json').write_text(json.dumps(manifest,indent=2)+'\n','utf-8')
print(f'{len(manifest)} studio images complete. Originals unchanged.')
