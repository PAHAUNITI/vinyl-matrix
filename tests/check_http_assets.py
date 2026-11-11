import urllib.request

urls = [
    "http://localhost:8080/index.html",
    "http://localhost:8080/css/tokens.css",
    "http://localhost:8080/css/brutalist-grid.css",
    "http://localhost:8080/css/components.css",
    "http://localhost:8080/css/animations.css",
    "http://localhost:8080/js/data/vinyl-data.js",
    "http://localhost:8080/js/audio/vinyl-engine.js",
    "http://localhost:8080/js/components/turntable.js",
    "http://localhost:8080/js/components/visualizer.js",
    "http://localhost:8080/js/components/ui-interactions.js",
    "http://localhost:8080/js/app.js"
]

all_ok = True
for url in urls:
    try:
        req = urllib.request.urlopen(url, timeout=5)
        print(f"[{req.status}] {url}")
        if req.status != 200:
            all_ok = False
    except Exception as e:
        print(f"[ERROR] {url}: {e}")
        all_ok = False

if all_ok:
    print("\nALL ASSETS LOADED WITH HTTP 200 SUCCESS!")
else:
    exit(1)
