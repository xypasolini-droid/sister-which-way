"""Original editable landscape art; no movie frames embedded or traced."""
from pathlib import Path
from html import escape
OUT=Path(__file__).parent
INK='#514a3a'
def p(d,c,w=2.5): return f'<path d="{d}" fill="{c}" stroke="{INK}" stroke-width="{w}" stroke-linejoin="round"/>'
def l(d,c='#77654d',w=2): return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"/>'
def g(id,s): return f'<g id="{id}">{s}</g>'
def ellipse(x,y,rx,ry,c):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{c}"/>'
def r(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>'
def scene_base():
    s=r(0,0,1280,720,'#cfbf96')
    s+=p('M0 205 L129 170 L205 187 L329 133 L444 178 L565 142 L716 197 L821 145 L958 196 L1121 150 L1280 190 L1280 469 L0 469Z','#c2ad81',0)
    s+=p('M0 322 L130 240 L225 276 L369 213 L530 302 L648 242 L814 295 L953 228 L1121 291 L1280 247 L1280 505 L0 505Z','#ad9871',0)
    s+=p('M0 406 L181 341 L324 360 L456 312 L594 392 L730 342 L907 375 L1097 325 L1280 355 L1280 551 L0 551Z','#9a8767',0)
    s+=l('M151 274 L218 289 L320 244 M659 273 L726 309 L795 314 M977 273 L1040 307 L1149 301','#b7a27d',5)
    # Low settlement at the foot of the hills, no modern street furniture.
    buildings=[(15,351,69,84),(77,334,57,112),(126,365,92,82),(213,347,71,105),(276,371,85,87),(355,345,62,112),(421,380,83,81),(495,364,67,101),(553,387,84,85),(637,381,58,95)]
    for i,(x,y,w,h) in enumerate(buildings):
        s+=p(f'M{x} {y} L{x+w} {y+3} L{x+w} {y+h} L{x} {y+h}Z',['#ad9270','#b39a75','#a98d6a'][i%3],1)
        s+=r(x+12,y+26,13,26,'#6d6551')+l(f'M{x} {y+10} L{x+w} {y+13}','#c2a77f',2)
    s+=p('M0 478 L350 449 L639 473 L812 455 L1280 498 L1280 720 L0 720Z','#b59c73',0)
    s+=p('M487 470 Q744 496 1280 590 L1280 720 L145 720 Q394 622 487 470Z','#c2ab83',0)
    s+=p('M0 572 L167 519 L258 539 L239 575 L327 617 L286 659 L357 720 L0 720Z','#8b7758',0)
    s+=l('M377 689 Q632 560 857 565 M742 658 L1005 681 M513 596 L615 573 M904 518 L1010 537','#ac926c',3)
    # Original foreground wall with damaged plaster and exposed brick.
    s+=g('wall',p('M0 248 L67 232 L113 245 L168 233 L174 496 L144 547 L113 542 L110 591 L0 617Z','#a9906b')+p('M0 276 L74 259 L128 277 L141 487 L105 520 L98 553 L0 576Z','#b49b76',0)+p('M0 484 L55 472 L57 512 L98 515 L94 550 L0 576Z','#8c7657',1)+l('M0 503 L54 494 M0 526 L92 533 M0 549 L88 556 M25 498 L25 524 M54 519 L54 548 M17 550 L18 568','#5c5644',2)+p('M102 299 L117 308 L108 322 L111 347 L93 360 L100 342 L92 328Z','#8f795a',0))
    s+=g('road-stones',p('M407 640 L425 635 L438 645 L430 652 L409 650Z','#8f7b59',1)+p('M614 680 L639 673 L663 682 L651 691 L620 692Z','#a28a63',1)+p('M1020 650 L1042 645 L1062 656 L1048 663 L1025 660Z','#9b855f',1)+l('M384 518 L400 514 M585 632 L598 629 M1092 690 L1114 693','#8e7a57',2))
    return s

def truck_passengers():
    # Four seated passengers: Nura in boy disguise, mother, little brother, older sister.
    s=g('passenger-mother',p('M747 470 L749 403 Q751 370 777 367 Q805 368 811 400 L827 473 L820 509 L744 503Z','#738590')+p('M758 403 Q777 387 800 404 L810 446 L750 449Z','#90a0a5')+r(768,406,27,24,'#607785')+l('M772 406 L772 430 M778 406 L778 430 M784 406 L784 430 M790 406 L790 430 M768 412 L795 412 M768 418 L795 418 M768 424 L795 424','#a3b0af',1)+l('M760 452 L753 488 M787 452 L792 490','#526c7a',2))
    s+=g('passenger-sister',p('M897 427 L933 420 L955 452 L966 505 L892 507 L879 469Z','#8a8062')+p('M903 380 Q922 366 938 386 L944 417 L930 437 L908 433 L894 412Z','#b88c60')+p('M894 394 Q892 364 913 360 Q939 359 947 388 L954 443 L935 455 L918 435 L934 412 L936 387 L923 378 L907 390 L909 418 L901 437 L886 426Z','#788678')+l('M911 398 L919 400 M929 398 L936 401','#3d4034',2)+l('M921 420 L932 420','#75513a',2)+p('M895 445 L885 471 L908 488 L927 478 L914 468 L915 449Z','#8a8062')+p('M932 447 L946 452 L949 473 L927 485 L919 476 L935 467Z','#8a8062'))
    s+=g('passenger-brother',p('M825 460 L848 451 L868 461 L879 496 L825 502 L817 480Z','#a4946f')+p('M825 425 Q841 411 856 425 L861 449 L851 466 L833 465 L822 449Z','#bf9160')+p('M822 431 L822 419 Q840 402 856 418 L861 431Z','#a0987d')+l('M830 440 L836 441 M847 440 L853 441','#413e31',2)+l('M837 455 L847 454','#7b533a',2)+p('M835 473 L852 468 L863 483 L850 490 L835 486Z','#b08d61'))
    s+=g('passenger-nura',p('M708 451 L730 450 L741 465 L743 493 L696 495 L696 470Z','#b2b3a1',1.7)+p('M701 416 Q705 402 719 401 Q734 403 737 416 L737 438 L728 453 L713 451 L702 440Z','#bd9063',1.5)+p('M700 417 L710 416 L708 428 L704 438 L701 431Z','#3f4537',1)+p('M699 415 L700 405 Q717 393 735 404 L740 418 Q718 411 699 421Z','#c5c3b0',1.5)+p('M699 415 Q719 406 739 416 L739 422 Q720 416 700 425Z','#a7ab95',1)+l('M708 430 L717 428 M725 429 L733 432','#3e4435',1.6)+l('M712 434 L716 433 M727 434 L731 435','#3e4435',1.6)+l('M723 433 L723 439 L727 441 M718 447 L728 447','#865e43',1)+p('M699 460 L693 470 L698 487 L715 488 L718 481 L705 480 L708 465Z','#b2b3a1',1.5)+p('M734 460 L743 470 L740 485 L725 491 L719 483 L732 478 L727 465Z','#b2b3a1',1.5)+p('M714 482 L725 482 L731 488 L726 493 L715 490Z','#bd9063',1.1)+l('M719 457 L720 478','#8d9884',1.2))
    return s

def truck_driver():
    # Visible only through the small cab side window. Yusuf drives; father is not aboard.
    clip='<defs><clipPath id="driver-window"><path d="M1056 395 L1116 395 L1143 432 L1056 432Z"/></clipPath></defs>'
    a=p('M1081 426 L1097 420 L1111 421 L1122 433 L1081 437Z','#949986',1.1)
    a+=p('M1091 402 L1104 401 L1110 408 L1117 412 L1110 416 L1111 424 L1099 426 L1092 421Z','#b78a60',1)
    a+=p('M1090 416 L1098 421 L1109 417 L1110 424 L1100 428 L1093 424Z','#535b49',.8)
    a+=p('M1088 402 L1089 397 Q1098 391 1108 398 L1111 404 L1089 406Z','#bbbba5',1)+l('M1090 402 L1109 403','#8c9680',1)
    a+=l('M1103 408 L1107 409','#3e493b',1.2)+p('M1110 425 L1120 424 L1128 429 L1125 433 L1115 431Z','#b78a60',.8)
    a+='<ellipse cx="1123" cy="437" rx="12" ry="11" fill="none" stroke="#3e5046" stroke-width="2"/>'
    return clip+'<g id="driver-yusuf" clip-path="url(#driver-window)">'+a+'</g>'

def truck(with_passengers=False):
    s=ellipse(965,606,266,30,'#8c795a')
    # Axles and large wheels identify a goods vehicle. No passenger cabin over the rear bed.
    s+=g('truck-chassis',p('M689 525 L1176 522 L1212 564 L1197 582 L707 582Z','#565b50')+p('M706 545 L757 547 L778 588 L734 591Z','#4b5046'))
    for x in (794,1143):
        s+=ellipse(x,574,49,56,'#44483e')+ellipse(x,574,29,36,'#85846d')+ellipse(x,574,13,17,'#555d51')
        s+=l(f'M{x-23} 557 L{x+23} 591 M{x-23} 591 L{x+23} 557','#666c5c',3)
    s+=g('truck-bed-back',p('M691 449 L1025 433 L1030 508 L689 525Z','#707d79')+p('M690 449 L714 431 L1032 419 L1025 438Z','#8b968c')+p('M700 470 L1019 457 L1021 477 L698 491Z','#99896a')+l('M730 443 L727 515 M843 439 L840 511 M955 434 L954 506','#4e6059',8))
    if with_passengers:s+=truck_passengers()
    s+=g('truck-cab',p('M1023 418 L1047 379 L1130 379 L1184 454 L1211 466 L1227 540 L1192 556 Q1195 527 1169 515 Q1138 499 1114 519 L1095 555 L1022 550Z','#6e8580')+p('M1044 387 L1122 387 L1159 440 L1045 439Z','#3f5351')+p('M1056 395 L1116 395 L1143 432 L1056 432Z','#a3b2aa')+p('M1132 390 L1173 448 L1158 451 L1119 391Z','#b7b9a0')+p('M1170 455 L1207 469 L1219 509 L1168 501Z','#8f9a88')+p('M1029 449 L1148 453 L1131 506 L1094 547 L1030 541Z','#7e9085')+l('M1045 451 L1045 522 L1093 531 M1064 466 L1080 466','#40584e',3)+p('M1195 486 L1211 490 L1216 503 L1199 501Z','#cec1a0')+p('M1208 522 L1232 523 L1235 540 L1206 540Z','#5d6558'))
    if with_passengers:s+=truck_driver()
    # Front edge of the cargo bed sits at passengers' laps, not their necks.
    s+=g('truck-bed-front',p('M686 492 L1028 480 L1029 548 L688 561Z','#7b8a80')+p('M686 495 L1029 482 L1028 500 L687 513Z','#a69b7a')+p('M691 528 L1025 516 L1025 537 L691 549Z','#8b7c5c')+l('M711 499 L711 552 M823 495 L823 548 M930 490 L930 545 M1016 486 L1017 542','#4e6058',7)+l('M722 534 L805 530 M836 531 L908 528 M944 527 L995 524','#bbac82',2))
    s+=g('truck-rear-step',p('M672 549 L704 547 L706 567 L672 571Z','#5b6355')+p('M687 519 L699 518 L699 537 L687 538Z','#9c5747'))
    if not with_passengers:
        s+=g('luggage',p('M726 468 L753 453 L791 461 L791 486 L728 488Z','#968367')+l('M753 455 L753 484 M728 474 L789 474','#665c47',3)+p('M953 456 Q969 434 989 451 L999 476 L951 479Z','#777d67'))
    return s

def sedan():
    s=ellipse(1002,596,229,29,'#887657')
    s+=g('sedan-wheels',ellipse(851,569,39,42,'#3f443b')+ellipse(851,569,19,24,'#7e8170')+ellipse(1154,566,38,42,'#3f443b')+ellipse(1154,566,19,23,'#7e8170'))
    s+=g('sedan-body',p('M781 506 L830 492 L895 421 L1037 416 L1116 479 L1197 494 L1231 519 L1225 560 L1202 575 L1192 574 Q1194 524 1155 522 Q1117 523 1111 577 L893 580 Q893 529 853 528 Q813 528 809 575 L781 568 L770 545Z','#8c4d40')+p('M789 507 L836 500 L897 434 L1033 429 L1096 480 L845 493Z','#ad6650')+p('M902 436 L955 434 L953 482 L854 488Z','#46544c')+p('M966 434 L1027 432 L1082 479 L965 482Z','#46544c')+p('M908 443 L945 442 L944 472 L871 478Z','#82948a')+p('M975 443 L1025 441 L1064 472 L975 474Z','#8b9a90')+p('M1115 487 L1190 502 L1211 523 L1102 519Z','#a75f4b')+l('M955 491 L952 559 M1102 495 L1095 562 M805 551 L812 550 M896 552 L1100 551','#673b33',3)+l('M913 503 L930 502 M1062 500 L1078 501','#c1ae8c',4)+p('M1206 523 L1226 529 L1225 543 L1206 539Z','#c8b68f')+p('M773 537 L791 538 L792 557 L775 553Z','#b38564')+p('M776 561 L811 565 L809 575 L777 572Z','#827f68')+p('M1193 562 L1227 552 L1229 566 L1197 577Z','#827f68'))
    # Open near-side front door: a narrow perspective panel and visible interior gap.
    s+=g('sedan-open-door',p('M962 491 L1056 487 L1068 563 L957 567Z','#3e4035')+p('M964 490 L1014 510 L1044 607 L991 599Z','#9f5846')+p('M963 490 L962 439 L1002 452 L1014 510Z','#70463b')+p('M969 447 L996 458 L1005 495 L971 484Z','#798f85')+l('M1015 518 L1035 590 M972 508 L985 513','#c17c5c',3)+l('M1004 547 L1019 551','#3e4035',4))
    return s

def save(name,desc,art):
    OUT.joinpath(name+'.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title desc"><title id="title">{escape(name)}</title><desc id="desc">{escape(desc)}</desc>
<!-- Original code-native game landscape; no film frames, raster imagery, modern bus, or photographic assets embedded. -->
{art}</svg>''')
base=scene_base()
save('road-open-truck','Original mountain road outside the fictional city, mud-brick settlement and a weathered open-bed cargo truck. Empty bed with low rails and luggage, one small cab at the front, no bus body and no roof over the rear.',base+truck(False))
save('road-open-truck-departure','Original departure scene: four passengers seated in the open rear bed: Nura in a pale gray cap and boy disguise to the left of her mother, mother in a muted blue-gray full-body outer covering, little brother, and older sister in a plain headscarf. Yusuf, a simply dressed capped man, is visible driving in the small front cab. No roof over passengers. Nura is embedded and must not be duplicated as an independent stage actor. Father is not aboard.',base+truck(True))
save('road-red-sedan','Original road scene with a dusty red four-door sedan, front passenger door open, no family embedded. Based only on the verified vehicle category in the relative confrontation around 01:15; this is not the original film image and is separate from the game invented open-truck departure.',base+sedan())
print('Wrote 3 original 1280x720 scene SVGs')
