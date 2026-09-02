"use strict";

const SOURCES={n12:"https://special.n12.co.il/elections2026",likud:"https://www.likud.org.il/",dem:"https://democrats.org.il/",yisrael:"https://beytenu.org.il/",rz:"https://zionutdatit.org.il/",otzma:"https://ozma-yeudit.co.il/",shas:"https://shas.org.il/",hadash:"https://hadash.org.il/",raam:"https://www.raam.org.il/",amcha:"https://amchaisrael.co.il/",launch:"https://www.ynet.co.il/news/elections2026/article/s13ku7jdzg"};

// Position arrays follow the exact order of questions in translations.js.
const PARTIES=[
{id:"beyachad",confidence:"medium",links:[["n12",SOURCES.n12]],p:[0,-1,0,1,2,1,1,0,1,-1,2,1,-1,2,2,-1,2,1,1,2]},
{id:"yashar",confidence:"high",links:[["n12",SOURCES.n12]],p:[1,-1,1,1,2,1,1,0,2,-2,2,2,0,2,1,0,2,1,1,2]},
{id:"blueWhite",confidence:"medium",links:[["n12",SOURCES.n12]],p:[1,-1,1,1,2,1,1,0,2,-1,2,2,0,1,1,0,2,1,1,2]},
{id:"democrats",confidence:"high",links:[["official",SOURCES.dem],["n12",SOURCES.n12]],p:[2,-2,2,0,2,2,2,-2,2,-2,2,2,2,2,-1,2,2,2,2,1]},
{id:"yisraelBeiteinu",confidence:"high",links:[["official",SOURCES.yisrael],["n12",SOURCES.n12]],p:[-1,1,-1,2,2,2,2,-1,1,0,2,2,-1,2,2,-1,2,1,0,1]},
{id:"likud",confidence:"medium",links:[["official",SOURCES.likud],["n12",SOURCES.n12]],p:[-2,1,-1,2,1,0,-1,1,-2,2,-1,-1,-2,-2,2,-1,0,0,0,-1]},
{id:"otzma",confidence:"medium",links:[["official",SOURCES.otzma],["n12",SOURCES.n12]],p:[-2,2,-2,2,1,0,-2,2,-2,2,-2,-1,-2,-2,1,0,-1,-1,-1,-2]},
{id:"religiousZionism",confidence:"high",links:[["official",SOURCES.rz],["n12",SOURCES.n12]],p:[-2,2,-2,2,2,1,-2,2,-2,2,-1,-1,-2,-2,2,-1,0,-1,-1,-1]},
{id:"shas",confidence:"medium",links:[["official",SOURCES.shas],["n12",SOURCES.n12]],p:[-1,0,-1,1,-2,-2,-2,2,-1,1,-1,-1,-2,-2,-1,2,-2,1,0,-1]},
{id:"utj",confidence:"medium",links:[["n12",SOURCES.n12]],p:[-1,0,-1,0,-2,-2,-2,2,-1,1,-1,-1,-2,-2,-1,2,-2,0,0,-1]},
{id:"hadashTaal",confidence:"high",links:[["official",SOURCES.hadash],["n12",SOURCES.n12]],p:[2,-2,2,-2,0,-1,2,-2,2,-2,2,2,1,2,-2,2,1,2,2,0]},
{id:"raam",confidence:"medium",links:[["official",SOURCES.raam],["n12",SOURCES.n12]],p:[2,-2,2,-1,0,-1,0,1,1,-1,2,1,2,1,-1,2,1,2,1,0]},
{id:"balad",confidence:"medium",links:[["n12",SOURCES.n12]],p:[2,-2,2,-2,-1,-1,2,-2,1,-1,2,2,1,2,-2,2,1,2,2,-1]},
{id:"zionistHome",confidence:"medium",links:[["n12",SOURCES.n12]],p:[0,0,0,1,2,2,1,0,1,-1,2,2,-1,2,1,0,2,1,1,2]},
{id:"amcha",confidence:"low",links:[["official",SOURCES.amcha],["launch",SOURCES.launch]],p:[-2,1,-2,2,2,1,-1,1,-1,1,1,0,-2,1,1,0,1,1,0,1]}
];
