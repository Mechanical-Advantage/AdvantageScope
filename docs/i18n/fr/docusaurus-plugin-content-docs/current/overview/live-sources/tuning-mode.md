---
sidebar_position: 1
---

# Mode de réglage {#tuning-mode}

Certaines sources en direct permettent de modifier des valeurs numériques et booléennes en temps réel. Vous pouvez par exemple vous en servir pour [régler les gains d'un contrôleur](https://docs.wpilib.org/fr/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) via NetworkTables (à condition que le code du robot soit prévu pour recevoir ces gains par NetworkTables).

Par défaut, toutes les valeurs affichées dans AdvantageScope sont en lecture seule. Pour passer en mode de réglage, **cliquez sur l'icône de curseurs** à droite de la barre de recherche lorsque vous êtes connecté à une source compatible. Quand l'icône devient violette, le mode de réglage est actif et vous pouvez modifier les champs.

- Pour modifier un **champ numérique**, saisissez une nouvelle valeur dans la zone de texte à droite du champ dans la barre latérale. La valeur est envoyée dès que vous quittez le champ ou appuyez sur « Entrée ». Laissez le champ vide pour revenir à la valeur publiée par le robot.
- Pour basculer un **champ booléen**, cliquez sur le cercle rouge ou vert à droite du champ dans la barre latérale.
- Pour copier toutes les valeurs modifiées dans le presse-papiers, **faites un clic droit sur l'icône de curseurs** et choisissez **« Copier les valeurs réglées »**.

:::warning
Ce mode ne sert pas à piloter le robot sur le terrain. Les éléments interactifs de tableau de bord comme les sélecteurs (_choosers_) ou les boutons de déclenchement ne sont pas pris en charge.
:::

## Régler des valeurs avec AdvantageKit {#tuning-with-advantagekit}

Les champs publiés par AdvantageKit dans la sous-table `AdvantageKit` sont en lecture seule. Vous pouvez toutefois exposer vos propres champs réglables depuis votre code robot. **Tous les champs publiés dans la table « /Tuning » de NetworkTables apparaîtront dans la table « Tuning » lorsque vous utilisez la source en direct « NetworkTables (AdvantageKit) ».**

Par exemple, vous pouvez créer un nombre réglable avec la classe [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) :

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
La sous-table `NetworkInputs` **ne peut pas être modifiée**, car AdvantageKit l'utilise pour enregistrer les entrées réseau en vue de la journalisation et de la relecture. Utilisez toujours la table `Tuning` pour ajuster des paramètres en temps réel.
:::
