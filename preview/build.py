# Builds preview/knil.html: one self-contained file (CSS, JS, fonts inlined)
# from `npm run build` output plus an esbuild bundle. Used for the hosted preview.
import base64, re, glob, subprocess, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
subprocess.run(["npx", "esbuild", "preview/entry.tsx", "--bundle", "--minify", "--format=iife",
                "--target=es2018", "--jsx=automatic", "--define:process.env.NEXT_PUBLIC_SITE_URL=undefined",
                "--define:process.env.NODE_ENV=\"production\"", "--outfile=preview/bundle.js"], check=True)
html = open("out/index.html", encoding="utf-8").read()
css_path = glob.glob("out/_next/static/chunks/*.css")[0]
css = open(css_path, encoding="utf-8").read()
def font(m):
    data = base64.b64encode(open("out/_next/static/media/" + m.group(1), "rb").read()).decode()
    return f"url(data:font/woff2;base64,{data})"
css = re.sub(r"url\(\.\./media/([^)]+)\)", font, css)
js = open("preview/bundle.js", encoding="utf-8").read().replace("</script", "<\\/script")
html_class = re.search(r'<html lang="ko" class="([^"]+)"', html).group(1)
body = re.search(r"<body>(.*?)<script", html, re.S).group(1)
head_meta = "".join(re.findall(r'<meta (?:name|property)="(?:description|og:[^"]+|twitter:[^"]+|keywords)"[^>]*/>', html))
out = f'''<!DOCTYPE html><html lang="ko" class="{html_class}"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>KNIL 크닐</title>{head_meta}<style>{css}</style></head>
<body><div id="root">{body}</div><script>{js}</script></body></html>'''
open("preview/knil.html", "w", encoding="utf-8").write(out)
print(len(out) // 1024, "KB")
