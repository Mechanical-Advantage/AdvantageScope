---
sidebar_position: 2
---

# Diagnostics Phoenix {#phoenix-diagnostics}

AdvantageScope peut diffuser en direct les signaux des appareils Phoenix 6 **sans rien ajouter dans le code de votre robot**. Vous profitez ainsi de toute l'interface et des outils d'AdvantageScope pour déboguer et régler vos appareils Phoenix :

- Visualisations variées, incluant les tableaux de données et l'analyse statistique
- Prise en charge complète des graphiques avec unités, avec conversion automatique ou en un clic ([documentation](/tab-reference/line-graph/units))
- Décodage des valeurs d'énumération en texte lisible (modes de contrôle, état du pont, état de l'aimant CANcoder, etc.)
- Info-bulles intégrées dans la barre latérale avec la description et l'unité de chaque signal
- Classement hiérarchique des signaux par bus CAN, appareil et type de signal
- Analyse avancée avec intégration et dérivation intégrées ([documentation](/tab-reference/line-graph/#adjusting-axes))

:::tip
Pour vous connecter, choisissez « Diagnostics Phoenix » lorsque vous lancez la connexion au robot ou au simulateur depuis la barre de menus.
:::

<img src="/img/overview/live-sources/phoenix-1.webp" alt="Capture d'écran du graphique linéaire" />

L'onglet 📊 [Statistiques](/tab-reference/statistics) permet également d'analyser en détail les signaux Phoenix grâce aux histogrammes, aux plages personnalisées et aux champs dérivés pour mesurer l'erreur relative ou absolue :

<img src="/img/overview/live-sources/phoenix-2.webp" alt="Capture d'écran des statistiques" />

_L'interface en anglais est illustrée ci-dessus._

:::note
Des mises à jour de Phoenix peuvent parfois perturber cette fonctionnalité. Pensez à utiliser la dernière version d'AdvantageScope pour limiter ces problèmes. Si vous rencontrez malgré tout un souci, [signalez-le sur GitHub](https://github.com/Mechanical-Advantage/AdvantageScope/issues).
:::
