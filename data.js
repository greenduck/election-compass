"use strict";

// Bump for changes to question meanings/order or scoring semantics.
const DATA_VERSION="2026-10-23-v3";
const SOURCES={
  "likud": "https://www.likud.org.il/",
  "beyachad": "https://be-yahad.org.il/",
  "yashar": "https://yasharwitheisenkot.com/principles/",
  "dem": "https://yes.democrats.org.il/",
  "yisrael": "https://beytenu.org.il/party-platform/",
  "rz": "https://zionutdatit.org.il/mishpat/",
  "zehut": "https://zehut.org.il/",
  "joint": "https://jointlist.org.il/en/platform/",
  "raam": "https://www.idi.org.il/policy/parties-and-elections/parties/raam/",
  "amcha": "https://amchaisrael.co.il/",
  "reservists": "https://www.themiluimnikim.org.il/platform/",
  "economic": "https://www.hakalkalit.org/",
  "haredi": "https://hatzibur-haharedi.org/",
  "noam": "https://www.noamlisrael.org.il/",
  "justice": "https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/",
  "polls": "https://www.timesofisrael.com/people-of-israel-charedi-public-vow-to-stay-in-race-despite-pressure-from-pm-and-allies/",
  "noamRace": "https://www.walla.co.il/news/politics/383958484",
  "noamInterview": "https://www.emess.co.il/radio/1947910",
  "harediDraft": "https://www.timesofisrael.com/deri-says-like-utj-shas-wont-join-next-government-without-a-draft-exemption-law/",
  "winter": "https://www.timesofisrael.com/winter-says-hell-demand-ultra-orthodox-idf-service-but-will-still-join-coalition-with-haredim/amp/",
  "hendel": "https://www.walla.co.il/news/politics/383958182",
  "arabPartners": "https://www.timesofisrael.com/day-after-meeting-opposition-chiefs-golan-says-arab-parties-could-be-in-next-government/",
  "abbas": "https://www.timesofisrael.com/liveblog_entry/raam-party-chief-abbas-says-netanyahu-win-would-be-catastrophe/",
  "otzma": "https://www.timesofisrael.com/ben-gvir-demands-role-of-defense-minister-in-next-government-gotliv-as-justice-minister/amp/",
  "rzMerger": "https://www.jns.org/news/israel-news/smotrich-feiglin-alliance-submits-final-list-for-oct-27-vote",
  "tropper": "https://www.ynet.co.il/news/elections2026/article/skuwxxiuml",
  "utj": "https://www.ynet.co.il/news/elections2026/article/r1yfwxqomx",
  "coalition": "https://www.timesofisrael.com/herzog-ill-work-to-set-up-stable-government-israel-must-avoid-repeat-elections/amp/",
  "beEducation": "https://be-yahad.org.il/plans-cat/חינוך/",
  "beHousing": "https://be-yahad.org.il/en/plans/together-well-fix-israels-housing-crisis-en/",
  "beMental": "https://be-yahad.org.il/plans/mental-health/",
  "yEducation": "https://yasharwitheisenkot.com/principles/education/",
  "yHousing": "https://yasharwitheisenkot.com/principles/housing/",
  "yHealth": "https://yasharwitheisenkot.com/principles/healthcare/",
  "mentalSurvey": "https://www.mako.co.il/news-israel-elections/2026/Article-b08dbb9982a31a1027.htm",
  "jointSocial": "https://jointlist.org.il/en/platform/10/"
};

