body=open('body.html').read()
D="Jesús no va deixar cap llibre. Unes cartes, quatre relats i dues breus mencions en historiadors antics permeten seguir el rastre del predicador de Galilea i dels qui el van recordar."
html=f'''<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Una vida, quatre evangelis · Inspired by Magazine</title>
<meta name="description" content="{D}">
<meta property="og:title" content="Una vida, quatre evangelis">
<meta property="og:description" content="{D}">
<meta property="og:image" content="cover.jpg">
<link rel="icon" sizes="192x192" href="../../assets/icon192.png">
<link rel="apple-touch-icon" href="../../assets/icon192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap">
<link rel="stylesheet" href="../../assets/ib.css">
<link rel="stylesheet" href="../../assets/article.css">
<link rel="stylesheet" href="article.css">
</head>
<body class="ib-article">
<header class="ib-bar">
  <a href="../../" aria-label="Inspired by Magazine"><img src="../../assets/logo.png" alt="Inspired by Magazine" width="1600" height="192"></a>
</header>
<div class="ib-progress" aria-hidden="true"><span id="ibProgress"></span></div>

<main class="page">
{body}
</main>
<footer class="ib-foot">
  <a href="../../"><img src="../../assets/logo.png" alt="Inspired by Magazine" width="1600" height="192"></a>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>
<script src="../../assets/scrolly.js"></script>
<script src="../../assets/ib-viz.js"></script>
<script src="dades.js"></script>
<script src="relleu.js"></script>
<script src="article.js"></script>
<script src="mapes.js"></script>
<script src="cites.js"></script>
<script src="../../assets/ib.js"></script>
</body>
</html>
'''
open('/home/user/inspiredby/web/articles/jesus-i-els-quatre-evangelis/index.html','w').write(html)
