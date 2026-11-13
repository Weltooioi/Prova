#!/bin/bash
# uso: render.sh "nome:inicio:fim nome:inicio:fim ..."  -> out/seg/nome.mp4 (um arquivo por etapa)
cd "$(dirname "$0")" && export NODE_PATH=${NODE_PATH:-$(npm root -g)} && mkdir -p out/${SEGDIR:-seg}
for s in $1; do IFS=: read n a b <<< "$s"; node capture.js clip $a $b out/${SEGDIR:-seg}/$n.mp4 2>&1 | grep -E "PAGEERR|CONSOLE|clip"; echo "DONE $n"; done; echo ALLDONE