// Q1–Q21; null = no established position, 0 = documented neutral/mixed.
// topicEvidence supplies direct citations for the three newly introduced topics.
// Remaining numeric values retain the editorial interpretations in the source review.
// Electoral status never affects scoring. See RESEARCH-2026-10-23.md.
const PARTIES=[
{"id":"beyachad","confidence":"medium","status":"competitive","links":[["official","https://be-yahad.org.il/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"],["interview","https://www.timesofisrael.com/herzog-ill-work-to-set-up-stable-government-israel-must-avoid-repeat-elections/amp/"]],"p":[null,-1,null,2,2,2,null,null,1,null,2,2,-1,2,2,-1,2,1,1,-2,2,2],"topicEvidence":{"3":"https://be-yahad.org.il/plans-cat/חינוך/","11":"https://be-yahad.org.il/en/plans/together-well-fix-israels-housing-crisis-en/","20":"https://be-yahad.org.il/plans/mental-health/","21":"https://be-yahad.org.il/en/plans-cat/the-new-agreement/"}},
{"id":"yashar","confidence":"medium","status":"competitive","links":[["official","https://yasharwitheisenkot.com/principles/"],["merger","https://www.ynet.co.il/news/elections2026/article/skuwxxiuml"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"],["interview","https://www.timesofisrael.com/day-after-meeting-opposition-chiefs-golan-says-arab-parties-could-be-in-next-government/"]],"p":[1,-1,1,2,2,2,null,null,2,-2,2,2,-1,2,1,null,2,2,1,-2,2,null],"topicEvidence":{"3":"https://yasharwitheisenkot.com/principles/education/","11":"https://yasharwitheisenkot.com/principles/housing/","20":"https://yasharwitheisenkot.com/principles/healthcare/"}},
{"id":"democrats","confidence":"high","status":"competitive","links":[["official","https://yes.democrats.org.il/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"],["interview","https://www.timesofisrael.com/day-after-meeting-opposition-chiefs-golan-says-arab-parties-could-be-in-next-government/"]],"p":[2,-2,2,null,2,2,2,-2,2,-2,2,null,2,null,-1,2,2,2,2,-2,2,2],"topicEvidence":{"6":"https://democrats.org.il/content/labor-meretz-voters","20":"https://yes.democrats.org.il/","21":"https://democrats.org.il/content/shabbat-public-transport"}},
{"id":"yisraelBeiteinu","confidence":"high","status":"competitive","links":[["official","https://beytenu.org.il/party-platform/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"],["interview","https://www.timesofisrael.com/day-after-meeting-opposition-chiefs-golan-says-arab-parties-could-be-in-next-government/"]],"p":[-1,1,-1,null,2,2,2,-1,1,-2,2,null,-2,2,2,-1,2,1,null,-2,2,2],"topicEvidence":{"6":"https://beytenu.org.il/party-platform/","20":"https://www.mako.co.il/news-israel-elections/2026/Article-b08dbb9982a31a1027.htm","21":"https://beytenu.org.il/party-platform/"}},
{"id":"likud","confidence":"medium","status":"competitive","links":[["official","https://www.likud.org.il/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"]],"p":[-2,1,-1,null,-1,-1,null,1,-2,1,-1,null,-2,null,2,-1,null,null,null,2,1,null],"topicEvidence":{"20":"https://www.mako.co.il/news-israel-elections/2026/Article-b08dbb9982a31a1027.htm"}},
{"id":"otzma","confidence":"medium","status":"competitive","links":[["interview","https://www.timesofisrael.com/ben-gvir-demands-role-of-defense-minister-in-next-government-gotliv-as-justice-minister/amp/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"]],"p":[-2,2,-2,null,null,null,null,2,-2,2,-2,null,-2,null,1,null,null,-1,null,2,null,null],"topicEvidence":{}},
{"id":"religiousZionism","confidence":"medium","status":"competitive","links":[["component","https://zionutdatit.org.il/mishpat/"],["component","https://zehut.org.il/"],["merger","https://www.jns.org/news/israel-news/smotrich-feiglin-alliance-submits-final-list-for-oct-27-vote"]],"p":[-2,2,-2,null,null,null,null,2,-2,2,-1,null,-2,1,2,-1,null,-1,null,2,null,null],"topicEvidence":{}},
{"id":"shas","confidence":"medium","status":"competitive","links":[["interview","https://www.timesofisrael.com/deri-says-like-utj-shas-wont-join-next-government-without-a-draft-exemption-law/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"]],"p":[-1,null,-1,null,-2,-2,null,2,-1,2,-1,null,-2,-2,-1,1,-2,1,null,1,1,null],"topicEvidence":{"20":"https://www.mako.co.il/news-israel-elections/2026/Article-b08dbb9982a31a1027.htm"}},
{"id":"utj","confidence":"medium","status":"competitive","links":[["interview","https://www.timesofisrael.com/deri-says-like-utj-shas-wont-join-next-government-without-a-draft-exemption-law/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"],["merger","https://www.ynet.co.il/news/elections2026/article/r1yfwxqomx"]],"p":[null,null,null,null,-2,-2,null,2,-1,2,-1,null,-2,-2,-1,1,-2,null,null,1,null,null],"topicEvidence":{}},
{"id":"jointList","confidence":"medium","status":"competitive","links":[["official","https://jointlist.org.il/en/platform/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"]],"p":[2,-2,1,null,-2,null,null,-2,2,-2,1,2,1,-2,-2,2,null,2,2,-2,2,null],"topicEvidence":{"11":"https://jointlist.org.il/en/platform/10/","20":"https://jointlist.org.il/en/platform/10/"}},
{"id":"raam","confidence":"medium","status":"competitive","links":[["review","https://www.idi.org.il/policy/parties-and-elections/parties/raam/"],["interview","https://www.timesofisrael.com/liveblog_entry/raam-party-chief-abbas-says-netanyahu-win-would-be-catastrophe/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"]],"p":[2,-2,1,null,-1,null,null,1,1,-1,1,null,2,-1,-1,1,null,2,null,-2,1,null],"topicEvidence":{"20":"https://www.mako.co.il/news-israel-elections/2026/Article-b08dbb9982a31a1027.htm"}},
{"id":"reservists","confidence":"medium","status":"borderline","links":[["component","https://www.themiluimnikim.org.il/platform/"],["component","https://www.hakalkalit.org/"],["interview","https://www.walla.co.il/news/politics/383958182"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"],["polls","https://www.timesofisrael.com/people-of-israel-charedi-public-vow-to-stay-in-race-despite-pressure-from-pm-and-allies/"]],"p":[-1,1,null,null,2,2,null,null,1,null,null,null,-2,2,2,-1,2,null,null,null,2,null],"topicEvidence":{"20":"https://www.mako.co.il/news-israel-elections/2026/Article-b08dbb9982a31a1027.htm"}},
{"id":"amcha","confidence":"low","status":"below","links":[["official","https://amchaisrael.co.il/"],["interview","https://www.timesofisrael.com/winter-says-hell-demand-ultra-orthodox-idf-service-but-will-still-join-coalition-with-haredim/amp/"],["review","https://www.timesofisrael.com/a-voters-guide-to-judicial-reform-the-moves-parties-are-planning-after-the-election/"],["polls","https://www.timesofisrael.com/people-of-israel-charedi-public-vow-to-stay-in-race-despite-pressure-from-pm-and-allies/"]],"p":[-2,1,-2,null,2,2,null,1,-1,null,1,null,-2,2,null,null,1,null,null,1,null,null],"topicEvidence":{}},
{"id":"harediPublic","confidence":"low","status":"below","links":[["official","https://hatzibur-haharedi.org/"],["polls","https://www.timesofisrael.com/people-of-israel-charedi-public-vow-to-stay-in-race-despite-pressure-from-pm-and-allies/"]],"p":[null,null,null,null,-1,-1,null,1,null,null,null,null,null,null,2,-1,null,null,null,null,null,null],"topicEvidence":{}},
{"id":"noam","confidence":"low","status":"below","links":[["official","https://www.noamlisrael.org.il/"],["interview","https://www.emess.co.il/radio/1947910"],["polls","https://www.walla.co.il/news/politics/383958484"]],"p":[null,null,null,null,null,null,null,2,-2,1,null,null,-2,null,null,null,null,null,null,2,null,null],"topicEvidence":{}}
];
