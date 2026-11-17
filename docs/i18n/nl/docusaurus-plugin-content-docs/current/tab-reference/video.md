---
sidebar_position: 7
---

# 🎬 Video {#video}

Op het tabblad Video leg je een apart opgenomen wedstrijdvideo naast je logdata. Hieronder lees je hoe je een video laadt en gelijk laat lopen met je logbestand.

## De video laden {#loading-the-video}

Je kunt op drie manieren een video laden in AdvantageScope:

1. **Lokaal bestand:** Klik op het grijze bestandspictogram en kies een videobestand op je computer. De meeste gangbare videoformaten worden ondersteund.
2. **YouTube:** Kopieer een YouTube-link naar je klembord en klik op het rode klembordpictogram. Na een paar seconden begint de video met downloaden.
3. **The Blue Alliance:** Klik op het blauwe TBA-pictogram om automatisch de wedstrijdvideo bij het logbestand op te halen. Zijn er meerdere video's beschikbaar, dan kies je er een uit het pop-upmenu. Hiervoor heb je wel een TBA-API-sleutel nodig: die vraag je aan op [thebluealliance.com/account](https://www.thebluealliance.com/account) en plak je in de voorkeuren van AdvantageScope bij "TBA-API-sleutel".

<img src="/img/tab-reference/video-1.webp" alt="Bronkiezer" />

Zodra je een video hebt gekozen, kleurt de tijdlijn rechtsonder langzaam blauw. Dat laat zien welke frames al in de cache staan (nodig om de video soepel te kunnen afspelen). Omdat alle frames eerst omgezet moeten worden, is deze functie echt bedoeld voor video's van wedstrijdformaat (niet voor urenlange opnames).

:::warning
Het downloaden van YouTube- en TBA-video's kan soms onverwacht stukgaan door aanpassingen op de servers van YouTube. Werkt het niet? Kijk of er een update is voor AdvantageScope, of gebruik een lokaal videobestand.
:::

:::info
AdvantageScope gebruikt [FFmpeg](https://ffmpeg.org) om videobestanden te verwerken. Staat FFmpeg nog niet in het PATH van je systeem, dan biedt AdvantageScope aan om het automatisch te downloaden zodra je voor het eerst een video opent. Dat werkt automatisch op Windows en macOS; op Linux moet je FFmpeg mogelijk zelf installeren en toevoegen aan PATH.
:::

## Navigeren in de video {#navigating-the-video}

Zolang een video nog niet gesynchroniseerd is met je logdata, bedien je de video en het logbestand los van elkaar. Gebruik de tijdlijn en de knoppen rechtsonder om de video te bedienen. Deze sneltoetsen werken ook:

- / = afspelen of pauzeren
- → = één frame vooruit
- ← = één frame terug
- \> = vijf seconden vooruit
- < = vijf seconden terug

<img src="/img/tab-reference/video-2.webp" alt="Videobediening" />

## Automatische synchronisatie {#automatic-synchronization}

De meeste wedstrijdvideo's worden vanzelf gesynchroniseerd zodra de frames van de autonome periode zijn geladen. Je hoeft daar niets voor te doen: als het lukt, worden de videoknoppen automatisch vergrendeld (zie "Afspelen" hieronder).

:::warning
Automatische synchronisatie werkt alleen bij wedstrijdvideo's met een score-overlay en lukt niet altijd. Blijven de videoknoppen ontgrendeld nadat alle frames zijn geladen? Synchroniseer de video dan handmatig.
:::

## Handmatige synchronisatie {#manual-synchronization}

Zoek met de videoknoppen eerst een duidelijk herkenbaar moment in de wedstrijd op, zoals het startsignaal van de autonome periode. Selecteer daarna precies datzelfde moment op de tijdlijn van het logbestand.

:::tip
De cursor op de tijdlijn klikt automatisch vast op het begin en einde van elke wedstrijdperiode. Zo kies je het begin van de wedstrijd heel nauwkeurig.
:::

Lopen de video en het logbestand gelijk? Klik dan op het slotpictogram naast de videotijdlijn (of druk op **↑ of ↓**). De videoknoppen worden nu vergrendeld. Klik opnieuw op het slotje om ze weer los te koppelen.

<img src="/img/tab-reference/video-3.webp" alt="Vergrendelknop" />

## Afspelen {#playback}

Zodra de video vergrendeld is, loopt het beeld netjes mee met het gekozen tijdstip in je logbestand. Geluid wordt niet afgespeeld, omdat de video frame voor frame is omgezet om strak te kunnen synchroniseren.

<details>
<summary>Tijdlijnbesturing</summary>

Met de tijdlijn stuur je het afspelen en de weergave aan. Klik op de tijdlijn om een tijdstip te selecteren, en klik met de rechtermuisknop om de selectie weer op te heffen. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, zodat je hetzelfde moment makkelijk terugvindt in andere weergaven.

Gele stukken geven aan wanneer de robot autonoom rijdt, blauwe stukken staan voor tele-operated en grijze stukken voor de utility-modus.

Zet je cursor op de tijdlijn en scrol omhoog of omlaag om in en uit te zoomen. Je kunt ook een bereik selecteren door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Naar links en rechts bewegen doe je door horizontaal te scrollen (als je apparaat dat ondersteunt) of door op de tijdlijn te klikken en te slepen. Ben je live verbonden? Zodra je naar links scrolt, laat de weergave de huidige tijd los; scrol je weer helemaal naar rechts, dan klikt de weergave vanzelf weer vast op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

:::tip
Wil je dat het camerabeeld in het 3D-veld overeenkomt met de video? Dan kun je daar het gezichtsveld (FOV) aanpassen. Kijk bij "Camera-opties" op de pagina 👀 [3D-veld](/tab-reference/3d-field) voor meer uitleg.
:::

<img src="/img/tab-reference/video-4.webp" alt="Videosnapshot met odometrie" />
