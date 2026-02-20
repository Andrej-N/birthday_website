# Vodič za objavljivanje sajta - Zlatna Lopta

## 1. Kupi domen

- Idi na **loopia.rs** (ili ninet.rs, hostserbia.rs)
- Registruj domen **zlatnalopta.rs**
- Cena: ~1.200-1.500 din/godišnje
- Prilikom registracije treba ti: ime, email, adresa, telefon

## 2. Postavi sajt na hosting (Netlify - besplatno)

1. Idi na **netlify.com** i napravi nalog (može preko GitHub-a ili emaila)
2. Na Dashboard-u klikni **"Add new site" → "Deploy manually"**
3. Prevuci ceo folder projekta (sa svim fajlovima) na stranicu
4. Sajt je odmah živ na adresi tipa `random-ime.netlify.app`
5. Proveri da li sve radi na toj adresi

## 3. Poveži domen sa Netlify

1. U Netlify idi na **Site settings → Domain management → Add custom domain**
2. Unesi `zlatnalopta.rs`
3. Netlify će ti dati DNS zapise (CNAME ili A record)
4. Uloguj se na **loopia.rs** (gde si kupio domen)
5. Idi na **DNS podešavanja** i dodaj zapise koje Netlify traži
6. Sačekaj do 24h da se DNS propagira (obično 1-2h)
7. Netlify automatski aktivira **HTTPS** (besplatno)

## 4. Google Search Console (indeksiranje)

1. Idi na **search.google.com/search-console**
2. Klikni **"Add property"** → unesi `https://zlatnalopta.rs`
3. Verifikuj vlasništvo (preporučujem DNS metodu - dodaj TXT zapis na Loopia)
4. Kada si verifikovan, idi na **Sitemaps** u levom meniju
5. Unesi: `https://zlatnalopta.rs/sitemap.xml` i klikni Submit
6. Google počinje da indeksira sajt za **1-7 dana**

## 5. Google Business profil (NAJVAŽNIJE za lokalni biznis)

1. Idi na **google.com/business** i uloguj se sa Google nalogom
2. Klikni **"Add your business"**
3. Popuni podatke:
   - Ime: **Zlatna Lopta Sportski Balon**
   - Kategorija: **Sports complex** ili **Children's party service**
   - Adresa: tačna adresa na Vračaru
   - Telefon: **+381 65 82 00 252**
   - Sajt: **https://zlatnalopta.rs**
   - Radno vreme: **09:00 - 22:00, svaki dan**
4. Google će ti poslati **razglednicu sa kodom** na adresu (ili verifikacija telefonom)
5. Unesi kod kada stigne i profil je aktivan
6. Dodaj **fotografije** balona, rođendana, terena (što više to bolje)
7. Zamoli zadovoljne roditelje da ostave **Google recenzije** - ovo je ključno za rangiranje

## 6. Ažuriranje sajta (nakon promena)

- Kad izmeniš nešto na sajtu, ponovo prevuci folder na Netlify
- Ili poveži GitHub repo za automatski deploy pri svakom push-u

---

## Checklist

- [ ] Kupljen domen zlatnalopta.rs
- [ ] Sajt postavljen na Netlify
- [ ] Domen povezan sa Netlify
- [ ] HTTPS aktivan
- [ ] Google Search Console - sajt dodat i sitemap submitovan
- [ ] Google Business profil kreiran i verifikovan
- [ ] Dodate fotografije na Google Business
- [ ] Obrisan generate-og-image.html iz projekta
