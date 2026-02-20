# Google Calendar Setup - Zlatna Lopta

## Korak 1: Napravi Google Calendar

1. Idi na [Google Calendar](https://calendar.google.com/)
2. Na levoj strani klikni **+** pored "Other calendars" -> **Create new calendar**
3. Ime kalendara: `Zlatna Lopta - Termini` (ili kako god zelis)
4. Klikni **Create calendar**

## Korak 2: Postavi kalendar kao javan

1. Klikni na tri tackice pored novog kalendara -> **Settings and sharing**
2. Skroluj do **Access permissions for events**
3. Chekiraj **Make available to public**
4. Izaberi **See all event details**
5. Skroluj do **Integrate calendar** sekcije
6. Kopiraj **Calendar ID** (izgleda kao `abc123@group.calendar.google.com`)

## Korak 3: Napravi Google Cloud projekat i API Key

1. Idi na [Google Cloud Console](https://console.cloud.google.com/)
2. Klikni **Select a project** -> **New Project**
3. Ime: `Zlatna Lopta Website` -> **Create**
4. Sacekaj da se projekat napravi i selektuj ga

### Ukljuci Google Calendar API

5. Idi na **APIs & Services** -> **Library**
6. Pretrazi `Google Calendar API`
7. Klikni na njega -> **Enable**

### Napravi API Key

8. Idi na **APIs & Services** -> **Credentials**
9. Klikni **+ CREATE CREDENTIALS** -> **API key**
10. Kopiraj API key koji se pojavi

### Ogranici API Key (VAZNO za bezbednost)

11. Klikni na novokreirani API key da ga editujes
12. Pod **Application restrictions**:
    - Izaberi **HTTP referrers (websites)**
    - Dodaj: `zlatnalopta.rs/*` i `www.zlatnalopta.rs/*`
    - Ako testiras lokalno dodaj i: `localhost:*` i `127.0.0.1:*`
13. Pod **API restrictions**:
    - Izaberi **Restrict key**
    - Izaberi samo **Google Calendar API**
14. Klikni **Save**

## Korak 4: Dodaj API Key i Calendar ID u kod

Otvori fajl `booking.js` i pronadji ove dve linije (oko linije 384):

```javascript
const GCAL_API_KEY = 'TVOJ_API_KEY_OVDE';
const GCAL_CALENDAR_ID = 'TVOJ_CALENDAR_ID_OVDE';
```

Zameni ih sa tvojim vrednostima:

```javascript
const GCAL_API_KEY = 'AIzaSy...tvoj-api-key...';
const GCAL_CALENDAR_ID = 'abc123xyz@group.calendar.google.com';
```

## Korak 5: Testiraj

1. Otvori Google Calendar i dodaj dogadjaj u novi kalendar:
   - Npr. naslov: `Zauzeto` ili `Rodjendan`
   - Datum: danas ili sutra
   - Vreme: npr. 16:00 - 18:00
2. Otvori sajt i idi na booking stranicu
3. Treba da vidis te sate oznacene crvenim (zauzeto) u nedeljnom kalendaru

## Kako koristiti

- Kad se zakazes rodjendan, dodaj dogadjaj u Google Calendar sa tacnim datumom i satima
- Sajt automatski cita kalendar i prikazuje zauzete termine roditeljima
- Roditelji biraju slobodne sate klikom na zelena polja
- Kad submituju formu, izabrani datum i sati se salju u email

## Napomene

- Google Calendar API ima besplatan limit od **1.000.000 zahteva dnevno** - vise nego dovoljno
- Promene u kalendaru se prikazuju na sajtu odmah (nema kesiranja)
- Ako obrises dogadjaj iz kalendara, termin postaje ponovo slobodan na sajtu
- API key je ogranicen na tvoj domen tako da niko drugi ne moze da ga koristi
