#!/bin/bash
# uso: sheet.sh nome t1,t2,...  -> st/nome.jpg (tira com os quadros)
cd "$(dirname "$0")" && export NODE_PATH=${NODE_PATH:-$(npm root -g)} && rm -rf st/tmp && node capture.js stills $2 st/tmp 2>&1 | grep -E "PAGEERR|CONSOLE|stills" ; n=$(ls st/tmp | wc -l); ins=""; for f in $(ls st/tmp | sort -t_ -k2 -n); do ins="$ins -i st/tmp/$f"; done; ffmpeg -v error -y $ins -filter_complex "hstack=inputs=$n,scale=2000:-1" st/$1.jpg
