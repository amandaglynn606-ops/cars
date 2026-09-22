import urllib.request, pathlib, re, concurrent.futures
root=pathlib.Path('.local/site-audit')
jobs=[
 ('google-history','https://status.search.google.com/incidents.json'),
 ('f1-race','https://www.formula1.com/en/racing/2026/united-arab-emirates'),
 ('dubai-world-cup','https://www.dubairacingclub.com/'),
 ('armani-official','https://www.armanihotels.com/en/hotels/armani-hotel-dubai/'),
 ('address-official','https://www.addresshotels.com/en/hotels/address-sky-view/'),
 ('address-photos','https://www.addresshotels.com/en/hotels/address-sky-view/photos-and-videos/'),
]
def fetch(job):
 name,url=job
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; ZaviLocalReview/1.0)'})
  with urllib.request.urlopen(req,timeout=30) as response:
   html=response.read().decode('utf8','replace')
  (root/(name+'.html')).write_text(html,encoding='utf8')
  text=re.sub(r'<script\b[\s\S]*?</script>|<style\b[\s\S]*?</style>','',html,flags=re.I)
  text=re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',text))
  (root/(name+'.txt')).write_text(text,encoding='utf8')
  return name+' OK'
 except Exception as e:return name+' '+str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for result in pool.map(fetch,jobs):print(result,flush=True)
