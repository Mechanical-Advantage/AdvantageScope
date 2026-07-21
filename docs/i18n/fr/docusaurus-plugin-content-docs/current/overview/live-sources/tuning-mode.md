---
sidebar_position: 1
---

# Mode de réglage

Certaines sources en direct prennent en charge le réglage en direct des valeurs numériques et booléennes. Par exemple, cette fonctionnalité peut être utilisée pour [régler les gains du contrôleur](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) lors de la connexion à une source NetworkTables. Notez que le code robot doit prendre en charge la réception de gains via NetworkTables.

Par défaut, toutes les valeurs dans AdvantageScope sont en lecture seule. Pour activer ou désactiver le mode de réglage, **cliquez sur l'icône de curseur** à droite de la barre de recherche lorsqu'il est connecté à une source en direct prise en charge. Lorsque l'icône est violette, le mode de réglage est actif et la modification des champs est activée.

- Pour modifier un **champ numérique**, saisissez une nouvelle valeur à l'aide de la zone de texte à droite du champ dans la barre latérale. La valeur est publiée après la désélection de la saisie ou lorsque la touche « Entrée » est enfoncée. Laissez la zone de texte vide pour utiliser la valeur publiée par le robot.
- Pour basculer un **champ booléen**, cliquez sur le cercle rouge ou vert à droite du champ dans la barre latérale.

:::warning
Cette fonctionnalité n'est pas destinée à contrôler le robot sur le terrain. Les saisies de type tableau de bord comme les sélecteurs, boutons de déclenchement, etc. ne sont pas prises en charge.
:::

## Réglage avec AdvantageKit

Les champs publiés par AdvantageKit dans la sous-table `AdvantageKit` sont en sortie uniquement et ne peuvent pas être modifiés. Cependant, les utilisateurs peuvent publier des champs à partir du code utilisateur qui sont réglables depuis AdvantageScope. **Tous les champs publiés dans la table « /Tuning » sur NetworkTables apparaîtront sous la table « Tuning » lors de l'utilisation de la source en direct « NetworkTables (AdvantageKit) ».**

Par exemple, un nombre réglable peut être publié en utilisant la classe [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) :

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
La sous-table `NetworkInputs` **ne peut pas être modifiée**, car elle est utilisée par AdvantageKit pour enregistrer les valeurs réseau aux fins de journalisation et de relecture. Utilisez la table `Tuning` pour interagir avec les saisies réseau en temps réel.
:::
