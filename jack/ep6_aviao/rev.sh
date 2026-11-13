#!/bin/bash
# uso: rev.sh nome [fps] -> rev/nome.jpg (folha de contato)
cd "$(dirname "$0")"; n=$1; f=${2:-1.5}
ffmpeg -v error -y -i out/seg/$n.mp4 -vf "fps=$f,scale=270:480,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x4" -frames:v 1 -q:v 3 rev/$n.jpg && echo ok $n
