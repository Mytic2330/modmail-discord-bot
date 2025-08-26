# DISCORD MODMAIL BOT

> [!WARNING]
> Repository ni več vzdrževan. Koda je kot je. Kasnejših sprememb ne pričakujem.

Ta modmail bot je bil narejen zaradi želje po unikatni izkušnji uporabnikov, ki potrebujejo pomoč, imajo vprašanja ali želijo zgolj klepetati z vami.

## Osnovne funkcije
- Kanal za odprtje ticketa
- Admin komentarji
- Bot API
- Arhiviranje ticketov
- Blacklista uporabnikov
- Aktivno tipkanje
- Samodejna inaktivnost
- Statistika
- Dodajanje / odstranjevanje uporabnikov iz ticketov.
- Ranki uporabnikov
- Po želji urejene kategorije in sporočila
- Spletni ogled ticket arhiva

## Daljši opis funkcij
Modmail podpira različne funkcije, ki bodo opisane in razložene spodaj.
### 1. Pogovor preko DM-a
Kot je to pri modmail botih navada, pogovr ne poteka v kanalu z uporabnikom, vendar uporabnik piše preko posrednika (t.j. bot), ki sporočila naprej posreduje v kanal (t.j. ticket), na določenem discord guildu (strežniku). Admini odgovarjajo v ta kanal, sporočila pa bot posreduje naprej uporabniku.
### 2. Admin pripombe
Zaradi goraj omenjenega načina komunikacije, lahko admini v kanal pišejo sporočila namenjena drug za drugega z uporabo "!adm" predpone pred sporočilom.
### 3. Shranjevanje pogovorov
Vsi pogovori se po zaključku shranijo v "ticketarchive", ki je dostopen v posebnem archive kanalau na discordu. Prav tako ima bot priloženo spletno stran, ki jo lahko uporabite za ogled ticketov preko spleta. Stran je zavarovana z ključem, ki ga uporabnik dobi preko discord bota z uporabo primerne komande.
### 4. Aktivno tipkanje
Bot prikazuje tako uporabniku, kot adminom, kdaj druga stran piše v kanal namenjen medsebojni komunikaciji. Tako, kot pri navadnem sporočanju, ostane indikator aktiven dokler uporabnik tipka.
### 5. Blacklista
Bot omogoča uporabo blacklist/unblacklist komand, ki uporabniku bodisi preprečijo možnost ustvarjanja novega ticketa bodisi to možnost povrnejo. 
### 6. Dodajanje uporabnikov
Zaradi narave tega načina komunikacije, ima bot vgrajeno add/remove komando, ki omogoča udeleženim v pogovoru, da dodajo novega uporabnika v pogovor. Prav tako ga lahko odstranijo, razen originalnega ustvarjalca ticketa.
### 7. Statistika
Bot omogoča ogled osnovne statisitke ali posameznega ticketa ali splošne statistike uporabe in ocen uporabnikov.
### 8. Nekativnost
Bot omogoča, da admini ticket označijo kot neaktiven. To pomeni, da mora v ticket biti poslano sporočilo vsakih 48h, drugače se bo samodejno zaprl.
### 9. Enostavna uporaba
Bot se ob prvm zagonu samodejno kalibrira, zbere potrebne podatke (nekatere je obvezno vpisati v config) in ustvari kanale potrebne za delovanje.
### 10. Priložen API
Bot ima priložen osnovni API (Applicaton programming interface), preko ExpressJS, kar omogoča zunanjim programom pridobitev željenih podatkov.
### 11. Prilagajanje
Bot ima ogromno možnosti prilagoditev in neomejeno možnosti razširitev (če imate potrebno znanje).
### 12. Ranki uporanbikov
Bot omogoča nastavitev rankov, torej lahko uporabnik vidi "čin" oz. položaj admina s katerim si piše. Naprimer admin, ki bo imel rolo H-Staff bo imel v ticketu napisano "Rank: H-Staff".

## Developer informacije
Bot je napisan večinsko v jeziku typescript. Uporablja node V22.1.0 in discord.js 14.14.1.
Za databazo je uporabljen sqlite. Za komunikacijo z databazo je uporabljen better-sqlite3 in quick.db. Za ustvarjanje arhivov pogovorov je uporabljen discord-html-transcripts.
