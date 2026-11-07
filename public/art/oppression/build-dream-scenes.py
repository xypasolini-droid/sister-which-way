"""Original dream-ending backgrounds. No movie frames or generated raster images."""
from pathlib import Path
from html import escape
OUT=Path(__file__).parent
INK='#514b3e'
def p(d,c,w=2):return f'<path d="{d}" fill="{c}" stroke="{INK}" stroke-width="{w}" stroke-linejoin="round"/>'
def l(d,c='#776c54',w=2):return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
def r(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>'
def ell(x,y,rx,ry,c):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{c}"/>'
def g(id,s,t=''):return f'<g id="{id}" {t}>{s}</g>'
def transform(x,y,s=1):return f'transform="translate({x} {y}) scale({s})"'

def woman(x,y,scale=1,coat='#839081',scarf='#8b967f',guard=False,walk=False,carry=False):
    # Adult anatomy, opaque scarf and loose sleeves / trousers, never a pinched-waist costume.
    a=ell(0,151,25,6,'#918b6b')
    a+=p('M-17 95 L-1 97 L-3 137 L-13 149 L-24 147 L-16 132Z','#6d776a')
    a+=p('M1 97 L18 96 L20 133 L30 145 L18 150 L8 135Z' if walk else 'M1 97 L18 96 L20 145 L8 148 L3 133Z','#7d8370')
    a+=p('M-24 144 L-11 143 L-9 151 L-30 152Z','#5b594a')+p('M17 143 L29 142 L36 150 L16 152Z' if walk else 'M7 143 L21 142 L29 150 L7 152Z','#5b594a')
    a+=p('M-17 38 L14 36 L24 57 L23 106 L-26 106 L-25 59Z',coat)+p('M-18 43 L-9 54 L-17 102 L-25 106 L-25 58Z','#6e7f70')+l('M1 48 L3 96 M-19 97 L-7 100 M9 100 L20 98','#5e6f60',1.3)
    if carry:
        a+=p('M-22 48 L-31 53 L-33 89 L-11 95 L-5 87 L-22 81 L-14 55Z',coat)+p('M-13 85 L0 85 L9 90 L5 97 L-11 94Z','#ba9068')
        a+=p('M19 46 L29 56 L29 80 L8 92 L3 84 L19 73 L12 56Z',coat)+p('M8 83 L-2 84 L-5 93 L7 95 L15 89Z','#ba9068')
    else:
        a+=p('M-22 46 L-31 54 L-33 96 L-23 98 L-17 58Z',coat)+p('M-32 94 L-34 107 L-28 116 L-23 112 L-23 96Z','#ba9068')
        a+=p('M19 45 L29 56 L32 96 L22 99 L13 58Z',coat)+p('M23 96 L22 108 L28 115 L33 109 L32 96Z','#ba9068')
    # Rounded cheek and visible calm eyes under a long plain headscarf.
    a+=p('M-12 4 Q1-5 13 7 L15 23 L7 38 L-6 36 L-15 24Z','#bd936b')
    a+=p('M-20 17 Q-19-7 2-9 Q21-9 24 17 L25 49 L15 57 L3 41 L12 24 L10 9 L-2 4 L-13 14 L-11 34 L-17 46 L-27 37Z',scarf)
    a+=l('M-10 18 L-4 18 M4 19 L10 20','#3d4438',1.6)+l('M-2 21 L-3 27 L1 28','#997450',1)+l('M-4 32 L4 32','#7f5940',1.2)
    a+=l('M-16 13 L-20 34 M17 24 L15 40','#677967',1)
    if guard:
        a+=p('M-14 44 L-3 45 L-4 85 L-22 86 L-22 57Z','#5b7064')+p('M6 44 L18 46 L23 86 L7 86Z','#5b7064')
        # Slung rifle points down; no one is being threatened by it.
        a+=l('M-16 50 L25 105','#585543',3)+p('M21 98 L27 99 L35 130 L27 133Z','#68634d')+p('M6 73 L13 70 L25 106 L19 110Z','#454f46')+l('M8 72 L-1 50','#454f46',3)
    return g('adult-woman',a,transform(x,y,scale))

def girl(x,y,scale=1,scarf='#96a48a',dress='#aca18a',walk=True):
    a=ell(0,103,17,4,'#a49b79')
    a+=p('M-13 71 L-2 73 L-4 94 L-12 102 L-20 99 L-12 91Z','#8b8e76')+p('M2 74 L13 72 L15 94 L23 100 L12 104 L5 96Z' if walk else 'M2 74 L13 72 L15 101 L6 102Z','#8b8e76')
    a+=p('M-13 34 L11 34 L17 76 L-20 78 L-19 48Z',dress)+p('M-16 37 L-24 47 L-25 67 L-18 71 L-12 50Z',dress)+p('M13 37 L22 49 L24 66 L18 70 L10 50Z',dress)
    a+=p('M-24 66 L-25 74 L-19 77 L-17 70Z','#c29970')+p('M18 67 L17 75 L23 77 L26 72 L24 65Z','#c29970')
    a+=p('M-11 5 Q0-2 10 7 L12 22 L4 34 L-7 30 L-14 19Z','#c29970')+p('M-17 13 Q-17-7 0-8 Q16-7 18 12 L21 36 L9 43 L2 33 L10 21 L7 7 L-2 4 L-11 13 L-10 28 L-16 37 L-22 29Z',scarf)
    a+=l('M-9 17 L-4 17 M3 18 L8 19','#434638',1.4)+l('M-3 27 L3 28','#805f43',1)
    return g('schoolgirl',a,transform(x,y,scale))

def writing_girl(x,y,scale=1,scarf='#9b9f87'):
    a=p('M-16 29 L9 27 L20 61 L-21 62 L-24 45Z','#9a9e86')+p('M-10 5 Q0-3 9 7 L10 20 L2 31 L-8 28 L-15 17Z','#bc936c')
    a+=p('M-18 13 Q-19-9 0-9 Q18-7 18 14 L22 36 L10 40 L2 29 L9 18 L7 4 L-5 3 L-13 17 L-11 28 L-20 34Z',scarf)
    a+=l('M-8 16 L-3 18 M3 18 L7 20','#424a3d',1.2)
    a+=p('M-18 35 L-24 42 L-15 56 L3 55 L4 48 L-12 47 L-10 37Z','#9a9e86')+p('M11 33 L19 39 L24 52 L9 58 L4 52 L15 48 L5 37Z','#9a9e86')
    a+=p('M-2 50 L11 49 L17 54 L13 60 L0 58Z','#bd936a')
    a+=p('M-30 58 L32 58 L38 68 L-36 68Z','#b29366')+p('M-30 68 L-25 95 L-20 95 L-23 68Z','#796f51')+p('M26 68 L30 95 L35 95 L33 68Z','#796f51')
    a+=p('M-10 56 L15 56 L19 62 L-5 62Z','#e0d7b9',.8)+l('M10 52 L4 60','#645c46',1.4)
    return g('girl-writing',a,transform(x,y,scale))

def seated_woman(x,y,scale=1,coat='#839081',scarf='#8b967f',talk=False):
    a=ell(0,104,28,6,'#a29878')
    a+=p('M-14 66 L11 64 L24 91 L14 105 L-15 102 L-26 91Z','#818775')+p('M-12 89 L17 95 L10 104 L-17 102 L-26 91Z','#939783')
    a+=p('M-13 32 L12 31 L19 67 L12 86 L-20 84 L-22 58Z',coat)
    a+=p('M-11 5 Q0-3 10 7 L12 22 L3 33 L-8 29 L-15 18Z','#bd936b')+p('M-18 12 Q-18-8 0-9 Q17-6 18 13 L24 39 L12 44 L2 33 L10 21 L7 5 L-3 4 L-12 14 L-9 29 L-18 37 L-25 28Z',scarf)
    a+=l('M-9 17 L-4 18 M3 18 L8 20','#424a3d',1.4)+l('M-3 27 L3 27','#805f43',1.2)
    a+=p('M-18 38 L-27 49 L-18 74 L-4 75 L-2 67 L-14 63 L-10 45Z',coat)+p('M-6 67 L6 69 L8 76 L-4 79Z','#bd936b')
    if talk:a+=p('M13 36 L22 43 L30 49 L43 42 L48 49 L32 61 L22 59 L7 45Z',coat)+p('M42 42 L47 35 L56 36 L59 42 L48 50Z','#bd936b')
    else:a+=p('M12 36 L22 45 L22 64 L8 75 L1 69 L13 59 L5 44Z',coat)+p('M8 67 L-2 68 L-7 74 L1 80 L12 76Z','#bd936b')
    return g('woman-council',a,transform(x,y,scale))

def landscape():
    s=r(0,0,1280,720,'#d7cfb2')+ell(882,151,88,88,'#e3dcbf')
    s+=p('M0 244 L113 161 L241 211 L365 133 L506 221 L638 174 L774 254 L903 173 L1044 230 L1158 156 L1280 206 L1280 499 L0 499Z','#b7b69d',0)
    s+=p('M0 359 L146 245 L288 310 L417 214 L547 309 L660 268 L781 347 L955 245 L1091 324 L1280 260 L1280 541 L0 541Z','#999f89',0)
    s+=l('M353 265 L418 229 L451 264 M941 270 L985 288 L1057 327 M160 273 L220 302','#c4c2a5',5)
    s+=p('M0 461 L191 413 L363 448 L535 391 L699 431 L850 399 L1049 448 L1280 419 L1280 720 L0 720Z','#a5ad8c',0)
    s+=p('M582 427 Q689 460 739 493 L1046 720 L272 720 Q479 523 582 427Z','#c9b995',0)
    s+=p('M0 622 L166 538 L308 584 L350 652 L294 720 L0 720Z','#819378',0)+p('M932 605 L1072 534 L1280 573 L1280 720 L1080 720Z','#899a7d',0)
    s+=l('M443 638 Q578 536 643 514 M737 563 L869 668','#b3a884',3)
    for x,y in [(183,595),(271,654),(358,613),(989,636),(1097,589),(1163,663),(64,675),(388,695)]:
        s+=l(f'M{x} {y} L{x-1} {y-24} M{x} {y-10} L{x-9} {y-17} M{x} {y-15} L{x+8} {y-23}','#60785e',2)
        s+=ell(x-1,y-26,4,3,'#c9bc86')+ell(x+8,y-23,3,3,'#c9bc86')
    return s

def guardian():
    s=landscape()
    # Pass walls are low watch positions, not an enclosing prison.
    s+=g('mountain-watch',p('M0 386 L159 328 L280 352 L375 410 L378 499 L0 525Z','#92967c')+p('M931 425 L1063 359 L1174 388 L1280 360 L1280 516 L944 509Z','#92967c')+l('M30 414 L156 364 L269 390 M1006 433 L1091 400 L1172 422','#b8b69a',4))
    s+=g('school',p('M703 347 L948 346 L983 369 L983 492 L703 494Z','#c2b38e')+p('M688 338 L953 338 L987 356 L705 360 L688 351Z','#b1a581')+p('M727 389 Q761 353 795 388 L795 495 L727 495Z','#6f8171')+p('M738 391 Q762 365 783 391 L783 492 L738 492Z','#b7c1a4')+p('M738 414 L767 405 L775 492 L738 492Z','#e1d9bb',0)+p('M826 387 L874 388 L874 435 L826 435Z','#718879')+l('M849 390 L849 433 M828 412 L872 412','#b9c3a5',3)+p('M899 387 L945 387 L945 435 L899 435Z','#718879')+l('M921 389 L921 433 M900 411 L944 411','#b9c3a5',3)+p('M719 493 L807 492 L826 509 L706 509Z','#a59b78')+l('M708 375 L727 374 M809 466 L826 465 M939 469 L971 468','#a89d7d',2))
    s+=g('lookout-stone',p('M413 448 L465 438 L490 455 L483 485 L414 490Z','#8b9279')+p('M968 467 L1014 453 L1050 470 L1034 500 L965 503Z','#8b9279'))
    s+=woman(470,381,.89,'#7e8d7c','#a4aa8e',True)
    s+=woman(987,396,.84,'#92977d','#738a7b',True)
    s+=woman(607,357,.62,'#8c967d','#959f87',True)
    # Children follow an ordinary safe path into an open school door.
    s+=girl(670,422,.82,'#9ba88c','#aea184')+girl(714,414,.76,'#aca58c','#929c81')+girl(754,398,.67,'#7b9689','#adab8f')
    s+=l('M681 477 L696 475','#bd936b',3)
    s+=g('foreground-papers',p('M329 672 L366 661 L392 675 L356 686Z','#d8ccaa',1)+p('M338 674 L359 669 L376 675 L356 681Z','#b7b38f',0))
    return s

def commons():
    s=landscape()
    s+=g('square',p('M232 377 L1047 370 L1134 523 L1154 720 L149 720 L191 509Z','#c6b791',0)+l('M281 617 L385 601 M896 645 L1027 664 M516 692 L630 685 M804 513 L856 519','#b5aa86',2))
    # A visible classroom, open onto the square. It is legible in the center phone crop.
    s+=g('school-open-room',p('M691 316 L948 319 L969 341 L966 495 L690 492Z','#c9bc99')+p('M678 306 L950 309 L976 330 L689 330Z','#a99e7f')+p('M711 348 L901 348 L901 473 L711 473Z','#8d9a80')+p('M721 358 L894 358 L894 464 L721 464Z','#d2c7a4')+p('M914 361 L950 361 L950 463 L914 463Z','#697f70')+l('M732 381 L885 381 M735 451 L884 451','#b6ac88',2)+p('M692 491 L970 492 L979 505 L685 505Z','#b2a581'))
    s+=writing_girl(757,393,.67,'#859b87')+writing_girl(808,394,.67,'#b4b091')+writing_girl(861,393,.67,'#8e9d89')
    # The canopy covers a woman-run fruit and book stall, not a checkpoint.
    s+=g('market-stall',p('M345 353 L549 353 L585 385 L314 385Z','#879b83')+p('M314 385 L585 385 L578 400 L319 400Z','#a9b497')+l('M334 390 L333 535 M565 390 L566 533','#766c50',7)+l('M339 391 L560 391','#c5c4a1',2))
    s+=woman(454,394,.72,'#a49677','#a2ac8d',False,False,True)
    s+=g('counter',p('M331 473 L565 473 L568 528 L328 528Z','#ac9067')+p('M328 465 L569 465 L575 480 L325 480Z','#c5aa79')+l('M344 489 L551 489 M344 511 L550 511','#8d7959',2)+p('M350 450 L407 450 L407 467 L349 467Z','#9e8560')+p('M423 449 L467 448 L473 467 L419 467Z','#c2b18b')+p('M487 452 L534 449 L539 467 L484 467Z','#9b8866'))
    for x,y,c in [(360,446,'#b39566'),(374,445,'#bba978'),(389,445,'#ac996c'),(495,448,'#a46c54'),(508,445,'#b27a59'),(525,445,'#b18b60')]:s+=ell(x,y,8,7,c)
    s+=p('M425 454 L459 451 L465 459 L430 463Z','#dacfaa',1)+l('M431 455 L456 453','#8c8d6e',1)
    s+=woman(582,413,.70,'#8f9a80','#b2ad8e',False,True,True)
    s+=girl(625,451,.69,'#9eaf98','#b4a68c')
    # The foreground group has equal seats and an open center, rather than a throne.
    s+=g('council-rug',p('M613 543 L742 531 L818 585 L766 622 L638 616 L584 580Z','#9d9d7e')+p('M624 553 L736 542 L801 583 L758 609 L645 605 L600 579Z','#b3b094')+l('M623 565 L659 590 L742 594 L778 578','#858d73',2))
    s+=seated_woman(627,512,.70,'#899981','#aaac8e',True)+seated_woman(731,505,.69,'#a39d7e','#859b88',False)+seated_woman(784,545,.68,'#919b84','#b0ab8b',False)
    s+=g('shared-plans',p('M671 575 L711 570 L735 581 L698 592Z','#e0d4af',1)+l('M682 578 L699 576 L712 580 L697 585 M718 580 L727 581','#929576',1)+p('M685 583 L691 580 L696 583 L692 586Z','#9caa8d',0))
    # Shade tree frames the right side; no slogans or decorative pseudo-script.
    s+=g('tree',p('M1049 462 L1061 325 L1076 264 L1089 265 L1077 342 L1081 466Z','#8c7d5d')+l('M1070 345 L1019 293 M1076 325 L1126 276','#8c7d5d',9)+p('M985 289 Q962 254 991 229 Q1006 203 1033 218 Q1061 180 1090 212 Q1128 199 1144 227 Q1182 243 1162 274 Q1170 307 1131 318 Q1105 337 1081 316 Q1042 331 1024 312 Q991 320 985 289Z','#84987b',1)+l('M1020 255 L1045 248 M1103 238 L1127 249 M1064 287 L1087 280','#a3b094',3))
    return s

def save(name,desc,content):
    OUT.joinpath(name+'.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title desc"><title id="title">{escape(name)}</title><desc id="desc">{escape(desc)}</desc><!-- Original code-native dream ending. Adult women and background children; no protagonist, source film imagery, photo, text slogan or sexualized costume. Center-safe action zone x420-860. -->{content}</svg>''')
save('dream-guardian','An explicitly imagined future: adult women in plain long tunics, loose trousers and opaque headscarves form a modest female guard at a mountain pass. Rifles remain slung downward. Several girls walk safely into the open school gate. No protagonist is embedded. The key guard and school entry fit the central mobile crop.',guardian())
save('dream-commons','An explicitly imagined future of ordinary civic freedom: women run a fruit-and-book market stall, girls write in a visible classroom, and women meet on equal seats to discuss shared plans in an open square. No protagonist, armed guards, slogans or text are embedded. School, stall and council overlap the central mobile crop.',commons())
print('Wrote dream-guardian.svg and dream-commons.svg')
