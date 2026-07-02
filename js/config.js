const SUPABASE_URL = 'https://ggrpefauwpoeeyjkwebw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdncnBlZmF1d3BvZWV5amt3ZWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTg2MjcsImV4cCI6MjA5ODU5NDYyN30.QCUGu31nL2GsgTuAD6unYX5Q_vL3zVB6ck7ojBJtsYs'

const DEFAULT_PRODUCTS = [
  { id:'barszcz_330',       namePL:'Barszcz (330 ml)',                              nameUA:'Борщ (330 мл)',                         price:24 },
  { id:'barszcz_wynos',     namePL:'Barszcz na wynos (500 ml)',                     nameUA:'Борщ на винос (500 мл)',               price:24 },
  { id:'kanapka_slonina',   namePL:'Kanapka ze słoniną (1 szt.)',                   nameUA:'Бутерброд із салом (1 шт.)',           price:6  },
  { id:'pampucha',          namePL:'Pampucha z czosnkiem (1 szt.)',                 nameUA:'Пампуха з часником (1 шт.)',          price:6  },
  { id:'pierogi_ziemn',     namePL:'Pierogi z ziemniakami (3 szt./porcja)',         nameUA:'Вареники з картоплею (3 шт./порц.)', price:22 },
  { id:'pierogi_twarog',    namePL:'Pierogi z twarogiem na słodko (3 szt./porcja)', nameUA:'Вареники з сиром (3 шт./порц.)',     price:22 },
  { id:'nalesniki_kurczak', namePL:'Naleśniki z pieczarką i kurczakiem',            nameUA:'Млинці з грибами та куркою',          price:15 },
  { id:'nalesniki_twarog',  namePL:'Naleśniki z twarogiem na słodko',               nameUA:'Млинці з сиром',                      price:15 },
  { id:'kielbasa',          namePL:'Kiełbasa wieprzowa (1 szt.)',                   nameUA:'Ковбаса свиняча (1 шт.)',             price:25 },
  { id:'slonina',           namePL:'Słonina pakowana (za 100 g)',                   nameUA:'Сало фасоване (100 г)',               price:10 },
  { id:'tort_waflowy',      namePL:'Tort waflowy (1 szt.)',                         nameUA:'Вафельний торт (1 шт.)',              price:10 },
  { id:'orzeszki',          namePL:'Orzeszki ze słodzonym mlekiem (5 szt.)',        nameUA:'Горішки зі згущеним молоком (5 шт.)', price:12 },
  { id:'kwas',              namePL:'Kwas / Żywczyk / Sok Tymbark (500 ml)',         nameUA:'Квас/Живчик/Тімбарк (500 мл)',        price:13 },
  { id:'sok_maly',          namePL:'Sok Sadoczok / Sok CapriSun (200 ml)',          nameUA:'Сік Садочок / CapriSun (200 мл)',     price:8  },
  { id:'pepsi',             namePL:'Pepsi (330 ml puszka)',                         nameUA:'Pepsi (330 мл банка)',                price:10 },
  { id:'woda',              namePL:'Woda (500 ml gazowana/niegazowana)',             nameUA:'Вода (500 мл газ/негаз)',             price:6  },
]
