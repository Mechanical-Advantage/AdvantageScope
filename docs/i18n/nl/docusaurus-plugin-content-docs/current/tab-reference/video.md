---
sidebar_position: 7
---

# 🎬 Video {#video}

Het tabblad video maakt het mogelijk om de logdata zij-aan-zij te vergelijken met een apart opgenomen wedstrijdvideo. De onderstaande stappen laten zien hoe je een video laadt en synchroniseert met het logbestand.

## De video laden {#loading-the-video}

AdvantageScope biedt drie opties voor het laden van een video:

1. **Lokaal bestand:** Klik op het grijze bestandspictogram en kies het te laden videobestand. De meeste gangbare videoformaten worden ondersteund.
2. **YouTube:** Kopieer een YouTube-link naar het klembord en klik op het rode klembordpictogram. Na enkele seconden begint de video te downloaden.
3. **The Blue Alliance:** Klik op het blauwe TBA-pictogram om de wedstrijdvideo automatisch te laden op basis van het logbestand. Als er meerdere video's beschikbaar zijn, kies dan de te downloaden video uit het pop-upmenu. Deze functie vereist een API-sleutel voor TBA, die kan worden verkregen via [thebluealliance.com/account](https://www.thebluealliance.com/account) en moet worden gekopieerd naar de voorkeurenpagina van AdvantageScope onder "TBA-API-sleutel".

<img src="/img/tab-reference/video-1.webp" alt="Bronkiezer" />

Na het kiezen van een video begint de tijdlijn rechtsonder blauw te worden om de frames aan te geven die in de cache zijn opgeslagen (deze stap is noodzakelijk voor soepel afspelen). Deze functie is uitsluitend bedoeld voor video's van wedstrijdlengte vanwege de vereiste frameconversie.

:::warning
Het downloaden van video's van YouTube en TBA kan onverwacht mislukken als gevolg van wijzigingen op de servers van YouTube. Probeer bij problemen AdvantageScope bij te werken of gebruik in plaats daarvan een lokaal videobestand.
:::

:::info
AdvantageScope vereist [FFmpeg](https://ffmpeg.org) om videobestanden te verwerken. Als er geen geldige versie van FFmpeg wordt gevonden op de PATH van je systeem, zal AdvantageScope vragen om FFmpeg van internet te downloaden wanneer je voor het eerst een video laadt. Automatische FFmpeg-installatie wordt alleen ondersteund op Windows en macOS; Linux-gebruikers moeten FFmpeg mogelijk handmatig installeren en toevoegen aan de systeem-PATH.
:::

## Navigeren in de video {#navigating-the-video}

Wanneer een video initieel wordt geladen en nog niet is gesynchroniseerd met de logdata, zijn de afspeelbedieningen voor de video en het logbestand nog onafhankelijk van elkaar. Gebruik de tijdlijn en de knoppen rechtsonder om het afspelen van de video te bedienen. De volgende sneltoetsen worden ook ondersteund:

- / = afspelen in-/uitschakelen
- → = één frame vooruit
- ← = één frame terug
- \> = vijf seconden vooruitspringen
- < = vijf seconden terugspringen

<img src="/img/tab-reference/video-2.webp" alt="Videobediening" />

## Automatische synchronisatie {#automatic-synchronization}

De meeste wedstrijdvideo's worden kort nadat de frames voor de autonome periode van de wedstrijd zijn geladen automatisch gesynchroniseerd met het logbestand. Er is geen actie vereist; als de synchronisatie slaagt, worden de videobedieningselementen automatisch vergrendeld (zie "Afspelen" hieronder).

:::warning
Automatische synchronisatie werkt alleen bij wedstrijdvideo's die score-overlays bevatten, en slaagt mogelijk niet in alle gevallen. Als de videobedieningselementen niet automatisch worden vergrendeld zodra alle frames zijn geladen, is handmatige synchronisatie vereist.
:::

## Handmatige synchronisatie {#manual-synchronization}

Gebruik eerst de videobedieningselementen om naar een bekend moment in de wedstrijd te navigeren, zoals het begin van auto. Selecteer vervolgens de tijd in het logbestand die overeenkomt met het huidige frame van de video.

:::tip
De cursor op de tijdlijn springt automatisch naar het begin en einde van wedstrijdperioden (snapping), waardoor het gemakkelijker is om het begin van de wedstrijd nauwkeurig te selecteren.
:::

Zodra de video en het logbestand zijn uitgelijnd, klik je op het slotpictogram naast de videotijdlijn (of druk je op **↑ of ↓**). De videobedieningselementen zijn nu uitgeschakeld. Klik nogmaals op het slotpictogram om het afspelen van de video te ontgrendelen.

<img src="/img/tab-reference/video-3.webp" alt="Lock button" />

## Afspelen {#playback}

Eenmaal vergrendeld blijft het afspelen van de video uitgelijnd met de geselecteerde tijd in het logbestand. Merk op dat geluidsweergave niet wordt ondersteund, omdat de originele video wordt geconverteerd naar een weergave frame-voor-frame om tijdsynchronisatie met het logbestand te ondersteunen.

<details>
<summary>Tijdlijnbesturing</summary>

De tijdlijn wordt gebruikt om het afspelen en de visualisatie te regelen. Als je op de tijdlijn klikt, selecteer je een tijdstip, en als je met de rechtermuisknop klikt, deselecteer je dit weer. Het geselecteerde tijdstip wordt gesynchroniseerd over alle tabbladen, waardoor het eenvoudig is om deze positie snel terug te vinden in andere weergaven.

Gele gedeelten geven aan wanneer de robot autonoom is, blauwe gedeelten geven aan wanneer de robot tele-operated is en grijze gedeelten geven aan wanneer de robot in de utility-modus staat.

Om te zoomen, plaats je de cursor op de tijdlijn en scrol je omhoog of omlaag. Er kan ook een bereik worden geselecteerd door te klikken en te slepen terwijl je `Shift` ingedrukt houdt. Beweeg naar links en rechts door horizontaal te scrollen (op ondersteunde apparaten), of door op de tijdlijn te klikken en te slepen. Wanneer er live verbinding is, ontgrendelt naar links scrollen van de huidige tijd, en helemaal naar rechts scrollen vergrendelt weer op de huidige tijd. Druk op `Ctrl+\` om in te zoomen op de periode waarin de robot is ingeschakeld.

<img src="/img/tab-reference/timeline.webp" alt="Tijdlijn" />

</details>

:::tip
Desgewenst kan het gezichtsveld (FOV) van de camera in de 3D-veldweergave worden aangepast aan het beeld van de video. Zie voor details "Camera-opties" op de pagina 👀 [3D-veld](/tab-reference/3d-field).
:::

<img src="/img/tab-reference/video-4.webp" alt="Videosnapshot met odometrie" />
