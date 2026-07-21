---
sidebar_position: 2
---

# Diagnostics Phoenix

AdvantageScope prend en charge la diffusion en direct de signaux depuis des appareils Phoenix 6 **sans aucune configuration dans le code utilisateur**. Cela permet un débogage et un réglage faciles des appareils Phoenix à l'aide de l'interface familière et de toute la puissance d'AdvantageScope :

- Des options de visualisation flexibles, y compris la prise en charge de plusieurs axes et de champs discrets
- La prise en charge complète des graphiques avec unités, y compris la conversion d'unités implicite et en un clic ([docs](/tab-reference/line-graph/units))
- Un aperçu en direct de toutes les valeurs dans la barre latérale pour une navigation facile
- La prise en charge du tracé et de l'aperçu du signal depuis plusieurs appareils simultanément
- Le décodage des valeurs d'énumération sous forme de chaînes lisibles par l'homme (modes de contrôle, état du pont, état de l'aimant CANcoder, etc.)
- Des info-bulles de barre latérale intégrées avec des descriptions et des unités pour chaque signal
- Une organisation hiérarchique des signaux, regroupés par bus CAN, appareil et type de signal
- Une analyse de données avancée avec des options d'intégration et de différenciation intégrées ([docs](/tab-reference/line-graph/#adjusting-axes))

:::tip
Pour vous connecter, sélectionnez « Diagnostics Phoenix » lors de la connexion au robot ou au simulateur depuis la barre de menu.
:::

<img src="/img/overview/live-sources/phoenix-1.png" alt="Capture d'écran du graphique linéaire" />

L'onglet 📊 [Statistiques](/tab-reference/statistics) d'AdvantageScope permet également une analyse avancée des signaux Phoenix, avec la prise en charge des histogrammes, des plages personnalisées et des champs dérivés pour les mesures d'erreur relative et absolue :

<img src="/img/overview/live-sources/phoenix-2.png" alt="Capture d'écran des statistiques" />

:::note
Cette fonctionnalité peut occasionnellement rencontrer des problèmes en raison des mises à jour de Phoenix. Nous vous recommandons d'utiliser la dernière version d'AdvantageScope pour minimiser les problèmes. Sinon, veuillez [ouvrir un problème](https://github.com/Mechanical-Advantage/AdvantageScope/issues) pour nous informer de tout problème.
:::
