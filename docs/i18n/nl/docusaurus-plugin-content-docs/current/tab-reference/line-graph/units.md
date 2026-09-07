# Ondersteuning voor eenheden {#unit-support}

Het tabblad lijngrafiek is eenheidsbewust, wat betekent dat numerieke waarden eenvoudig kunnen worden geconverteerd tussen compatibele eenheidstypen. Wanneer eenheidsinformatie beschikbaar is, worden alle numerieke waarden ook nauwkeurig gelabeld wanneer ze worden weergegeven op de assen of in legenda's. Zie [hier](#supported-formats) voor meer informatie over het publiceren van eenheidsinformatie. AdvantageScope biedt verschillende tools om snel tussen eenheden te converteren:

- Bij het toevoegen van **velden op dezelfde as met compatibele eenheidstypen**, converteert AdvantageScope automatisch beide velden naar dezelfde eenheid. Dit wordt weerspiegeld in de labeling van de Y-as en de legenda.
- Klik op de drie stippen naast de astitel om **snel over te schakelen naar alternatieve eenheden**. Deze lijst bevat de meest voorkomende eenheden die compatibel zijn met de geselecteerde velden.
- Schakel **integratie of differentiatie** in ([documentatie](/tab-reference/line-graph/#integration-and-differentiation)) om de nauwkeurige integraal- of afgeleide-eenheden te zien. De basiseenheid kan worden aangepast via het menu om filteren in niet-native eenheden te ondersteunen.

<img src="/img/tab-reference/line-graph/units-1.webp" alt="Eenheidsbewuste grafieken" />

_De Engelstalige interface wordt hierboven weergegeven._

## Ondersteunde formaten {#supported-formats}

AdvantageScope ondersteunt verschillende methoden om eenheidsinformatie over elk veld te verstrekken. De meeste gangbare eenheden worden ondersteund; raadpleeg voor een volledige lijst het pop-upmenu bij het configureren van [handmatige conversie](#manual-conversion).

Voor (2) en (3) worden eenheidstypen geparseerd met behulp van strings. AdvantageScope ondersteunt meerdere namen voor elke eenheid, inclusief gangbare afkortingen (bijv. `ft` en `feet` zijn beide goed) en zowel Amerikaanse als Britse spellingen (bijv. `meters` en `metres`). Merk op dat eenheidsnamen moeten worden opgegeven met behulp van SI-symbolen of in het Engels, ongeacht de in AdvantageScope geselecteerde taal. Als een eenheidsnaam niet zoals verwacht wordt geparseerd, [open dan een issue](https://github.com/Mechanical-Advantage/AdvantageScope/issues).

:::tip
Twijfel je of eenheden correct worden geparseerd? Controleer of er een eenheidstype wordt weergegeven op de Y-as wanneer je een veld toevoegt aan de lijngrafiek.
:::

### 🥇 Struct-eenheden {#struct-units}

AdvantageScope gebruikt automatisch de native eenheden voor veelvoorkomende gestructureerde datatypen zoals `Rotation2d` en `Translation3d`. Het publiceren van toepasselijke waarden met behulp van deze formaten is **altijd de beste manier om data te publiceren** en zorgt voor maximale compatibiliteit bij het visualiseren van geometriedata.

### 🥈 Veldmetadata {#field-metadata}

De WPILOG- en NetworkTables-formaten ondersteunen het publiceren van aanvullende "metadata" voor elk veld. AdvantageScope zoekt naar JSON-velden met de naam "unit" of "units" die een stringnaam voor het eenheidstype bevatten (met spaties, camel-case, pascal-case of snake-case). Om de metadata voor elk veld te controleren, houd je de muisaanwijzer boven de veldnaam in de zijbalk.

:::tip
AdvantageKit bevat ondersteuning voor eenheidsmetadata bij het loggen van inputs en outputs, inclusief logging via annotaties. Raadpleeg de documentatie [hier](https://docs.advantagekit.org/data-flow/supported-types#units) voor details.
:::

### 🥉 Veldnaamgeving {#field-naming}

Als fallback probeert AdvantageScope het juiste eenheidstype te bepalen door de naam van elk veld te parseren. **Het eenheidstype moet als achtervoegsel worden opgenomen.** AdvantageScope ondersteunt verschillende naamgevingsschema's. Enkele geldige opties worden hieronder vermeld:

- **Camel/pascal-case**, zoals `PositionMeters`, `velocityRadPerSec` en `TimestampS`
- **Snake-case**, zoals `position_meters`, `velocity_rad_per_sec` en `timestamp_s`
- **Spatiescheidingen**, zoals `position meters`, `velocity rad per sec` en `timestamp s`

Naamgeving is _niet_ hoofdlettergevoelig bij gebruik van snake-case of spatiescheidingen.

:::tip
Als eenheden onjuist worden geparseerd, klik je op `Handmatige eenheden` > `Automatische eenheden uitschakelen` om eenheidsinformatie te negeren. Handmatige conversie kan vervolgens worden gebruikt om naar alternatieve eenheden over te schakelen.
:::

## Handmatige conversie {#manual-conversion}

Wanneer eenheidsmetadata niet beschikbaar of onnauwkeurig is, kunnen assen ook handmatig worden geconfigureerd om tussen eenheden te converteren (of eenheidsmetadata volledig te negeren).

Om handmatige conversie te configureren, klik je op de drie stippen naast de astitel en vervolgens op `Handmatige eenheden` > `Conversie bewerken`. Selecteer het type eenheid, de broneenheid en de doeleenheid. Elke waarde wordt ook vermenigvuldigd met de "Extra factor", wat aangepaste conversies mogelijk maakt (zoals overbrengingsverhoudingen, omzettingen van hoek naar lineair, of andere eenheden die niet door AdvantageScope worden geleverd). De factor kan ook worden ingevoerd met behulp van een wiskundige uitdrukking zoals `1.5*pi`.

:::tip
Om eenheidsconversie snel in of uit te schakelen, klik je op de drie stippen naast de astitel en kies je `Recente voorinstellingen` of `Eenheden resetten`.
:::

<img src="/img/tab-reference/line-graph/units-2.webp" alt="Eenheidsconversie bewerken" height="250" />

_De Engelstalige interface wordt hierboven weergegeven._
