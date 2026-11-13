#!/bin/bash
# uso: grid.sh nome  -> st/nome_g.jpg com os quadros de st/tmp em grade de 4 colunas
cd "$(dirname "$0")"; ins=""; n=0; for f in $(ls st/tmp | sort -t_ -k2 -n); do ins="$ins -i st/tmp/$f"; n=$((n+1)); done
ffmpeg -v error -y $ins -filter_complex "concat=n=$n:v=1:a=0,scale=450:800,tile=4x$(( (n+3)/4 ))" -frames:v 1 -q:v 3 st/$1_g.jpg
