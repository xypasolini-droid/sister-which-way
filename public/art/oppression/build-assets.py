from pathlib import Path
from html import escape

OUT=Path(__file__).parent
INK='#3c352d'; SKIN='#af7f52'; LIGHT='#c69a6e'

def path(d,fill,extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round" {extra}/>'
def line(d,color=INK,w=2,extra=''):
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def group(id,body,extra=''):
    return f'<g id="{id}" {extra}>{body}</g>'
def face(expression='angry',beard=True,cap='turban'):
    # Three-quarter face, looking left. Angular features, narrow eyes, restrained earth colors.
    s=path('M192 94 Q233 66 290 99 L308 164 L295 219 L272 256 L232 259 L201 237 L184 205 L160 187 L178 169 L178 128Z',LIGHT)
    s+=path('M288 143 Q314 129 313 160 Q310 186 294 184',SKIN)
    s+=path('M187 169 L168 189 L191 194 L198 189',SKIN)
    s+=line('M278 151 L278 192 L287 199', '#8c6546',2)
    if beard:
        s+=path('M191 209 L205 213 L215 207 L245 213 L272 203 L298 184 L291 232 L271 269 L235 283 L209 264 L193 240Z','#393b34')
        s+=path('M205 222 L222 213 L244 215 L254 224 L241 226 L221 221Z','#272c27')
    if expression=='angry':
        s+=path('M185 139 L215 151 L231 143 L223 134 L193 128Z','#34372f')
        s+=path('M247 144 L277 132 L282 140 L251 153Z','#34372f')
        s+=path('M187 157 L218 159 L213 169 L192 167Z','#eadcc3')
        s+=path('M246 160 L272 153 L273 164 L252 172Z','#eadcc3')
        s+='<ellipse cx="201" cy="161" rx="4" ry="6" fill="#32312a"/><ellipse cx="257" cy="163" rx="4" ry="6" fill="#32312a"/>'
        s+=path('M213 234 L236 230 L249 239 L221 241Z','#4a3028')+line('M220 233 L237 234','#dbc5a0',2)
        s+=line('M192 148 L185 147 M242 150 L238 145', '#8c6546',2)
    elif expression=='anxious':
        s+=path('M185 139 L220 128 L224 136 L188 149Z','#3f3a30')+path('M246 129 L275 145 L274 152 L246 140Z','#3f3a30')
        s+=path('M187 158 Q202 147 220 157 Q205 172 188 168Z','#eee0c5')+path('M245 160 Q258 151 275 165 Q258 176 245 170Z','#eee0c5')
        s+='<ellipse cx="199" cy="160" rx="5" ry="7" fill="#36332b"/><ellipse cx="255" cy="165" rx="5" ry="7" fill="#36332b"/>'
        s+=line('M215 238 Q230 224 247 235', '#5c3d30',3)
    else:
        s+=path('M186 140 L220 136 L224 145 L188 150Z','#39392f')+path('M246 138 L276 143 L277 151 L247 148Z','#39392f')
        s+=path('M187 159 Q202 151 220 159 Q207 172 189 167Z','#e8dcc4')+path('M247 162 Q263 154 276 165 Q261 174 248 171Z','#e8dcc4')
        s+='<ellipse cx="201" cy="161" rx="4" ry="6" fill="#31342d"/><ellipse cx="258" cy="165" rx="4" ry="6" fill="#31342d"/>'
        s+=line('M215 234 L245 234', '#6e4837',2.5)
    if cap=='turban':
        s+=path('M170 115 L171 84 Q192 40 248 41 Q292 43 310 75 L319 123 L306 144 L289 120 L272 94 L239 99 L203 118 L184 142Z','#696852')
        s+=path('M171 89 Q216 64 300 78 L314 99 Q228 81 177 123Z','#85816a')
        s+=line('M184 74 Q228 52 283 65 M182 102 Q238 83 305 97 M200 116 L289 102', '#4f5143',3)
        s+=path('M299 123 L325 137 L332 302 L311 318 L309 184 L292 157Z','#5b5d4a')
    else:
        s+=path('M175 111 L177 77 Q225 47 286 77 L304 105 L303 126 L180 133Z','#c8c3ad')
        s+=path('M177 109 Q228 88 302 108 L303 126 Q224 110 180 135Z','#a8a28c')
        s+=line('M193 85 L193 105 M210 78 L211 99 M229 75 L230 95 M248 76 L249 95 M269 82 L270 99', '#9b967f',2)
    return group('head',s)

def shoes(left='M164 957 L219 956 L226 982 L246 994 Q246 1007 228 1007 L145 1006 L134 995Z',right='M281 956 L333 954 L342 981 L378 993 L374 1007 L278 1007 L269 996Z'):
    return group('feet',path(left,'#594e3e')+path(right,'#584c3d')+line('M147 996 L231 999 M281 996 L365 999','#302b24',3))

def man_body(tunic='#9a9277',vest='#4a4c3c',pose='point',weapon=False):
    s=group('legs',path('M169 702 L255 709 L262 844 L224 965 L163 965 L148 874Z','#807e68')+path('M249 712 L324 701 L350 879 L335 967 L278 968 L257 875Z','#898570')+path('M171 760 L207 876 L180 941 L158 919Z','#6d6e5b')+path('M303 783 L280 887 L320 946 L339 928Z','#6d6b57'))
    s+=shoes()
    s+=group('body',path('M177 273 L220 252 L269 256 L321 281 L344 726 Q266 750 155 729Z',tunic)+path('M180 273 L217 252 L232 294 L223 549 L151 568 L158 359Z',vest)+path('M265 259 L296 267 L327 291 L349 564 L273 553 L253 298Z',vest)+line('M234 291 L252 312 L254 645 M172 693 L219 701 M285 698 L327 691','#5c5b48',2)+line('M167 550 L202 539 M284 535 L326 543','#33392e',3))
    # Left arm projects into the family's space; blocking fingers are individual shapes.
    if pose=='point':
        arm=path('M178 283 Q159 275 143 301 L115 358 L69 370 L65 423 L130 433 L174 371 L194 320Z',tunic)+path('M70 373 L42 375 L18 366 Q9 371 18 380 L40 390 L20 396 Q12 402 22 406 L48 402 L53 422 L68 421Z',LIGHT)+line('M51 387 L65 389 M49 402 L63 401','#8e6546',2)
    elif pose=='block':
        arm=path('M179 281 L148 293 L116 370 L80 404 L107 444 L161 411 L196 331Z',tunic)+path('M84 406 L64 386 L54 353 Q48 341 43 350 L44 385 L34 353 Q27 345 23 354 L29 389 L17 366 Q8 359 7 369 L23 411 L42 434 L65 444 L105 434Z',LIGHT)+line('M43 387 L51 411 M30 391 L42 417','#8e6546',2)
    elif pose=='pull':
        arm=path('M177 279 L143 294 L117 393 L56 438 L88 478 L165 434 L197 327Z',tunic)+path('M62 437 L33 444 L14 465 L24 476 L43 466 L38 489 L49 497 L65 474 L85 475 L91 457Z',LIGHT)
    else:
        arm=path('M179 280 L146 294 L119 445 L132 525 L174 516 L191 354Z',tunic)+path('M133 514 L129 552 L142 584 L153 578 L148 548 L161 564 L168 556 L172 519Z',LIGHT)
    s+=group('arm-left',arm)
    s+=group('arm-right',path('M312 281 Q335 286 348 316 L383 445 L369 509 L326 496 L329 414 L300 335Z',tunic)+path('M328 489 L323 523 L333 546 L343 544 L345 527 L356 539 L369 527 L372 503Z',LIGHT))
    if weapon:
        s+=group('rifle-slung',path('M291 304 L310 314 L208 683 L183 699 L175 681 L196 650Z','#282e29')+path('M200 627 L227 635 L217 682 L192 678Z','#6a4931')+line('M323 300 L185 661','#342f27',12)+path('M183 646 L168 684 L171 730 L189 736 L199 693Z','#604632')+path('M232 571 L253 581 L238 628 L220 624Z','#292d26'))
    return s

def male(name,desc,tunic='#9a9277',vest='#4a4c3c',expr='angry',pose='point',weapon=False,cap='turban',beard=True):
    s=man_body(tunic,vest,pose,weapon)+face(expr,beard,cap)
    if name=='patrol':
        s+=group('cane',line('M355 493 L363 978','#493727',13)+line('M352 492 L360 976','#8f6c3b',4))
    save(name,desc,s)
    return s

def save(name,desc,content):
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="1024" viewBox="0 0 512 1024" role="img" aria-labelledby="title desc">
<title id="title">{escape(name)}</title><desc id="desc">{escape(desc)}</desc>
<!-- Original editable game art. Fictional Afghan setting circa 2001, not a claim about all Muslim dress. -->
{content}
</svg>'''
    (OUT/f'{name}.svg').write_text(svg)

base=male('patrol','A hostile young patrolman, dark olive turban and waistcoat, angry eyes and shouted orders, pointing at the family with a wooden cane in the other hand.', '#92917a','#454a3a',beard=False)
male('armed-patrol','An older armed patrolman in an earth toned long tunic and turban, heavy beard and angry expression, rifle slung diagonally, blocking the street.','#77745f','#3f4638',weapon=True)
male('relative','The abusive relative in a dusty maroon waistcoat and tan tunic, ordering the family to leave and reaching to pull someone by the wrist.','#ac9a79','#6b4740',pose='point',cap='cap')
male('merchant','A bread seller in a sand colored tunic and worn olive waistcoat, sharply knitted brows and an extended blocking palm.','#b2a286','#69694f',pose='block',cap='cap')
male('recruit','An intimidating recruiter with dark green waistcoat, covered arms and a lowered slung rifle, pointing children toward military labor.','#8b8870','#394637',weapon=True)
# Purpose-drawn cane poses preserve the body baseline and face identity.
for name, arm, cane in [
 ('patrol-raised',path('M313 284 L342 281 L398 204 L390 128 L351 134 L350 185 L306 235Z','#92917a')+path('M351 138 L345 112 L353 89 L367 93 L379 86 L392 100 L389 129Z',LIGHT),line('M369 105 L180 20','#493727',13)+line('M369 102 L180 17','#9a7745',4)),
 ('patrol-strike',path('M315 283 L336 282 L301 371 L160 421 L144 380 L267 327Z','#92917a')+path('M158 381 L129 385 L115 400 L125 419 L150 423 L170 406Z',LIGHT),line('M137 404 L21 578','#493727',13)+line('M134 403 L18 576','#9a7745',4))]:
    # Regenerate the neutral body rather than layering a second visible arm.
    import re
    v=re.sub(r'<g id="arm-right"[^>]*>.*?</g>',group('arm-right',arm),base)
    v=re.sub(r'<g id="cane"[^>]*>.*?</g>',group('cane',cane),v)
    save(name,'Same patrolman, purpose-drawn arm and cane pose: '+name.replace('patrol-','')+'.',v)

# Mother: the face is intentionally hidden by the chadari mesh. Expression comes from posture, never drawn eyes over the mesh.
BLUE='#6f8390'; BLUE_D='#526c7a'; BLUE_L='#94a4a7'
def mesh(x,y,w=66,h=50):
    s=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="#637985" stroke="#536773" stroke-width="2"/>'
    for a in range(7): s+=line(f'M{x+a*w/6:g} {y} L{x+a*w/6:g} {y+h}',BLUE_L,1.5)
    for a in range(6): s+=line(f'M{x} {y+a*h/5:g} L{x+w} {y+a*h/5:g}',BLUE_L,1.5)
    return group('face-mesh',s)

def mother_stand(shield=False):
    s=shoes('M180 971 L222 970 L228 990 L246 999 L239 1008 L170 1008 L163 998Z','M286 971 L327 970 L344 999 L332 1008 L275 1008 L271 998Z')
    s+=group('body',path('M202 162 Q245 121 282 160 Q312 196 317 281 L347 554 L392 985 Q266 1011 127 987 L153 744 L176 443 L176 287Z',BLUE)+path('M260 205 L277 288 L303 590 L338 986 L305 993 L267 641 L249 342Z',BLUE_D)+path('M199 292 L182 545 L162 975 L194 988 L214 590 L231 294Z','#81949c')+line('M236 326 L222 977 M278 373 L304 983 M188 483 L157 983','#465f6c',2))
    s+=group('head',path('M184 178 Q185 112 234 102 Q290 92 311 144 L323 274 L292 312 L177 301Z',BLUE)+path('M187 178 Q217 145 282 153 L305 198 L300 292 L179 299Z',BLUE_L)+mesh(209,182,70,53)+line('M189 272 Q234 252 300 275',BLUE_D,3))
    if not shield:
        s+=group('arm-left',path('M188 308 L166 339 L155 451 L258 428 L263 391 L202 390 L218 332Z',BLUE)+path('M258 389 L286 379 L321 381 L332 393 L320 402 L289 399 L272 422 L256 426Z',LIGHT))
        s+=group('arm-right',path('M297 311 L319 326 L332 402 L384 390 L397 425 L337 445 L298 419 L278 343Z',BLUE)+path('M384 392 L413 378 L445 379 L456 390 L449 400 L420 399 L397 420Z',LIGHT))
    else:
        s+=group('arm-left',path('M185 315 L159 312 L139 245 L173 165 L211 186 L178 251 L210 305Z',BLUE)+path('M175 168 L182 143 L199 124 L211 132 L206 156 L222 151 L230 162 L211 187Z',LIGHT))
        s+=group('arm-right',path('M300 311 L331 302 L346 226 L302 153 L270 174 L309 235 L283 302Z',BLUE)+path('M302 156 L289 131 L273 123 L263 135 L274 156 L256 156 L253 171 L276 180Z',LIGHT))
    return s
save('mother-plead','Mother standing in a muted blue full chadari with woven face mesh, both hands extended pleading. The garment conceals her face.',mother_stand())
save('mother-shield','Mother curls her shoulders and raises both covered arms to protect her head under a muted blue chadari, woven face mesh intact, no blood.',mother_stand(True))
fallen=group('body',path('M218 512 Q255 478 289 526 L316 653 L353 749 L416 866 L424 984 L145 1002 L86 961 L112 833 L142 702 L155 601Z',BLUE)+path('M286 619 L321 772 L386 966 L336 991 L248 783 L230 641Z',BLUE_D)+path('M153 704 L129 876 L111 951 L166 979 L194 789 L217 674Z','#8a9da4')+line('M196 784 L168 986 M269 793 L317 988 M333 869 L383 981',BLUE_D,3))
fallen+=group('feet',path('M307 970 L369 968 L401 986 L389 1008 L311 1007Z','#554b40'))
fallen+=group('head',path('M177 531 Q166 483 187 452 Q224 414 267 444 L308 490 L314 582 L287 627 L182 602Z',BLUE)+path('M189 490 L251 459 L291 500 L298 570 L204 595Z',BLUE_L)+mesh(210,494,65,46))
fallen+=group('arm-left',path('M180 599 L142 609 L118 716 L68 812 L101 838 L162 759 L205 667Z',BLUE)+path('M67 810 L42 830 L29 865 L40 876 L59 854 L72 855 L73 879 L89 877 L103 837Z',LIGHT))
fallen+=group('arm-right',path('M286 610 L317 617 L331 672 L291 703 L241 626 L264 597Z',BLUE)+path('M267 600 L261 569 L237 554 L229 566 L244 585 L230 590 L236 609Z',LIGHT))
save('mother-fallen','Mother on bent knees, collapsed low under her blue chadari, one hand braced against the ground and the other protecting her head. No blood.',fallen)

# Girl's face uses the same green scarf, long narrow nose, almond eyes, changed brows and open mouth.
def girl_head(cx=258,cy=160,fear=True,tilt=0):
    g=path('M201 59 Q248 30 295 69 L322 130 L307 240 L281 276 L219 250 L185 188 L184 119Z','#344a38')
    g+=path('M234 98 L277 90 L302 129 L295 187 L279 221 L253 237 L216 217 L205 189 L208 139Z','#be8a58')
    g+=path('M230 103 L246 89 L280 98 L299 118 L282 115 L264 101 L273 116 L247 105 L230 119Z','#262f25')
    g+=path('M215 144 Q233 130 251 143 Q234 159 216 153Z','#eee0c4')+path('M271 143 Q283 134 295 144 L291 155 L274 155Z','#eee0c4')
    g+='<ellipse cx="237" cy="146" rx="5" ry="8" fill="#393a2e"/><ellipse cx="286" cy="146" rx="4" ry="8" fill="#393a2e"/>'
    g+=line('M216 128 L244 119 M273 120 L293 128','#3e3b2e',4)
    g+=line('M269 151 L270 184 L261 188','#795238',2)
    g+=path('M247 206 Q260 194 275 203 L270 215 L252 216Z','#5c392b')
    if fear: g+=path('M232 157 Q225 176 234 180 Q242 174 232 157Z','#bbd0cf')
    g+=path('M192 136 L207 194 L233 240 L299 259 L318 326 L205 308 L165 273 L178 202Z','#304a35')
    g+=path('M194 241 L214 268 L301 274 L323 320 L189 365 L152 330 L163 279Z','#3d5941')
    g+=line('M186 262 L235 290 L296 286 M201 74 Q178 129 185 189','#253d2c',2)
    return group('head',g,f'transform="translate({cx-258} {cy-160}) rotate({tilt} 258 160)"')

fear=group('legs',path('M186 728 L247 731 L243 856 L216 964 L166 960 L164 874Z','#817b69')+path('M253 735 L306 724 L324 866 L351 969 L299 976 L274 886Z','#8b816d')+path('M190 787 L202 879 L182 937 L166 916Z','#6c6b5b'))
fear+=shoes('M169 955 L218 961 L212 984 L229 1002 L220 1008 L140 1007 L137 992Z','M297 965 L348 962 L366 983 L395 996 L389 1008 L302 1008 L293 995Z')
fear+=group('body',path('M197 293 L290 300 L320 425 L328 747 L173 753 L165 401Z','#8c8a70')+path('M196 357 L211 524 L192 727 L171 744 L175 449Z','#737963')+line('M247 373 L260 726 M288 500 L305 724','#5d6653',2))
fear+=group('arm-left',path('M191 302 L168 310 L146 390 L169 483 L208 467 L188 393 L216 336Z','#96917a')+path('M170 469 L172 442 L189 416 L202 424 L195 446 L218 433 L224 445 L207 470 L194 487Z',LIGHT))
fear+=group('arm-right',path('M291 306 L316 318 L337 405 L315 474 L280 457 L298 403 L271 340Z','#96917a')+path('M282 459 L274 431 L258 414 L246 424 L258 444 L235 440 L232 453 L258 473 L276 479Z',LIGHT))
fear+=girl_head(250,168,True,-5)
save('hero-fear','Nura in her plain green headscarf and long tunic, stepping backward with raised defensive hands, frightened eyes, tear and open mouth.',fear)
helping=group('legs',path('M185 708 L249 720 L210 845 L179 960 L122 963 L134 841Z','#817b69')+path('M243 709 L305 741 L356 862 L382 969 L324 979 L293 883 L238 837 L216 789Z','#8b816d'))
helping+=shoes('M125 950 L178 954 L182 980 L207 997 L198 1008 L106 1008 L101 994Z','M327 963 L378 959 L396 981 L438 995 L433 1008 L332 1008 L322 996Z')
helping+=group('body',path('M186 442 L272 389 L313 467 L308 614 L298 747 L181 761 L149 665 L159 523Z','#8c8a70')+path('M175 520 L178 653 L206 738 L177 753 L150 659 L157 550Z','#747963')+line('M258 482 L269 699 M220 554 L209 710','#5d6653',2))
helping+=group('arm-left',path('M199 452 L174 471 L177 568 L262 656 L287 625 L219 547 L224 472Z','#96917a')+path('M263 632 L283 624 L311 644 L322 668 L310 675 L299 660 L299 684 L285 690 L279 667 L266 660Z',LIGHT))
helping+=group('arm-right',path('M278 423 L306 427 L327 504 L354 594 L322 610 L292 551 L263 478Z','#96917a')+path('M325 597 L354 592 L379 615 L386 645 L374 650 L365 629 L359 655 L344 657 L341 628 L328 619Z',LIGHT))
helping+=girl_head(270,318,True,20)
save('hero-help','Nura bends at the waist and knees to reach toward her injured mother, green scarf in place, eyes wide with fear and grief, two hands extended.',helping)

# Film verification 00:06:10: his right leg (viewer-left in this frontal pose) is absent.
# Do not add a prosthetic. The empty trouser end is folded, with one supporting leg.
def father_crutch(dropped=False):
    return group('crutch', path('M119 398 L148 399 L130 981 L115 1007 L104 1006 L109 979Z','#8d7655')+path('M92 382 Q125 367 163 383 L162 405 Q125 392 93 405Z','#66523a')+path('M115 583 L145 584 L142 604 L114 603Z','#584a35')+line('M131 411 L116 978','#b69a6d',4))
f=father_crutch(True)
f+=group('legs',path('M173 710 L246 722 L239 786 Q204 806 169 784 L161 765Z','#99947b')+path('M170 768 Q207 751 241 770 L239 791 Q205 811 170 791Z','#827d68')+line('M178 780 Q207 771 231 781','#575b4b',2)+path('M250 717 L317 712 L335 847 L360 964 L307 977 L272 864Z','#a7a18a'))
f+=group('feet',path('M308 966 L357 957 L375 985 L414 997 L408 1009 L317 1008 L302 993Z','#584c3d')+line('M319 999 L402 1001','#302b24',3))
f+=group('body',path('M178 293 L270 275 L315 314 L336 744 L166 751 L151 457Z','#a9a188')+path('M176 295 L218 273 L238 315 L213 565 L153 574 L154 389Z','#60664e')+path('M264 276 L297 291 L321 316 L345 563 L272 558 L250 314Z','#60664e')+line('M241 329 L253 710 M184 698 L217 706','#6b7158',2))
f+=group('arm-left',path('M177 301 L150 310 L121 447 L142 524 L178 511 L168 438 L199 337Z','#a9a188')+path('M144 514 L144 548 L156 575 L168 571 L165 548 L184 556 L191 545 L178 513Z',LIGHT))
f+=group('arm-right',path('M299 296 L322 299 L350 323 L404 280 L428 310 L370 374 L332 374 L286 341Z','#a9a188')+path('M406 283 L424 265 L451 261 L467 272 L459 285 L443 282 L426 309Z',LIGHT))
f+=face('anxious',True,'cap')
save('father-drag','Father is pulled by an outstretched wrist, visibly distressed, his right leg absent with an empty folded trouser end and one supporting left leg. A wooden axillary crutch is visible. No invented prosthetic.',f)

print('\n'.join(sorted(p.name for p in OUT.glob('*.svg'))))

# Arrest/coercion hand variants are real silhouette changes, not a shifted identical sprite.
armed=(OUT/'armed-patrol.svg').read_text().split('<!-- Original editable game art. Fictional Afghan setting circa 2001, not a claim about all Muslim dress. -->\n',1)[1].rsplit('</svg>',1)[0]
grab=group('arm-left',path('M178 283 L146 293 L107 370 L39 390 L52 435 L130 425 L184 365 L194 320Z','#77745f')+path('M42 393 L18 396 L6 411 L11 425 L29 419 L30 438 L42 442 L52 430 L58 411Z',LIGHT))
save('armed-patrol-grab','Armed patrolman reaching left with a visibly closed grasping hand, used to seize a wrist or sleeve, rifle remains slung.',re.sub(r'<g id="arm-left"[^>]*>.*?</g>',grab,armed))
relative=(OUT/'relative.svg').read_text().split('<!-- Original editable game art. Fictional Afghan setting circa 2001, not a claim about all Muslim dress. -->\n',1)[1].rsplit('</svg>',1)[0]
pull=group('arm-left',path('M177 279 L143 294 L105 365 L32 383 L44 431 L131 420 L184 355 L197 327Z','#ac9a79')+path('M37 385 L13 390 L2 407 L8 421 L24 416 L23 434 L34 439 L46 429 L53 404Z',LIGHT))
save('relative-pull','Abusive relative with an outstretched clutching hand, pulling the family toward the vehicle.',re.sub(r'<g id="arm-left"[^>]*>.*?</g>',pull,relative))

# Low crouching poses for public streets/prison: caps remain on, both knees bend.
# Head top is below y=400, rather than scaling a standing figure downward.
def child_crouch_head(friend=False):
    skin='#ba8b61' if friend else '#bf8e5f'
    cap='#7d7560' if friend else '#c5c1ae'
    band='#5e5a4c' if friend else '#a6a18e'
    h=path('M207 104 L247 86 L282 104 L300 137 L293 189 L273 225 L247 235 L218 217 L201 183 L198 139Z',skin)
    h+=path('M290 144 Q312 137 310 157 Q308 178 294 181Z','#a47650')
    h+=path('M201 111 L216 95 L252 86 L285 109 L300 138 L283 130 L263 111 L269 129 L245 114 L229 120 L225 144 L212 151 L204 175 L194 154Z','#30362c')
    if friend:
        h+=path('M212 144 L242 134 L246 141 L216 151Z','#36372d')+path('M264 136 L289 141 L291 148 L265 144Z','#36372d')
        h+=path('M214 159 Q229 148 247 157 Q232 169 215 166Z','#e8ddc5')+path('M267 159 Q281 151 292 161 L288 169 L270 169Z','#e8ddc5')
        h+='<ellipse cx="238" cy="158" rx="4.5" ry="7" fill="#34382e"/><ellipse cx="286" cy="161" rx="4" ry="6" fill="#34382e"/>'
        h+=line('M264 163 L270 187 L261 194','#825a40',2)+line('M246 210 Q259 205 271 209','#6c4934',2.5)
    else:
        h+=path('M213 143 L240 128 L246 135 L217 151Z','#34372b')+path('M265 131 L289 142 L288 149 L266 140Z','#34372b')
        h+=path('M214 158 Q230 145 247 157 Q233 172 216 167Z','#f0e3c9')+path('M266 160 Q281 148 292 161 L288 172 L269 171Z','#f0e3c9')
        h+='<ellipse cx="235" cy="158" rx="5" ry="8" fill="#34382e"/><ellipse cx="283" cy="162" rx="4.5" ry="8" fill="#34382e"/>'
        h+=line('M265 164 L268 189 L260 194','#825a40',2)+path('M247 211 Q258 201 271 210 L268 221 L251 221Z','#5c392b')
        h+=path('M226 169 Q221 184 227 188 Q234 184 226 169Z','#bfd3ce')
    h+=path('M196 105 L196 77 Q216 47 252 47 Q282 48 299 76 L304 105 Q253 90 196 113Z',cap)
    h+=path('M195 100 Q245 81 303 99 L305 116 Q246 101 198 122Z',band)
    h+=line('M209 80 Q247 60 286 77', '#93917e' if not friend else '#575b4b',2)
    # The friend looks around the corner; Nura lowers her face into defensive arms.
    return group('head',h, 'transform="translate(7 390) rotate(-6 250 160)"' if friend else 'transform="translate(-7 386) rotate(6 250 160)"')

def crouch(friend=False):
    tunic='#85816d' if friend else '#b5b2a0'
    shade='#6e705e' if friend else '#979b88'
    trouser='#777663' if friend else '#aaa997'
    skin='#ba8b61' if friend else '#bf8e5f'
    s=group('legs',path('M195 749 L253 773 L222 834 L172 875 L195 964 L138 979 L103 870 Q100 837 125 810Z',trouser)+path('M260 754 L309 750 L376 811 Q394 830 385 854 L349 970 L290 974 L313 858 L256 842 L230 810Z',trouser)+path('M130 821 L161 846 L143 871 L170 946 L143 960 L115 872Z',shade)+path('M346 828 L364 843 L331 956 L309 958 L327 853 L289 832Z',shade)+line('M151 890 L164 939 M343 867 L323 937','#666b5b',2))
    s+=group('feet',path('M139 959 L190 951 L203 980 L229 994 L226 1008 L114 1008 L108 993Z','#5a5143')+path('M290 958 L346 956 L360 983 L402 995 L400 1008 L286 1008 L278 994Z','#5a5143')+line('M120 998 L215 1000 M291 998 L391 1000','#3d3b31',3))
    s+=group('body',path('M207 615 L249 603 L283 619 L305 677 L327 748 L349 844 Q246 861 149 844 L163 761 L176 668Z',tunic)+path('M177 679 L198 701 L182 791 L164 834 L149 844 L163 758Z',shade)+path('M280 650 L300 685 L317 790 L327 838 L299 842 L271 727Z',shade)+line('M242 641 L252 695 L247 773 M179 817 L213 826 M285 825 L326 818','#737966',2))
    # Forearms fold over a raised knee and chest, not behind the silhouette.
    s+=group('arm-left',path('M198 632 L175 650 L156 725 L182 770 L218 750 L198 713 L226 660Z',tunic)+path('M183 751 L193 730 L216 711 L229 718 L219 734 L243 730 L248 743 L225 761 L206 772Z',skin)+line('M221 739 L234 737','#8e6546',2))
    if friend:
        s+=group('arm-right',path('M283 630 L306 640 L330 713 L306 759 L273 740 L294 706 L264 662Z',tunic)+path('M274 738 L260 721 L244 716 L232 722 L236 734 L254 740 L247 754 L257 766 L279 762Z',skin))
    else:
        s+=group('arm-right',path('M282 630 L308 644 L321 717 L288 758 L261 735 L282 704 L257 659Z',tunic)+path('M266 739 L248 722 L226 722 L216 732 L226 745 L246 747 L244 763 L260 771 L281 756Z',skin))
    s+=child_crouch_head(friend)
    return s

save('hero-worker-crouch','Nura disguised as a boy in a plain pale gray cap, knee-length gray tunic and loose trousers, crouching low with both knees bent, arms protecting her chest, frightened eyes and a small tear. Her cap remains on in public.',crouch(False))
save('friend-worker-crouch','Layla disguised as a boy in a darker gray-brown cap, long tunic and loose trousers, crouching on bent knees, turning her head to watch the street from cover. Her cap remains on in public.',crouch(True))

# The father gets up to shield his daughter: a distinct defensive pose, not the dragging asset.
f_shield=man_body('#a9a188','#60664e','neutral',False)
f_shield=re.sub(r'<g id="legs"[^>]*>.*?</g>',group('legs',path('M169 702 L251 709 L245 782 Q210 805 172 783 L159 758Z','#99947b')+path('M168 770 Q204 754 246 770 L243 793 Q208 811 171 793Z','#827d68')+line('M181 781 Q208 771 235 781','#575b4b',2)+path('M249 712 L324 701 L350 879 L335 967 L278 968 L257 875Z','#a7a18a')+path('M303 783 L280 887 L320 946 L339 928Z','#8a8971')),f_shield)
f_shield=re.sub(r'<g id="feet"[^>]*>.*?</g>',group('feet',path('M281 956 L333 954 L342 981 L378 993 L374 1007 L278 1007 L269 996Z','#584c3d')+line('M281 996 L365 999','#302b24',3)),f_shield)
f_shield=father_crutch()+f_shield
shield_left=group('arm-left',path('M178 283 L151 293 L125 365 L76 411 L91 456 L151 422 L192 341 L199 314Z','#a9a188')+path('M80 413 L57 408 L30 410 L17 422 L24 434 L47 430 L27 443 L34 454 L62 449 L84 459 L97 438Z',LIGHT)+line('M45 426 L67 430','#8e6546',2))
shield_right=group('arm-right',path('M312 284 L338 282 L369 324 L402 269 L440 291 L407 369 L377 391 L334 360 L301 330Z','#a9a188')+path('M404 273 L398 247 L400 217 Q404 206 410 216 L414 238 L416 198 Q421 187 425 198 L427 238 L435 209 Q441 198 445 210 L443 246 L454 228 Q463 221 464 231 L452 268 L437 292 L418 286Z',LIGHT)+line('M415 249 L419 272 M428 248 L429 275 M441 252 L437 275','#8e6546',2))
f_shield=re.sub(r'<g id="arm-left"[^>]*>.*?</g>',shield_left,f_shield)
f_shield=re.sub(r'<g id="arm-right"[^>]*>.*?</g>',shield_right,f_shield)
f_shield+=face('anxious',True,'cap').replace('<g id="head" >','<g id="head" transform="translate(512 0) scale(-1 1)">')
save('father-shield','Father shields his daughter with one arm extended back and his other palm toward the patrolman, worried but firm. His right leg is absent: the empty trouser end is folded, only the left foot reaches the ground, and an axillary crutch braces him. No prosthetic.',f_shield)

# A neutral single-leg standing pose for the arrest entrance, not a shielding or dragging pose.
f_stand=f_shield
stand_left=group('arm-left',path('M178 286 L151 300 L118 455 L119 569 L153 577 L166 460 L199 328Z','#a9a188')+path('M119 562 L113 581 L119 609 L134 613 L145 603 L153 576Z',LIGHT)+line('M123 589 L142 590','#8e6546',2))
stand_right=group('arm-right',path('M313 285 L339 300 L372 446 L357 535 L320 528 L327 441 L299 333Z','#a9a188')+path('M322 522 L315 552 L324 579 L337 580 L341 558 L353 569 L363 558 L360 531Z',LIGHT))
f_stand=re.sub(r'<g id="arm-left"[^>]*>.*?</g>',stand_left,f_stand)
f_stand=re.sub(r'<g id="arm-right"[^>]*>.*?</g>',stand_right,f_stand)
save('father-standing-crutch','Father before the arrest: one remaining leg, folded empty trouser end, axillary wooden crutch under one arm, hand gripping the support. Pale cap, long tunic, olive-brown waistcoat. His disability predates the arrest.',f_stand)

# Seated on the ground by his market wares; only one foot and no invented prosthesis.
f_market=group('crutches',path('M376 438 L395 440 L433 1005 L416 1007Z','#8d7655')+path('M351 420 Q379 410 408 425 L408 444 Q380 434 353 443Z','#66523a')+path('M398 624 L419 623 L420 645 L399 646Z','#584a35')+path('M421 491 L439 489 L475 1006 L458 1007Z','#8d7655')+path('M399 473 Q429 460 455 475 L454 493 Q429 485 400 493Z','#66523a')+line('M384 453 L425 985 M432 501 L465 991','#b69a6d',3))
f_market+=group('legs',path('M178 823 L257 811 L321 850 L356 925 L330 976 L229 979 L159 930 L121 882Z','#a7a18a')+path('M149 839 Q172 810 207 823 L238 850 L213 892 Q182 895 151 872Z','#99947b')+path('M152 853 Q180 841 214 864 L207 890 Q175 893 150 872Z','#827d68')+path('M255 866 L284 861 L319 918 L295 950 L238 935 L212 909Z','#8c8b74')+line('M234 944 L279 957 M289 911 L308 938','#666b57',3))
f_market+=group('feet',path('M286 931 L332 938 L337 966 L366 981 L360 998 L284 999 L267 982Z','#584c3d')+line('M286 989 L352 989','#302b24',3))
f_market+=group('body',path('M177 592 L217 566 L278 572 L316 601 L332 859 Q257 897 151 854 L154 698Z','#a9a188')+path('M177 590 L216 568 L236 610 L217 798 L151 813 L157 667Z','#60664e')+path('M268 574 L299 591 L320 611 L338 804 L276 804 L251 610Z','#60664e')+line('M242 630 L251 834','#666b57',2))
f_market+=group('arm-left',path('M178 605 L150 619 L127 753 L162 812 L197 787 L169 741 L205 642Z','#a9a188')+path('M163 788 L181 776 L204 785 L222 803 L215 819 L194 807 L183 819 L168 811Z',LIGHT))
f_market+=group('arm-right',path('M303 600 L329 624 L351 755 L310 808 L277 782 L312 742 L279 641Z','#a9a188')+path('M280 779 L259 774 L235 793 L237 811 L258 806 L266 820 L284 812 L300 794Z',LIGHT))
f_market+=group('letter',path('M190 750 L272 763 L264 826 L181 810Z','#dbcfb0')+line('M201 767 L260 777 M198 779 L248 788 M196 791 L253 803','#8c8165',2))
f_market+=face('anxious',True,'cap').replace('<g id="head" >','<g id="head" transform="translate(0 320)">')
save('father-market','Father seated on the ground at his market stall reading a letter, with a folded empty trouser end, one remaining foot, and two wooden axillary crutches resting beside him. His disability is present before arrest.',f_market)

# After release he is too weak to stand. Entire wooden handcart stays inside the actor canvas.
cart=group('cart-wheel',path('M325 873 Q373 855 395 898 Q418 950 385 992 Q352 1019 321 985 Q294 935 325 873Z','#4d483a')+path('M336 896 Q363 882 377 909 Q393 946 371 975 Q348 991 332 968 Q315 934 336 896Z','#85775b')+line('M352 897 L355 981 M326 937 L386 939 M333 908 L377 972 M374 905 L333 975','#4b483a',6))
cart+=group('cart-frame',path('M57 818 L438 846 L427 874 L54 847Z','#7e6547')+path('M66 847 L81 947 L104 948 L97 850Z','#67553c')+path('M409 865 L453 965 L472 962 L433 851Z','#67553c')+path('M32 784 L461 818 L453 850 L31 815Z','#997f58')+line('M50 798 L440 831 M58 819 L429 849','#c2a072',4))
# Body lies horizontally, head supported at left; one sole trouser leg, empty other end is folded.
cart+=group('body',path('M164 728 Q219 713 281 737 L369 771 L411 807 L389 827 L266 806 L155 787Z','#aaa28a')+path('M160 729 L222 727 L262 773 L249 805 L159 786Z','#60664e')+path('M234 752 L322 757 L393 799 L382 823 L295 801 L247 795Z','#b1a990')+path('M290 758 L328 767 L352 793 L328 807 L288 788Z','#827d68')+line('M296 783 L325 796','#575b4b',2))
cart+=group('feet',path('M383 798 L410 806 L437 820 L433 838 L402 838 L377 823Z','#584c3d'))
cart+=group('arm-left',path('M168 747 L186 753 L218 787 L264 787 L267 806 L209 809 L168 784Z','#a9a188')+path('M263 786 L280 787 L294 797 L289 809 L266 806Z',LIGHT))
cart+=group('head',path('M93 697 Q116 672 148 691 L174 722 L168 761 L145 785 L113 778 L88 751 L84 722Z','#b28a63')+path('M107 756 L137 761 L161 745 L157 779 L135 801 L105 785Z','#393b34')+path('M90 716 Q117 687 153 706 L173 725 L178 709 Q144 668 106 684 L87 698Z','#c8c3ad')+line('M105 725 L119 730 M137 731 L151 734','#4f4536',3)+line('M115 722 L121 714 M138 722 L149 723','#4f4536',3)+line('M128 730 L125 747 L135 750','#8b6549',2)+line('M122 770 L139 771','#61412f',2))
cart+=group('blanket',path('M210 754 L247 750 L319 765 L380 799 L372 826 L262 814 L224 797Z','#7e8572')+line('M255 772 L282 802 M307 779 L334 815','#5e6a59',3))
save('father-rescued','The weakened father lies on a wooden handcart after release, eyes closed, long beard, pale cap and worn olive-gray clothing. One remaining foot is visible, the other trouser end is folded under the blanket. He does not stand or suddenly regain a leg.',cart)

# Adult Nura for the civic-future dream, deliberately distinct from the armed-guardian ending.
b=group('legs',path('M179 669 L250 676 L250 825 L217 967 L158 965 L152 848Z','#8d9580')+path('M248 674 L319 666 L344 838 L339 968 L280 969 L264 840Z','#919980')+path('M179 739 L201 848 L176 946 L158 935 L156 850Z','#737f6c')+path('M302 755 L286 858 L322 946 L339 936 L340 843Z','#79836c')+line('M206 744 L219 856 M300 861 L310 930','#69775f',2))
b+=shoes('M158 955 L218 957 L220 984 L248 996 L243 1008 L147 1008 L139 996Z','M281 958 L338 956 L348 982 L387 996 L383 1008 L278 1008 L269 997Z')
b+=group('body',path('M180 265 L217 250 L270 250 L310 272 L332 410 L330 698 Q254 723 158 698 L162 414Z','#a6aa96')+path('M179 285 L196 341 L186 525 L175 682 L158 698 L162 414Z','#89977e')+path('M290 296 L308 335 L326 543 L330 698 L303 705 L284 495Z','#929f86')+path('M217 255 L236 287 L252 284 L273 257 L261 326 L231 331Z','#778b70')+line('M244 328 L251 676 M178 674 L220 681 M280 680 L316 674','#77876d',2)+line('M220 293 L225 317 M271 293 L268 315','#bac0a6',2))
# Left forearm supports a blank notebook, right arm opens toward another speaker.
b+=group('arm-left',path('M181 278 L152 286 L129 414 L145 510 L190 500 L174 417 L205 311Z','#a6aa96')+path('M150 490 L164 477 L184 484 L202 505 L194 524 L177 515 L159 523 L147 513Z','#be936a'))
b+=group('notebook',path('M180 446 L265 446 L272 552 L185 552Z','#b4a27d')+path('M188 453 L258 453 L263 544 L191 544Z','#e0d5b3')+line('M198 457 L202 540','#bdb18e',1.5)+line('M185 550 L266 550','#7e765b',2))
b+=group('arm-right',path('M309 280 L333 294 L355 389 L392 440 L366 471 L317 424 L289 323Z','#a6aa96')+path('M369 441 L383 434 L403 437 L421 428 L443 429 Q454 433 445 440 L420 444 L444 445 Q455 450 446 456 L420 455 L439 463 Q448 470 438 474 L408 463 L388 469 L371 466 L361 452Z','#be936a')+line('M388 447 L402 453 M403 447 L419 447','#8d694b',2))
# Calm adult face with an opaque, plain green scarf; no exposed hair or military headgear.
h=path('M197 110 Q211 87 243 88 Q276 90 290 116 L289 167 L275 207 L250 231 L222 225 L201 202 L190 167Z','#bf956d')
h+=path('M192 154 L185 174 L195 181 L202 175Z','#b2845c')+path('M281 148 Q302 139 300 160 Q299 178 286 180Z','#b0845e')
h+=path('M199 139 L225 132 L229 139 L202 146Z','#424938')+path('M248 133 L275 140 L275 147 L248 141Z','#424938')
h+=path('M202 154 Q215 147 229 155 Q216 166 203 162Z','#e9dfc3')+path('M248 155 Q262 149 275 158 Q262 168 249 164Z','#e9dfc3')
h+='<ellipse cx="217" cy="157" rx="4" ry="6" fill="#394335"/><ellipse cx="263" cy="159" rx="4" ry="6" fill="#394335"/>'
h+=line('M240 157 L236 180 L244 184','#986f4f',2)+line('M225 200 Q241 207 257 199','#80563e',2.8)+line('M203 178 L208 182 M270 180 L274 175','#ad805b',1.5)
h+=path('M181 125 Q175 67 220 55 Q259 43 291 72 Q312 92 312 132 L307 223 L285 266 L246 287 L201 268 L173 229 L174 175Z','#526f54')
# Reopen the face region as the scarf wraps around its sides rather than covering the face.
h+=path('M198 126 Q203 91 236 87 Q264 88 282 114 L286 161 L276 199 L251 226 L224 220 L204 195 L194 163Z','#bf956d')
h+=path('M198 141 L225 132 L229 139 L202 148Z','#424938')+path('M248 133 L275 140 L275 147 L248 141Z','#424938')
h+=path('M202 155 Q215 148 229 156 Q216 166 203 163Z','#eee3c8')+path('M248 155 Q262 149 275 158 Q262 168 249 164Z','#eee3c8')
h+='<ellipse cx="217" cy="157" rx="4" ry="6" fill="#394335"/><ellipse cx="263" cy="159" rx="4" ry="6" fill="#394335"/>'
h+=line('M240 157 L236 180 L244 184','#986f4f',2)+line('M225 200 Q241 207 257 199','#80563e',2.8)
h+=path('M188 122 Q204 90 236 87 L213 113 L198 151 L203 194 L222 221 L249 237 L286 211 L302 174 L306 221 L282 256 L243 277 L205 256 L183 227 L177 176Z','#617f60')+path('M188 122 Q195 88 221 75 Q254 65 281 91 L294 118 L280 111 Q262 87 237 88 Q209 92 198 124Z','#73906c')+path('M251 237 L286 212 L303 174 L304 221 L279 259 L244 276 L218 261Z','#46684d')+line('M185 154 L185 199 L203 234 M215 247 L243 261 L277 245 M282 85 L294 112','#36533e',2)
b+=group('head',h)
save('adult-builder','Adult Nura in a plain green headscarf, loose gray-green long tunic and wide trousers. One hand supports a blank notebook; the other opens in an invitation for another woman to speak. Calm mature face, no uniform, armor, shield, spear or rifle. Original civilian dream-ending protagonist.',b)
